"use client";
import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TablePreview } from "@/types/chart-spec";
import { parsePreview } from "@/lib/xlsx";
import { fileUploadService, type FileUpload } from "@/lib/file-upload";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthenticatedFileUploader({
  onUploadComplete,
}: {
  onUploadComplete?: (upload: FileUpload) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleFiles = useCallback(async (f: File) => {
    if (status === 'unauthenticated' || !(session?.user as any)?.id) {
      setError("Please sign in to upload files");
      router.push("/signin");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress("Validating file...");
    
    try {
      // Validate file type
      if (!f.name.match(/\.(xlsx|xls|csv|tsv|ods|txt)$/i)) {
        throw new Error("Please upload a supported data file (.xlsx, .xls, .csv, .tsv, .ods, .txt)");
      }
      
      // Validate file size (max 10MB)
      if (f.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }
      
      setUploadProgress("Processing file...");
      const preview = await parsePreview(f);
      
      setUploadProgress("Uploading to cloud...");
      const upload = await fileUploadService.uploadFile(f, preview, (session!.user as any).id);
      
      setUploadProgress("Upload complete!");
      onUploadComplete?.(upload);
      
      // Clear form
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  }, [status, session?.user, onUploadComplete, router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files[0]);
    }
  }, [handleFiles]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files[0]);
    }
  }, [handleFiles]);

  if (status === 'unauthenticated') {
    return (
      <Card aria-label="Sign in required">
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground mb-4">
            Please sign in to upload files
          </div>
          <Button onClick={() => router.push("/signin")}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card aria-label="Data file uploader">
      <CardContent className="py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            {uploadProgress}
          </div>
        )}

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            drag
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          } ${loading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".xlsx,.xls,.csv,.tsv,.ods,.txt"
            onChange={onInputChange}
            disabled={loading}
          />

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div>
              <h3 className="font-medium text-foreground">
                {loading ? "Processing..." : "Upload your data file"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports .xlsx, .xls, .csv, .tsv, .ods, .txt (max 10MB)
              </p>
            </div>

            <Button variant="outline" disabled={loading}>
              {loading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Keep the original FileUploader for backward compatibility
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

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files[0]);
    }
  }, [handleFiles]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files[0]);
    }
  }, [handleFiles]);

  return (
    <Card aria-label="Data file uploader">
      <CardContent className="py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            drag
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          } ${loading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".xlsx,.xls,.csv,.tsv,.ods,.txt"
            onChange={onInputChange}
            disabled={loading}
          />

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div>
              <h3 className="font-medium text-foreground">
                {loading ? "Processing..." : "Upload your data file"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports .xlsx, .xls, .csv, .tsv, .ods, .txt (max 10MB)
              </p>
            </div>

            <Button variant="outline" disabled={loading}>
              {loading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PreviewTable({ preview }: { preview: TablePreview | null }) {
  if (!preview || !preview.rows || preview.rows.length === 0) return null;

  // Get column names from the first row
  const columns = Object.keys(preview.rows[0]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-medium">Data Preview</h3>
        <p className="text-sm text-muted-foreground">
          {preview.rows.length} sample rows, {columns.length} columns
          {preview.firstSheetName && ` from "${preview.firstSheetName}"`}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-2 text-left font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr key={i} className="border-b">
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-2">
                    {row[col]?.toString() ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 text-sm text-muted-foreground border-t">
        Showing {preview.rows.length} sample rows
        {preview.sheets.length > 1 && ` (${preview.sheets.length} sheets available)`}
      </div>
    </div>
  );
}