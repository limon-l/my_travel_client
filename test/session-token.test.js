import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import { signSessionToken } from "@/lib/session-token";

function decode(token) {
  const [encoded] = token.split(".");
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
}

describe("server-signed identity token", () => {
  it("signs subject, normalised role and a two-minute expiry", () => {
    const token = signSessionToken({ sub: "user-123", role: "admin" });
    const payload = decode(token);

    expect(token.split(".")).toHaveLength(2);
    expect(payload.sub).toBe("user-123");
    expect(payload.role).toBe("admin");
    expect(payload.exp - payload.iat).toBe(120);
  });

  it("normalises any unknown role to user", () => {
    const payload = decode(signSessionToken({ sub: "user-123", role: "superuser" }));
    expect(payload.role).toBe("user");
  });

  it("produces a verifiable HMAC over the encoded payload", () => {
    const token = signSessionToken({ sub: "user-123", role: "user" });
    const [encoded, signature] = token.split(".");
    const expected = crypto
      .createHmac("sha256", process.env.API_SESSION_SECRET)
      .update(encoded)
      .digest("base64url");
    expect(signature).toBe(expected);
  });

  it("refuses to sign without a subject", () => {
    expect(() => signSessionToken({ role: "user" })).toThrow(/subject/i);
  });

  it("refuses to sign when the shared secret is too short", () => {
    const original = process.env.API_SESSION_SECRET;
    process.env.API_SESSION_SECRET = "too-short";
    try {
      expect(() => signSessionToken({ sub: "user-123" })).toThrow(/API_SESSION_SECRET/);
    } finally {
      process.env.API_SESSION_SECRET = original;
    }
  });
});
