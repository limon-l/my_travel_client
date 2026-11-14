import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { LoadingState } from "@/components/ui";

export const metadata = {
  title: "Sign in",
  description: "Sign in to request published departures and track operations decisions.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading sign-in…" />}>
      <LoginForm />
    </Suspense>
  );
}
