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
  if (apiKey && groupId) {
    const body = { email: v.email, fields: v.fields, groups: [groupId] };
    if (ip) { body.ip_address = ip; body.optin_ip = ip; }
    body.opted_in_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
      const r = await fetch(ML_URL, { method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
      if (!r.ok) console.error('MailerLite non-2xx', r.status, v.email);
    } catch (e) { console.error('MailerLite failed', e?.message); }
  } else { console.error('Brak MAILERLITE_API_KEY / WAITLIST_GROUP_ID — pomijam zapis.'); }

  // PM: dedykowany thank-you (nie waitlista „AI w pracy"). Inaczej: /subscribed (EN) / /zapisano (PL).
  // `inter` celowo idzie na /zapisano: karta 1 i tak jest wysylana RECZNIE (plan MailerLite
  // dopuszcza trzy automatyzacje i wszystkie sa zajete), wiec dedykowany ekran obiecywalby
  // natychmiastowa wysylke, ktorej nie ma czym wykonac. Strona ofertowa mowi to wprost.
  const dest = listKey === 'pm' ? '/pm-gotowe' : (v.lang === 'en' ? '/subscribed' : '/zapisano');
  const to = new URL(dest, request.url);
  return Response.redirect(to.toString(), 302);
}
