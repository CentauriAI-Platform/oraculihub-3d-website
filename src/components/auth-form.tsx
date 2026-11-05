"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { BrandMark } from "./brand";
export function AuthForm({
  mode,
  emailEnabled = false,
}: {
  mode: "sign-in" | "sign-up" | "forgot" | "reset";
  emailEnabled?: boolean;
}) {
  const search = useSearchParams(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [show, setShow] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || ""),
      password = String(f.get("password") || "");
    try {
      let result;
      if (mode === "sign-up")
        result = await authClient.signUp.email({
          email,
          password,
          name: String(f.get("name")),
        });
      else if (mode === "sign-in")
        result = await authClient.signIn.email({ email, password });
      else if (mode === "forgot")
        result = await authClient.requestPasswordReset({
          email,
          redirectTo: "/reset-password",
        });
      else
        result = await authClient.resetPassword({
          newPassword: password,
          token: search.get("token") || "",
        });
      if (result.error)
        throw new Error(
          result.error.message || "Please check your details and try again.",
        );
      if (mode === "forgot" || mode === "reset") {
        setDone(true);
        return;
      }
      const next = search.get("next") || "/dashboard";
      const destination = new URL(next, location.origin);
      location.assign(
        destination.origin === location.origin
          ? destination.pathname + destination.search + destination.hash
          : "/dashboard",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const title =
    mode === "sign-up" ? (
      <>
        A new chapter
        <br />
        <em>starts here.</em>
      </>
    ) : mode === "sign-in" ? (
      <>
        Welcome back,
        <br />
        <em>curious mind.</em>
      </>
    ) : mode === "forgot" ? (
      <>
        Find your
        <br />
        <em>way back.</em>
      </>
    ) : (
      <>
        A fresh start.
        <br />
        <em>A new password.</em>
      </>
    );
  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <div className="auth-visual-shade" />
        <div>
          <BrandMark size={50} />
          <blockquote>
            “The beginning
            <br />
            is the most
            <br />
            <em>
              important part
              <br />
              of the work.”
            </em>
          </blockquote>
          <span className="eyebrow">
            AN ANCIENT IDEA. AN EVERYDAY PRACTICE.
          </span>
        </div>
      </div>
      <div className="auth-panel">
        <span className="eyebrow">YOUR ORACULIHUB JOURNEY</span>
        <h1>{title}</h1>
        <p>
          {mode === "sign-up"
            ? "Bring your curiosity. We’ll help you find your path."
            : mode === "sign-in"
              ? "Your next discovery is waiting for you."
              : "Let’s get you back to learning."}
        </p>
        {done ? (
          <div className="success-panel" role="status">
            <h3>
              {mode === "forgot"
                ? "Check your inbox"
                : "Your password is updated"}
            </h3>
            <p>
              {mode === "forgot"
                ? "If an account exists for that address, you’ll receive a reset link."
                : "Sign in with your new password to continue."}
            </p>
            <Link className="button button-gold" href="/sign-in">
              Back to sign in <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="stack-form">
            {mode === "sign-up" && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="What should we call you?"
                />
              </label>
            )}
            {mode !== "reset" && (
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
            )}
            {(mode === "sign-in" || mode === "sign-up" || mode === "reset") && (
              <label>
                {mode === "reset" ? "New password" : "Password"}
                <div className="password-input">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={
                      mode === "sign-in" ? "current-password" : "new-password"
                    }
                    required
                    minLength={10}
                    maxLength={128}
                    placeholder="At least 10 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "sign-in" && (
              <Link href="/forgot-password" className="forgot-link">
                Forgot your password?
              </Link>
            )}
            {mode === "forgot" && !emailEnabled && (
              <div className="notice">
                Password recovery becomes available once Oraculihub’s email
                service is connected.
              </div>
            )}
            {mode === "reset" && !search.get("token") && (
              <div className="notice">
                Open the password reset link from your email to continue.
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button-gold"
              disabled={
                busy ||
                (mode === "forgot" && !emailEnabled) ||
                (mode === "reset" && !search.get("token"))
              }
            >
              {busy
                ? "One moment…"
                : mode === "sign-in"
                  ? "Continue your journey"
                  : mode === "sign-up"
                    ? "Create your account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Save new password"}
              <ArrowRight size={17} />
            </button>
          </form>
        )}
        <div className="auth-switch">
          {mode === "sign-in" ? (
            <>
              New to the shrine?{" "}
              <Link
                href={`/sign-up${search.get("next") ? `?next=${encodeURIComponent(search.get("next")!)}` : ""}`}
              >
                Begin your journey
              </Link>
            </>
          ) : mode === "sign-up" ? (
            <>
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </>
          ) : (
            <Link href="/sign-in">← Back to sign in</Link>
          )}
        </div>
        <p className="auth-legal">
          <LockKeyhole size={12} /> By continuing, you agree to our{" "}
          <Link href="/terms">terms</Link> and{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}
