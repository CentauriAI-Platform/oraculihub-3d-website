import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { isAdmin } from "./db";
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
export async function requireUser(returnTo = "/dashboard") {
  const s = await getSession();
  if (!s) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return s.user;
}
export async function requireAdmin() {
  const u = await requireUser("/admin");
  if (!isAdmin(u.id)) redirect("/dashboard?notice=admin-only");
  return u;
}
