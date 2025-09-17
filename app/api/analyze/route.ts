import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { type ChartSpec } from "@/types/chart-spec";
import { getChartSuggestions } from "@/lib/ai";

export const runtime = "nodejs";

function guessSchema(rows: any[]): { columns: { name: string; type: string }[] } {
  if (!rows?.length) return { columns: [] };
  const sample = rows[0];
  const columns = Object.keys(sample).map((k) => {
    const vals = rows.map((r) => r[k]).filter((v) => v !== null && v !== undefined);
    const num = vals.filter((v) => typeof v === "number").length;
    const type = num > vals.length / 2 ? "number" : "string";
    return { name: k, type };
  });
  return { columns };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const prompt = String(form.get("prompt") ?? "");
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await (file as Blob).arrayBuffer();
    
    // Get file name and extension for better parsing
    const fileName = (file as File).name || 'unknown';
    const fileExt = fileName.toLowerCase().split('.').pop();
    
    // Set appropriate parsing options based on file type
    let readOptions: any = { type: "array" };
    if (fileExt === 'csv') {
      readOptions = { type: "array", raw: false, codepage: 65001 };
    } else if (fileExt === 'tsv' || fileExt === 'txt') {
      readOptions = { type: "array", raw: false, codepage: 65001, FS: "\t" };
    }
    
    const wb = XLSX.read(arrayBuffer, readOptions);
    const first = wb.SheetNames[0];
    if (!first) return NextResponse.json({ error: "No sheets found" }, { status: 400 });
    
    const ws = wb.Sheets[first];
    
    // Always treat first row as headers - use consistent parsing with preview
    const jsonArray = XLSX.utils.sheet_to_json(ws, { 
      defval: null, 
      raw: false, 
      header: 1 // Get array format to handle headers explicitly
    }) as any[][];
    
    // Convert to object format with first row as headers
    let rows: any[] = [];
    if (jsonArray.length > 1) { // Need at least 2 rows (header + data)
      // First row contains the actual column names from the file
      const headers = jsonArray[0]?.map((header: any, index: number) => {
        // Use the actual value from first row as column name
        const headerValue = String(header || '').trim();
        return headerValue || `Column ${index + 1}`;
      }) || [];
      
      // Data rows start from index 1 (skip header row), take up to 200 for AI processing
      const dataRows = jsonArray.slice(1, 201);
      
      rows = dataRows.map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined && row[index] !== null ? row[index] : null;
        });
        return obj;
      });
    } else if (jsonArray.length === 1) {
      // Only header row exists, return error as we need data for analysis
      return NextResponse.json({ error: "File contains only headers, no data rows found" }, { status: 400 });
    }
    
    const schema = guessSchema(rows);

    // Ask AI for chart specs (with fallback heuristics in lib/ai)
    const specs: ChartSpec[] = await getChartSuggestions({ prompt, schema, rows });

    // Basic validation
    const clean = specs
      .filter((s) => s && s.labels && s.datasets && s.datasets.length > 0)
      .map((s, i) => ({ ...s, id: s.id || `chart_${i + 1}` }));

    return NextResponse.json({ specs: clean });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Analysis failed" }, { status: 500 });
  }
}

