import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/backend";
import { authOptions } from "@/lib/auth";
import { identityFromSession } from "@/lib/identity";
import { isApiBridgeConfigured, signSessionToken } from "@/lib/session-token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Same-origin bridge between the browser and the Express API.
 *
 * Why this exists:
 * - The browser used to send `userId` (and price/duration) directly to the API,
 *   so any caller could act as any user. Identity is now derived from the
 *   NextAuth session and signed here.
 * - The API base URL and shared secret stay server-side.
 *
 * This is an *allowlist*: anything not listed below returns 404, and every
 * request body is rebuilt from known fields so a browser cannot smuggle
 * identity, role, price, status or timestamps through. The Express API enforces
 * the same rules independently — this layer is defence in depth.
 */

const TOUR_ID = "[A-Za-z0-9_-]+";
const BOOKING_ID = "[A-Za-z0-9_-]+";
const USER_ID = "[A-Za-z0-9_-]+";

const REGISTER_FIELDS = ["name", "email", "password", "hometown", "dob"];
const BOOKING_FIELDS = ["tourId", "startDate"];
const PROFILE_FIELDS = ["name", "hometown", "dob"];
const STATUS_FIELDS = ["status", "note"];
const TOUR_FIELDS = [
  "title",
  "shortDesc",
  "fullDesc",
  "location",
  "image",
  "price",
  "duration",
  "priority",
  "availableDates",
];
const DATE_FIELDS = ["availableDates"];

const ROUTES = [
  // Public catalogue + registration
  { method: "GET", pattern: /^tours$/, access: "public" },
  { method: "GET", pattern: new RegExp(`^tours/${TOUR_ID}$`), access: "public" },
  {
    method: "GET",
    pattern: new RegExp(`^tours/${TOUR_ID}/available-dates$`),
    access: "public",
  },
  { method: "POST", pattern: /^register$/, access: "public", fields: REGISTER_FIELDS },

  // Customer
  { method: "POST", pattern: /^bookings$/, access: "user", fields: BOOKING_FIELDS, scope: "self" },
  { method: "GET", pattern: new RegExp(`^bookings/${USER_ID}$`), access: "user", scope: "self" },
  { method: "DELETE", pattern: new RegExp(`^bookings/${BOOKING_ID}$`), access: "user" },
  { method: "GET", pattern: new RegExp(`^users/${USER_ID}$`), access: "user", scope: "self" },
  {
    method: "PUT",
    pattern: new RegExp(`^users/${USER_ID}$`),
    access: "user",
    fields: PROFILE_FIELDS,
    scope: "self",
  },

  // Operations
  { method: "GET", pattern: /^admin\/summary$/, access: "admin" },
  { method: "GET", pattern: /^admin\/bookings$/, access: "admin" },
  {
    method: "PUT",
    pattern: new RegExp(`^admin/bookings/${BOOKING_ID}/status$`),
    access: "admin",
    fields: STATUS_FIELDS,
  },
  { method: "POST", pattern: /^tours$/, access: "admin", fields: TOUR_FIELDS },
  {
    method: "PATCH",
    pattern: new RegExp(`^tours/${TOUR_ID}$`),
    access: "admin",
    fields: TOUR_FIELDS,
  },
  { method: "DELETE", pattern: new RegExp(`^tours/${TOUR_ID}$`), access: "admin" },
  {
    method: "PUT",
    pattern: new RegExp(`^tours/${TOUR_ID}/available-dates$`),
    access: "admin",
    fields: DATE_FIELDS,
  },
];

function matchRoute(method, path) {
  return ROUTES.find((route) => route.method === method && route.pattern.test(path)) || null;
}

function parseSegments(params) {
  const raw = Array.isArray(params?.path) ? params.path : [];
  if (raw.length === 0) return null;
  if (raw.some((segment) => typeof segment !== "string" || !/^[A-Za-z0-9_-]+$/.test(segment))) {
    return null;
  }
  return raw;
}

function pickFields(body, fields) {
  const source = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  if (!fields) return source;
  const picked = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(source, field)) picked[field] = source[field];
  }
  return picked;
}

function jsonError(status, error, code) {
  return NextResponse.json({ error, code }, { status });
}

async function proxy(request, context) {
  const { params } = context;
  const resolved = await params;
  const segments = parseSegments(resolved);

  if (!segments) return jsonError(400, "Invalid API path", "INVALID_PATH");

  let path = segments.join("/");
  const method = request.method;
  const route = matchRoute(method, path);

  if (!route) {
    return jsonError(404, "This API route is not available", "ROUTE_NOT_ALLOWED");
  }

  if (!API_BASE_URL) {
    return jsonError(
      503,
      "The API URL is not configured for this deployment.",
      "API_NOT_CONFIGURED",
    );
  }

  if (!isApiBridgeConfigured()) {
    // Public catalogue reads do not need an identity token. Private routes fail
    // closed rather than silently forwarding an unsigned request.
    if (route.access !== "public") {
      return jsonError(
        503,
        "The API bridge secret is not configured. Set API_SESSION_SECRET.",
        "BRIDGE_NOT_CONFIGURED",
      );
    }
  }

  const session = await getServerSession(authOptions);
  const identity = identityFromSession(session);

  if (route.access !== "public" && !identity) {
    return jsonError(401, "Authentication required", "UNAUTHENTICATED");
  }

  if (route.access === "admin" && identity?.role !== "admin") {
    return jsonError(403, "Admin access required", "FORBIDDEN");
  }

  // Never let a caller address another account by id. The signed token decides
  // who "self" is; the route pattern only exists so the upstream contract holds.
  if (route.scope === "self" && identity) {
    const parts = path.split("/");
    if (parts.length === 2) {
      parts[1] = identity.sub;
      path = parts.join("/");
    }
  }

  let body;
  if (method !== "GET" && method !== "DELETE") {
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      rawBody = {};
    }
    body = pickFields(rawBody, route.fields);
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  const headers = {};
  if (idempotencyKey && /^[A-Za-z0-9._:-]{8,100}$/.test(idempotencyKey)) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  if (identity && isApiBridgeConfigured()) {
    headers.Authorization = `Bearer ${signSessionToken(identity)}`;
  }
  const upstream = await fetch(`${API_BASE_URL}/api/${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  }).catch((error) => {
    if (error?.name === "TimeoutError") {
      return jsonError(
        504,
        "The travel service took too long to respond. Please retry.",
        "UPSTREAM_TIMEOUT",
      );
    }
    return jsonError(
      502,
      "The travel service is unreachable right now.",
      "UPSTREAM_UNREACHABLE",
    );
  });

  if (upstream instanceof NextResponse) return upstream;

  const text = await upstream.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { error: "The travel service returned an unexpected response" };
  }

  return NextResponse.json(payload, {
    status: upstream.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
