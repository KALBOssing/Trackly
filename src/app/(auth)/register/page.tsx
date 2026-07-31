"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    setValue("role", next);
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
      toast.success("Account created! You can now sign in.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-2 flex items-center gap-2 font-semibold text-lg">
            <GraduationCap className="h-6 w-6 text-primary" /> Trackly
          </Link>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join Trackly as a student or teacher</CardDescription>
        </CardHeader>
        <CardContent>
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
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
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
        </CardContent>
      </Card>
    </main>
  );
}
