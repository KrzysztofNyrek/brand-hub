// functions/api/_subscribe_core.mjs
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v ?? '').replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, max);

export function validateSubscription(data) {
  const honeypot = clean(data.firma_www ?? data.honeypot_website, 200);
  if (honeypot !== '') return { ok: false, status: 403 };
  const email = clean(data.email, 200).toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, status: 400 };
  return {
    ok: true,
    email,
    fields: {
      utm_source: clean(data.utm_source, 100),
      utm_campaign: clean(data.utm_campaign, 100),
      utm_content: clean(data.utm_content, 100),
    },
    lang: data.lang === 'en' ? 'en' : 'pl',
  };
}
