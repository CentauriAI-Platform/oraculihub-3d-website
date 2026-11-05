import { createHash, timingSafeEqual } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
export const md5 = (s: string) =>
  createHash("md5").update(s).digest("hex").toUpperCase();
export function paymentSignature(
  merchant: string,
  order: string,
  amount: string,
  currency: string,
  status: string,
  secret: string,
) {
  return md5(merchant + order + amount + currency + status + md5(secret));
}
export function secureEqual(a: string, b: string) {
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export type PaymentNotice = {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  payment_id: string;
};
export function applyPaymentNotice(
  database: DatabaseSync,
  notice: PaymentNotice,
  merchant: string,
  secret: string,
) {
  if (
    notice.merchant_id !== merchant ||
    !secureEqual(
      paymentSignature(
        notice.merchant_id,
        notice.order_id,
        notice.payhere_amount,
        notice.payhere_currency,
        notice.status_code,
        secret,
      ),
      notice.md5sig,
    )
  )
    throw new Error("Invalid payment signature");
  if (!/^\d+\.\d{2}$/.test(notice.payhere_amount))
    throw new Error("Invalid amount format");
  const row = database
    .prepare("SELECT * FROM purchase WHERE id=?")
    .get(notice.order_id) as
    | {
        id: string;
        user_id: string;
        course_id: string;
        amount: number;
        currency: string;
        status: string;
        payment_id: string | null;
      }
    | undefined;
  if (
    !row ||
    row.amount !== Math.round(Number(notice.payhere_amount) * 100) ||
    row.currency !== notice.payhere_currency
  )
    throw new Error("Order amount or currency mismatch");
  if (!["2", "0", "-1", "-2", "-3"].includes(notice.status_code))
    throw new Error("Unknown payment status");
  if (!notice.payment_id) throw new Error("Missing payment reference");
  // A confirmed chargeback can revoke access; late pending/failed messages cannot undo a success.
  if (
    row.status === "charged_back" ||
    (row.status === "paid" && notice.status_code !== "-3")
  )
    return;
  const state = (
    {
      "2": "paid",
      "0": "pending",
      "-1": "cancelled",
      "-2": "failed",
      "-3": "charged_back",
    } as Record<string, string>
  )[notice.status_code];
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare("UPDATE purchase SET status=?,payment_id=? WHERE id=?")
      .run(state, notice.payment_id, row.id);
    if (state === "paid")
      database
        .prepare(
          "INSERT OR IGNORE INTO enrollment(user_id,course_id) VALUES (?,?)",
        )
        .run(row.user_id, row.course_id);
    if (state === "charged_back") {
      const other = database
        .prepare(
          "SELECT 1 FROM purchase WHERE user_id=? AND course_id=? AND status='paid' AND id<>?",
        )
        .get(row.user_id, row.course_id, row.id);
      if (!other)
        database
          .prepare("DELETE FROM enrollment WHERE user_id=? AND course_id=?")
          .run(row.user_id, row.course_id);
    }
    database.exec("COMMIT");
  } catch (e) {
    database.exec("ROLLBACK");
    throw e;
  }
}
