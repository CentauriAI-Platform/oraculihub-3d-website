import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  applyPaymentNotice,
  paymentSignature,
  secureEqual,
  type PaymentNotice,
} from "../src/lib/payments";
const merchant = "test-merchant",
  secret = "test-secret";
function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec(
    "CREATE TABLE purchase(id TEXT PRIMARY KEY,user_id TEXT,course_id TEXT,amount INTEGER,currency TEXT,status TEXT,payment_id TEXT UNIQUE);CREATE TABLE enrollment(user_id TEXT,course_id TEXT,PRIMARY KEY(user_id,course_id));INSERT INTO purchase VALUES('order-1','learner-1','course-1',150000,'LKR','pending',NULL)",
  );
  return db;
}
function notice(overrides: Partial<PaymentNotice> = {}): PaymentNotice {
  const n = {
    merchant_id: merchant,
    order_id: "order-1",
    payhere_amount: "1500.00",
    payhere_currency: "LKR",
    status_code: "2",
    payment_id: "provider-1",
    md5sig: "",
    ...overrides,
  };
  if (!overrides.md5sig)
    n.md5sig = paymentSignature(
      n.merchant_id,
      n.order_id,
      n.payhere_amount,
      n.payhere_currency,
      n.status_code,
      secret,
    );
  return n;
}
test("a verified successful payment enrolls exactly once, even on retries", () => {
  const db = fixture();
  try {
    applyPaymentNotice(db, notice(), merchant, secret);
    applyPaymentNotice(db, notice(), merchant, secret);
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM enrollment").get()?.n,
      1,
    );
    assert.equal(
      db.prepare("SELECT status FROM purchase").get()?.status,
      "paid",
    );
  } finally {
    db.close();
  }
});
test("forged signatures and mismatched merchant, amount, or currency never enroll", () => {
  for (const invalid of [
    { md5sig: "0".repeat(32) },
    { merchant_id: "other" },
    { payhere_amount: "1.00" },
    { payhere_currency: "USD" },
    { status_code: "99" },
    { payhere_amount: "1500" },
  ]) {
    const db = fixture();
    try {
      assert.throws(() =>
        applyPaymentNotice(db, notice(invalid), merchant, secret),
      );
      assert.equal(
        db.prepare("SELECT COUNT(*) AS n FROM enrollment").get()?.n,
        0,
      );
      assert.equal(
        db.prepare("SELECT status FROM purchase").get()?.status,
        "pending",
      );
    } finally {
      db.close();
    }
  }
});
test("pending, cancelled, and failed notifications do not grant course access", () => {
  for (const status of ["0", "-1", "-2"]) {
    const db = fixture();
    try {
      applyPaymentNotice(db, notice({ status_code: status }), merchant, secret);
      assert.equal(
        db.prepare("SELECT COUNT(*) AS n FROM enrollment").get()?.n,
        0,
      );
    } finally {
      db.close();
    }
  }
});
test("out-of-order pending/failed notifications do not undo paid access", () => {
  const db = fixture();
  try {
    applyPaymentNotice(db, notice(), merchant, secret);
    applyPaymentNotice(db, notice({ status_code: "0" }), merchant, secret);
    applyPaymentNotice(db, notice({ status_code: "-2" }), merchant, secret);
    assert.equal(
      db.prepare("SELECT status FROM purchase").get()?.status,
      "paid",
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM enrollment").get()?.n,
      1,
    );
  } finally {
    db.close();
  }
});
test("a verified chargeback revokes access and cannot be undone by a stale success", () => {
  const db = fixture();
  try {
    applyPaymentNotice(db, notice(), merchant, secret);
    applyPaymentNotice(db, notice({ status_code: "-3" }), merchant, secret);
    applyPaymentNotice(db, notice(), merchant, secret);
    assert.equal(
      db.prepare("SELECT status FROM purchase").get()?.status,
      "charged_back",
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM enrollment").get()?.n,
      0,
    );
  } finally {
    db.close();
  }
});
test("a provider payment reference cannot be reused for a second order", () => {
  const db = fixture();
  try {
    db.exec(
      "INSERT INTO purchase VALUES('order-2','learner-2','course-1',150000,'LKR','pending',NULL)",
    );
    applyPaymentNotice(db, notice(), merchant, secret);
    assert.throws(() =>
      applyPaymentNotice(db, notice({ order_id: "order-2" }), merchant, secret),
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM enrollment").get()?.n,
      1,
    );
    assert.equal(
      db.prepare("SELECT status FROM purchase WHERE id='order-2'").get()
        ?.status,
      "pending",
    );
  } finally {
    db.close();
  }
});
test("signature comparison handles malformed signatures safely", () => {
  assert.equal(secureEqual("ABC", "AB"), false);
  assert.equal(secureEqual("ABC", "ABD"), false);
  assert.equal(secureEqual("ABC", "ABC"), true);
  assert.equal(secureEqual("ABC", "éBC"), false);
});
