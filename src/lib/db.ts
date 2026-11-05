import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  seedCourses,
  sampleLessons,
  type Course,
  type Lesson,
} from "./catalog";

const globalDb = globalThis as unknown as { oraculiDb?: DatabaseSync };
function openDatabase() {
  const location = resolve(
    /* turbopackIgnore: true */ process.env.DATABASE_PATH ||
      "./data/oraculihub.sqlite",
  );
  mkdirSync(dirname(location), { recursive: true });
  const database = new DatabaseSync(location);
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS course (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, subtitle TEXT NOT NULL, pathway TEXT NOT NULL, level TEXT NOT NULL, duration TEXT NOT NULL, price INTEGER NOT NULL CHECK(price>=0), published INTEGER NOT NULL DEFAULT 0, demo INTEGER NOT NULL DEFAULT 1, outcomes TEXT NOT NULL, prerequisites TEXT NOT NULL, instructor TEXT NOT NULL, image TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS lesson (id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES course(id) ON DELETE CASCADE, title TEXT NOT NULL, module TEXT NOT NULL, position INTEGER NOT NULL, minutes INTEGER NOT NULL, content TEXT NOT NULL, video_url TEXT NOT NULL DEFAULT '', resource_url TEXT NOT NULL DEFAULT '', quiz TEXT NOT NULL DEFAULT '', preview INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS enrollment (user_id TEXT NOT NULL, course_id TEXT NOT NULL REFERENCES course(id), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,course_id));
    CREATE TABLE IF NOT EXISTS progress (user_id TEXT NOT NULL, lesson_id TEXT NOT NULL REFERENCES lesson(id) ON DELETE CASCADE, completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,lesson_id));
    CREATE TABLE IF NOT EXISTS purchase (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, course_id TEXT NOT NULL REFERENCES course(id), amount INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'LKR', status TEXT NOT NULL DEFAULT 'pending', payment_id TEXT UNIQUE, sandbox INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS coaching (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, goals TEXT NOT NULL, availability TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS admin_user (user_id TEXT PRIMARY KEY);
    CREATE INDEX IF NOT EXISTS lesson_course ON lesson(course_id,position);
    CREATE INDEX IF NOT EXISTS purchase_user ON purchase(user_id);
  `);
  const count = database.prepare("SELECT COUNT(*) AS n FROM course").get() as {
    n: number;
  };
  if (!count.n) {
    database.exec("BEGIN");
    try {
      for (const course of seedCourses) {
        database
          .prepare("INSERT INTO course VALUES (?,?,?,?,?,?,?,?,1,1,?,?,?,?)")
          .run(
            course.id,
            course.slug,
            course.title,
            course.subtitle,
            course.pathway,
            course.level,
            course.duration,
            course.price,
            JSON.stringify(course.outcomes),
            course.prerequisites,
            course.instructor,
            course.image,
          );
        for (const lesson of sampleLessons(course))
          database
            .prepare("INSERT INTO lesson VALUES (?,?,?,?,?,?,?,?,?,?,?)")
            .run(
              lesson.id,
              lesson.course_id,
              lesson.title,
              lesson.module,
              lesson.position,
              lesson.minutes,
              lesson.content,
              lesson.video_url,
              lesson.resource_url,
              lesson.quiz,
              lesson.preview,
            );
      }
      database.exec("COMMIT");
    } catch (e) {
      database.exec("ROLLBACK");
      throw e;
    }
  }
  return database;
}
export const db = globalDb.oraculiDb ?? openDatabase();
globalDb.oraculiDb = db;
export function courses(includeDrafts = false) {
  return db
    .prepare(
      `SELECT * FROM course ${includeDrafts ? "" : "WHERE published=1"} ORDER BY rowid`,
    )
    .all()
    .map((row) => ({ ...row })) as unknown as Course[];
}
export function courseBySlug(slug: string) {
  const row = db.prepare("SELECT * FROM course WHERE slug=?").get(slug);
  return row ? ({ ...row } as unknown as Course) : undefined;
}
export function lessons(courseId: string) {
  return db
    .prepare("SELECT * FROM lesson WHERE course_id=? ORDER BY position,id")
    .all(courseId)
    .map((row) => ({ ...row })) as unknown as Lesson[];
}
export function enrolled(userId: string, courseId: string) {
  return !!db
    .prepare("SELECT 1 FROM enrollment WHERE user_id=? AND course_id=?")
    .get(userId, courseId);
}
export function isAdmin(userId: string) {
  return !!db.prepare("SELECT 1 FROM admin_user WHERE user_id=?").get(userId);
}
