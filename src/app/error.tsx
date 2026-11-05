"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state page-shell">
      <span className="eyebrow">A MOMENT TO REGROUP</span>
      <h1>
        Something interrupted
        <br />
        <em>your journey.</em>
      </h1>
      <p>Please try again. Your learning progress is saved.</p>
      <button className="button button-gold" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
