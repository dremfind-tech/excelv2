"use client";
import { useRef, useState } from "react";
import { parsePreview } from "@/lib/xlsx";
import type { TablePreview } from "@/types/chart-spec";
import { Button } from "@/components/ui/button";
import { Plus, Mic, Sparkles, Paperclip } from "lucide-react";

export function PromptHero({
  prompt,
  setPrompt,
  disabled,
  onSelect,
  onGenerate,
}: {
  prompt: string;
  setPrompt: (s: string) => void;
  disabled: boolean;
  onSelect: (file: File, preview: TablePreview) => void;
  onGenerate: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl md:text-3xl text-center mb-6">Ready when you are.</h2>
      <div
        className="w-full max-w-3xl rounded-full bg-white/5 border border-white/10 px-3 py-2 flex items-center gap-2 shadow-lg focus-within:ring-2 focus-within:ring-white/20"
        aria-label="Prompt input bar"
      >
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10"
          onClick={() => inputRef.current?.click()}
          aria-label="Attach data file"
        >
          <Plus size={16} />
        </button>
        <input
          type="text"
          placeholder="Ask anything"
          className="flex-1 bg-transparent outline-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        {fileName && (
          <span className="text-xs text-muted hidden md:block" aria-label="Selected file">{fileName}</span>
        )}
        <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10" aria-label="Voice input placeholder" disabled>
          <Mic size={16} />
        </button>
        <Button
          size="sm"
          className="rounded-full h-9 w-9"
          disabled={disabled}
          onClick={onGenerate}
          aria-label="Generate charts"
        >
          <Sparkles size={16} />
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.tsv,.ods,.txt"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const preview = await parsePreview(f);
            setFileName(f.name);
            onSelect(f, preview);
          }}
        />
      </div>
      <div className="mt-2 text-xs text-muted">Attach a spreadsheet (Excel, CSV, TSV, ODS) and ask what to visualize.</div>
    </div>
  );
}

