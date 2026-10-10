import { describe, it, expect } from "vitest";
import {
  emailVerificationRequired,
  needsEmailVerification,
  newVerificationExpiry,
  verificationTokenState,
  VERIFY_TTL_MS,
} from "@/lib/email-verification";

const now = Date.UTC(2026, 0, 1);

describe("emailVerificationRequired", () => {
  it("is off when no email provider is configured", () => {
    expect(emailVerificationRequired({})).toBe(false);
  });
  it("is on when an email provider is configured", () => {
    expect(emailVerificationRequired({ RESEND_API_KEY: "re_123" })).toBe(true);
  });
  it("can be switched off explicitly", () => {
    expect(emailVerificationRequired({ RESEND_API_KEY: "re_123", EMAIL_VERIFICATION_REQUIRED: "false" })).toBe(false);
  });
});

describe("needsEmailVerification", () => {
  const expires = new Date(now + 1000);
  it("blocks a new unverified account when required", () => {
    expect(needsEmailVerification({ emailVerified: null, emailVerifyExpiresAt: expires }, true)).toBe(true);
  });
  it("lets verified accounts in", () => {
    expect(needsEmailVerification({ emailVerified: new Date(now), emailVerifyExpiresAt: expires }, true)).toBe(false);
  });
  it("never blocks accounts that pre-date verification", () => {
    expect(needsEmailVerification({ emailVerified: null, emailVerifyExpiresAt: null }, true)).toBe(false);
  });
  it("never blocks when verification is not required", () => {
    expect(needsEmailVerification({ emailVerified: null, emailVerifyExpiresAt: expires }, false)).toBe(false);
  });
});

describe("verificationTokenState", () => {
  it("is valid before expiry", () => {
    expect(verificationTokenState({ emailVerified: null, emailVerifyExpiresAt: newVerificationExpiry(now) }, now)).toBe("valid");
  });
  it("is expired after the 24 hour window", () => {
    const expires = newVerificationExpiry(now);
    expect(verificationTokenState({ emailVerified: null, emailVerifyExpiresAt: expires }, now + VERIFY_TTL_MS + 1)).toBe("expired");
  });
  it("reports already-verified accounts as verified, even if the link is old", () => {
    expect(
      verificationTokenState({ emailVerified: new Date(now), emailVerifyExpiresAt: new Date(now - 1) }, now + VERIFY_TTL_MS * 5)
    ).toBe("verified");
  });
});
