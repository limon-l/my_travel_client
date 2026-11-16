"use client";

/**
 * Browser API client. Every call goes through the same-origin Next.js bridge at
 * `/api/backend/*`, which attaches a server-signed identity token. No user id,
 * price, duration or role is ever trusted from this layer.
 */

export class ApiError extends Error {
  constructor(message, { status = 0, code = "NETWORK_ERROR", details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;

async function request(path, { method = "GET", body, idempotencyKey, signal } = {}) {
  const segments = String(path).split("/").filter(Boolean);
  if (segments.length === 0 || segments.some((segment) => !SAFE_SEGMENT.test(segment))) {
    throw new ApiError("Invalid request path", { code: "INVALID_PATH" });
  }

  let response;
  try {
    response = await fetch(`/api/backend/${segments.join("/")}`, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("You appear to be offline. Check your connection and retry.", {
      code: "NETWORK_ERROR",
    });
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const fallback =
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
          ? "You do not have permission to do that."
          : response.status === 404
            ? "We could not find what you were looking for."
            : response.status === 409
              ? "That changed while you were working. Refresh and try again."
              : response.status === 429
                ? "Too many attempts. Please wait a moment and try again."
                : response.status === 503
                  ? "The travel service is briefly unavailable. Your details are safe — retry in a moment."
                  : "Something went wrong. Please try again.";
    throw new ApiError(data?.error || fallback, {
      status: response.status,
      code: data?.code || `HTTP_${response.status}`,
      details: data?.details,
    });
  }

  return data;
}

function bookingRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const api = {
  // Public
  listTours: (options) => request("tours", options),
  getTour: (id, options) => request(`tours/${id}`, options),
  getAvailableDates: (id, options) => request(`tours/${id}/available-dates`, options),
  register: (payload) => request("register", { method: "POST", body: payload }),

  // Customer
  createBooking: ({ tourId, startDate, requestId }) =>
    request("bookings", {
      method: "POST",
      body: { tourId, startDate },
      idempotencyKey: requestId || bookingRequestId(),
    }),
  listBookings: (userId, options) => request(`bookings/${userId}`, options),
  cancelBooking: (bookingId) => request(`bookings/${bookingId}`, { method: "DELETE" }),
  getProfile: (userId, options) => request(`users/${userId}`, options),
  updateProfile: (userId, payload) => request(`users/${userId}`, { method: "PUT", body: payload }),

  // Admin
  admin: {
    summary: (options) => request("admin/summary", options),
    listBookings: (options) => request("admin/bookings", options),
    setBookingStatus: (bookingId, status, note) =>
      request(`admin/bookings/${bookingId}/status`, {
        method: "PUT",
        body: { status, note },
      }),
    createTour: (payload) => request("tours", { method: "POST", body: payload }),
    updateTour: (tourId, payload) => request(`tours/${tourId}`, { method: "PATCH", body: payload }),
    deleteTour: (tourId) => request(`tours/${tourId}`, { method: "DELETE" }),
    setAvailableDates: (tourId, availableDates) =>
      request(`tours/${tourId}/available-dates`, {
        method: "PUT",
        body: { availableDates },
      }),
  },
};

export { bookingRequestId };
