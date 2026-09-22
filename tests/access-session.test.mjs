import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAccessSession, validAccessSession, validAccessCode, safeReturnPath, SESSION_SECONDS } from '../src/lib/access-session.ts';
process.env.SYLLO_SESSION_SECRET = 'test-secret-with-at-least-32-characters';
process.env.SYLLO_ACCESS_CODE = 'system99';

test('shared code requires an exact match', () => {
  assert.equal(validAccessCode('system99'), true);
  for (const value of ['', 'System99', 'system99 ', 'incorrect']) assert.equal(validAccessCode(value), false);
});
test('session rejects forgery, malformed tokens and expiry', () => {
  const now = 1800000000000;
  const token = createAccessSession(now);
  assert.equal(validAccessSession(token, now), true);
  assert.equal(validAccessSession(token, now + SESSION_SECONDS * 1000), false);
  assert.equal(validAccessSession(token + 'x', now), false);
  assert.equal(validAccessSession('99999999999.nonce.fake', now), false);
  assert.equal(validAccessSession(undefined, now), false);
  assert.equal(validAccessSession('system99', now), false);
});
test('return destination stays inside learning routes', () => {
  assert.equal(safeReturnPath('/course/communication-systems?view=lessons'), '/course/communication-systems?view=lessons');
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/api/auth/logout', '/login', '/workspace\n']) assert.equal(safeReturnPath(path), '/workspace');
});
test('missing signing key fails closed', () => {
  const token = createAccessSession();
  const key = process.env.SYLLO_SESSION_SECRET;
  delete process.env.SYLLO_SESSION_SECRET;
  assert.equal(validAccessSession(token), false);
  assert.throws(() => createAccessSession());
  process.env.SYLLO_SESSION_SECRET = key;
});
