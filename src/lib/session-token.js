import crypto from "node:crypto";

/**
 * Server-only helper that mints the short-lived token the Express API verifies.
 *
 * The browser never sees this token and never supplies its own identity. It is
 * created per upstream request from the NextAuth session, which is signed and
 * encrypted by NextAuth itself.
 */

const MIN_SECRET_LENGTH = 32;
const TOKEN_TTL_SECONDS = 120;

function secret() {
  const value = process.env.API_SESSION_SECRET;
  if (typeof value !== "string" || value.length < MIN_SECRET_LENGTH) return null;
  return value;
}

export function isApiBridgeConfigured() {
  return secret() !== null;
}

function encode(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function signSessionToken(identity) {
  const key = secret();
  if (!key) {
    throw new Error(
      "API_SESSION_SECRET is missing or shorter than 32 characters. Add it to the client and API environments.",
    );
  }
  if (!identity?.sub) throw new Error("Cannot sign a token without a subject");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(identity.sub),
    role: identity.role === "admin" ? "admin" : "user",
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  if (identity.name) payload.name = String(identity.name).slice(0, 120);
  if (identity.email) payload.email = String(identity.email).slice(0, 254);

  const encoded = encode(payload);
  const signature = crypto.createHmac("sha256", key).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}
