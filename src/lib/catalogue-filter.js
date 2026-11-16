/**
 * Pure catalogue filtering and sorting.
 *
 * Extracted from the React component so the rules can be unit tested and the
 * UI stays a thin rendering layer. The catalogue is small enough for safe
 * client-side filtering; no unsupported query parameters are invented for the
 * Express API.
 */

export const CATEGORIES = Object.freeze(["All", "Standard", "Premium", "VIP"]);

export const PRICE_BANDS = Object.freeze([
  { value: "any", label: "Any price" },
  { value: "under-1000", label: "Under $1,000" },
  { value: "1000-2000", label: "$1,000 – $2,000" },
  { value: "over-2000", label: "Over $2,000" },
]);

export const DURATION_BANDS = Object.freeze([
  { value: "any", label: "Any duration" },
  { value: "short", label: "Up to 5 days" },
  { value: "medium", label: "6 – 10 days" },
  { value: "long", label: "11+ days" },
]);

export const SORT_OPTIONS = Object.freeze([
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "duration-asc", label: "Duration: shortest" },
  { value: "duration-desc", label: "Duration: longest" },
]);

const PRICE_VALUES = new Set(PRICE_BANDS.map((band) => band.value));
const DURATION_VALUES = new Set(DURATION_BANDS.map((band) => band.value));
const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value));
const CATEGORY_VALUES = new Set(CATEGORIES);

function priceMatches(price, band) {
  if (!Number.isFinite(price)) return band === "any";
  switch (band) {
    case "under-1000":
      return price < 1000;
    case "1000-2000":
      return price >= 1000 && price <= 2000;
    case "over-2000":
      return price > 2000;
    default:
      return true;
  }
}

function durationMatches(duration, band) {
  if (!Number.isFinite(duration)) return band === "any";
  switch (band) {
    case "short":
      return duration <= 5;
    case "medium":
      return duration >= 6 && duration <= 10;
    case "long":
      return duration >= 11;
    default:
      return true;
  }
}

export function normalizeFilters(input = {}) {
  return {
    query: typeof input.query === "string" ? input.query : "",
    category: CATEGORY_VALUES.has(input.category) ? input.category : "All",
    price: PRICE_VALUES.has(input.price) ? input.price : "any",
    duration: DURATION_VALUES.has(input.duration) ? input.duration : "any",
    sort: SORT_VALUES.has(input.sort) ? input.sort : "recommended",
  };
}

export function filterTours(tours, rawFilters = {}) {
  const filters = normalizeFilters(rawFilters);
  const needle = filters.query.trim().toLowerCase();

  const result = (Array.isArray(tours) ? tours : []).filter((tour) => {
    const haystack = `${tour.title || ""} ${tour.location || ""} ${
      tour.shortDesc || ""
    }`.toLowerCase();
    const matchesQuery = needle.length === 0 || haystack.includes(needle);
    const matchesCategory = filters.category === "All" || tour.priority === filters.category;
    return (
      matchesQuery &&
      matchesCategory &&
      priceMatches(Number(tour.price), filters.price) &&
      durationMatches(Number(tour.duration), filters.duration)
    );
  });

  if (filters.sort === "recommended") return result;

  return [...result].sort((a, b) => {
    if (filters.sort === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
    if (filters.sort === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
    if (filters.sort === "duration-asc") {
      return Number(a.duration || 0) - Number(b.duration || 0);
    }
    if (filters.sort === "duration-desc") {
      return Number(b.duration || 0) - Number(a.duration || 0);
    }
    return 0;
  });
}

export function hasActiveFilters(rawFilters = {}) {
  const filters = normalizeFilters(rawFilters);
  return (
    filters.query.trim().length > 0 ||
    filters.category !== "All" ||
    filters.price !== "any" ||
    filters.duration !== "any" ||
    filters.sort !== "recommended"
  );
}

/**
 * Serialises only non-default values so the URL stays readable and shareable.
 */
export function filtersToSearchParams(rawFilters = {}) {
  const filters = normalizeFilters(rawFilters);
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category !== "All") params.set("category", filters.category);
  if (filters.price !== "any") params.set("price", filters.price);
  if (filters.duration !== "any") params.set("duration", filters.duration);
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  return params;
}

export function filtersFromSearchParams(searchParams) {
  const read = (key) => {
    if (!searchParams) return "";
    if (typeof searchParams.get === "function") return searchParams.get(key) || "";
    return searchParams[key] || "";
  };
  return normalizeFilters({
    query: read("q"),
    category: read("category"),
    price: read("price"),
    duration: read("duration"),
    sort: read("sort"),
  });
}
