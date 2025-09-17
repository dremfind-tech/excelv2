"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  RefreshCw, 
  Download, 
  Trash2, 
  Copy, 
  Share2,
  MoreHorizontal,
  Filter,
  Grid3X3,
  List
} from "lucide-react";

interface ChartActionsProps {
  chartCount: number;
  onRegenerateAll: () => void;
  onExportAll: () => void;
  onClearAll: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ChartActions({ 
  chartCount, 
  onRegenerateAll, 
  onExportAll, 
  onClearAll,
  viewMode,
  onViewModeChange
}: ChartActionsProps) {
  const [showActions, setShowActions] = useState(false);

  if (chartCount === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              {chartCount} chart{chartCount !== 1 ? 's' : ''} generated
            </span>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2 text-xs ${viewMode === "grid" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                title="Grid view"
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-2 text-xs ${viewMode === "list" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerateAll}
              className="text-xs"
              title="Regenerate all charts"
            >
              <RefreshCw size={14} className="mr-1" />
              Regenerate All
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onExportAll}
              className="text-xs"
              title="Export all charts"
            >
              <Download size={14} className="mr-1" />
              Export All
            </Button>

            {/* More Actions Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="h-8 w-8 p-0"
                title="More actions"
              >
                <MoreHorizontal size={14} />
              </Button>

              {showActions && (
                <>
                  <div className="absolute right-0 top-10 bg-[color:var(--card)] border border-white/10 rounded-lg shadow-lg z-20 min-w-[140px]">
                    <button
                      onClick={() => { /* Copy all charts data */ setShowActions(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 first:rounded-t-lg"
                    >
                      <Copy size={12} />
                      Copy All
                    </button>
                    <button
                      onClick={() => { /* Share charts */ setShowActions(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    <hr className="border-white/10" />
                    <button
                      onClick={() => { onClearAll(); setShowActions(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 text-red-400 flex items-center gap-2 last:rounded-b-lg"
                    >
                      <Trash2 size={12} />
                      Clear All
                    </button>
                  </div>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowActions(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}