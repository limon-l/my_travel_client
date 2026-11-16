import { afterEach } from "vitest";

// A deterministic test secret: long enough for signSessionToken's 32-char floor.
process.env.API_SESSION_SECRET = "test-secret-that-is-definitely-long-enough-1234567890";
process.env.API_BASE_URL = "https://api.example.test";

afterEach(() => {
  delete globalThis.fetch;
});
