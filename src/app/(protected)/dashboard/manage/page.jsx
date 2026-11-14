import TourInventory from "./TourInventory";
import { requireAdminSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journey inventory",
};

export default async function ManagePage() {
  await requireAdminSession();
  return <TourInventory />;
}
