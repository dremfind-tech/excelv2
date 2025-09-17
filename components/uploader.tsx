"use client";
import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TablePreview } from "@/types/chart-spec";
import { parsePreview } from "@/lib/xlsx";

export function FileUploader({
  onFile,
}: {
  onFile: (file: File, preview: TablePreview) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(async (f: File) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate file type
      if (!f.name.match(/\.(xlsx|xls|csv|tsv|ods|txt)$/i)) {
        throw new Error("Please upload a supported data file (.xlsx, .xls, .csv, .tsv, .ods, .txt)");
      }
      
      // Validate file size (max 10MB)
      if (f.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }
      
      const preview = await parsePreview(f);
      onFile(f, preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setLoading(false);
    }
  }, [onFile]);

  return (
    <Card aria-label="Data file uploader">
      <CardContent className="py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag and drop your data file here"
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            drag 
              ? "border-secondary bg-secondary/10" 
              : "border-white/10 hover:border-white/20"
          } ${loading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f && !loading) handleFiles(f);
          }}
          onClick={() => !loading && inputRef.current?.click()}
          onKeyDown={(e) => { 
            if ((e.key === "Enter" || e.key === " ") && !loading) {
              inputRef.current?.click(); 
            }
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <div className="text-lg font-semibold">Processing file...</div>
            </div>
          ) : (
            <>
              <div className="text-lg font-semibold">Drop your data file</div>
              <div className="text-sm text-muted">Excel, CSV, TSV, ODS supported (max 10MB)</div>
            </>
          )}
          <Input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.tsv,.ods,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && !loading) handleFiles(f);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function PreviewTable({ preview }: { preview: TablePreview | null }) {
  if (!preview) return null;
  const { firstSheetName, rows } = preview;
  if (!firstSheetName || rows.length === 0) {
    return <div className="text-sm text-muted">No preview available.</div>;
  }
  const headers = Object.keys(rows[0] ?? {});
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10" aria-label="Preview of first 10 rows">
      <table className="min-w-full text-sm">
        <caption className="text-left px-3 py-2 text-muted">Sheet: {firstSheetName} (first 10 rows)</caption>
        <thead className="text-muted">
          <tr className="border-b border-white/10">
            {headers.map((h) => (
              <th key={h} className="text-left font-medium py-2 px-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5 last:border-b-0">
              {headers.map((h) => (
                <td key={h} className="py-1.5 px-3">{String(r[h] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
