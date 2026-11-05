import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiUser, readBody, apiError, HttpError } from "@/lib/http";
export async function POST(request: Request) {
  try {
    const u = await apiUser(request);
    const body = await readBody(
      request,
      z.object({
        goals: z
          .string()
          .trim()
          .min(
            30,
            "Tell us a little more about your goals (at least 30 characters).",
          )
          .max(4000),
        availability: z.string().trim().min(5).max(300),
      }),
    );
    const pending = db
      .prepare(
        "SELECT COUNT(*) AS n FROM coaching WHERE user_id=? AND status IN ('new','contacted')",
      )
      .get(u.id) as { n: number };
    if (pending.n >= 3)
      throw new HttpError(
        429,
        "You already have active coaching requests. Please wait for a response.",
      );
    db.prepare(
      "INSERT INTO coaching(id,user_id,goals,availability) VALUES (?,?,?,?)",
    ).run(randomUUID(), u.id, body.goals, body.availability);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
