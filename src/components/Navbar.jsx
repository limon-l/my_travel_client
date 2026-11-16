"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  CalendarDays,
  ChevronDown,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { displayName, isAdminSession } from "@/lib/roles";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Destinations", href: "/tours" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

function initials(name) {
  return String(name || "W")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const isAdmin = isAdminSession(session);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b transition-colors",
          scrolled
            ? "border-line bg-canvas/92 shadow-[0_10px_30px_-24px_rgba(13,41,51,0.5)] backdrop-blur-md"
            : "border-transparent bg-canvas/70 backdrop-blur-sm",
        )}
      >
        <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Primary">
          <Link href="/" className="flex items-center gap-2 rounded-md py-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand">
              <Compass size={18} aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl text-ink">Wanderlust</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-ink">
                Atlas
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex" onClick={closeAll}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-surface-muted text-brand-ink"
                      : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {status === "loading" ? (
              <span className="h-9 w-24 animate-pulse rounded-full bg-surface-muted" aria-hidden="true" />
            ) : session ? (
              <div className="relative">
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1 pr-3 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-on-brand"
                  >
                    {initials(displayName(session))}
                  </span>
                  <span className="max-w-[9rem] truncate">{displayName(session).split(" ")[0]}</span>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn("text-ink-subtle transition-transform", menuOpen && "rotate-180")}
                  />
                </button>

                {menuOpen ? (
                  <div
                    ref={menuRef}
                    role="menu"
                    aria-label="Account"
                    onClick={closeAll}
                    className="absolute right-0 top-[calc(100%+0.5rem)] w-64 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-xl"
                  >
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{displayName(session)}</p>
                      <p className="truncate text-xs text-ink-muted">{session.user.email}</p>
                      {isAdmin ? (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-ink">
                          Operations
                        </p>
                      ) : null}
                    </div>

                    {isAdmin ? (
                      <>
                        <Link
                          href="/dashboard"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
                        >
                          <LayoutDashboard size={16} aria-hidden="true" />
                          Operations overview
                        </Link>
                        <Link
                          href="/dashboard/requests"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
                        >
                          <CalendarDays size={16} aria-hidden="true" />
                          Requests & departures
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/dashboard/bookings"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
                        >
                          <CalendarDays size={16} aria-hidden="true" />
                          My trips
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
                        >
                          <UserRound size={16} aria-hidden="true" />
                          Profile
                        </Link>
                      </>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-1 flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-sm text-danger hover:bg-danger-soft"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg border border-line-strong bg-surface p-2 text-ink md:hidden"
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </nav>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="reveal border-b border-line bg-canvas shadow-lg md:hidden"
          onClick={closeAll}
        >
          <div className="container-page space-y-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(link.href)
                    ? "bg-surface-muted text-brand-ink"
                    : "text-ink-muted hover:bg-surface-muted",
                )}
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-3 border-t border-line pt-3">
              {session ? (
                <div className="space-y-1">
                  <p className="px-3 pb-1 text-xs text-ink-subtle">
                    Signed in as {session.user.email}
                  </p>
                  <Link
                    href={isAdmin ? "/dashboard" : "/dashboard/bookings"}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface-muted"
                  >
                    {isAdmin ? "Operations overview" : "My trips"}
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/dashboard/requests"
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface-muted"
                    >
                      Requests & departures
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/profile"
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface-muted"
                    >
                      Profile
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-soft"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-1">
                  <Link
                    href="/login"
                    className="rounded-full border border-line-strong bg-surface px-4 py-2.5 text-center text-sm font-semibold text-ink"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-on-brand"
                  >
                    Create account
                  </Link>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-line px-1 pt-3">
                <p className="text-xs font-medium text-ink-subtle">Colour theme</p>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
