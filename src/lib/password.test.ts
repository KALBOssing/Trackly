import { describe, it, expect } from "vitest";
import { PASSWORD_REGEX } from "@/lib/password";

describe("PASSWORD_REGEX", () => {
  it("accepts a password with upper, lower, number, symbol, 8+ chars", () => {
    expect(PASSWORD_REGEX.test("Password!123")).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(PASSWORD_REGEX.test("Pw1!")).toBe(false);
  });

  it("rejects passwords missing an uppercase letter", () => {
    expect(PASSWORD_REGEX.test("password!123")).toBe(false);
  });

  it("rejects passwords missing a lowercase letter", () => {
    expect(PASSWORD_REGEX.test("PASSWORD!123")).toBe(false);
  });

  it("rejects passwords missing a number", () => {
    expect(PASSWORD_REGEX.test("Password!")).toBe(false);
  });

  it("rejects passwords missing a symbol", () => {
    expect(PASSWORD_REGEX.test("Password123")).toBe(false);
  });
});
