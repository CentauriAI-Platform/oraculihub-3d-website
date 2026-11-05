import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
const base = process.env.SMOKE_URL || "http://127.0.0.1:3000",
  origin = new URL(base).origin;
async function main() {
  const { db } = await import("../src/lib/db");
  let cookie = "",
    userId = "",
    createdCourse = "";
  async function post(path: string, body: unknown, customOrigin = origin) {
    return fetch(base + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: customOrigin,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
      redirect: "manual",
    });
  }
  try {
    const home = await fetch(base);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Ancient wisdom/);
    const library = await fetch(base + "/courses");
    const libraryHtml = await library.text();
    assert.equal(library.status, 200);
    assert.match(libraryHtml, /AI, from the beginning/);
    assert.doesNotMatch(libraryHtml, /Only plain objects|A MOMENT TO REGROUP/);
    const protectedPage = await fetch(base + "/dashboard", {
      redirect: "manual",
    });
    assert.ok(
      protectedPage.status === 307 ||
        /NEXT_REDIRECT/.test(await protectedPage.text()),
      "Dashboard must redirect unauthenticated visitors",
    );
    assert.equal(
      (await post("/api/enroll", { courseId: "ai-foundations" })).status,
      401,
    );
    const email = `qa-${Date.now()}@example.invalid`,
      password = randomBytes(18).toString("base64url");
    const registered = await post("/api/auth/sign-up/email", {
      name: "QA Learner",
      email,
      password,
    });
    assert.equal(registered.status, 200, await registered.clone().text());
    const result = await registered.json();
    userId = result.user.id;
    cookie = registered.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    assert.ok(cookie);
    assert.equal(
      (await fetch(base + "/dashboard", { headers: { Cookie: cookie } }))
        .status,
      200,
    );
    assert.equal(
      (
        await post("/api/admin", {
          kind: "coaching",
          id: "none",
          status: "closed",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await post(
          "/api/enroll",
          { courseId: "ai-foundations" },
          "https://untrusted.example",
        )
      ).status,
      403,
    );
    assert.equal(
      (await post("/api/progress", { lessonId: "ai-foundations-2", answer: 2 }))
        .status,
      403,
    );
    const locked = await fetch(
      base + "/learn/ai-foundations/ai-foundations-2",
      { headers: { Cookie: cookie }, redirect: "manual" },
    );
    assert.ok(
      locked.status === 307 || /NEXT_REDIRECT/.test(await locked.text()),
      "Course lesson must be inaccessible without enrollment",
    );
    assert.equal(
      (await post("/api/enroll", { courseId: "prompt-craft" })).status,
      403,
    );
    assert.equal(
      (await post("/api/enroll", { courseId: "ai-foundations" })).status,
      200,
    );
    assert.equal(
      (await post("/api/enroll", { courseId: "ai-foundations" })).status,
      200,
    );
    assert.equal(
      (await post("/api/progress", { lessonId: "ai-foundations-1", answer: 0 }))
        .status,
      422,
    );
    assert.equal(
      (await post("/api/progress", { lessonId: "ai-foundations-1", answer: 1 }))
        .status,
      200,
    );
    assert.equal(
      (
        db
          .prepare("SELECT COUNT(*) AS n FROM progress WHERE user_id=?")
          .get(userId) as { n: number }
      ).n,
      1,
    );
    assert.equal(
      (
        await post("/api/coaching", {
          goals:
            "I am exploring a new career path and would like help planning the skills I need.",
          availability: "Weekday evenings after 6pm",
        })
      ).status,
      200,
    );
    db.prepare("INSERT INTO admin_user VALUES (?)").run(userId);
    const adminPage = await fetch(base + "/admin", {
      headers: { Cookie: cookie },
    });
    assert.equal(adminPage.status, 200);
    const adminHtml = await adminPage.text();
    assert.match(adminHtml, /BEHIND THE SHRINE/);
    assert.doesNotMatch(adminHtml, /Only plain objects|A MOMENT TO REGROUP/);
    const saved = await post("/api/admin", {
      kind: "course",
      title: "QA disposable course",
      slug: `qa-${Date.now()}`,
      subtitle: "Integration check",
      pathway: "apollo",
      level: "Beginner",
      price: 120000,
      published: false,
      demo: true,
      outcomes: ["Verify the editor"],
      prerequisites: "None",
      instructor: "QA",
    });
    assert.equal(saved.status, 200, await saved.clone().text());
    createdCourse = (await saved.json()).id;
    const lesson = await post("/api/admin", {
      kind: "lesson",
      courseId: createdCourse,
      title: "QA lesson",
      module: "Module one",
      position: 0,
      minutes: 5,
      content:
        "A disposable integration test lesson to verify curriculum persistence.",
      videoUrl: "",
      resourceUrl: "",
      preview: false,
      quiz: {
        question: "Is this a test?",
        options: ["Yes", "No"],
        answer: 0,
        explanation: "This is a disposable QA fixture.",
      },
    });
    assert.equal(lesson.status, 200, await lesson.clone().text());
    const signOut = await post("/api/auth/sign-out", {});
    assert.equal(signOut.status, 200);
    assert.equal(
      (await post("/api/enroll", { courseId: "workflows" })).status,
      401,
    );
    console.log(
      "PASS: public pages, protected redirects, account creation/session/sign-out, origin protection, administrator permissions, paid enrollment protection, free enrollment, protected lessons, server-graded quiz, saved progress, coaching, course and lesson editing.",
    );
  } finally {
    if (userId) {
      db.exec("BEGIN");
      try {
        for (const table of [
          "progress",
          "enrollment",
          "coaching",
          "purchase",
          "admin_user",
        ])
          db.prepare(`DELETE FROM ${table} WHERE user_id=?`).run(userId);
        db.prepare('DELETE FROM "user" WHERE id=?').run(userId);
        if (createdCourse)
          db.prepare("DELETE FROM course WHERE id=?").run(createdCourse);
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    }
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
