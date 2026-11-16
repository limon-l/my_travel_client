import MyBookings from "./MyBookings";
import { requireSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My trips",
};

export default async function BookingsPage() {
  const session = await requireSession();
  return <MyBookings userId={session.user.id} />;
}
