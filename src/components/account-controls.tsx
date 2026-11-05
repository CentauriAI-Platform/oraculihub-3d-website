"use client";
import Link from "next/link";
import { useState } from "react";
import { LogOut, Settings2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
export function AccountControls() {
  return (
    <div className="account-controls">
      <Link href="/settings" className="button button-outline button-small">
        <Settings2 size={15} /> Account settings
      </Link>
      <button
        className="icon-button"
        aria-label="Sign out"
        onClick={async () => {
          await authClient.signOut();
          location.assign("/");
        }}
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await authClient.updateUser({ name: String(f.get("name")) });
      if (r.error) throw new Error(r.error.message);
      setMessage("Your profile is updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      <label>
        Name
        <input
          name="name"
          defaultValue={name}
          required
          minLength={2}
          maxLength={80}
        />
      </label>
      <label>
        Email address
        <input value={email} readOnly />
        <small>For account security, email changes require support.</small>
      </label>
      <button className="button button-gold" disabled={busy}>
        {busy ? "Saving…" : "Save profile"}
      </button>
      {message && (
        <p className="form-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
export function PasswordForm() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMessage("");
    setError("");
    const f = new FormData(form);
    try {
      const r = await authClient.changePassword({
        currentPassword: String(f.get("current")),
        newPassword: String(f.get("next")),
        revokeOtherSessions: true,
      });
      if (r.error) throw new Error(r.error.message);
      form.reset();
      setMessage("Password changed. Other sessions have been signed out.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      <label>
        Current password
        <input
          type="password"
          name="current"
          required
          autoComplete="current-password"
        />
      </label>
      <label>
        New password
        <input
          type="password"
          name="next"
          minLength={10}
          maxLength={128}
          required
          autoComplete="new-password"
        />
      </label>
      <button className="button button-outline" disabled={busy}>
        {busy ? "Saving…" : "Update password"}
      </button>
      {message && (
        <p className="form-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
