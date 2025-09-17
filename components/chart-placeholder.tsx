"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Download, Edit3, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export function ChartPlaceholder({ id, url, title: initialTitle }: { id: string; url: string; title: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const downloadImage = async () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.png`;
    a.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ id, title, url, type: "placeholder" }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${id}.json`;
    a.click();
  };

  const handleTitleSave = () => {
    setIsEditing(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setTitle(initialTitle);
      setIsEditing(false);
    }
  };

  return (
    <Card className="h-full group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                autoFocus
                aria-label="Chart title"
                className="w-full bg-transparent border-b border-primary/50 outline-none text-lg font-semibold pb-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyPress}
                placeholder="Enter chart title..."
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3 
                  className="text-lg font-semibold truncate cursor-pointer hover:text-primary transition-colors" 
                  onClick={() => setIsEditing(true)}
                  title={title}
                >
                  {title || "Untitled Chart"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit title"
                >
                  <Edit3 size={12} />
                </Button>
              </div>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1">
            {/* Preview Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(true)}
              className="h-8 w-8 p-0"
              title="Open preview"
            >
              <Maximize2 size={14} />
            </Button>

            {/* Export Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-8 w-8 p-0"
                title="Export options"
              >
                <Download size={14} />
              </Button>
              
              {showExportMenu && (
                <>
                  <div className="absolute right-0 top-10 bg-[color:var(--card)] border border-white/10 rounded-lg shadow-lg z-20 min-w-[120px]">
                    <button
                      onClick={() => { downloadImage(); setShowExportMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 first:rounded-t-lg"
                    >
                      PNG
                    </button>
                    <button
                      onClick={() => { downloadJSON(); setShowExportMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 last:rounded-b-lg"
                    >
                      JSON
                    </button>
                  </div>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-64 relative">
        <div 
          className="relative h-full w-full group cursor-pointer" 
          onClick={() => setOpen(true)}
        >
          <img 
            src={url} 
            alt={title} 
            className="h-full w-full object-contain rounded-xl border border-white/10 hover:border-white/20 transition-colors" 
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
              <Maximize2 size={14} />
              Click to preview
            </div>
          </div>
        </div>
      </CardContent>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setZoom(1); }}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>{title}</DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} aria-label="Zoom out">-</Button>
            <div className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</div>
            <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.1))} aria-label="Zoom in">+</Button>
            <Button variant="ghost" size="sm" onClick={() => setZoom(1)} aria-label="Reset zoom">Reset</Button>
          </div>
          <div className="overflow-auto max-h-[70vh] border border-white/10 rounded-xl p-2 bg-black/30">
            <img src={url} alt={title} style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
