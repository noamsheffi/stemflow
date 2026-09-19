import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const encoder = new TextEncoder();
const base64url = (value: Uint8Array | string) => Buffer.from(value).toString("base64url");
const sign = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("base64url");

export function isLecturerBasicAuth(authorization: string | null) {
  const username = process.env.LECTURER_USERNAME; const password = process.env.LECTURER_PASSWORD;
  if (!username || !password || !authorization?.startsWith("Basic ")) return false;
  try {
    const [candidateUser, ...rest] = Buffer.from(authorization.slice(6), "base64").toString("utf8").split(":");
    const candidate = `${candidateUser}:${rest.join(":")}`; const expected = `${username}:${password}`;
    return candidate.length === expected.length && timingSafeEqual(encoder.encode(candidate), encoder.encode(expected));
  } catch { return false; }
}

export function createLecturerSyncToken() {
  const secret = process.env.LECTURER_SYNC_TOKEN_SECRET;
  if (!secret) throw new Error("LECTURER_SYNC_TOKEN_SECRET is not configured.");
  const payload = base64url(JSON.stringify({ role: "lecturer-sync", exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }));
  return `${payload}.${sign(payload, secret)}`;
}

export function hasValidLecturerSyncToken(authorization: string | null) {
  const secret = process.env.LECTURER_SYNC_TOKEN_SECRET;
  if (!secret || !authorization?.startsWith("Bearer ")) return false;
  const [payload, signature] = authorization.slice(7).split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  if (signature.length !== expected.length || !timingSafeEqual(encoder.encode(signature), encoder.encode(expected))) return false;
  try { const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); return parsed.role === "lecturer-sync" && typeof parsed.exp === "number" && parsed.exp > Math.floor(Date.now() / 1000); } catch { return false; }
}
