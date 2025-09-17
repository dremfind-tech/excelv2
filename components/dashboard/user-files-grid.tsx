"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fileUploadService, type FileUpload } from "@/lib/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FileText, BarChart3, Download, Trash2 } from "lucide-react";

export function UserFilesGrid() {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || !(session?.user as any)?.id) {
      setLoading(false);
      return;
    }

    loadUserFiles();
  }, [status, session?.user]);

  const loadUserFiles = async () => {
    if (!(session?.user as any)?.id) return;

    try {
      setLoading(true);
      const userUploads = await fileUploadService.getUserUploads((session!.user as any).id);
      setUploads(userUploads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!(session?.user as any)?.id || !confirm("Are you sure you want to delete this file?")) return;

    try {
      await fileUploadService.deleteUpload(uploadId, (session!.user as any).id);
      setUploads(prev => prev.filter(upload => upload.id !== uploadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const handleDownload = async (upload: FileUpload) => {
    try {
      const downloadUrl = await fileUploadService.getDownloadUrl(upload.storage_path);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = upload.original_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download file");
    }
  };

  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground mb-4">
            Please sign in to view your files
          </div>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Button onClick={loadUserFiles} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (uploads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first data file to start creating visualizations
          </p>
          <Link href="/upload">
            <Button>Upload File</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Files</h2>
        <Link href="/upload">
          <Button>Upload New File</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {uploads.map((upload) => (
          <Card key={upload.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="truncate">{upload.original_name}</span>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatFileSize(upload.file_size)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(upload.created_at), { addSuffix: true })}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {upload.chart_specs && upload.chart_specs.length > 0 && (
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    {upload.chart_specs.length} chart{upload.chart_specs.length !== 1 ? 's' : ''} generated
                  </Badge>
                </div>
              )}

              {upload.preview_data && (
                <div className="text-sm text-muted-foreground">
                  {upload.preview_data.rows?.length || 0} sample rows
                  {upload.preview_data.firstSheetName && (
                    <span> from &quot;{upload.preview_data.firstSheetName}&quot;</span>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Link href={`/dashboard?file=${upload.id}`} className="flex-1">
                  <Button variant="default" size="sm" className="w-full">
                    {upload.chart_specs ? "View Charts" : "Create Charts"}
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(upload)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(upload.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}