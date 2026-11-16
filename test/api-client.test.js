import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, api } from "@/lib/api-client";

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  };
}

describe("browser API client", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("rejects path traversal before touching the network", async () => {
    await expect(api.getTour("../admin/bookings")).rejects.toMatchObject({
      code: "INVALID_PATH",
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("calls the same-origin bridge for public reads", async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(200, [{ _id: "t1", title: "A" }]));

    const tours = await api.listTours();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/backend/tours",
      expect.objectContaining({ method: "GET", credentials: "same-origin" }),
    );
    expect(tours).toHaveLength(1);
  });

  it("maps a structured upstream error to ApiError", async () => {
    globalThis.fetch.mockResolvedValue(
      jsonResponse(409, {
        error: "That departure is no longer available.",
        code: "CONFLICT",
        details: { currentStatus: "Pending" },
      }),
    );

    await expect(api.createBooking({ tourId: "t1", startDate: "2026-08-01" })).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      code: "CONFLICT",
      message: "That departure is no longer available.",
      details: { currentStatus: "Pending" },
    });
  });

  it("sends only server-acceptable booking fields plus an idempotency key", async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(201, { booking: { _id: "b1" } }));

    await api.createBooking({
      tourId: "t1",
      startDate: "2026-08-01",
      requestId: "request-12345",
    });

    const [, options] = globalThis.fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Idempotency-Key"]).toBe("request-12345");
    expect(JSON.parse(options.body)).toEqual({ tourId: "t1", startDate: "2026-08-01" });
    expect(JSON.parse(options.body)).not.toHaveProperty("userId");
    expect(JSON.parse(options.body)).not.toHaveProperty("price");
  });

  it("uses DELETE for withdrawal", async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse(200, { message: "Booking cancelled" }));

    await api.cancelBooking("b1");

    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toBe("/api/backend/bookings/b1");
    expect(options.method).toBe("DELETE");
  });

  it("turns an offline failure into a human-readable network error", async () => {
    globalThis.fetch.mockRejectedValue(new TypeError("fetch failed"));

    await expect(api.listTours()).rejects.toMatchObject({
      name: "ApiError",
      code: "NETWORK_ERROR",
    });
  });

  it("does not swallow an aborted request", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    globalThis.fetch.mockRejectedValue(abort);

    await expect(api.listTours()).rejects.toBe(abort);
  });
});
