import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Check,
  Clock3,
  BookOpen,
  Play,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";
import { courseBySlug, lessons, enrolled, isAdmin } from "@/lib/db";
import { getSession } from "@/lib/session";
import { money, pathways } from "@/lib/catalog";
import { EnrollButton } from "@/components/enroll-button";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: courseBySlug(slug)?.title || "Course" };
}
export default async function CourseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = courseBySlug(slug);
  if (!c) notFound();
  const session = await getSession();
  if (!c.published && !(session && isAdmin(session.user.id))) notFound();
  const list = lessons(c.id),
    hasAccess = !!session && enrolled(session.user.id, c.id);
  const p = pathways.find((p) => p.id === c.pathway);
  return (
    <div className="page-shell">
      <Link href="/courses" className="breadcrumb">
        ← The course library
      </Link>
      <div className="course-detail-grid">
        <div>
          <span className="eyebrow">
            {p?.name.toUpperCase()} · {p?.specialty}
          </span>
          <h1>{c.title}</h1>
          <p className="lead">{c.subtitle}</p>
          <div className="course-meta">
            <span>
              <BookOpen size={15} />
              {c.level}
            </span>
            <span>
              <Clock3 size={15} />
              {list.length} lessons · {list.reduce((n, l) => n + l.minutes, 0)}{" "}
              min
            </span>
            <span>English · Self-paced</span>
          </div>
          {!!c.demo && (
            <div className="notice">
              This is a sample course with illustrative content.{" "}
              {c.price > 0
                ? "The price is illustrative and purchasing is disabled."
                : "You can enroll free to explore the learning experience."}
            </div>
          )}
          <section className="detail-section">
            <h2>
              What you’ll <em>take away.</em>
            </h2>
            <ul className="outcomes">
              {(JSON.parse(c.outcomes) as string[]).map((o) => (
                <li key={o}>
                  <Check size={18} />
                  {o}
                </li>
              ))}
            </ul>
          </section>
          <section className="detail-section">
            <h2>
              Your <em>learning journey.</em>
            </h2>
            <div className="curriculum">
              {list.map((l) => (
                <div key={l.id} className="curriculum-item">
                  <span className="lesson-number">
                    {String(l.position + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <small>{l.module}</small>
                    <strong>{l.title}</strong>
                  </div>
                  <span>{l.minutes} min</span>
                  {hasAccess || l.preview ? (
                    <Link
                      href={`/learn/${c.slug}/${l.id}`}
                      className="lesson-open"
                      aria-label={`Open ${l.title}`}
                    >
                      <Play size={16} />
                    </Link>
                  ) : (
                    <LockKeyhole size={15} />
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h3>Before you begin</h3>
            <p>{c.prerequisites}</p>
            <h3>Your guide</h3>
            <p>{c.instructor}</p>
          </section>
        </div>
        <aside className="course-purchase">
          <div className="purchase-art">
            <Image
              src={c.image}
              alt={`${p?.name} sculpture`}
              fill
              priority
              sizes="400px"
            />
          </div>
          <div className="purchase-content">
            <span className="eyebrow">INVEST IN YOUR NEXT CHAPTER</span>
            <h2>{c.price ? money(c.price) : "Free to explore"}</h2>
            {c.price > 0 && !!c.demo && (
              <small>Illustrative price · Not for sale</small>
            )}
            {hasAccess ? (
              <Link
                href={`/learn/${c.slug}/${list[0]?.id}`}
                className="button button-gold"
              >
                Continue learning <ArrowRight size={16} />
              </Link>
            ) : (
              <EnrollButton
                courseId={c.id}
                slug={c.slug}
                free={c.price === 0}
                demo={!!c.demo}
              />
            )}
            <ul>
              <li>
                <Check size={14} /> Learn at your own pace
              </li>
              <li>
                <Check size={14} /> Practical lessons and exercises
              </li>
              <li>
                <Check size={14} /> Progress saved to your account
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
