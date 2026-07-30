"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Users, BookOpenCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ClassRow = {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  status: "ACTIVE" | "ARCHIVED";
  _count: { students: number; lessonAssignments: number };
};

const PAGE_SIZE = 9;

export function ClassesGrid({ classes, canFilterByStatus }: { classes: ClassRow[]; canFilterByStatus: boolean }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "ARCHIVED">("ACTIVE");
  const [sortBy, setSortBy] = useState<"name" | "students">("name");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = classes;
    if (canFilterByStatus && statusFilter !== "ALL") {
      rows = rows.filter((c) => c.status === statusFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.gradeLevel.toLowerCase().includes(q) ||
          c.section.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) : b._count.students - a._count.students
    );
    return rows;
  }, [classes, query, statusFilter, sortBy, canFilterByStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search classes…"
            className="pl-9"
          />
        </div>
        {canFilterByStatus && (
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as typeof statusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="students">Sort: Students</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageRows.map((c) => (
          <Link key={c.id} href={`/classes/${c.id}`}>
            <Card className={`h-full transition-shadow hover:shadow-md ${c.status === "ARCHIVED" ? "opacity-60" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {c.name}
                  {c.status === "ARCHIVED" && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
                      Archived
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {c.gradeLevel} · {c.section}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {c._count.students} students
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpenCheck className="h-4 w-4" /> {c._count.lessonAssignments} lessons
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No classes match your search.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
