import DashboardNav from "@/components/DashboardNav";
import { Container } from "@/components/ui";
import { displayName, isAdminSession } from "@/lib/roles";
import { requireSession } from "@/lib/server-auth";

/**
 * Defence in depth: `src/proxy.js` already redirects unauthenticated visitors,
 * and this layout re-checks the session on the server for every account page.
 */
export default async function ProtectedLayout({ children }) {
  const session = await requireSession();
  const admin = isAdminSession(session);

  return (
    <div className="min-h-[70vh] pb-20">
      <div className="border-b border-line bg-surface">
        <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lagoon-700">
              {admin ? "Operations" : "Your account"}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink">
              {displayName(session)}
              <span className="ml-2 font-normal text-ink-muted">{session.user.email}</span>
            </p>
          </div>
          <DashboardNav role={admin ? "admin" : "user"} />
        </Container>
      </div>

      <Container className="pt-8">{children}</Container>
    </div>
  );
}
