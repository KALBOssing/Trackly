import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { cn } from "@/lib/utils";

/** Split-screen layout shared by every sign-in / sign-up screen: brand panel left, form right. */
export function AuthShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main id="main" className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <AuthBrandPanel />
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" aria-label="Trackly home" className="w-fit lg:hidden">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className={cn("w-full animate-page-in", wide ? "max-w-xl" : "max-w-md")}>{children}</div>
        </div>
      </div>
    </main>
  );
}

export function AuthHeading({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      {icon}
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
    </div>
  );
}
