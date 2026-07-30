import Link from "next/link";
import { GraduationCap, CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  let success = false;

  if (token) {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), emailVerifyToken: null },
      });
      success = true;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Link href="/" className="mx-auto mb-2 flex items-center gap-2 font-semibold text-lg">
            <GraduationCap className="h-6 w-6 text-primary" /> Trackly
          </Link>
          {success ? (
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
          ) : (
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
          )}
          <CardTitle className="mt-2">{success ? "Email verified" : "Verification failed"}</CardTitle>
          <CardDescription>
            {success
              ? "Your email address has been confirmed."
              : "This verification link is invalid or has already been used."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/login">Continue to login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
