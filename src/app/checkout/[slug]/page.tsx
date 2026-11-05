import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { courseBySlug, enrolled } from "@/lib/db";
import { money } from "@/lib/catalog";
import { CheckoutForm } from "@/components/checkout-form";
export default async function Checkout({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const u = await requireUser(`/checkout/${slug}`);
  const c = courseBySlug(slug);
  if (!c?.published) notFound();
  if (c.demo || c.price === 0) redirect(`/courses/${slug}`);
  if (enrolled(u.id, c.id)) redirect("/dashboard");
  const ready = !!(
    process.env.PAYHERE_MERCHANT_ID &&
    process.env.PAYHERE_MERCHANT_SECRET &&
    process.env.APP_URL?.startsWith("https://")
  );
  return (
    <div className="page-shell">
      <Link className="breadcrumb" href={`/courses/${slug}`}>
        ← Back to course
      </Link>
      <div className="page-intro">
        <span className="eyebrow">MAKE ROOM FOR YOUR FUTURE</span>
        <h1>
          Your next <em>chapter.</em>
        </h1>
      </div>
      <div className="checkout-grid">
        <section className="panel">
          <h3>Billing details</h3>
          <CheckoutForm
            courseId={c.id}
            name={u.name}
            ready={ready}
            sandbox={process.env.PAYHERE_SANDBOX !== "false"}
          />
        </section>
        <aside className="panel order-summary">
          <span className="eyebrow">YOUR COURSE</span>
          <h2>{c.title}</h2>
          <p>{c.subtitle}</p>
          <div className="record">
            <span>One-time purchase</span>
            <strong>{money(c.price)}</strong>
          </div>
          <div className="record">
            <strong>Total · LKR</strong>
            <strong>{money(c.price)}</strong>
          </div>
          <p>
            Access is granted after your payment is confirmed by the payment
            provider.
          </p>
        </aside>
      </div>
    </div>
  );
}
