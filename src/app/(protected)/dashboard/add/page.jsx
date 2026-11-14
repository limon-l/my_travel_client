import AddTourForm from "./AddTourForm";
import { requireAdminSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add a journey",
};

export default async function AddPage() {
  await requireAdminSession();
  return <AddTourForm />;
}
