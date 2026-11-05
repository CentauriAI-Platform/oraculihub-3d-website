"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
export function CoachingForm() {
  const { data: session } = authClient.useSession(),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: f.get("goals"),
          availability: f.get("availability"),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="panel coaching-form" id="consultation">
      <span className="eyebrow">A CONVERSATION CAN CHANGE THINGS</span>
      <h2>
        Let’s find
        <br />
        <em>your direction.</em>
      </h2>
      <p>
        Tell us where you are and where you’d like to go. Request a conversation
        with your career guide.
      </p>
      {done ? (
        <div className="success-panel" role="status">
          <CheckCircle2 size={28} />
          <h3>Your request is saved.</h3>
          <p>
            The team can now review your goals and availability. This is a
            consultation request; a session has not been booked yet.
          </p>
          <Link className="text-link" href="/dashboard">
            View your request <ArrowRight size={16} />
          </Link>
        </div>
      ) : !session ? (
        <>
          <p>
            Create an account to send a request and keep track of its status.
          </p>
          <Link
            className="button button-gold"
            href="/sign-in?next=%2Fcoaching%23consultation"
          >
            Sign in to request coaching <ArrowRight size={16} />
          </Link>
        </>
      ) : (
        <form className="stack-form" onSubmit={submit}>
          <label>
            What would you like help with?
            <textarea
              name="goals"
              required
              minLength={30}
              maxLength={4000}
              rows={5}
              placeholder="Your current role or studies, what you’re working toward, and what feels uncertain…"
            />
          </label>
          <label>
            Your preferred availability
            <input
              name="availability"
              required
              minLength={5}
              maxLength={300}
              placeholder="e.g. Weekday evenings after 6 pm"
            />
            <small>All availability is in Sri Lanka time (Asia/Colombo).</small>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-gold" disabled={busy}>
            {busy ? "Saving your request…" : "Request a conversation"}
            <ArrowRight size={16} />
          </button>
          <small>
            A request starts a conversation. Session availability and any fees
            will be confirmed with you before booking.
          </small>
        </form>
      )}
    </div>
  );
}
