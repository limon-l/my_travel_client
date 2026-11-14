/**
 * Shapes a verified NextAuth session into the identity the Express API accepts.
 * Server-only: the result is used to sign a short-lived token.
 */
export function identityFromSession(session) {
  if (!session?.user?.id) return null;
  return {
    sub: String(session.user.id),
    role: session.user.role === "admin" ? "admin" : "user",
    name: session.user.name || undefined,
    email: session.user.email || undefined,
  };
}
