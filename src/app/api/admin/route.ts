import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiUser, readBody, apiError, HttpError } from "@/lib/http";
const safeUrl = z
  .string()
  .max(1000)
  .refine(
    (v) => v === "" || /^https:\/\//.test(v),
    "Use an HTTPS URL or leave blank.",
  );
const schemas = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("course"),
    id: z.string().max(100).optional(),
    title: z.string().trim().min(3).max(150),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(150),
    subtitle: z.string().max(300),
    pathway: z.enum(["apollo", "athena", "hephaestus", "hermes"]),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    price: z.number().int().min(0).max(100000000),
    published: z.boolean(),
    demo: z.boolean(),
    outcomes: z.array(z.string().max(300)).min(1).max(15),
    prerequisites: z.string().max(2000),
    instructor: z.string().min(1).max(120),
  }),
  z.object({
    kind: z.literal("lesson"),
    id: z.string().max(100).optional(),
    courseId: z.string().max(100),
    title: z.string().min(3).max(150),
    module: z.string().min(1).max(150),
    position: z.number().int().min(0).max(10000),
    minutes: z.number().int().min(1).max(1000),
    content: z.string().min(30).max(60000),
    videoUrl: safeUrl,
    resourceUrl: safeUrl,
    preview: z.boolean(),
    quiz: z.union([
      z.literal(""),
      z.object({
        question: z.string().min(5).max(1000),
        options: z.array(z.string().min(1).max(500)).min(2).max(8),
        answer: z.number().int().min(0).max(7),
        explanation: z.string().min(1).max(2000),
      }),
    ]),
  }),
  z.object({
    kind: z.literal("coaching"),
    id: z.string().max(100),
    status: z.enum(["new", "contacted", "scheduled", "completed", "closed"]),
  }),
]);
export async function POST(request: Request) {
  try {
    await apiUser(request, true);
    const b = await readBody(request, schemas);
    if (b.kind === "course") {
      const id = b.id || randomUUID();
      const duplicate = db
        .prepare("SELECT id FROM course WHERE slug=? AND id<>?")
        .get(b.slug, id);
      if (duplicate)
        throw new HttpError(409, "That course URL already exists.");
      if (b.id && !db.prepare("SELECT 1 FROM course WHERE id=?").get(id))
        throw new HttpError(404, "Course not found.");
      db.prepare(
        `INSERT INTO course(id,slug,title,subtitle,pathway,level,duration,price,published,demo,outcomes,prerequisites,instructor,image) VALUES (?,?,?,?,?,?,'Self-paced',?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title=excluded.title,subtitle=excluded.subtitle,pathway=excluded.pathway,level=excluded.level,price=excluded.price,published=excluded.published,demo=excluded.demo,outcomes=excluded.outcomes,prerequisites=excluded.prerequisites,instructor=excluded.instructor,image=excluded.image`,
      ).run(
        id,
        b.slug,
        b.title,
        b.subtitle,
        b.pathway,
        b.level,
        b.price,
        +b.published,
        +b.demo,
        JSON.stringify(b.outcomes),
        b.prerequisites,
        b.instructor,
        `/images/${b.pathway}.webp`,
      );
      return NextResponse.json({ ok: true, id });
    }
    if (b.kind === "lesson") {
      if (!db.prepare("SELECT 1 FROM course WHERE id=?").get(b.courseId))
        throw new HttpError(404, "Course not found.");
      if (
        b.id &&
        !db
          .prepare("SELECT 1 FROM lesson WHERE id=? AND course_id=?")
          .get(b.id, b.courseId)
      )
        throw new HttpError(404, "Lesson not found.");
      if (b.quiz && b.quiz.answer >= b.quiz.options.length)
        throw new HttpError(400, "Choose a valid correct answer.");
      const id = b.id || randomUUID();
      db.prepare(
        `INSERT INTO lesson VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,module=excluded.module,position=excluded.position,minutes=excluded.minutes,content=excluded.content,video_url=excluded.video_url,resource_url=excluded.resource_url,quiz=excluded.quiz,preview=excluded.preview`,
      ).run(
        id,
        b.courseId,
        b.title,
        b.module,
        b.position,
        b.minutes,
        b.content,
        b.videoUrl,
        b.resourceUrl,
        b.quiz ? JSON.stringify(b.quiz) : "",
        +b.preview,
      );
      return NextResponse.json({ ok: true, id });
    }
    const result = db
      .prepare("UPDATE coaching SET status=? WHERE id=?")
      .run(b.status, b.id);
    if (!result.changes) throw new HttpError(404, "Request not found.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
