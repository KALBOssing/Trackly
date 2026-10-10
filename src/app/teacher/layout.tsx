import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("TEACHER");
  return <AppShell user={user}>{children}</AppShell>;
}
