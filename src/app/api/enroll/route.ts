import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiUser, readBody, apiError, HttpError } from "@/lib/http";
export async function POST(request: Request) {
  try {
    const u = await apiUser(request);
    const { courseId } = await readBody(
      request,
      z.object({ courseId: z.string().max(100) }),
    );
    const c = db
      .prepare("SELECT price,published FROM course WHERE id=?")
      .get(courseId) as { price: number; published: number } | undefined;
    if (!c?.published) throw new HttpError(404, "Course unavailable.");
    if (c.price !== 0)
      throw new HttpError(403, "This course requires a confirmed payment.");
    db.prepare(
      "INSERT OR IGNORE INTO enrollment(user_id,course_id) VALUES (?,?)",
    ).run(u.id, courseId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
