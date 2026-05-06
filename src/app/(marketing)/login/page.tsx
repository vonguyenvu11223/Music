import { LoginView } from "@/components/auth/LoginView";
import { Suspense } from "react";

export const metadata = {
  title: "Login",
  description: "Sign in to VIBEFLOW.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-black" />}>
      <LoginView />
    </Suspense>
  );
}
