import { Resend } from "resend";

// Two providers are supported; Brevo is used if its key is set, otherwise Resend.
//  - Resend: needs a domain you own and have verified.
//  - Brevo: only needs one verified sender address (e.g. a Gmail), no domain.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const brevoKey = process.env.BREVO_API_KEY ?? "";
const FROM = process.env.EMAIL_FROM ?? "Trackly <no-reply@trackly.app>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

// "Trackly <me@gmail.com>" -> { name: "Trackly", email: "me@gmail.com" }
function parseFrom(from: string): { name?: string; email: string } {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || undefined, email: m[2] } : { email: from.trim() };
}

async function send(to: string, subject: string, html: string) {
  if (brevoKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: parseFrom(FROM), to: [{ email: to }], subject, htmlContent: html }),
      });
      if (!res.ok) console.error("Brevo failed to send email:", res.status, await res.text());
    } catch (err) {
      console.error("Failed to send email:", err);
    }
    return;
  }
  if (!resend) {
    // No provider configured — log instead of throwing, so local dev/demo flows
    // (register, forgot password) still work without email set up.
    console.log(`[email:skipped — no BREVO_API_KEY or RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await send(
    to,
    "Verify your Trackly account",
    `<p>Welcome to Trackly! Please confirm your email address to finish creating your account:</p>
     <p><a href="${link}">Verify my email</a></p>
     <p>Or copy this link into your browser:<br>${link}</p>
     <p>This link expires in 24 hours. If you didn't create a Trackly account, you can ignore this email.</p>`
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await send(
    to,
    "Reset your Trackly password",
    `<p>We received a request to reset your password. This link expires in 1 hour.</p>
     <p><a href="${link}">${link}</a></p>
     <p>If you didn't request this, you can safely ignore this email.</p>`
  );
}

export async function sendNewLessonEmail(to: string, lessonTitle: string, lessonId: string, dueDate: Date | null) {
  const link = `${APP_URL}/lessons/${lessonId}`;
  await send(
    to,
    `New lesson: ${lessonTitle}`,
    `<p>A new lesson has been posted: <strong>${lessonTitle}</strong>.</p>
     ${dueDate ? `<p>Due: ${dueDate.toLocaleString()}</p>` : ""}
     <p><a href="${link}">View lesson</a></p>`
  );
}

export async function sendDeadlineReminderEmail(to: string, lessonTitle: string, lessonId: string, dueDate: Date) {
  const link = `${APP_URL}/lessons/${lessonId}`;
  await send(
    to,
    `Reminder: ${lessonTitle} is due soon`,
    `<p><strong>${lessonTitle}</strong> is due ${dueDate.toLocaleString()}.</p>
     <p><a href="${link}">Submit now</a></p>`
  );
}

export async function sendGradeReleasedEmail(to: string, lessonTitle: string, lessonId: string, score: number, maxScore: number) {
  const link = `${APP_URL}/lessons/${lessonId}`;
  await send(
    to,
    `Grade released: ${lessonTitle}`,
    `<p>Your submission for <strong>${lessonTitle}</strong> has been graded: ${score}/${maxScore}.</p>
     <p><a href="${link}">View feedback</a></p>`
  );
}
