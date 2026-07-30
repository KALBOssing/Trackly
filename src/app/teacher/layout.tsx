import { requireRole } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole("TEACHER");
  return (
    <div className="flex min-h-screen">
      <Sidebar role="TEACHER" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
