"use client";
import { useState } from "react";
import { LockKeyhole, ArrowUpRight } from "lucide-react";
export function CheckoutForm({
  courseId,
  name,
  ready,
  sandbox,
}: {
  courseId: string;
  name: string;
  ready: boolean;
  sandbox: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          firstName: f.get("firstName"),
          lastName: f.get("lastName"),
          phone: f.get("phone"),
          address: f.get("address"),
          city: f.get("city"),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const action = new URL(d.action);
      if (
        !["sandbox.payhere.lk", "www.payhere.lk"].includes(action.hostname) ||
        action.protocol !== "https:"
      )
        throw new Error("Invalid payment destination.");
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action.href;
      Object.entries(d.fields as Record<string, string>).forEach(
        ([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.append(input);
        },
      );
      document.body.append(form);
      form.submit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setBusy(false);
    }
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      {sandbox && (
        <div className="notice">
          Sandbox checkout · Test transactions only. No real payment will be
          collected.
        </div>
      )}
      {!ready && (
        <div className="notice">
          Checkout is awaiting merchant configuration. Your payment details will
          be handled securely by PayHere once connected.
        </div>
      )}
      <div className="form-two">
        <label>
          First name
          <input
            name="firstName"
            defaultValue={name.split(" ")[0]}
            autoComplete="given-name"
            required
            maxLength={80}
          />
        </label>
        <label>
          Last name
          <input
            name="lastName"
            defaultValue={name.split(" ").slice(1).join(" ")}
            autoComplete="family-name"
            required
            maxLength={80}
          />
        </label>
      </div>
      <label>
        Phone
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+94 …"
        />
      </label>
      <label>
        Billing address
        <input
          name="address"
          autoComplete="street-address"
          required
          maxLength={200}
        />
      </label>
      <label>
        City
        <input
          name="city"
          autoComplete="address-level2"
          required
          maxLength={80}
        />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" required />I agree to the course terms and
        understand the stated delivery format.
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-gold" disabled={!ready || busy}>
        {busy
          ? "Preparing secure checkout…"
          : sandbox
            ? "Continue to test checkout"
            : "Continue to secure payment"}
        <ArrowUpRight size={17} />
      </button>
      <small>
        <LockKeyhole size={12} /> Card details are entered on PayHere.
        Oraculihub does not store them.
      </small>
    </form>
  );
}
