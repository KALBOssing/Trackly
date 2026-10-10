import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";

type ShellUser = {
  id: string;
  role: "STUDENT" | "TEACHER";
  isAdmin?: boolean;
  impersonatedBy?: string;
};

// One shell for every signed-in area (shared pages, /student, /teacher) so the
// navigation, skip link, and unread badge behave the same everywhere.
export async function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const unread = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {user.impersonatedBy && <ImpersonationBanner />}
      <MobileHeader role={user.role} isAdmin={!!user.isAdmin} unread={unread} />
      <div className="flex flex-1">
        <Sidebar role={user.role} isAdmin={!!user.isAdmin} unread={unread} />
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
