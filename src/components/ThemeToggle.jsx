"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/cn";
import { useTheme } from "@/components/ThemeProvider";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

const noopSubscribe = () => () => {};

export default function ThemeToggle({ className }) {
  const { mode, setMode } = useTheme();
  // Hydration-safe mount flag: `false` during SSR and hydration, `true` after.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "h-9 w-[6.75rem] rounded-full border border-line bg-surface",
          className,
        )}
      />
    );
  }

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-brand-soft text-brand-ink"
                : "text-ink-subtle hover:bg-surface-muted hover:text-ink",
            )}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
