import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { money } from "@/lib/catalog";
export default async function Order({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    u = await requireUser(`/orders/${id}`);
  const o = db
    .prepare(
      "SELECT p.*,c.title,c.slug FROM purchase p JOIN course c ON c.id=p.course_id WHERE p.id=? AND p.user_id=?",
    )
    .get(id, u.id) as
    | {
        id: string;
        title: string;
        slug: string;
        status: string;
        amount: number;
        sandbox: number;
        created_at: string;
        payment_id: string;
      }
    | undefined;
  if (!o) notFound();
  return (
    <div className="page-shell order-page">
      <span className="eyebrow">{o.sandbox ? "SANDBOX" : "YOUR"} ORDER</span>
      <h1>
        {o.status === "paid" ? (
          <>
            Your next chapter
            <br />
            <em>is open.</em>
          </>
        ) : o.status === "pending" ? (
          <>
            Awaiting
            <br />
            <em>confirmation.</em>
          </>
        ) : (
          <>
            Let’s review
            <br />
            <em>your order.</em>
          </>
        )}
      </h1>
      <div className="panel">
        <h3>{o.title}</h3>
        <div className="record">
          <span>Amount</span>
          <strong>{money(o.amount)}</strong>
        </div>
        <div className="record">
          <span>Status</span>
          <span className="status">{o.status.replaceAll("_", " ")}</span>
        </div>
        <div className="record">
          <span>Order reference</span>
          <small>{o.id}</small>
        </div>
        {o.payment_id && (
          <div className="record">
            <span>Payment reference</span>
            <small>{o.payment_id}</small>
          </div>
        )}
        {o.status === "pending" && (
          <p>
            We haven’t received a confirmed payment yet. Returning from checkout
            does not confirm payment. Refresh this page after a moment, or check
            your purchase history.
          </p>
        )}
        <div className="hero-buttons">
          <Link className="button button-gold" href="/dashboard">
            Go to your learning space →
          </Link>
          <Link className="text-link" href={`/courses/${o.slug}`}>
            Course overview
          </Link>
        </div>
      </div>
    </div>
  );
}
