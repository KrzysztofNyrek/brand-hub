// functions/api/subscribe.js
// Cloudflare Pages Function — POST /api/subscribe (waitlist „AI-w-pracy early access").
//
// Flow: parse (JSON|form) -> validateSubscription (honeypot 403 / email 400)
//       -> MailerLite upsert subscriber + grupa waitlist -> PRG 302 /subscribed (EN) | /zapisano (PL).
// Failure-safe: MailerLite non-2xx/timeout -> i tak 302 thank-you (nie odbijamy błędów do usera), log console.error.
//
// WYMAGANE (CF Pages -> Settings -> Environment variables):
//   env MAILERLITE_API_KEY              - token API MailerLite (Integrations -> API). Sekret.
//   env MAILERLITE_WAITLIST_GROUP_ID    - ID grupy „AI-w-pracy early access" (domyslna).
//   env MAILERLITE_PM_GROUP_ID          - ID grupy „PM - First 5 Days" (gdy form wysyla list=pm).
//   env MAILERLITE_INTER_GROUP_ID       - ID grupy „Interesariusze - lista chetnych" (list=inter, D126).
import { validateSubscription } from './_subscribe_core.mjs';
const ML_URL = 'https://connect.mailerlite.com/api/subscribers';
const bad = (s, m) => new Response(m, { status: s, headers: { 'content-type': 'text/plain; charset=utf-8' } });

