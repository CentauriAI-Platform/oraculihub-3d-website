import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, enrolled } from "@/lib/db";
import type { Course } from "@/lib/catalog";
import { md5 } from "@/lib/payments";
import { apiUser, readBody, apiError, HttpError } from "@/lib/http";
export async function POST(request: Request) {
  try {
    const u = await apiUser(request);
    const b = await readBody(
      request,
      z.object({
        courseId: z.string().max(100),
        firstName: z.string().trim().min(1).max(80),
        lastName: z.string().trim().min(1).max(80),
        phone: z
          .string()
          .regex(/^[+\d\s()-]{7,20}$/, "Enter a valid telephone number."),
        address: z.string().trim().min(3).max(200),
        city: z.string().trim().min(2).max(80),
      }),
    );
    const merchant = process.env.PAYHERE_MERCHANT_ID,
      secret = process.env.PAYHERE_MERCHANT_SECRET,
      base = process.env.APP_URL;
    if (!merchant || !secret || !base?.startsWith("https://"))
      throw new HttpError(
        503,
        "Checkout will open once the merchant account and public callback URL are configured.",
      );
    const c = db
      .prepare("SELECT * FROM course WHERE id=? AND published=1")
      .get(b.courseId) as unknown as Course | undefined;
    if (!c) throw new HttpError(404, "Course unavailable.");
    if (c.demo || c.price <= 0)
      throw new HttpError(400, "Sample and free courses cannot be purchased.");
    if (enrolled(u.id, c.id))
      throw new HttpError(409, "You are already enrolled in this course.");
    const id = randomUUID(),
      amount = (c.price / 100).toFixed(2),
      sandbox = process.env.PAYHERE_SANDBOX !== "false";
    db.prepare(
      "INSERT INTO purchase(id,user_id,course_id,amount,sandbox) VALUES (?,?,?,?,?)",
    ).run(id, u.id, c.id, c.price, sandbox ? 1 : 0);
    return NextResponse.json({
      action: sandbox
        ? "https://sandbox.payhere.lk/pay/checkout"
        : "https://www.payhere.lk/pay/checkout",
      fields: {
        merchant_id: merchant,
        return_url: `${base}/orders/${id}`,
        cancel_url: `${base}/orders/${id}?cancelled=1`,
        notify_url: `${base}/api/payments/notify`,
        order_id: id,
        items: c.title,
        currency: "LKR",
        amount,
        first_name: b.firstName,
        last_name: b.lastName,
        email: u.email,
        phone: b.phone,
        address: b.address,
        city: b.city,
        country: "Sri Lanka",
        hash: md5(merchant + id + amount + "LKR" + md5(secret)),
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
