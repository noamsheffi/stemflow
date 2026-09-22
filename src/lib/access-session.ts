import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

export const ACCESS_COOKIE = "syllo_access";
export const SESSION_SECONDS = 60 * 60 * 24;

function secret() {
  const value = process.env.SYLLO_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SYLLO_SESSION_SECRET must contain at least 32 characters");
  return value;
}

export function validAccessCode(value: string) {
  const expected = Buffer.from(process.env.SYLLO_ACCESS_CODE || "system99");
  const actual = Buffer.from(value);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createAccessSession(now = Date.now()) {
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}

export function validAccessSession(token: string | undefined, now = Date.now()) {
  if (!token || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{32}$/.test(parts[1])) return false;
  const expiry = Number(parts[0]);
  if (expiry <= Math.floor(now / 1000) || expiry > Math.floor(now / 1000) + SESSION_SECONDS) return false;
  try {
    const expected = Buffer.from(signature(`${parts[0]}.${parts[1]}`));
    const actual = Buffer.from(parts[2]);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}

export function safeReturnPath(value: unknown) {
  if (typeof value !== "string" || !/^\/(admin|workspace|course|courses|lessons|formulas|concepts|slide-friction|lecturer)(\/|\?|$)/.test(value) || /[\\\r\n]/.test(value)) return "/workspace";
  return value;
}
