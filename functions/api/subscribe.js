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
  //   list=pm -> grupa PM (MAILERLITE_PM_GROUP_ID); w przeciwnym razie domyslna waitlist.
  const listKey = String(data.list || '').toLowerCase();
  const groupId = (listKey === 'pm' && env.MAILERLITE_PM_GROUP_ID)
    ? env.MAILERLITE_PM_GROUP_ID
    : (env.MAILERLITE_WAITLIST_GROUP_ID || '');
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

  const to = new URL(v.lang === 'en' ? '/subscribed' : '/zapisano', request.url);
  return Response.redirect(to.toString(), 302);
}
