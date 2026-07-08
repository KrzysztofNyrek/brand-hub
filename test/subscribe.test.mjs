// test/subscribe.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSubscription } from '../functions/api/_subscribe_core.mjs';

test('valid email + empty honeypot -> ok', () => {
  const r = validateSubscription({ email: 'a@b.pl', honeypot_website: '' });
  assert.equal(r.ok, true);
  assert.equal(r.email, 'a@b.pl');
});
test('filled honeypot -> 403', () => {
  const r = validateSubscription({ email: 'a@b.pl', honeypot_website: 'x' });
  assert.equal(r.ok, false); assert.equal(r.status, 403);
});
test('bad email -> 400', () => {
  const r = validateSubscription({ email: 'nope', honeypot_website: '' });
  assert.equal(r.ok, false); assert.equal(r.status, 400);
});
test('email lowercased + trimmed', () => {
  const r = validateSubscription({ email: '  A@B.PL ', honeypot_website: '' });
  assert.equal(r.email, 'a@b.pl');
});
