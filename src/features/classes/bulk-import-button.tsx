"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BulkImportButton({ classId }: { classId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch(`/api/classes/${classId}/students/bulk-import`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: results.data }),
          });
          const json = await res.json();
          if (!res.ok) {
            toast.error(json.error ?? "Import failed");
            return;
          }
          toast.success(`Imported ${json.created} students (${json.skipped} skipped)`);
          router.refresh();
        } finally {
          setLoading(false);
          if (inputRef.current) inputRef.current.value = "";
        }
      },
      error: () => {
        toast.error("Could not parse that CSV file");
        setLoading(false);
      },
    });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
        disabled={loading}
      />
      <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Bulk Import CSV
      </Button>
    </>
  );
}
