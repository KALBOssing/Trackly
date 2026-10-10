import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { NavLinks, type NavRole } from "@/components/layout/nav-links";

export function Sidebar({
  role,
  isAdmin,
  unread = 0,
}: {
  role: NavRole;
  isAdmin?: boolean;
  unread?: number;
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
      <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-4 py-6">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 font-display text-lg font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" /> Trackly
        </Link>
        <NavLinks role={role} isAdmin={isAdmin} unread={unread} />
      </div>
    </aside>
  );
}
