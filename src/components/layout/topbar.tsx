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
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <h1 className="shrink-0 text-lg font-semibold">{title}</h1>
      <GlobalSearch />
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
        {initials(firstName ?? "", lastName)}
      </div>
    </header>
  );
}
