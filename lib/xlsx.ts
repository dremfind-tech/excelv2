import * as XLSX from "xlsx";
import type { TablePreview } from "@/types/chart-spec";

export async function parsePreview(file: File): Promise<TablePreview> {
  const buf = await file.arrayBuffer();
  
  // Determine file type and set appropriate options
  const fileExt = file.name.toLowerCase().split('.').pop();
  let readOptions: XLSX.ParsingOptions = { type: "array" };
  
  // Special handling for CSV and TSV files
  if (fileExt === 'csv') {
    readOptions = { type: "array", raw: false, codepage: 65001 }; // UTF-8
  } else if (fileExt === 'tsv' || fileExt === 'txt') {
    readOptions = { type: "array", raw: false, codepage: 65001, FS: "\t" }; // Tab separated
  }
  
  const wb = XLSX.read(buf, readOptions);
  const sheets = wb.SheetNames || [];
  const first = sheets[0] ?? null;
  let rows: Array<Record<string, any>> = [];
  
  if (first) {
    const ws = wb.Sheets[first];
    
    // Always treat first row as headers by using header: 1 to get array format
    const json = XLSX.utils.sheet_to_json(ws, { 
      defval: null, 
      raw: false, 
      header: 1 // Get raw array format to manually handle headers
    }) as any[][];
    
    // Ensure we have data and convert to object format with first row as headers
    if (json.length > 1) { // Need at least 2 rows (header + data)
      // First row contains the actual column names from the file
      const headers = json[0]?.map((header: any, index: number) => {
        // Use the actual value from first row as column name
        const headerValue = String(header || '').trim();
        return headerValue || `Column ${index + 1}`;
      }) || [];
      
      // Data rows start from index 1 (skip header row), take up to 10 for preview
      const dataRows = json.slice(1, 11);
      
      rows = dataRows.map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined && row[index] !== null ? row[index] : null;
        });
        return obj;
      });
    } else if (json.length === 1) {
      // Only header row exists, no data rows
      const headers = json[0]?.map((header: any, index: number) => {
        const headerValue = String(header || '').trim();
        return headerValue || `Column ${index + 1}`;
      }) || [];
      
      // Create empty data structure to show headers
      rows = [];
    }
  }
  
  return { sheets, firstSheetName: first, rows };
}

