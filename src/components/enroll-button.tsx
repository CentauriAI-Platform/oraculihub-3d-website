"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
export function EnrollButton({
  courseId,
  slug,
  free,
  demo,
}: {
  courseId: string;
  slug: string;
  free: boolean;
  demo: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  async function enroll() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (r.status === 401) {
        router.push(`/sign-in?next=${encodeURIComponent(`/courses/${slug}`)}`);
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push(`/dashboard`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {free ? (
        <button className="button button-gold" onClick={enroll} disabled={busy}>
          {busy ? "Opening your path…" : "Start learning for free"}
          <ArrowRight size={16} />
        </button>
      ) : demo ? (
        <button className="button button-outline" disabled>
          Sample course · Coming soon
        </button>
      ) : (
        <Link className="button button-gold" href={`/checkout/${slug}`}>
          Enroll in this course <ArrowRight size={16} />
        </Link>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
