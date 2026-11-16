import { signSessionToken } from "./session-token";

/**
 * Server-side access to the Wanderlust Express API.
 *
 * All browser traffic is proxied through `/api/backend/*`, so `NEXT_PUBLIC_*`
 * is no longer required for data access and the API base URL stays server-side.
 */

/**
 * Accepts either `https://host` or the legacy `https://host/api` value and
 * normalises it to the origin the routes below append `/api/...` to.
 */
export function normalizeApiBaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "",
);

export class UpstreamError extends Error {
  constructor(message, { status = 500, code = "UPSTREAM_ERROR", details } = {}) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Calls the Express API. `identity` is an optional NextAuth-derived object
 * `{ sub, role, name, email }`; when present a signed token is attached.
 */
export async function backendFetch(
  path,
  { method = "GET", body, identity, headers = {}, timeoutMs = 12000 } = {},
) {
  if (!API_BASE_URL) {
    throw new UpstreamError(
      "The API base URL is not configured. Set API_BASE_URL (or NEXT_PUBLIC_API_URL) on the server.",
      { status: 503, code: "API_NOT_CONFIGURED" },
    );
  }

  const url = `${API_BASE_URL}/api/${path.replace(/^\/+/, "")}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(identity ? { Authorization: `Bearer ${signSessionToken(identity)}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "The API returned an unexpected response" };
      }
    }

    if (!response.ok) {
      throw new UpstreamError(data?.error || "The request could not be completed", {
        status: response.status,
        code: data?.code || "UPSTREAM_ERROR",
        details: data?.details,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (error.name === "AbortError") {
      throw new UpstreamError("The travel service took too long to respond. Please retry.", {
        status: 504,
        code: "UPSTREAM_TIMEOUT",
      });
    }
    throw new UpstreamError("The travel service is unreachable right now.", {
      status: 502,
      code: "UPSTREAM_UNREACHABLE",
    });
  } finally {
    clearTimeout(timer);
  }
}
