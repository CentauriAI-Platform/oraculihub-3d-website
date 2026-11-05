import Link from "next/link";
import { requireUser } from "@/lib/session";
import { ProfileForm, PasswordForm } from "@/components/account-controls";
export default async function Settings() {
  const user = await requireUser("/settings");
  return (
    <div className="page-shell">
      <Link className="breadcrumb" href="/dashboard">
        ← Your learning space
      </Link>
      <div className="page-intro">
        <span className="eyebrow">MAKE YOURSELF AT HOME</span>
        <h1>
          Your <em>account.</em>
        </h1>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <h3>Your profile</h3>
          <ProfileForm name={user.name} email={user.email} />
        </section>
        <section className="panel">
          <h3>Account security</h3>
          <PasswordForm />
        </section>
      </div>
    </div>
  );
}
