"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Light / Dark / System theme engine.
 *
 * The initial class is applied by an inline script in the document head (see
 * `app/layout.js`) so there is no incorrect-theme flash. This provider owns the
 * user's choice, persists it, and follows the OS while in System mode.
 */

const STORAGE_KEY = "wa-theme";
const MODES = ["light", "dark", "system"];

const ThemeContext = createContext({
  mode: "system",
  resolved: "light",
  setMode: () => {},
});

function systemPrefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(mode) {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode === "dark" ? "dark" : "light";
}

function apply(mode) {
  const resolved = resolve(mode);
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }
  return resolved;
}

/** Reads the stored choice during the client's first render (SSR falls back). */
function readStoredMode() {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return MODES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/** The pre-paint script already set the class; mirror it instead of guessing. */
function initialResolved() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode);
  const [resolved, setResolved] = useState(initialResolved);

  // Synchronise the document with the chosen mode (the inline script covers the
  // very first paint). No state is written here, so this stays a pure external
  // system update.
  useEffect(() => {
    apply(mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (mode === "system") setResolved(apply("system"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((next) => {
    const value = MODES.includes(next) ? next : "system";
    setModeState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* Storage can be disabled; the theme still applies for this session. */
    }
    setResolved(apply(value));
  }, []);

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
