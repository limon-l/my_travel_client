import { describe, expect, it } from "vitest";

import {
  filterTours,
  filtersFromSearchParams,
  filtersToSearchParams,
  hasActiveFilters,
  normalizeFilters,
} from "@/lib/catalogue-filter";

const TOURS = [
  { _id: "1", title: "Coastal Japan", location: "Japan", price: 2400, duration: 12, priority: "Premium", shortDesc: "Temples and coast" },
  { _id: "2", title: "Atlas Mountains", location: "Morocco", price: 900, duration: 5, priority: "Standard", shortDesc: "Berber valleys" },
  { _id: "3", title: "Patagonia Traverse", location: "Chile", price: 1800, duration: 9, priority: "VIP", shortDesc: "Glaciers" },
  { _id: "4", title: "Lofoten Light", location: "Norway", price: 1500, duration: 6, priority: "Premium", shortDesc: "Arctic coast" },
];

const titles = (tours) => tours.map((tour) => tour.title);

describe("catalogue filtering", () => {
  it("returns everything with default filters", () => {
    expect(titles(filterTours(TOURS, {}))).toEqual(titles(TOURS));
  });

  it("matches title, location and description case-insensitively", () => {
    expect(titles(filterTours(TOURS, { query: "japan" }))).toEqual(["Coastal Japan"]);
    expect(titles(filterTours(TOURS, { query: "morocco" }))).toEqual(["Atlas Mountains"]);
    expect(titles(filterTours(TOURS, { query: "glaciers" }))).toEqual(["Patagonia Traverse"]);
  });

  it("filters by category", () => {
    expect(titles(filterTours(TOURS, { category: "Premium" }))).toEqual([
      "Coastal Japan",
      "Lofoten Light",
    ]);
    expect(filterTours(TOURS, { category: "VIP" })).toHaveLength(1);
  });

  it("filters by price band", () => {
    expect(titles(filterTours(TOURS, { price: "under-1000" }))).toEqual(["Atlas Mountains"]);
    expect(titles(filterTours(TOURS, { price: "1000-2000" }))).toEqual([
      "Patagonia Traverse",
      "Lofoten Light",
    ]);
    expect(titles(filterTours(TOURS, { price: "over-2000" }))).toEqual(["Coastal Japan"]);
  });

  it("filters by duration band", () => {
    expect(titles(filterTours(TOURS, { duration: "short" }))).toEqual(["Atlas Mountains"]);
    expect(titles(filterTours(TOURS, { duration: "medium" }))).toEqual([
      "Patagonia Traverse",
      "Lofoten Light",
    ]);
    expect(titles(filterTours(TOURS, { duration: "long" }))).toEqual(["Coastal Japan"]);
  });

  it("combines filters", () => {
    expect(
      titles(filterTours(TOURS, { query: "a", category: "Premium", duration: "medium" })),
    ).toEqual(["Lofoten Light"]);
  });

  it("sorts without mutating the input", () => {
    const original = titles(TOURS);
    expect(titles(filterTours(TOURS, { sort: "price-asc" }))).toEqual([
      "Atlas Mountains",
      "Lofoten Light",
      "Patagonia Traverse",
      "Coastal Japan",
    ]);
    expect(titles(filterTours(TOURS, { sort: "price-desc" }))[0]).toBe("Coastal Japan");
    expect(titles(filterTours(TOURS, { sort: "duration-asc" }))[0]).toBe("Atlas Mountains");
    expect(titles(filterTours(TOURS, { sort: "duration-desc" }))[0]).toBe("Coastal Japan");
    expect(titles(TOURS)).toEqual(original);
  });

  it("ignores unsupported filter values instead of throwing", () => {
    expect(normalizeFilters({ category: "Luxury", price: "free", sort: "random" })).toEqual({
      query: "",
      category: "All",
      price: "any",
      duration: "any",
      sort: "recommended",
    });
    expect(filterTours(null, {})).toEqual([]);
  });

  it("detects whether any filter is active", () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ query: "  " })).toBe(false);
    expect(hasActiveFilters({ query: "japan" })).toBe(true);
    expect(hasActiveFilters({ price: "over-2000" })).toBe(true);
    expect(hasActiveFilters({ sort: "recommended" })).toBe(false);
  });
});

describe("catalogue URL state", () => {
  it("serialises only non-default values", () => {
    expect(filtersToSearchParams({}).toString()).toBe("");
    const params = filtersToSearchParams({
      query: "  japan ",
      category: "Premium",
      price: "over-2000",
      duration: "long",
      sort: "price-asc",
    });
    expect(params.get("q")).toBe("japan");
    expect(params.get("category")).toBe("Premium");
    expect(params.get("price")).toBe("over-2000");
    expect(params.get("duration")).toBe("long");
    expect(params.get("sort")).toBe("price-asc");
  });

  it("round-trips through URLSearchParams", () => {
    const filters = {
      query: "coast",
      category: "VIP",
      price: "under-1000",
      duration: "short",
      sort: "duration-desc",
    };
    const params = filtersToSearchParams(filters);
    expect(filtersFromSearchParams(params)).toEqual(filters);
  });

  it("tolerates missing and invalid params", () => {
    expect(filtersFromSearchParams(new URLSearchParams())).toEqual({
      query: "",
      category: "All",
      price: "any",
      duration: "any",
      sort: "recommended",
    });
    expect(
      filtersFromSearchParams(new URLSearchParams("category=Bogus&price=free&sort=weird")),
    ).toEqual({
      query: "",
      category: "All",
      price: "any",
      duration: "any",
      sort: "recommended",
    });
  });
});
