import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

export const ACCESS_COOKIE = "syllo_access";
export const SESSION_SECONDS = 60 * 60 * 24;
export type AccessScope = "platform" | "admin";

function secret() {
  const value = process.env.SYLLO_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SYLLO_SESSION_SECRET must contain at least 32 characters");
  return value;
}

export function accessScopeForPath(path: string): AccessScope {
  return path === "/admin" || path.startsWith("/admin/") || path === "/api/admin" || path.startsWith("/api/admin/")
    ? "admin"
    : "platform";
}

export function validAccessCode(value: string, scope: AccessScope = "platform") {
  const configuredCode = scope === "admin" ? process.env.SYLLO_ADMIN_ACCESS_CODE : process.env.SYLLO_ACCESS_CODE;
  if (scope === "admin" && !configuredCode) return false;
  const expected = Buffer.from(configuredCode || "system99");
  const actual = Buffer.from(value);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createAccessSession(scope: AccessScope, now = Date.now()) {
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(16).toString("hex")}.${scope}`;
  return `${payload}.${signature(payload)}`;
}

export function validAccessSession(token: string | undefined, requiredScope?: AccessScope, now = Date.now()) {
  if (!token || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{32}$/.test(parts[1]) || (parts[2] !== "platform" && parts[2] !== "admin")) return false;
  if (requiredScope && parts[2] !== requiredScope) return false;
  const expiry = Number(parts[0]);
  if (expiry <= Math.floor(now / 1000) || expiry > Math.floor(now / 1000) + SESSION_SECONDS) return false;
  try {
    const expected = Buffer.from(signature(`${parts[0]}.${parts[1]}.${parts[2]}`));
    const actual = Buffer.from(parts[3]);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}

export function safeReturnPath(value: unknown) {
  if (typeof value !== "string" || !/^\/(admin|workspace|course|courses|lessons|formulas|concepts|slide-friction|lecturer|survey)(\/|\?|$)/.test(value) || /[\\\r\n]/.test(value)) return "/workspace";
  return value;
}
