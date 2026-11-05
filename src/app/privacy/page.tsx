export const metadata = { title: "Privacy" };
export default function Privacy() {
  return (
    <div className="page-shell legal-page">
      <span className="eyebrow">YOUR INFORMATION, HANDLED WITH CARE</span>
      <h1>
        Your <em>privacy.</em>
      </h1>
      <div className="notice">
        Preview policy. The business operator’s identity, contact address,
        retention periods, and final policy must be completed before public
        launch.
      </div>
      <div className="prose">
        <h2>Information the platform stores</h2>
        <p>
          When you create an account, the platform stores your name, email, a
          password hash, and session information. It also stores your course
          enrollments, completed lessons, purchase records, and coaching
          requests.
        </p>
        <h2>How it is used</h2>
        <p>
          This information supports account access, learning progress, course
          access, purchase confirmation, and responding to coaching requests. Do
          not include sensitive personal information in a coaching request.
        </p>
        <h2>Payments and email</h2>
        <p>
          Configured payment transactions are handled by PayHere. Billing
          details entered at checkout are sent to the payment provider. Card
          numbers are not collected or stored by Oraculihub. If email delivery
          is enabled, the configured email service sends account recovery
          messages.
        </p>
        <h2>Cookies</h2>
        <p>
          Essential cookies maintain your signed-in session. The initial
          implementation does not add advertising trackers.
        </p>
        <h2>Account requests</h2>
        <p>
          Account export, deletion, and privacy enquiries require a verified
          request to the business operator. A public contact address must be
          provided before launch.
        </p>
      </div>
    </div>
  );
}
