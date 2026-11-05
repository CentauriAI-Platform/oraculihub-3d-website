import { requireAdmin } from "@/lib/session";
import { db, courses, lessons } from "@/lib/db";
import {
  AdminDashboard,
  type CoachingRecord,
  type OrderRecord,
} from "@/components/admin-dashboard";
export const metadata = { title: "Administration" };
export default async function Admin() {
  await requireAdmin();
  const cs = courses(true);
  const requests = db
    .prepare(
      'SELECT c.*,u.name,u.email FROM coaching c JOIN "user" u ON u.id=c.user_id ORDER BY c.created_at DESC',
    )
    .all()
    .map((row) => ({ ...row })) as unknown as CoachingRecord[];
  const orders = db
    .prepare(
      'SELECT p.*,c.title,u.email FROM purchase p JOIN course c ON c.id=p.course_id JOIN "user" u ON u.id=p.user_id ORDER BY p.created_at DESC',
    )
    .all()
    .map((row) => ({ ...row })) as unknown as OrderRecord[];
  const learners = (
    db.prepare('SELECT COUNT(*) AS n FROM "user"').get() as { n: number }
  ).n;
  return (
    <AdminDashboard
      courses={cs}
      lessons={cs.flatMap((c) => lessons(c.id))}
      requests={requests}
      orders={orders}
      learners={learners}
    />
  );
}
