"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks, type NavRole } from "@/components/layout/nav-links";

// The desktop sidebar is hidden below the md breakpoint, so phones and small
// tablets get this slim header with a slide-in drawer holding the same links.
export function MobileHeader({
  role,
  isAdmin,
  unread = 0,
}: {
  role: NavRole;
  isAdmin?: boolean;
  unread?: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur md:hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-fade-in" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-card px-4 py-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
          >
            <div className="mb-6 flex items-center justify-between px-2">
              <Dialog.Title className="flex items-center gap-2 font-display text-lg font-semibold">
                <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" /> Trackly
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>
            <NavLinks role={role} isAdmin={isAdmin} unread={unread} onNavigate={() => setOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Link href="/dashboard" className="flex items-center gap-2 font-display text-base font-semibold">
        <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" /> Trackly
      </Link>

      <Button variant="ghost" size="icon" className="relative ml-auto" asChild>
        <Link href="/notifications" aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </Button>
    </div>
  );
}
