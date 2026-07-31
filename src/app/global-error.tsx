"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <GraduationCap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">An unexpected error occurred.</p>
          <p className="max-w-lg rounded-md border border-border bg-secondary/40 p-3 font-mono text-xs text-muted-foreground">
            {error.message || "Unknown error"}
            {error.digest && <span className="block mt-1">Reference: {error.digest}</span>}
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </main>
      </body>
    </html>
  );
}
