import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Begin your journey" };
export default function SignUp() {
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
