// Rules for email verification at sign-up.
//
// Two safety valves keep this from locking anyone out:
//  1. Verification is only enforced when email can actually be delivered
//     (BREVO_API_KEY or RESEND_API_KEY is set). Without it the verification email is only logged,
//     so requiring it would make every new account unusable.
//  2. Only accounts created under this flow carry an `emailVerifyExpiresAt`.
//     Older accounts have NULL there and are treated as already trusted.

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export function emailVerificationRequired(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.BREVO_API_KEY || env.RESEND_API_KEY) && env.EMAIL_VERIFICATION_REQUIRED !== "false";
}

export function newVerificationExpiry(now: number = Date.now()): Date {
  return new Date(now + VERIFY_TTL_MS);
}

type VerifyFields = { emailVerified: Date | null; emailVerifyExpiresAt: Date | null };

export function needsEmailVerification(user: VerifyFields, required: boolean): boolean {
  return required && !user.emailVerified && user.emailVerifyExpiresAt !== null;
}

export type TokenState = "verified" | "valid" | "expired";

export function verificationTokenState(user: VerifyFields, now: number = Date.now()): TokenState {
  if (user.emailVerified) return "verified";
  if (user.emailVerifyExpiresAt && user.emailVerifyExpiresAt.getTime() < now) return "expired";
  return "valid";
}
