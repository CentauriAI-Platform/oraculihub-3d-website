"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Download, BookOpen } from "lucide-react";
import type { Lesson } from "@/lib/catalog";
type PublicLesson = Omit<Lesson, "quiz"> & {
  quiz: { question: string; options: string[] } | null;
};
export function LessonView({
  lesson,
  hasAccess,
  completed,
  nextUrl,
}: {
  lesson: PublicLesson;
  hasAccess: boolean;
  completed: boolean;
  nextUrl: string;
}) {
  const [answer, setAnswer] = useState<number | null>(null),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(completed),
    [error, setError] = useState("");
  const router = useRouter();
  async function complete() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          answer: answer ?? undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="lesson-article">
      <span className="eyebrow">
        {lesson.module} · {lesson.minutes} MIN READ
      </span>
      <h1>{lesson.title}</h1>
      {!hasAccess && (
        <div className="notice">
          You’re reading a preview. Enroll in the course to save your progress
          and unlock all lessons.
        </div>
      )}
      {lesson.video_url && (
        <video
          className="lesson-video"
          controls
          preload="metadata"
          src={lesson.video_url}
          controlsList="nodownload"
        >
          <track kind="captions" />
          Your browser does not support this video.
        </video>
      )}
      <div className="lesson-content">
        {lesson.content.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {lesson.resource_url && (
        <a
          className="button button-outline"
          href={lesson.resource_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download size={16} /> Open lesson resource
        </a>
      )}
      {lesson.quiz && (
        <section className="quiz-panel">
          <span className="eyebrow">
            <BookOpen size={14} /> A MOMENT TO REFLECT
          </span>
          <h3>{lesson.quiz.question}</h3>
          <fieldset disabled={done || !hasAccess}>
            <legend className="sr-only">Choose an answer</legend>
            {lesson.quiz.options.map((o, i) => (
              <label
                key={i}
                className={`quiz-option ${answer === i ? "chosen" : ""}`}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={answer === i}
                  onChange={() => setAnswer(i)}
                />
                <span>{String.fromCharCode(65 + i)}</span>
                {o}
              </label>
            ))}
          </fieldset>
        </section>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="lesson-actions">
        {done ? (
          <span className="lesson-done" role="status">
            <CheckCircle2 size={19} /> Lesson complete · Progress saved
          </span>
        ) : hasAccess ? (
          <button
            className="button button-gold"
            onClick={complete}
            disabled={busy || (!!lesson.quiz && answer === null)}
          >
            {busy ? "Saving…" : "Complete this lesson"}
            <CheckCircle2 size={16} />
          </button>
        ) : (
          <Link
            href={`/courses/${nextUrl.split("/")[2] || "ai-foundations"}`}
            className="button button-gold"
          >
            Explore this course <ArrowRight size={16} />
          </Link>
        )}
        {hasAccess && done && (
          <Link className="button button-outline" href={nextUrl}>
            {nextUrl === "/dashboard" ? "Back to your journey" : "Next lesson"}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}
