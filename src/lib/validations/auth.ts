import { z } from "zod";
import { PASSWORD_REGEX, passwordStrengthMessage } from "@/lib/password";

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(60),
    middleName: z.string().max(60).optional().or(z.literal("")),
    lastName: z.string().min(1, "Last name is required").max(60),
    email: z.string().email("Enter a valid email address"),
    studentId: z.string().min(1).max(30).optional(),
    password: z.string().regex(PASSWORD_REGEX, passwordStrengthMessage()),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "TEACHER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.role !== "STUDENT" || !!data.studentId, {
    message: "Student ID is required for students",
    path: ["studentId"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().regex(PASSWORD_REGEX, passwordStrengthMessage()),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
