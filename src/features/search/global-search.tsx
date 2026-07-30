"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchResult = { type: string; id: string; title: string; subtitle?: string; href: string };

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search lessons, classes, students…"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-md">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => {
                router.push(r.href);
                setOpen(false);
                setQuery("");
              }}
              className={cn(
                "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-secondary",
                "border-b border-border last:border-0"
              )}
            >
              <span className="font-medium">{r.title}</span>
              <span className="text-xs text-muted-foreground">
                {r.type}
                {r.subtitle ? ` · ${r.subtitle}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card p-3 text-sm text-muted-foreground shadow-md">
          No results for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
