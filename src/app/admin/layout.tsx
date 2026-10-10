import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { ShieldCheck, LayoutDashboard, Users, BookOpenCheck } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: BookOpenCheck },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Phones and small tablets: a compact top bar with the same links, since the sidebar is hidden. */}
      <header className="border-b border-destructive/30 bg-destructive/5 md:hidden">
        <div className="flex h-12 items-center justify-between px-4">
          <span className="flex items-center gap-2 font-display font-semibold text-destructive">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" /> Admin
          </span>
          <Link href="/dashboard" className="flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">
            ← Back to app
          </Link>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 pb-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-destructive/30 bg-destructive/5 px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2 font-display text-lg font-semibold text-destructive">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" /> Admin
        </div>
        <nav aria-label="Admin" className="flex-1 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/dashboard"
          className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary"
        >
          ← Back to app
        </Link>
      </aside>
      <main id="main" className="min-w-0 flex-1 bg-background">
        {children}
      </main>
    </div>
  );
}
