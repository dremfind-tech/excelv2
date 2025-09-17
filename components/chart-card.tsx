"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ChartSpec } from "@/types/chart-spec";
import { 
  Download, 
  MoreHorizontal, 
  Edit3, 
  RotateCcw, 
  RefreshCw,
  ZoomIn,
  ZoomOut,
  FileImage,
  FileCode,
  Maximize2
} from "lucide-react";

// Dynamic import for Chart.js to avoid SSR issues
let Chart: any = null;
let zoomPlugin: any = null;

if (typeof window !== 'undefined') {
  import('chart.js/auto').then((module) => {
    Chart = module.default;
  });
  import('chartjs-plugin-zoom').then((module) => {
    zoomPlugin = module.default;
    if (Chart) {
      Chart.register(zoomPlugin);
    }
  });
}

export function ChartCard({
  spec,
  loading,
  onUpdate,
  onRegenerate,
}: {
  spec: ChartSpec;
  loading?: boolean;
  onUpdate?: (next: ChartSpec) => void;
  onRegenerate?: (chartId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);
  const [title, setTitle] = useState(spec.title);
  const [isEditing, setIsEditing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => setTitle(spec.title), [spec.title]);

  // Load Chart.js dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !Chart) {
      Promise.all([
        import('chart.js/auto'),
        import('chartjs-plugin-zoom')
      ]).then(([chartModule, zoomModule]) => {
        Chart = chartModule.default;
        zoomPlugin = zoomModule.default;
        Chart.register(zoomPlugin);
        setChartLoaded(true);
      });
    } else if (Chart) {
      setChartLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || loading || !chartLoaded || !Chart) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ctx, {
      type: spec.type,
      data: { labels: spec.labels, datasets: spec.datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          title: { display: !!title, text: title },
          zoom: {
            pan: { enabled: true, mode: "xy", modifierKey: "ctrl" },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: "xy",
              onZoomComplete: () => setIsZoomed(true),
            },
          },
        },
        ...(spec.options ?? {}),
      },
    });
    return () => chartRef.current?.destroy();
  }, [spec, loading, title, chartLoaded]);

  const specJson = useMemo(() => JSON.stringify(spec, null, 2), [spec]);

  const exportPNG = () => {
    const url = chartRef.current?.toBase64Image();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.id}.png`;
    a.click();
  };

  const exportSVG = () => {
    // Create an SVG wrapper embedding the PNG; this is a lightweight workaround
    const url = chartRef.current?.toBase64Image();
    if (!url) return;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><image href='${url}' width='1200' height='800'/></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${spec.id}.svg`;
    a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([specJson], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${spec.id}.json`;
    a.click();
  };

  const resetZoom = () => {
    chartRef.current?.resetZoom();
    setIsZoomed(false);
  };

  const handleTitleSave = () => {
    setIsEditing(false);
    onUpdate?.({ ...spec, title });
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setTitle(spec.title);
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
            {/* Chart Type Selector */}
            <select
              aria-label="Chart type"
              className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-sm hover:bg-white/10 transition-colors"
              value={spec.type}
              onChange={(e) => onUpdate?.({ ...spec, type: e.target.value as any })}
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="pie">Pie</option>
            </select>

            {/* Zoom Controls */}
            {isZoomed && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetZoom} 
                className="h-8 w-8 p-0"
                title="Reset zoom"
              >
                <RotateCcw size={14} />
              </Button>
            )}

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
                <div className="absolute right-0 top-10 bg-[color:var(--card)] border border-white/10 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => { exportPNG(); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 first:rounded-t-lg"
                  >
                    <FileImage size={12} />
                    PNG
                  </button>
                  <button
                    onClick={() => { exportSVG(); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2"
                  >
                    <FileImage size={12} />
                    SVG
                  </button>
                  <button
                    onClick={() => { exportJSON(); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 last:rounded-b-lg"
                  >
                    <FileCode size={12} />
                    JSON
                  </button>
                </div>
              )}
            </div>

            {/* Regenerate Button */}
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerate(spec.id)}
                className="h-8 w-8 p-0"
                title="Regenerate chart"
              >
                <RefreshCw size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-64 relative">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <div className="text-sm text-muted">Generating chart...</div>
          </div>
        ) : (
          <>
            <canvas 
              ref={canvasRef} 
              role="img" 
              aria-label={`${spec.type} chart: ${spec.title}`}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
            
            {/* Interaction Hints */}
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <ZoomIn size={10} />
                <span>Scroll to zoom • Ctrl+drag to pan</span>
              </div>
            </div>
          </>
        )}
        
        {/* Click outside to close export menu */}
        {showExportMenu && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowExportMenu(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
