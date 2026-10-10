import Link from "next/link";
import { GraduationCap, CheckCircle2, XCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verificationTokenState } from "@/lib/email-verification";
import { ResendVerification } from "@/features/auth/resend-verification";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Outcome = "success" | "expired" | "invalid";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  let outcome: Outcome = "invalid";
  let email = "";

  if (token) {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (user) {
      email = user.email;
      const state = verificationTokenState(user);
      if (state === "verified") {
        outcome = "success";
      } else if (state === "valid") {
        // The token is kept (not cleared) so a second click, or an email
        // scanner that opened the link first, still shows success.
        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        outcome = "success";
      } else {
        outcome = "expired";
      }
    }
  }

  const copy = {
    success: { title: "Email verified", text: "Your email address is confirmed. You can sign in now." },
    expired: { title: "This link has expired", text: "Verification links last 24 hours. Request a new one below." },
    invalid: { title: "Verification failed", text: "This link isn't valid. Request a new one below, or sign in if you've already verified." },
  }[outcome];

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Link href="/" className="mx-auto mb-2 flex items-center gap-2 font-display text-lg font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" /> Trackly
          </Link>
          {outcome === "success" && <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />}
          {outcome === "expired" && <Clock className="mx-auto h-10 w-10 text-amber-600" aria-hidden="true" />}
          {outcome === "invalid" && <XCircle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />}
          <CardTitle className="mt-2">{copy.title}</CardTitle>
          <CardDescription>{copy.text}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {outcome !== "success" && <ResendVerification defaultEmail={email} />}
          <Button asChild variant={outcome === "success" ? "default" : "ghost"}>
            <Link href="/login">Continue to login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
