"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchResult = { type: string; id: string; title: string; subtitle?: string; href: string };

export function GlobalSearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [settledQuery, setSettledQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const hasResults = open && results.length > 0;
  const showEmpty = open && !loading && !failed && settledQuery === trimmed && trimmed.length >= 2 && results.length === 0;
  const showFailed = open && !loading && failed;

  // Click outside closes the list.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Press "/" anywhere (outside a text field) to jump to search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounced fetch; older requests are aborted so slow responses can't overwrite newer ones.
  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setFailed(false);
      setActive(-1);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setResults(json.results ?? []);
        setFailed(false);
        setSettledQuery(trimmed);
        setActive(-1);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResults([]);
        setFailed(true);
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [trimmed]);

  function choose(result: SearchResult) {
    router.push(result.href);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && hasResults) {
      e.preventDefault();
      choose(results[active >= 0 ? active : 0]);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full" role="search">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search Trackly"
          aria-expanded={hasResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={hasResults && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => (results.length > 0 || trimmed.length >= 2) && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search Trackly"
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring [&::-webkit-search-cancel-button]:hidden"
        />
        {loading ? (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          !query && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 text-[10px] font-medium text-muted-foreground lg:block">
              /
            </kbd>
          )
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {hasResults ? `${results.length} result${results.length === 1 ? "" : "s"} available` : ""}
      </p>

      {hasResults && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md"
        >
          {results.map((r, i) => (
            <li
              key={`${r.type}-${r.id}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(r)}
              className={cn(
                "flex cursor-pointer flex-col items-start border-b border-border px-3 py-2.5 text-left text-sm last:border-0",
                i === active && "bg-secondary"
              )}
            >
              <span className="font-medium">{r.title}</span>
              <span className="text-xs text-muted-foreground">
                {r.type}
                {r.subtitle ? ` · ${r.subtitle}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card p-3 text-sm text-muted-foreground shadow-md">
          Nothing matches &quot;{trimmed}&quot;. Try a lesson title, class name, or student ID.
        </div>
      )}
      {showFailed && (
        <div
          role="alert"
          className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card p-3 text-sm text-destructive shadow-md"
        >
          Search isn&apos;t working right now. Try again in a moment.
        </div>
      )}
    </div>
  );
}
