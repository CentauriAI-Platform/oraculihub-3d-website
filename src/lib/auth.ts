import { betterAuth } from "better-auth";
import { db } from "./db";

export const emailEnabled = !!(
  process.env.RESEND_API_KEY && process.env.EMAIL_FROM
);
async function sendMail(to: string, subject: string, text: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
    }),
  });
  if (!response.ok) throw new Error("Email delivery failed");
}
export const auth = betterAuth({
  appName: "Oraculihub",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: db,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    revokeSessionsOnPasswordReset: true,
    ...(emailEnabled
      ? {
          sendResetPassword: async ({
            user,
            url,
          }: {
            user: { email: string };
            url: string;
          }) => {
            await sendMail(
              user.email,
              "Reset your Oraculihub password",
              `Reset your password using this link: ${url}\nIf you did not request this, ignore this email.`,
            );
          },
        }
      : {}),
  },
  rateLimit: { enabled: true, window: 60, max: 60 },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
});
