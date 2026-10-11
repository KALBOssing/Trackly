import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verificationTokenState } from "@/lib/email-verification";
import { ResendVerification } from "@/features/auth/resend-verification";
import { AuthShell, AuthHeading } from "@/components/auth/auth-shell";
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

  const icon =
    outcome === "success" ? (
      <CheckCircle2 className="mb-5 h-12 w-12 text-emerald-500" aria-hidden="true" />
    ) : outcome === "expired" ? (
      <Clock className="mb-5 h-12 w-12 text-amber-500" aria-hidden="true" />
    ) : (
      <XCircle className="mb-5 h-12 w-12 text-destructive" aria-hidden="true" />
    );

  return (
    <AuthShell>
      <AuthHeading title={copy.title} description={copy.text} icon={icon} className="mb-6" />
      <div className="space-y-4">
        {outcome !== "success" && <ResendVerification defaultEmail={email} />}
        <Button asChild variant={outcome === "success" ? "default" : "ghost"} className="w-full">
          <Link href="/login">Continue to login</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
