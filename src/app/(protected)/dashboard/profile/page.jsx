import { redirect } from "next/navigation";

import ProfileForm from "./ProfileForm";
import { requireSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await requireSession();
  if (session.user.role === "admin") redirect("/dashboard");
  return <ProfileForm userId={session.user.id} />;
}