export async function onRequestPost({ request, env }) {
  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    data = ct.includes('application/json') ? await request.json()
         : Object.fromEntries(await request.formData());
  } catch { return bad(400, 'Bad form data.'); }

  const v = validateSubscription(data);
  if (!v.ok) return bad(v.status, v.status === 403 ? 'Forbidden.' : 'Invalid email.');

  // 🔴 TURNSTILE (28.08.2026). Honeypot `firma_www` przepuścił boty: odczyt z API MailerLite pokazał,
  // że 4 z 5 wpisów na liście „AI-w-pracy early access" to zapisy maszynowe (identyczna trójka UTM,
  // zero otwarć, dwa IP z tego samego bloku /24, dwa adresy na mail.ru). Sama baza to najmniejszy kłopot:
  // D125 pkt 6 i D126 stawiają PROGI LICZONE W ZAPISACH i to one decydują, czy budujemy produkt.
  //
  // POLITYKA BŁĘDU, świadomie niesymetryczna:
  //   - token obecny i ODRZUCONY przez siteverify  -> 403, zapis nie powstaje,
  //   - brak TURNSTILE_SECRET_KEY w CF Pages       -> przepuszczamy + głośny log (błąd konfiguracji
  //     nie może wyciąć wszystkich zapisów; ten sam wzorzec co przy braku GROUP_ID niżej),
  //   - siteverify niedostępny albo timeout        -> przepuszczamy + głośny log (awaria sieci
  //     po naszej stronie nie może kosztować realnego człowieka).
  // Czyli: blokujemy tylko wtedy, gdy Cloudflare AKTYWNIE powie „to nie człowiek".
  const tsSecret = env.TURNSTILE_SECRET_KEY || '';
  const tsToken = String(data['cf-turnstile-response'] || '');
  if (!tsSecret) {
    console.error('Brak TURNSTILE_SECRET_KEY — zapis przepuszczony BEZ weryfikacji bota!');
  } else {
    const form = new FormData();
    form.append('secret', tsSecret);
    form.append('response', tsToken);
    const cfIp = request.headers.get('CF-Connecting-IP');
    if (cfIp) form.append('remoteip', cfIp);
    try {
      const tr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',
        { method: 'POST', body: form, signal: AbortSignal.timeout(10_000) });
      const tj = await tr.json();
      if (!tj.success) {
        // Bez adresu e-mail w logu (log Cloudflare to nie miejsce na dane osobowe).
        console.error('Turnstile odrzucil zapis:', JSON.stringify(tj['error-codes'] || []));
        return bad(403, 'Forbidden.');
      }
    } catch (e) {
      console.error('Turnstile siteverify niedostepny, przepuszczam:', e?.message);
    }
  }

  const apiKey = env.MAILERLITE_API_KEY || '';
  // Wybor grupy wg pola `list` (server-side mapping, brak otwartego wstrzykiwania ID przez usera):
  //   list=pm    -> grupa PM (MAILERLITE_PM_GROUP_ID)
  //   list=inter -> grupa „Interesariusze - lista chetnych" (MAILERLITE_INTER_GROUP_ID, D126)
  //   inaczej    -> domyslna waitlist.
  const listKey = String(data.list || '').toLowerCase();
  const GROUP_BY_LIST = {
    pm: env.MAILERLITE_PM_GROUP_ID,
    inter: env.MAILERLITE_INTER_GROUP_ID,
  };
  // 🔴 GLOSNY FALLBACK, nie cichy (24.08.2026). Jesli formularz deklaruje ZNANA liste, a jej
  // zmiennej srodowiskowej nie ma w CF Pages, zapis i tak leci do domyslnej waitlisty, zeby nie
  // stracic leada, ALE zostawia blad w logach. Bez tego wpis z kampanii o interesariuszach
  // wyladowalby po cichu na liscie „AI-w-pracy early access" i nikt by sie nie dowiedzial,
  // dopoki ktos nie policzylby zapisow przy progu z D126.
  if (listKey in GROUP_BY_LIST && !GROUP_BY_LIST[listKey]) {
    // Bez adresu e-mail w logu: log Cloudflare to nie jest miejsce na dane osobowe,
    // a do diagnozy wystarczy nazwa listy. Kogo dotyczy, odczytamy z MailerLite.
    console.error(`Brak MAILERLITE_${listKey.toUpperCase()}_GROUP_ID — zapis leci do domyslnej waitlisty!`);
  }
  const groupId = GROUP_BY_LIST[listKey] || env.MAILERLITE_WAITLIST_GROUP_ID || '';
  const ip = request.headers.get('CF-Connecting-IP') || '';

  // 🔴 WYPISANY WCZESNIEJ (01.09.2026). Wykryte na zapisie testowym, nie w teorii.
  // MailerLite odrzuca POST /subscribers dla adresu ze statusem `unsubscribed` kodem 422
  // i komunikatem „This subscriber is unsubscribed and cannot be imported”. Do 01.09 konczylo sie
  // to CICHO: log lecial w prozni, a czlowiek dostawal /zapisano i nie dostawal nic wiecej.
  // Tak wlasnie przepadl zapis testowy z 01.09 i dowiedzielismy sie o tym tylko dlatego,
  // ze robil go wlasciciel i powiedzial, ze nie przyszedl mail.
  //
  // Ta flaga zmienia wylacznie to, CO WIDZI CZLOWIEK. Nie zapisujemy go na sile: odwrocenie
  // cudzej rezygnacji bez wyraznej zgody nie jest drobiazgiem technicznym, wiec kierujemy
  // go na strone z prawda i z adresem mailowym.
  let wypisanyWczesniej = false;

  if (apiKey && groupId) {
    const body = { email: v.email, fields: v.fields, groups: [groupId] };
    if (ip) { body.ip_address = ip; body.optin_ip = ip; }
    body.opted_in_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
      const r = await fetch(ML_URL, { method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
      if (!r.ok) {
        // Bez adresu e-mail w logu. Log Cloudflare to nie jest miejsce na dane osobowe,
        // a do diagnozy wystarczy kod i nazwa listy (poprawione 01.09: wczesniej lecial tu e-mail).
        console.error(`MailerLite non-2xx ${r.status} (lista: ${listKey || 'domyslna'})`);
        if (r.status === 422) {
          const tekst = await r.text().catch(() => '');
          if (/unsubscribed/i.test(tekst)) {
            wypisanyWczesniej = true;
            console.error(`Zapis odrzucony: adres ma status unsubscribed (lista: ${listKey || 'domyslna'})`);
          }
        }
      }
    } catch (e) { console.error('MailerLite failed', e?.message); }
  } else { console.error('Brak MAILERLITE_API_KEY / WAITLIST_GROUP_ID — pomijam zapis.'); }

  // PM: dedykowany thank-you (nie waitlista „AI w pracy"). Inaczej: /subscribed (EN) / /zapisano (PL).
  // `inter` celowo idzie na /zapisano, ale POWOD sie zmienil i komentarz byl nieaktualny:
  // od 27.08.2026 karta 1 NIE jest wysylana recznie, tylko automatem MailerLite
  // („Interesariusze - karta 1", wlaczony przez K, sprawdzony po tresci 28.08). Ekran /zapisano
  // zostaje, bo mowi prawde: karta idzie od razu, mailem, w kilka minut od zapisu.
  // Podziekowanie NALEZY SIE tylko wtedy, gdy zapis naprawde powstal. Przypadek wypisanego
  // wczesniej adresu ma wlasna strone, bo inaczej klamiemy czlowiekowi w twarz.
  const dest = wypisanyWczesniej
    ? '/zapis-wymaga-kontaktu'
    : (listKey === 'pm' ? '/pm-gotowe' : (v.lang === 'en' ? '/subscribed' : '/zapisano'));
  const to = new URL(dest, request.url);
  return Response.redirect(to.toString(), 302);
}
