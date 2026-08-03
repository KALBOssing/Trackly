import { requireRole } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("TEACHER");
  return (
    <div className="flex min-h-screen flex-col">
      {user.impersonatedBy && <ImpersonationBanner />}
      <div className="flex flex-1">
        <Sidebar role="TEACHER" isAdmin={!!user.isAdmin} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
