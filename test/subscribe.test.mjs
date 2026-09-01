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

// 🔴 STANOWISKO (01.09.2026, D127 Decyzja 8). Pole nieobowiazkowe. Trzy warunki, ktore musza sie
// trzymac, bo od nich zalezy odczyt z 30.09: wpisane trafia do fields, puste NIE trafia wcale
// (pusty string nadpisalby wartosc w profilu subskrybenta), a dlugi wpis jest przyciety do 100.
test('stanowisko wpisane -> trafia do fields', () => {
  const r = validateSubscription({ email: 'a@b.pl', stanowisko: ' Kierownik projektu ' });
  assert.equal(r.ok, true);
  assert.equal(r.fields.stanowisko, 'Kierownik projektu');
});
test('stanowisko puste -> nie ma go w fields', () => {
  const r = validateSubscription({ email: 'a@b.pl', stanowisko: '   ' });
  assert.equal(r.ok, true);
  assert.equal('stanowisko' in r.fields, false);
});
test('stanowisko nieprzeslane -> nie ma go w fields', () => {
  const r = validateSubscription({ email: 'a@b.pl' });
  assert.equal('stanowisko' in r.fields, false);
});
test('stanowisko dluzsze niz 100 znakow -> przyciete', () => {
  const r = validateSubscription({ email: 'a@b.pl', stanowisko: 'x'.repeat(250) });
  assert.equal(r.fields.stanowisko.length, 100);
});
