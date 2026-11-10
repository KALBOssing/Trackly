import Link from "next/link";
import { Logo } from "@/components/brand/logo";
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
        <Link href="/dashboard" aria-label="Trackly dashboard" className="mb-8 px-2">
          <Logo markClassName="h-9 w-9" />
        </Link>
        <NavLinks role={role} isAdmin={isAdmin} unread={unread} />
      </div>
    </aside>
  );
}
