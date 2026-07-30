import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
