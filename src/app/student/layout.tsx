import { requireRole } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT");
  return (
    <div className="flex min-h-screen">
      <Sidebar role="STUDENT" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
