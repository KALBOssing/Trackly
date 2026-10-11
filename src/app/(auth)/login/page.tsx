"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, MailWarning } from "lucide-react";
import { ResendVerification } from "@/features/auth/resend-verification";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthShell, AuthHeading } from "@/components/auth/auth-shell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(searchParams.get("verify") === "sent" ? (searchParams.get("email") ?? "") : null);
  const justRegistered = searchParams.get("verify") === "sent";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (searchParams.get("suspended") === "1") {
      toast.error("Your account has been suspended. Contact your administrator for help.");
    }
  }, [searchParams]);

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      rememberMe: String(!!data.rememberMe),
      redirect: false,
    });
    setLoading(false);

    if (res?.error === "EMAIL_NOT_VERIFIED") {
      setUnverifiedEmail(data.email);
      toast.error("Please verify your email address before signing in.");
      return;
    }
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell>
      <AuthHeading title="Welcome back" description="Sign in to continue to your dashboard" />
      {unverifiedEmail !== null && (
        <div role="status" className="mb-5 space-y-3 rounded-md border border-border bg-accent/50 p-4 text-sm">
          <p className="flex items-start gap-2 font-medium text-accent-foreground">
            <MailWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {justRegistered && unverifiedEmail
              ? `Check ${unverifiedEmail} for a verification link, then sign in.`
              : "Verify your email to sign in. Check your inbox for the link we sent."}
          </p>
          <details>
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Didn&apos;t get it?</summary>
            <div className="mt-3">
              <ResendVerification defaultEmail={unverifiedEmail} />
            </div>
          </details>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@school.edu" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" placeholder="••••••••" {...register("password")} />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="rounded border-input" {...register("rememberMe")} />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
