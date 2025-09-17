"use client";
import { AuthenticatedFileUploader, PreviewTable } from "@/components/authenticated-uploader";
import { useState } from "react";
import type { TablePreview } from "@/types/chart-spec";
import type { FileUpload } from "@/lib/file-upload";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [recentUpload, setRecentUpload] = useState<FileUpload | null>(null);
  const [preview, setPreview] = useState<TablePreview | null>(null);
  const router = useRouter();

  const handleUploadComplete = (upload: FileUpload) => {
    setRecentUpload(upload);
    setPreview(upload.preview_data || null);
    
    // Optionally redirect to dashboard after successful upload
    setTimeout(() => {
      router.push(`/dashboard?file=${upload.id}`);
    }, 2000);
  };

  return (
    <section className="container-section">
      <h1 className="text-3xl font-bold">Upload</h1>
      <p className="mt-2 text-muted">Upload your data files to create visualizations.</p>
      
      <div className="mt-6">
        <AuthenticatedFileUploader onUploadComplete={handleUploadComplete} />
      </div>
      
      {recentUpload && (
        <div className="mt-6">
          <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
            ✅ File &quot;{recentUpload.original_name}&quot; uploaded successfully! 
            Redirecting to dashboard...
          </div>
          
          <h2 className="text-xl font-semibold mb-4">
            File: {recentUpload.original_name}
          </h2>
          <PreviewTable preview={preview} />
        </div>
      )}
    </section>
  );
}
