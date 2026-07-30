import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Trackly <no-reply@trackly.app>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    // No API key configured — log instead of throwing, so local dev/demo flows
    // (register, forgot password) still work without email set up.
    console.log(`[email:skipped — no RESEND_API_KEY] to=${to} subject="${subject}"`);
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
    `<p>Welcome to Trackly! Please confirm your email address:</p>
     <p><a href="${link}">${link}</a></p>`
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

export async function sendNewLessonEmail(to: string, lessonTitle: string, lessonId: string, dueDate: Date) {
  const link = `${APP_URL}/lessons/${lessonId}`;
  await send(
    to,
    `New lesson: ${lessonTitle}`,
    `<p>A new lesson has been posted: <strong>${lessonTitle}</strong>.</p>
     <p>Due: ${dueDate.toLocaleString()}</p>
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
