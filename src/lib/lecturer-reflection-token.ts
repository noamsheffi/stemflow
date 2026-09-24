import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const sessionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function signature(payload: string) {
  const secret = process.env.LECTURER_SYNC_TOKEN_SECRET;
  if (!secret) throw new Error("LECTURER_SYNC_TOKEN_SECRET is not configured.");
  return createHmac("sha256", secret).update(`lecturer-reflection:${payload}`).digest("base64url");
}

export function createLecturerReflectionToken(sessionId: string, now = Date.now()) {
  if (!sessionIdPattern.test(sessionId)) throw new Error("Invalid lecturer session ID.");
  const payload = `${sessionId}.${Math.floor(now / 1000) + 30 * 60}`;
  return `${payload}.${signature(payload)}`;
}

export function hasValidLecturerReflectionToken(token: string, sessionId: string, now = Date.now()) {
  if (!sessionIdPattern.test(sessionId) || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== sessionId || !/^\d+$/.test(parts[1])) return false;
  const expiresAt = Number(parts[1]);
  const nowSeconds = Math.floor(now / 1000);
  if (expiresAt <= nowSeconds || expiresAt > nowSeconds + 30 * 60) return false;
  try {
    const expected = Buffer.from(signature(`${parts[0]}.${parts[1]}`));
    const actual = Buffer.from(parts[2]);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
