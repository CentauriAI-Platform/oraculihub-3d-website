import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state page-shell">
      <span className="eyebrow">A PATH YET TO BE FOUND · 404</span>
      <h1>
        Even explorers
        <br />
        <em>take a wrong turn.</em>
      </h1>
      <p>Let’s find your way back to the shrine.</p>
      <Link href="/" className="button button-gold">
        Return to the shrine →
      </Link>
    </div>
  );
}
