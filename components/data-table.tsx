"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { TablePreview } from "@/types/chart-spec";

interface DataTableProps {
  fileName: string;
  preview: TablePreview;
}

export function DataTable({ fileName, preview }: DataTableProps) {
  if (!preview.rows || preview.rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{fileName}</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted">
            <div className="text-lg">📊</div>
            <div className="mt-2">No data rows found in the uploaded file.</div>
            <div className="text-xs mt-1">Make sure your file has data rows below the column headers.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get column headers from the first row
  const headers = Object.keys(preview.rows[0]);
  
  // Helper function to format cell values based on type
  const formatCellValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    
    // Handle numbers
    if (typeof value === 'number') {
      // Format numbers with commas for large numbers
      if (Math.abs(value) >= 1000) {
        return value.toLocaleString();
      }
      return String(value);
    }
    
    // Handle dates (if it looks like a date)
    const str = String(value);
    if (str.match(/^\d{4}-\d{2}-\d{2}/) || str.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
      try {
        const date = new Date(str);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (e) {
        // If date parsing fails, return as string
      }
    }
    
    return str;
  };
  
  // Get file extension for icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'csv':
        return '📄';
      case 'tsv':
      case 'txt':
        return '📋';
      case 'ods':
        return '📊';
      default:
        return '📄';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>{getFileIcon(fileName)}</span>
          {fileName}
        </h3>
        <div className="text-sm text-muted">
          Showing first {preview.rows.length} data rows • Column names from first row
          {preview.firstSheetName && (
            <span> • Sheet: &quot;{preview.firstSheetName}&quot;</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96 border border-white/10 rounded-lg bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="bg-white/5 sticky top-0 z-10">
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index}
                    className="px-3 py-3 text-left font-medium text-foreground border-b border-white/10 whitespace-nowrap min-w-[120px]"
                  >
                    <div className="flex items-center gap-2">
                      {header || `Column ${index + 1}`}
                      <span className="text-xs text-muted/60">
                        {preview.rows.length > 0 && typeof preview.rows[0][header] === 'number' ? '🔢' : '📝'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    rowIndex % 2 === 0 ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  {headers.map((header, colIndex) => (
                    <td 
                      key={colIndex}
                      className="px-3 py-3 text-foreground/80 whitespace-nowrap min-w-[120px]"
                      title={String(row[header] || '')}
                    >
                      <div className="max-w-[200px] truncate">
                        {formatCellValue(row[header])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Data summary and actions */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              📊 <strong>{headers.length}</strong> columns
            </span>
            <span className="flex items-center gap-1">
              📋 <strong>{preview.rows.length}</strong> rows shown
            </span>
            {preview.sheets.length > 1 && (
              <span className="flex items-center gap-1">
                📁 <strong>{preview.sheets.length}</strong> sheets total
              </span>
            )}
          </div>
          
          {preview.rows.length >= 10 && (
            <div className="text-xs text-muted italic">
              Only showing first 10 rows for preview
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}