"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import TourCard from "@/components/TourCard";
import { Alert, EmptyState, Button, inputClasses } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  CATEGORIES,
  DURATION_BANDS,
  PRICE_BANDS,
  SORT_OPTIONS,
  filterTours,
  filtersFromSearchParams,
  filtersToSearchParams,
  hasActiveFilters,
} from "@/lib/catalogue-filter";

export default function TourCatalogue({ tours, error }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchId = useId();
  const priceId = useId();
  const durationId = useId();
  const sortId = useId();

  // The URL is the source of truth for shareable filter state. When the URL
  // changes from outside this component (back/forward, a shared link), adjust
  // state during render rather than in an effect.
  const urlFilters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const urlSerialized = filtersToSearchParams(urlFilters).toString();
  const [filters, setFilters] = useState(urlFilters);
  const [seenUrl, setSeenUrl] = useState(urlSerialized);

  if (seenUrl !== urlSerialized) {
    setSeenUrl(urlSerialized);
    setFilters(urlFilters);
  }

  useEffect(() => {
    const next = filtersToSearchParams(filters).toString();
    const current = searchParams.toString();
    if (next === current) return undefined;

    const timer = setTimeout(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, pathname, router, searchParams]);

  function update(field) {
    return (event) => setFilters((current) => ({ ...current, [field]: event.target.value }));
  }

  function reset() {
    setFilters({ query: "", category: "All", price: "any", duration: "any", sort: "recommended" });
  }

  const filtered = useMemo(() => filterTours(tours, filters), [tours, filters]);
  const isFiltering = hasActiveFilters(filters);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label htmlFor={searchId} className="mb-1.5 block text-sm font-semibold text-ink">
              Search journeys
            </label>
            <div className="relative">
              <Search
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
              <input
                id={searchId}
                type="search"
                value={filters.query}
                onChange={update("query")}
                placeholder="Destination, journey name or description"
                className={cn(inputClasses(), "pl-10")}
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <SlidersHorizontal size={15} aria-hidden="true" />
              Category
            </p>
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, category: item }))}
                  aria-pressed={filters.category === item}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    filters.category === item
                      ? "border-brand bg-brand text-on-brand"
                      : "border-line-strong bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor={priceId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Price
            </label>
            <select
              id={priceId}
              value={filters.price}
              onChange={update("price")}
              className={inputClasses()}
            >
              {PRICE_BANDS.map((band) => (
                <option key={band.value} value={band.value}>
                  {band.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={durationId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Duration
            </label>
            <select
              id={durationId}
              value={filters.duration}
              onChange={update("duration")}
              className={inputClasses()}
            >
              {DURATION_BANDS.map((band) => (
                <option key={band.value} value={band.value}>
                  {band.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={sortId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Sort by
            </label>
            <select
              id={sortId}
              value={filters.sort}
              onChange={update("sort")}
              className={inputClasses()}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted" role="status" aria-live="polite">
          {error
            ? "The catalogue could not be loaded."
            : `${filtered.length} of ${tours.length} journey${tours.length === 1 ? "" : "s"} shown`}
        </p>
        {isFiltering ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="mt-6">
        {error ? (
          <Alert tone="warning" role="alert" title="Catalogue temporarily unavailable">
            {error} Nothing is shown because inventing journeys would be worse than an
            honest empty state.
          </Alert>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={tours.length === 0 ? "No journeys published yet" : "No journeys match those filters"}
            description={
              tours.length === 0
                ? "Operations has not added a journey to the catalogue yet."
                : "Try a different destination or relax the price and duration filters."
            }
            action={
              isFiltering ? (
                <Button variant="secondary" onClick={reset}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tour, index) => (
              <TourCard key={tour._id} tour={tour} priority={index < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
