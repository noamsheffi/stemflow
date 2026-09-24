import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessScopeForPath, createAccessSession, validAccessSession, validAccessCode, safeReturnPath, SESSION_SECONDS } from '../src/lib/access-session.ts';
process.env.SYLLO_SESSION_SECRET = 'test-secret-with-at-least-32-characters';
process.env.SYLLO_ACCESS_CODE = 'system99';
process.env.SYLLO_ADMIN_ACCESS_CODE = 'admin-only-test-code';

test('platform and admin codes are isolated and require exact matches', () => {
  assert.equal(validAccessCode('system99', 'platform'), true);
  assert.equal(validAccessCode('admin-only-test-code', 'admin'), true);
  assert.equal(validAccessCode('system99', 'admin'), false);
  assert.equal(validAccessCode('admin-only-test-code', 'platform'), false);
  for (const value of ['', 'System99', 'system99 ', 'incorrect']) assert.equal(validAccessCode(value, 'platform'), false);
});
test('session rejects forgery, malformed tokens and expiry', () => {
  const now = 1800000000000;
  const token = createAccessSession('platform', now);
  assert.equal(validAccessSession(token, 'platform', now), true);
  assert.equal(validAccessSession(token, 'admin', now), false);
  assert.equal(validAccessSession(token, 'platform', now + SESSION_SECONDS * 1000), false);
  assert.equal(validAccessSession(token + 'x', 'platform', now), false);
  assert.equal(validAccessSession('99999999999.nonce.fake', 'platform', now), false);
  assert.equal(validAccessSession(undefined, 'platform', now), false);
  assert.equal(validAccessSession('system99', 'platform', now), false);
  assert.equal(validAccessSession(createAccessSession('admin', now), 'platform', now), false);
});
test('admin paths select the admin scope and student routes select platform scope', () => {
  assert.equal(accessScopeForPath('/admin'), 'admin');
  assert.equal(accessScopeForPath('/admin/surveys/001-problem-discovery'), 'admin');
  assert.equal(accessScopeForPath('/api/admin/overview'), 'admin');
  assert.equal(accessScopeForPath('/workspace'), 'platform');
  assert.equal(accessScopeForPath('/course/communication-systems'), 'platform');
});
test('return destination stays inside learning routes', () => {
  assert.equal(safeReturnPath('/course/communication-systems?view=lessons'), '/course/communication-systems?view=lessons');
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/api/auth/logout', '/login', '/workspace\n']) assert.equal(safeReturnPath(path), '/workspace');
});
test('missing signing key fails closed', () => {
  const token = createAccessSession('platform');
  const key = process.env.SYLLO_SESSION_SECRET;
  delete process.env.SYLLO_SESSION_SECRET;
  assert.equal(validAccessSession(token, 'platform'), false);
  assert.throws(() => createAccessSession('platform'));
  process.env.SYLLO_SESSION_SECRET = key;
});
