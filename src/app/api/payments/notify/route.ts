import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applyPaymentNotice, type PaymentNotice } from "@/lib/payments";
export async function POST(request: Request) {
  const merchant = process.env.PAYHERE_MERCHANT_ID,
    secret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchant || !secret)
    return new NextResponse("Payments unavailable", { status: 503 });
  try {
    const text = await request.text();
    if (text.length > 16000)
      return new NextResponse("Too large", { status: 413 });
    const f = new URLSearchParams(text);
    const notice = Object.fromEntries(
      [
        "merchant_id",
        "order_id",
        "payhere_amount",
        "payhere_currency",
        "status_code",
        "md5sig",
        "payment_id",
      ].map((k) => [k, f.get(k) || ""]),
    ) as PaymentNotice;
    applyPaymentNotice(db, notice, merchant, secret);
    return new NextResponse("OK");
  } catch {
    return new NextResponse("Invalid notification", { status: 400 });
  }
}
