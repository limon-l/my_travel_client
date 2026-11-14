import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { identityFromSession } from "@/lib/identity";

/**
 * Server-component guards. The proxy already protects `/dashboard/*`, but every
 * private page re-checks the session and role so a proxy misconfiguration or a
 * direct RSC request cannot expose another role's surface.
 */

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.user.role !== "admin") redirect("/dashboard/bookings");
  return session;
}

export async function getIdentity() {
  return identityFromSession(await getSession());
}
