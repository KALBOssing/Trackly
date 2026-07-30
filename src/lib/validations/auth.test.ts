import { describe, it, expect } from "vitest";
import { registerSchema } from "@/lib/validations/auth";

const base = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan@school.edu",
  password: "Password!123",
  confirmPassword: "Password!123",
};

describe("registerSchema", () => {
  it("requires studentId/gradeLevel/section when role is STUDENT", () => {
    const result = registerSchema.safeParse({ ...base, role: "STUDENT" });
    expect(result.success).toBe(false);
  });

  it("accepts a complete student registration", () => {
    const result = registerSchema.safeParse({
      ...base,
      role: "STUDENT",
      studentId: "S00001",
      gradeLevel: "Grade 11",
      section: "STEM A",
    });
    expect(result.success).toBe(true);
  });

  it("does not require student fields for a teacher", () => {
    const result = registerSchema.safeParse({ ...base, role: "TEACHER" });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      ...base,
      role: "TEACHER",
      confirmPassword: "Different!123",
    });
    expect(result.success).toBe(false);
  });
});
