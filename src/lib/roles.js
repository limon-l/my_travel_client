/**
 * Session helpers shared by server components and client components.
 * Roles come from the verified API sign-in response, never from the email.
 */

export const ADMIN_ROLE = "admin";
export const CUSTOMER_ROLE = "user";

export function isAdminSession(session) {
  return session?.user?.role === ADMIN_ROLE;
}

export function isAuthenticated(session) {
  return Boolean(session?.user?.id);
}

export function displayName(session) {
  const name = session?.user?.name;
  if (typeof name === "string" && name.trim().length > 0) return name.trim();
  return "Traveller";
}
