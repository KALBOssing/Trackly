import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { ShieldCheck, LayoutDashboard, Users, BookOpenCheck } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/classes", label: "Classes", icon: BookOpenCheck },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-destructive/30 bg-destructive/5 px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2 font-semibold text-lg text-destructive">
          <ShieldCheck className="h-6 w-6" /> Admin
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">
          ← Back to app
        </Link>
      </aside>
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
}
