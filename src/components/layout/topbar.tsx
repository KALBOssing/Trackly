import Link from "next/link";
import { initials } from "@/lib/utils";
import { GlobalSearch } from "@/features/search/global-search";

export function Topbar({
  title,
  name,
}: {
  title: string;
  name: string;
}) {
  const [firstName, lastName = ""] = name.split(" ");
  return (
    <header className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 border-b border-border bg-background px-4 py-3 md:px-6">
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold sm:flex-none">{title}</h1>
      {/* On phones the search drops to its own full-width row under the title. */}
      <div className="order-last w-full sm:order-none sm:ml-auto sm:w-auto sm:max-w-sm sm:flex-1">
        <GlobalSearch />
      </div>
      <Link
        href="/profile"
        aria-label={`${name || "Your"} profile`}
        title="Your profile"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {initials(firstName ?? "", lastName)}
      </Link>
    </header>
  );
}
