import RequestsManager from "./RequestsManager";
import { requireAdminSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Requests & departures",
};

export default async function AdminRequestsPage() {
  await requireAdminSession();
  return <RequestsManager />;
}
