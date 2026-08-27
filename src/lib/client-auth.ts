import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

// Session for a logged-in Client (the customer, not the VA/staff User in
// auth.ts). Deliberately mirrors auth.ts's HMAC-signed-cookie shape exactly
// — same SESSION_SECRET, same encode/decode scheme — but with its own
// cookie name so the two session types can never be confused with each
// other, and can coexist in the same browser (e.g. a VA previewing the
// client area). This never replaces the Client.portalToken / /p/[token]
// link — that stays a permanent, unauthenticated fallback.
const COOKIE_NAME = "client_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-only-insecure-secret";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function encode(clientId: string): string {
  const payload = JSON.stringify({ clientId, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const b64 = Buffer.from(payload).toString("base64url");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

function decode(token: string): { clientId: string } | null {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = sign(b64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (typeof payload.clientId !== "string" || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return { clientId: payload.clientId };
  } catch {
    return null;
  }
}

export async function createClientSession(clientId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, encode(clientId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyClientSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentClient() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = decode(token);
  if (!decoded) return null;
  return prisma.client.findUnique({ where: { id: decoded.clientId } });
}
