import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, LockKeyhole, BookOpen } from "lucide-react";
import { courseBySlug, lessons, enrolled, db, isAdmin } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { Quiz } from "@/lib/catalog";
import { LessonView } from "@/components/lesson-view";
export default async function Learn({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params,
    c = courseBySlug(slug);
  if (!c) notFound();
  const session = await getSession(),
    admin = !!session && isAdmin(session.user.id);
  if (!c.published && !admin) notFound();
  const ls = lessons(c.id),
    index = ls.findIndex((l) => l.id === lessonId),
    lesson = ls[index];
  if (!lesson) notFound();
  const access = !!session && (enrolled(session.user.id, c.id) || admin);
  if (!access && !lesson.preview) {
    if (!session)
      redirect(`/sign-in?next=${encodeURIComponent(`/courses/${slug}`)}`);
    redirect(`/courses/${slug}`);
  }
  const completed = session
    ? (
        db
          .prepare(
            "SELECT p.lesson_id FROM progress p JOIN lesson l ON l.id=p.lesson_id WHERE p.user_id=? AND l.course_id=?",
          )
          .all(session.user.id, c.id) as { lesson_id: string }[]
      ).map((p) => p.lesson_id)
    : [];
  const q: Quiz | null = lesson.quiz ? JSON.parse(lesson.quiz) : null;
  return (
    <div className="learning-layout">
      <aside className="lesson-sidebar">
        <Link href={`/courses/${slug}`} className="breadcrumb">
          ← Course overview
        </Link>
        <BookOpen size={25} />
        <h3>{c.title}</h3>
        <p>
          {completed.length} of {ls.length} lessons completed
        </p>
        <div className="progress-bar">
          <span
            style={{
              width: `${ls.length ? (completed.length / ls.length) * 100 : 0}%`,
            }}
          />
        </div>
        <nav aria-label="Course lessons">
          {ls.map((l, i) => (
            <Link
              className={`sidebar-lesson ${l.id === lessonId ? "current" : ""}`}
              key={l.id}
              href={
                access || l.preview
                  ? `/learn/${slug}/${l.id}`
                  : `/courses/${slug}`
              }
            >
              <span>
                {completed.includes(l.id) ? (
                  <CheckCircle2 size={17} />
                ) : access || l.preview ? (
                  String(i + 1).padStart(2, "0")
                ) : (
                  <LockKeyhole size={15} />
                )}
              </span>
              <div>
                <small>{l.module}</small>
                <strong>{l.title}</strong>
                <small>{l.minutes} min</small>
              </div>
            </Link>
          ))}
        </nav>
      </aside>
      <LessonView
        key={lesson.id}
        lesson={{
          ...lesson,
          quiz: q ? { question: q.question, options: q.options } : null,
        }}
        hasAccess={access}
        completed={completed.includes(lessonId)}
        nextUrl={
          ls[index + 1] ? `/learn/${slug}/${ls[index + 1].id}` : "/dashboard"
        }
      />
    </div>
  );
}
