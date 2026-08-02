"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Users,
  LogOut,
  Bell,
  ScrollText,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/classes", label: "Classes", icon: Users },
  { href: "/lessons", label: "Lessons", icon: BookOpenCheck },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

const teacherLinks = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/classes", label: "Classes", icon: Users },
  { href: "/lessons", label: "Lessons", icon: BookOpenCheck },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar({ role }: { role: "STUDENT" | "TEACHER" }) {
  const pathname = usePathname();
  const links = role === "TEACHER" ? teacherLinks : studentLinks;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 font-semibold text-lg">
        <GraduationCap className="h-6 w-6 text-primary" /> Trackly
      </Link>
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </aside>
  );
}
