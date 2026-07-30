"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

type Row = Record<string, string | number>;

async function exportExcel(rows: Row[], filename: string) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");
  if (rows.length > 0) {
    sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: 20 }));
    sheet.addRows(rows);
  }
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  triggerDownload(blob, `${filename}.xlsx`);
}

async function exportPdf(rows: Row[], filename: string, title: string) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  if (rows.length > 0) {
    autoTable(doc, {
      startY: 22,
      head: [Object.keys(rows[0])],
      body: rows.map((r) => Object.values(r)),
    });
  }
  doc.save(`${filename}.pdf`);
}

function exportCsv(rows: Row[], filename: string) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ rows, filename, title }: { rows: Row[]; filename: string; title: string }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => exportCsv(rows, filename)}>
        <Download className="h-4 w-4" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportExcel(rows, filename)}>
        <Download className="h-4 w-4" /> Excel
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportPdf(rows, filename, title)}>
        <Download className="h-4 w-4" /> PDF
      </Button>
    </div>
  );
}
