import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { emailEnabled } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default function Forgot() {
  return (
    <Suspense>
      <AuthForm mode="forgot" emailEnabled={emailEnabled} />
    </Suspense>
  );
}
