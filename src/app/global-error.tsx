"use client";

import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
          <GraduationCap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
          <Button onClick={() => reset()}>Try again</Button>
        </main>
      </body>
    </html>
  );
}
