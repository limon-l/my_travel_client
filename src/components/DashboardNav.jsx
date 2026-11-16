"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const ADMIN_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/requests", label: "Requests & departures" },
  { href: "/dashboard/manage", label: "Journeys" },
  { href: "/dashboard/add", label: "New journey" },
];

const CUSTOMER_LINKS = [
  { href: "/dashboard/bookings", label: "My trips" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardNav({ role }) {
  const pathname = usePathname();
  const links = role === "admin" ? ADMIN_LINKS : CUSTOMER_LINKS;

  return (
    <nav aria-label="Account sections" className="-mx-1 overflow-x-auto no-scrollbar">
      <ul className="flex items-center gap-1 px-1">
        {links.map((link) => {
          const isActive =
            link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand text-on-brand"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
