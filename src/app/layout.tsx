import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Trackly: GLOW Pathways Progress Tracking",
  description:
    "A modern learning management and progress tracking system for schools running the GLOW Pathways program.",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
