import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
async function main() {
  if (!existsSync(".env.local")) {
    writeFileSync(
      ".env.local",
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}\nBETTER_AUTH_URL=http://localhost:3000\nAPP_URL=http://localhost:3000\nDATABASE_PATH=./data/oraculihub.sqlite\nPAYHERE_SANDBOX=true\n`,
    );
    console.log(
      "Created local environment with a unique authentication secret.",
    );
  }
  loadEnvConfig(process.cwd());
  const { auth } = await import("../src/lib/auth");
  const { getMigrations } = await import("better-auth/db/migration");
  const migration = await getMigrations(auth.options);
  await migration.runMigrations();
  const adminArg = process.argv.find((a) => a.startsWith("--admin="));
  if (adminArg) {
    const { db } = await import("../src/lib/db");
    const user = db
      .prepare('SELECT id FROM "user" WHERE email=?')
      .get(adminArg.slice(8)) as { id: string } | undefined;
    if (!user)
      throw new Error(
        "Register that email address first, then run setup again.",
      );
    db.prepare("INSERT OR IGNORE INTO admin_user(user_id) VALUES (?)").run(
      user.id,
    );
    console.log("Administrator access granted to the registered account.");
  }
  console.log(
    "Database ready. Illustrative courses seeded; no accounts or passwords created.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
