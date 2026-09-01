// functions/api/_subscribe_core.mjs
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v ?? '').replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, max);

export function validateSubscription(data) {
  const honeypot = clean(data.firma_www ?? data.honeypot_website, 200);
  if (honeypot !== '') return { ok: false, status: 403 };
  const email = clean(data.email, 200).toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, status: 400 };
  // 🔴 STANOWISKO (01.09.2026, D127 Decyzja 8). Pole NIEOBOWIAZKOWE i jedyny przyrzad testu,
  // ktory D127 nazywa rozstrzygajacym: „do 30.09 odczytujemy z MailerLite tytuly zapisanych na
  // liste". Bez niego 30.09 nie ma czego odczytac, a Decyzja 8 przestaje byc testem i staje sie
  // odroczeniem sporu. Do MailerLite wysylamy je TYLKO gdy czlowiek cos wpisal: pusta wartosc
  // nadpisywalaby to, co juz stoi w profilu subskrybenta.
  const stanowisko = clean(data.stanowisko, 100);
  const fields = {
    utm_source: clean(data.utm_source, 100),
    utm_campaign: clean(data.utm_campaign, 100),
    utm_content: clean(data.utm_content, 100),
  };
  if (stanowisko) fields.stanowisko = stanowisko;
  return {
    ok: true,
    email,
    fields,
    lang: data.lang === 'en' ? 'en' : 'pl',
  };
}
