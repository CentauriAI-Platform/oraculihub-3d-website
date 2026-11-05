import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Compass,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { db, lessons, isAdmin } from "@/lib/db";
import { money, type Course } from "@/lib/catalog";
import { AccountControls } from "@/components/account-controls";
export const metadata = { title: "Your learning space" };
export default async function Dashboard() {
  const u = await requireUser();
  const enrolledCourses = db
    .prepare(
      "SELECT c.* FROM course c JOIN enrollment e ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.created_at DESC",
    )
    .all(u.id) as unknown as Course[];
  const completed = db
    .prepare("SELECT lesson_id FROM progress WHERE user_id=?")
    .all(u.id) as { lesson_id: string }[];
  const completedIds = new Set(completed.map((p) => p.lesson_id));
  const orders = db
    .prepare(
      "SELECT p.*,c.title FROM purchase p JOIN course c ON c.id=p.course_id WHERE p.user_id=? ORDER BY p.created_at DESC",
    )
    .all(u.id) as {
    id: string;
    title: string;
    amount: number;
    status: string;
    sandbox: number;
    created_at: string;
  }[];
  const requests = db
    .prepare("SELECT * FROM coaching WHERE user_id=? ORDER BY created_at DESC")
    .all(u.id) as {
    id: string;
    goals: string;
    availability: string;
    status: string;
  }[];
  return (
    <div className="page-shell dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">YOUR PERSONAL LEARNING SPACE</span>
          <h1>
            Keep your
            <br />
            <em>curiosity alive, {u.name.split(" ")[0]}.</em>
          </h1>
          <p>Every small step is a step toward what comes next.</p>
        </div>
        <AccountControls />
      </div>
      <div className="dashboard-stats">
        <div>
          <BookOpen size={20} />
          <strong>{enrolledCourses.length}</strong>
          <span>Paths you’ve started</span>
        </div>
        <div>
          <CheckCircle2 size={20} />
          <strong>{completed.length}</strong>
          <span>Lessons completed</span>
        </div>
        <Link href="/coaching">
          <Compass size={20} />
          <span>
            Need a little direction?
            <strong>
              Meet your career guide <ArrowUpRight size={15} />
            </strong>
          </span>
        </Link>
      </div>
      <div className="section-heading compact">
        <h2>
          Your <em>learning journey.</em>
        </h2>
        <Link href="/courses" className="text-link">
          Discover more <ArrowUpRight size={15} />
        </Link>
      </div>
      {enrolledCourses.length ? (
        <div className="dashboard-courses">
          {enrolledCourses.map((c) => {
            const ls = lessons(c.id),
              done = ls.filter((l) => completedIds.has(l.id)).length,
              next = ls.find((l) => !completedIds.has(l.id)) || ls[0],
              pct = ls.length ? Math.round((done / ls.length) * 100) : 0;
            return (
              <article className="learning-card" key={c.id}>
                <div className="learning-art">
                  <Image
                    src={c.image}
                    alt="Pathway sculpture"
                    fill
                    sizes="180px"
                  />
                </div>
                <div>
                  <span className="eyebrow">
                    {c.pathway} · {c.level}
                  </span>
                  <h3>{c.title}</h3>
                  <p>
                    {done} of {ls.length} lessons complete
                  </p>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${c.title} progress`}
                  >
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  {next ? (
                    <Link
                      className="text-link"
                      href={`/learn/${c.slug}/${next.id}`}
                    >
                      {pct === 100
                        ? "Revisit this course"
                        : "Continue learning"}{" "}
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <span>Lessons are being prepared.</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state panel">
          <Compass size={34} />
          <h3>Your first discovery awaits.</h3>
          <p>Start a free sample course and explore your learning space.</p>
          <Link className="button button-gold" href="/courses">
            Find your first course <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <div className="dashboard-bottom">
        <section className="panel">
          <h3>Coaching requests</h3>
          {requests.length ? (
            requests.map((r) => (
              <div className="record" key={r.id}>
                <div>
                  <p>{r.goals}</p>
                  <small>{r.availability} · Asia/Colombo</small>
                </div>
                <span className="status">{r.status}</span>
              </div>
            ))
          ) : (
            <p>
              No requests yet. Your next step doesn’t have to be a solo one.
            </p>
          )}
          <Link href="/coaching" className="text-link">
            Explore career coaching <ArrowUpRight size={15} />
          </Link>
        </section>
        <section className="panel">
          <h3>Purchase history</h3>
          {orders.length ? (
            orders.map((o) => (
              <Link className="record" href={`/orders/${o.id}`} key={o.id}>
                <div>
                  <strong>{o.title}</strong>
                  <small>
                    {money(o.amount)} {o.sandbox ? "· Sandbox" : ""}
                  </small>
                </div>
                <span className="status">{o.status.replaceAll("_", " ")}</span>
              </Link>
            ))
          ) : (
            <p>Your course purchases will appear here.</p>
          )}
        </section>
      </div>
      {isAdmin(u.id) && (
        <Link href="/admin" className="button button-outline">
          Open administration <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
