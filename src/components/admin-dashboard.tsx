"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Users,
  MessagesSquare,
  ArrowUpRight,
} from "lucide-react";
import {
  pathways,
  money,
  type Course,
  type Lesson,
  type Quiz,
} from "@/lib/catalog";
export type CoachingRecord = {
  id: string;
  name: string;
  email: string;
  goals: string;
  availability: string;
  status: string;
};
export type OrderRecord = {
  id: string;
  title: string;
  email: string;
  amount: number;
  status: string;
  sandbox: number;
};
export function AdminDashboard({
  courses,
  lessons,
  requests,
  orders,
  learners,
}: {
  courses: Course[];
  lessons: Lesson[];
  requests: CoachingRecord[];
  orders: OrderRecord[];
  learners: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("courses"),
    [selected, setSelected] = useState(courses[0]?.id || "new"),
    [lessonId, setLessonId] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const course = courses.find((c) => c.id === selected),
    courseLessons = lessons.filter((l) => l.course_id === selected),
    lesson = courseLessons.find((l) => l.id === lessonId),
    quiz: Quiz | null = lesson?.quiz ? JSON.parse(lesson.quiz) : null;
  async function mutate(body: unknown) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMessage("Saved successfully.");
      router.refresh();
      return d as { id?: string };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function saveCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      price = Number(f.get("price"));
    const d = await mutate({
      kind: "course",
      id: course?.id,
      title: f.get("title"),
      slug: f.get("slug"),
      subtitle: f.get("subtitle"),
      pathway: f.get("pathway"),
      level: f.get("level"),
      price: Math.round(price * 100),
      published: f.get("published") === "on",
      demo: f.get("demo") === "on",
      outcomes: String(f.get("outcomes"))
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      prerequisites: f.get("prerequisites"),
      instructor: f.get("instructor"),
    });
    if (d?.id) setSelected(d.id);
  }
  async function saveLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const options = String(f.get("options") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      question = String(f.get("question") || "").trim();
    const d = await mutate({
      kind: "lesson",
      id: lesson?.id,
      courseId: selected,
      title: f.get("title"),
      module: f.get("module"),
      position: Number(f.get("position")),
      minutes: Number(f.get("minutes")),
      content: f.get("content"),
      videoUrl: f.get("videoUrl"),
      resourceUrl: f.get("resourceUrl"),
      preview: f.get("preview") === "on",
      quiz: question
        ? {
            question,
            options,
            answer: Number(f.get("answer")) - 1,
            explanation: f.get("explanation"),
          }
        : "",
    });
    if (d?.id) setLessonId(d.id);
  }
  return (
    <div className="page-shell admin-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">BEHIND THE SHRINE</span>
          <h1>
            Make room
            <br />
            <em>for discovery.</em>
          </h1>
          <p>Manage your curriculum, learners, and conversations.</p>
        </div>
        <Link className="button button-outline" href="/dashboard">
          Your learning space <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="dashboard-stats">
        <div>
          <BookOpen size={20} />
          <strong>{courses.length}</strong>
          <span>Courses</span>
        </div>
        <div>
          <Users size={20} />
          <strong>{learners}</strong>
          <span>Learners</span>
        </div>
        <div>
          <MessagesSquare size={20} />
          <strong>{requests.filter((r) => r.status === "new").length}</strong>
          <span>New coaching requests</span>
        </div>
      </div>
      <div className="filter-tabs admin-tabs">
        {[
          { id: "courses", name: "Courses & lessons" },
          { id: "coaching", name: "Coaching requests" },
          { id: "orders", name: "Orders" },
        ].map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "selected" : ""}
            onClick={() => {
              setTab(t.id);
              setError("");
              setMessage("");
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {message && <p className="form-success">{message}</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      {tab === "courses" && (
        <div className="admin-editor">
          <aside className="admin-course-list">
            <button
              className="button button-outline"
              onClick={() => {
                setSelected("new");
                setLessonId("");
              }}
            >
              <Plus size={16} /> New course
            </button>
            {courses.map((c) => (
              <button
                className={selected === c.id ? "selected" : ""}
                key={c.id}
                onClick={() => {
                  setSelected(c.id);
                  setLessonId("");
                  setError("");
                  setMessage("");
                }}
              >
                <strong>{c.title}</strong>
                <small>
                  {c.published ? "Published" : "Draft"}{" "}
                  {c.demo ? "· Sample" : ""}
                </small>
              </button>
            ))}
          </aside>
          <div>
            <section className="panel">
              <h3>{course ? "Edit course" : "Create a course"}</h3>
              <form className="stack-form" key={selected} onSubmit={saveCourse}>
                <label>
                  Course title
                  <input
                    name="title"
                    required
                    minLength={3}
                    maxLength={150}
                    defaultValue={course?.title}
                  />
                </label>
                <label>
                  Course URL
                  <input
                    name="slug"
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    defaultValue={course?.slug}
                    placeholder="your-course-title"
                  />
                  <small>Lowercase words separated by hyphens.</small>
                </label>
                <label>
                  Short description
                  <input
                    name="subtitle"
                    maxLength={300}
                    defaultValue={course?.subtitle}
                  />
                </label>
                <div className="form-two">
                  <label>
                    Pathway
                    <select
                      name="pathway"
                      defaultValue={course?.pathway || "apollo"}
                    >
                      {pathways.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.specialty}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Difficulty
                    <select
                      name="level"
                      defaultValue={course?.level || "Beginner"}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </label>
                </div>
                <div className="form-two">
                  <label>
                    Price in LKR
                    <input
                      name="price"
                      type="number"
                      min="0"
                      max="1000000"
                      step=".01"
                      required
                      defaultValue={(course?.price || 0) / 100}
                    />
                    <small>Use 0 for free enrollment.</small>
                  </label>
                  <label>
                    Instructor
                    <input
                      name="instructor"
                      required
                      defaultValue={course?.instructor || "Oraculihub"}
                      maxLength={120}
                    />
                  </label>
                </div>
                <label>
                  Learning outcomes
                  <textarea
                    name="outcomes"
                    rows={4}
                    required
                    defaultValue={
                      course ? JSON.parse(course.outcomes).join("\n") : ""
                    }
                  />
                  <small>One outcome per line.</small>
                </label>
                <label>
                  Prerequisites
                  <textarea
                    name="prerequisites"
                    rows={2}
                    defaultValue={course?.prerequisites}
                  />
                </label>
                <div className="checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="demo"
                      defaultChecked={course ? !!course.demo : true}
                    />{" "}
                    Sample course · paid checkout disabled
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="published"
                      defaultChecked={!!course?.published}
                    />{" "}
                    Publish in library
                  </label>
                </div>
                <button className="button button-gold" disabled={busy}>
                  {busy ? "Saving…" : "Save course"}
                </button>
              </form>
            </section>
            {course && (
              <section className="panel lesson-editor">
                <div className="section-heading compact">
                  <h3>Course lessons</h3>
                  <button
                    className="button button-outline button-small"
                    onClick={() => setLessonId("new")}
                  >
                    <Plus size={14} /> Add lesson
                  </button>
                </div>
                <div className="admin-lesson-list">
                  {courseLessons.map((l) => (
                    <button
                      key={l.id}
                      className={lessonId === l.id ? "selected" : ""}
                      onClick={() => setLessonId(l.id)}
                    >
                      <span>{l.position + 1}</span>
                      {l.title}
                      <small>{l.minutes} min</small>
                    </button>
                  ))}
                </div>
                {lessonId && (
                  <form
                    key={`${selected}-${lessonId}`}
                    className="stack-form"
                    onSubmit={saveLesson}
                  >
                    <h3>{lesson ? "Edit lesson" : "New lesson"}</h3>
                    <label>
                      Lesson title
                      <input
                        name="title"
                        required
                        minLength={3}
                        defaultValue={lesson?.title}
                      />
                    </label>
                    <label>
                      Module name
                      <input
                        name="module"
                        required
                        defaultValue={lesson?.module || "01 · Getting started"}
                      />
                    </label>
                    <div className="form-two">
                      <label>
                        Order (starts at 0)
                        <input
                          type="number"
                          name="position"
                          min={0}
                          required
                          defaultValue={
                            lesson?.position ?? courseLessons.length
                          }
                        />
                      </label>
                      <label>
                        Duration in minutes
                        <input
                          type="number"
                          name="minutes"
                          min={1}
                          required
                          defaultValue={lesson?.minutes || 10}
                        />
                      </label>
                    </div>
                    <label>
                      Lesson text
                      <textarea
                        name="content"
                        required
                        minLength={30}
                        maxLength={60000}
                        rows={12}
                        defaultValue={lesson?.content}
                      />
                      <small>Separate paragraphs with a blank line.</small>
                    </label>
                    <label>
                      Video URL
                      <input
                        name="videoUrl"
                        type="url"
                        placeholder="https://…/lesson.mp4"
                        defaultValue={lesson?.video_url}
                      />
                      <small>
                        A direct HTTPS video file or compatible stream. Use a
                        protected media service for paid video.
                      </small>
                    </label>
                    <label>
                      Downloadable resource URL
                      <input
                        name="resourceUrl"
                        type="url"
                        placeholder="https://…/worksheet.pdf"
                        defaultValue={lesson?.resource_url}
                      />
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="preview"
                        defaultChecked={!!lesson?.preview}
                      />{" "}
                      Allow a public preview of this lesson
                    </label>
                    <div className="quiz-editor">
                      <h3>Knowledge check</h3>
                      <p>
                        Leave the question empty for a lesson without a quiz.
                      </p>
                      <label>
                        Question
                        <input name="question" defaultValue={quiz?.question} />
                      </label>
                      <label>
                        Answer options
                        <textarea
                          rows={4}
                          name="options"
                          defaultValue={quiz?.options.join("\n")}
                        />
                        <small>One answer per line, at least two.</small>
                      </label>
                      <label>
                        Correct answer number
                        <input
                          name="answer"
                          type="number"
                          min={1}
                          max={8}
                          defaultValue={quiz ? quiz.answer + 1 : 1}
                        />
                      </label>
                      <label>
                        Explanation
                        <textarea
                          name="explanation"
                          rows={2}
                          defaultValue={quiz?.explanation}
                        />
                      </label>
                    </div>
                    <button className="button button-gold" disabled={busy}>
                      {busy ? "Saving…" : "Save lesson"}
                    </button>
                  </form>
                )}
              </section>
            )}
          </div>
        </div>
      )}
      {tab === "coaching" && (
        <section className="panel">
          <h3>Career coaching conversations</h3>
          {requests.length ? (
            requests.map((r) => (
              <article className="admin-request" key={r.id}>
                <div>
                  <strong>{r.name}</strong>
                  <a href={`mailto:${r.email}`}>{r.email}</a>
                  <p>{r.goals}</p>
                  <small>Availability: {r.availability} · Asia/Colombo</small>
                </div>
                <label>
                  Status
                  <select
                    value={r.status}
                    disabled={busy}
                    onChange={(e) =>
                      mutate({
                        kind: "coaching",
                        id: r.id,
                        status: e.target.value,
                      })
                    }
                  >
                    {[
                      "new",
                      "contacted",
                      "scheduled",
                      "completed",
                      "closed",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </article>
            ))
          ) : (
            <p>New coaching requests will appear here.</p>
          )}
        </section>
      )}
      {tab === "orders" && (
        <section className="panel">
          <h3>Course purchases</h3>
          {orders.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Learner</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        {o.title}
                        <small>{o.id}</small>
                      </td>
                      <td>{o.email}</td>
                      <td>{money(o.amount)}</td>
                      <td>
                        <span className="status">{o.status}</span>
                      </td>
                      <td>{o.sandbox ? "Sandbox" : "Live"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Orders will appear here when learners start checkout.</p>
          )}
        </section>
      )}
    </div>
  );
}
