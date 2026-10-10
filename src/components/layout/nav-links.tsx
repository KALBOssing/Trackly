"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpenCheck,
  Bell,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ScrollText,
  ShieldCheck,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavRole = "STUDENT" | "TEACHER";

type NavItem = { href: string; label: string; icon: LucideIcon };

// Day-to-day destinations, in the order people reach for them.
const MAIN_LINKS: Record<NavRole, NavItem[]> = {
  STUDENT: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lessons", label: "Lessons", icon: BookOpenCheck },
    { href: "/classes", label: "Classes", icon: Users },
    { href: "/announcements", label: "Announcements", icon: Megaphone },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
  ],
  TEACHER: [
    { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lessons", label: "Lessons", icon: BookOpenCheck },
    { href: "/classes", label: "Classes", icon: Users },
    { href: "/announcements", label: "Announcements", icon: Megaphone },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/audit-log", label: "Audit Log", icon: ScrollText },
  ],
};

const ACCOUNT_LINKS: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItemLink({
  item,
  active,
  badge,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-accent font-semibold text-accent-foreground"
          : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary" />}
      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {badge > 99 ? "99+" : badge}
          <span className="sr-only"> unread</span>
        </span>
      ) : null}
    </Link>
  );
}

export function NavLinks({
  role,
  isAdmin,
  unread = 0,
  onNavigate,
}: {
  role: NavRole;
  isAdmin?: boolean;
  unread?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col">
      <nav aria-label="Main" className="flex-1 space-y-1">
        {MAIN_LINKS[role].map((item) => (
          <NavItemLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
        ))}
      </nav>

      <nav aria-label="Account" className="mt-4 space-y-1 border-t border-border pt-4">
        {ACCOUNT_LINKS.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            badge={item.href === "/notifications" ? unread : undefined}
            onNavigate={onNavigate}
          />
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" /> Admin
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" /> Sign out
        </button>
      </nav>
    </div>
  );
}
