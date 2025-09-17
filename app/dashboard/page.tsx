"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const [prompt, setPrompt] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [filePreview, setFilePreview] = useState<any>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard - Session status:', status);
    console.log('Dashboard - Session data:', session);
    
    if (status === "loading") {
      console.log('Session is loading...');
      return;
    }
    
    if (status === "unauthenticated" || !session) {
      console.log('No session found, redirecting to signin in 1 second...');
      // Add a small delay to allow session to stabilize
      const timer = setTimeout(() => {
        router.push('/signin');
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (session?.user) {
      console.log('User authenticated successfully:', session.user.email);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    if (!session?.user?.email) {
      alert('Please sign in to upload files');
      router.push('/signin');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Read file for preview
      if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
        const text = await file.text();
        const separator = file.name.endsWith('.csv') ? ',' : '\t';
        const lines = text.split('\n').slice(0, 6); // First 6 rows for preview
        const preview = lines.map(line => line.split(separator));
        setFilePreview({ type: 'csv', data: preview, fileName: file.name });
      } else if (file.name.match(/\.(xlsx|xls|xlsm|xlsb)$/)) {
        // For Excel files, we'll show basic info and let the backend process it
        setFilePreview({ 
          type: 'excel', 
          fileName: file.name, 
          size: file.size,
          data: 'Excel file uploaded - processing on server...' 
        });
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file with session:', session?.user?.email); // Debug log

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for session
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Upload response status:', response.status); // Debug log

      if (response.ok) {
        const result = await response.json();
        // Ensure we store the file name for display
        const fileData = {
          ...result,
          fileName: file.name
        };
        setUploadedFile(fileData);
        
        // If it's an Excel file and we got processed data back, update preview
        if (result.preview && file.name.match(/\.(xlsx|xls|xlsm|xlsb)$/)) {
          setFilePreview({ 
            type: 'excel', 
            fileName: file.name, 
            data: result.preview,
            columns: result.columns 
          });
        }
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          // Keep modal open to show preview
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed:', response.status, errorData);
        
        if (response.status === 401) {
          alert('Authentication failed. Please sign in again.');
          router.push('/signin');
          return;
        }
        
        const errorMessage = errorData.error || `Upload failed with status ${response.status}`;
        alert(`Upload failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    }
  };

  const openUploadModal = () => {
    console.log('Opening upload modal, session:', session); // Debug log
    if (!session) {
      router.push('/signin');
      return;
    }
    setShowUploadModal(true);
    setFilePreview(null);
    setUploadedFile(null);
    console.log('Modal should be showing now'); // Debug log
  };
  
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <section className="flex flex-col items-center justify-center w-full h-full">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-card shadow-lg p-8 flex flex-col items-center">
          <div className="mb-4">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mx-auto text-muted-foreground">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-center">Ready to visualize your data</h2>
          <p className="text-muted-foreground text-center mb-4">Upload a data file (Excel, CSV, TSV, ODS) and enter a prompt to generate beautiful charts with AI assistance.</p>
          <div className="w-full mb-6">
            <div className="rounded-lg border bg-background p-4 text-sm text-foreground/90">
              <div className="font-semibold text-primary mb-2 text-center">Quick start tips:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Upload Excel (.xlsx, .xls), CSV, TSV, or ODS files up to 10MB</li>
                <li>First row should contain your column names (e.g., &quot;Project&quot;, &quot;Date&quot;, &quot;Amount&quot;)</li>
                <li>Try prompts like <span className="text-primary">&quot;show sales by month&quot;</span> or <span className="text-primary">&quot;compare categories&quot;</span></li>
                <li>Generate multiple chart types automatically</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition" 
              type="button"
            >
              Upload File
            </button>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mt-16">
          <div className="w-full max-w-xl">
            {/* Uploaded File Display */}
            {uploadedFile && (
              <div className="mb-4 p-3 bg-background/10 border border-white/10 rounded-lg flex items-center gap-3">
                <div className="flex-shrink-0">
                  {uploadedFile.fileName?.match(/\.(xlsx|xls|xlsm|xlsb)$/) ? (
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M10 12h4M10 16h4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {uploadedFile.fileName || 'Uploaded file'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ready for analysis
                  </p>
                </div>
                <button 
                  onClick={() => setUploadedFile(null)}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="rounded-full bg-background/10 border border-white/10 px-3 py-2 flex items-center gap-2 shadow-lg focus-within:ring-2 focus-within:ring-white/20">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="rounded-full bg-muted/20 p-2 text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-foreground text-base"
                placeholder="Ask anything"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <button className="rounded-full bg-primary p-2 text-primary-foreground">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Attach a spreadsheet (Excel, CSV, TSV, ODS) and ask what to visualize.
            </div>
          </div>
        </div>
      </section>

      {/* Upload Modal - Always render for testing */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowUploadModal(false)}
          style={{ zIndex: 9999 }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Your File</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {!isUploading && !filePreview ? (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-500 dark:text-gray-400 mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Excel, CSV, TSV, ODS files (up to 10MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx,.xls,.xlsm,.xlsb,.csv,.tsv,.ods"
                    onChange={handleFileUpload}
                  />
                </label>
                
                <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Excel files (.xlsx, .xls, .xlsm, .xlsb)</li>
                    <li>• CSV and TSV files (.csv, .tsv)</li>
                    <li>• OpenDocument Spreadsheet (.ods)</li>
                  </ul>
                </div>
              </div>
            ) : isUploading ? (
              <div className="text-center">
                <div className="mb-4">
                  <svg width="48" height="48" className="mx-auto text-primary animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-2">Uploading your file...</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{uploadProgress}% complete</p>
              </div>
            ) : (
              /* File Preview */
              <div>
                <div className="flex items-center mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <svg width="20" height="20" className="text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">File uploaded successfully!</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{filePreview?.fileName}</p>
                  </div>
                </div>

                {filePreview?.type === 'csv' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Preview (first 5 rows):</p>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="min-w-full text-xs">
                        <tbody>
                          {filePreview.data.slice(0, 5).map((row: string[], index: number) => (
                            <tr key={index} className={index === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
                              {row.slice(0, 4).map((cell, cellIndex) => (
                                <td key={cellIndex} className={`px-2 py-1 border-r border-gray-200 dark:border-gray-700 ${index === 0 ? 'font-medium' : ''}`}>
                                  {cell.substring(0, 20)}{cell.length > 20 ? '...' : ''}
                                </td>
                              ))}
                              {row.length > 4 && <td className="px-2 py-1 text-gray-500">+{row.length - 4} more</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {filePreview?.type === 'excel' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Excel File Info:</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                      <p className="text-gray-700 dark:text-gray-300">File size: {(filePreview.size / 1024).toFixed(1)} KB</p>
                      <p className="text-gray-700 dark:text-gray-300">Status: Ready for processing</p>
                      {filePreview.columns && (
                        <p className="text-gray-700 dark:text-gray-300">Columns: {filePreview.columns.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setShowUploadModal(false);
                      setFilePreview(null);
                      // Keep uploadedFile so it shows in the dashboard
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    Continue
                  </button>
                  <button 
                    onClick={() => {
                      setFilePreview(null);
                      setUploadedFile(null);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
                  >
                    Upload different file
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}