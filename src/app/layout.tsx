import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Trackly: GLOW Pathways Progress Tracking",
  description:
    "A modern learning management and progress tracking system for schools running the GLOW Pathways program.",
  verification: {
    google: "9sWFFWWgy5X02aVWft7x3S2rW7ZvDMH19NlHEW1R56g",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getCurrentUser();
  const prefs = sessionUser
    ? await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { darkMode: true, themeColor: true },
      })
    : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={prefs?.darkMode ? "dark" : undefined}
      data-theme={prefs?.themeColor ?? "blue"}
    >
      <body className={`${body.variable} ${display.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
