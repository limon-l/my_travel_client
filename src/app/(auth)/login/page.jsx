import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p>Loading...</p>
        </div>
      }>
      <LoginForm />
    </Suspense>
  );
}
