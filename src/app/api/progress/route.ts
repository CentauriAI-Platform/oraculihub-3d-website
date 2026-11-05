import { NextResponse } from "next/server";
import { z } from "zod";
import { db, enrolled, isAdmin } from "@/lib/db";
import type { Lesson, Quiz } from "@/lib/catalog";
import { apiUser, readBody, apiError, HttpError } from "@/lib/http";
export async function POST(request: Request) {
  try {
    const u = await apiUser(request);
    const { lessonId, answer } = await readBody(
      request,
      z.object({
        lessonId: z.string().max(100),
        answer: z.number().int().min(0).max(20).optional(),
      }),
    );
    const l = db
      .prepare("SELECT * FROM lesson WHERE id=?")
      .get(lessonId) as unknown as Lesson | undefined;
    if (!l) throw new HttpError(404, "Lesson not found.");
    if (!enrolled(u.id, l.course_id) && !isAdmin(u.id))
      throw new HttpError(403, "Enroll in this course to save your progress.");
    if (l.quiz) {
      const quiz: Quiz = JSON.parse(l.quiz);
      if (answer !== quiz.answer)
        return NextResponse.json(
          {
            error: "Not quite. Try another answer.",
            explanation: quiz.explanation,
          },
          { status: 422 },
        );
    }
    db.prepare(
      "INSERT OR IGNORE INTO progress(user_id,lesson_id) VALUES (?,?)",
    ).run(u.id, lessonId);
    return NextResponse.json({
      ok: true,
      message: "Lesson complete. Your progress is saved.",
    });
  } catch (e) {
    return apiError(e);
  }
}
