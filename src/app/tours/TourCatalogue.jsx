"use client";

import { useId, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import TourCard from "@/components/TourCard";
import { Alert, EmptyState, Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const CATEGORIES = ["All", "Standard", "Premium", "VIP"];

export default function TourCatalogue({ tours, error }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const searchId = useId();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tours.filter((tour) => {
      const title = String(tour.title || "").toLowerCase();
      const location = String(tour.location || "").toLowerCase();
      const matchesQuery =
        needle.length === 0 || title.includes(needle) || location.includes(needle);
      const matchesCategory = category === "All" || tour.priority === category;
      return matchesQuery && matchesCategory;
    });
  }, [tours, query, category]);

  const isFiltering = query.trim().length > 0 || category !== "All";

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Destination or journey name"
              className="w-full rounded-xl border border-line-strong bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink shadow-sm placeholder:text-ink-subtle hover:border-sand-400"
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
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  category === item
                    ? "border-ocean-900 bg-ocean-900 text-white"
                    : "border-line-strong bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                {item}
              </button>
            ))}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
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
                : "Try a different destination or clear the category filter."
            }
            action={
              isFiltering ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                >
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
