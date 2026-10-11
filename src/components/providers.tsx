"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* reducedMotion="user" makes every framer-motion animation respect the OS setting. */}
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </MotionConfig>
    </SessionProvider>
  );
}
