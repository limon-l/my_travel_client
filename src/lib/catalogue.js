import { UpstreamError, backendFetch } from "@/lib/backend";
import { isUpcoming } from "@/lib/dates";

/**
 * Server-only data access used by React Server Components. Every function
 * returns `{ data, error }` instead of throwing so pages can render an honest
 * "service unavailable" state rather than inventing content.
 */

function describe(error) {
  if (error instanceof UpstreamError) return error.message;
  return "The travel service could not be reached. Please retry shortly.";
}

export async function loadTours() {
  try {
    const data = await backendFetch("tours", { timeoutMs: 10000 });
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch (error) {
    return { data: [], error: describe(error) };
  }
}

export async function loadTour(id) {
  try {
    const data = await backendFetch(`tours/${id}`, { timeoutMs: 10000 });
    return { data, error: null, notFound: false };
  } catch (error) {
    const notFound = error instanceof UpstreamError && error.status === 404;
    return { data: null, error: notFound ? null : describe(error), notFound };
  }
}

export async function loadAvailability(id) {
  try {
    const data = await backendFetch(`tours/${id}/available-dates`, { timeoutMs: 10000 });
    return {
      dates: Array.isArray(data?.availableDates) ? data.availableDates : [],
      publishedCount: Number(data?.publishedCount) || 0,
      error: null,
    };
  } catch (error) {
    return { dates: [], publishedCount: 0, error: describe(error) };
  }
}

/**
 * Finds the traveller's active request for a tour, if any. A failed lookup is
 * treated as "no active request" so it never blocks browsing; the booking panel
 * still enforces the rule server-side.
 */
export async function findActiveBooking(identity, tourId) {
  if (!identity) return null;
  try {
    const bookings = await backendFetch(`bookings/${identity.sub}`, {
      identity,
      timeoutMs: 8000,
    });
    if (!Array.isArray(bookings)) return null;
    return (
      bookings.find((booking) => {
        const id = typeof booking.tour === "object" && booking.tour ? booking.tour._id : booking.tour;
        return (
          String(id) === String(tourId) &&
          (booking.status === "Pending" || booking.status === "Confirmed")
        );
      }) || null
    );
  } catch {
    return null;
  }
}

export function upcomingDates(tour) {
  const dates = Array.isArray(tour?.availableDates) ? tour.availableDates : [];
  return dates.filter((date) => isUpcoming(date)).sort();
}

export function featuredTours(tours, limit = 6) {
  return [...tours]
    .sort((a, b) => {
      const aDates = upcomingDates(a).length;
      const bDates = upcomingDates(b).length;
      if (aDates !== bDates) return bDates - aDates;
      return String(a.title || "").localeCompare(String(b.title || ""));
    })
    .slice(0, limit);
}
