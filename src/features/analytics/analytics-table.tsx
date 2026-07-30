"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Row = {
  "Student ID": string;
  Name: string;
  Class: string;
  "Avg Completion %": number;
  "Avg Score": number;
};

const PAGE_SIZE = 20;

export function AnalyticsTable({ rows }: { rows: Row[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">Student ID</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Class</th>
              <th className="py-2 pr-4">Avg Completion</th>
              <th className="py-2 pr-4">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r["Student ID"]} className="border-t border-border">
                <td className="py-2 pr-4">{r["Student ID"]}</td>
                <td className="py-2 pr-4">{r.Name}</td>
                <td className="py-2 pr-4">{r.Class}</td>
                <td className="py-2 pr-4">{r["Avg Completion %"]}%</td>
                <td className="py-2 pr-4">{r["Avg Score"]}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted-foreground">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({rows.length} students)
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
