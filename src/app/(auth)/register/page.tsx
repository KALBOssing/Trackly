"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthShell, AuthHeading } from "@/components/auth/auth-shell";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STUDENT" },
  });

  function selectRole(next: "STUDENT" | "TEACHER") {
    setRole(next);
    setValue("role", next, { shouldValidate: true });
  }

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Registration failed");
        return;
      }
      if (json.verificationRequired) {
        if (json.emailSent) {
          toast.success("Account created! Check your email to verify your address, then sign in.");
        } else {
          toast.error(
            "Account created, but we couldn't send the verification email. Use \"Didn't get it?\" on the sign-in page to try again, or contact your administrator.",
            { duration: 12000 }
          );
        }
        router.push(`/login?verify=sent&email=${encodeURIComponent(data.email)}`);
      } else {
        toast.success("Account created! You can now sign in.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell wide>
      <AuthHeading title="Create your account" description="Join Trackly as a student or teacher" />
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-md bg-secondary p-1">
        {(["STUDENT", "TEACHER"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => selectRole(r)}
            className={cn(
              "rounded-md py-2 text-sm font-medium transition-colors",
              role === r ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            {r === "STUDENT" ? "Student" : "Teacher"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("role")} />

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="middleName">Middle Name (Optional)</Label>
            <Input id="middleName" {...register("middleName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {role === "STUDENT" && (
          <div className="space-y-1.5">
            <Label htmlFor="studentId">Student ID</Label>
            <Input id="studentId" {...register("studentId")} />
            {errors.studentId && (
              <p className="text-xs text-destructive">{errors.studentId.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              You&apos;ll be able to request to join your class once you&apos;re signed in.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput id="confirmPassword" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
