import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { auth } from "./auth";
import { isAdmin } from "./db";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function apiUser(request: Request, admin = false) {
  const origin = request.headers.get("origin");
  const target = new URL(request.url);
  const host = request.headers.get("host");
  const allowed = [
    target.origin,
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    ...(host ? [`${target.protocol}//${host}`] : []),
  ];
  if (!origin || !allowed.includes(origin))
    throw new HttpError(403, "Please submit this request from Oraculihub.");
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new HttpError(401, "Sign in to continue.");
  if (admin && !isAdmin(session.user.id))
    throw new HttpError(403, "Administrator access required.");
  return session.user;
}
export async function readBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  const text = await request.text();
  if (text.length > 150000) throw new HttpError(413, "Request is too large.");
  try {
    return schema.parse(JSON.parse(text));
  } catch (e) {
    if (e instanceof SyntaxError) throw new HttpError(400, "Invalid request.");
    throw e;
  }
}
export function apiError(e: unknown) {
  if (e instanceof HttpError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError)
    return NextResponse.json(
      { error: e.issues[0]?.message || "Please check the form." },
      { status: 400 },
    );
  console.error(
    "Platform request failed",
    e instanceof Error ? e.message : "unknown",
  );
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
