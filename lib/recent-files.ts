export type RecentFile = {
  id: string;
  name: string;
  uploadedAt: number;
  chartCount: number;
  size: number;
  type: string;
  tags?: string[];
};

const FILES_KEY = "viz:recent-files";

export function listRecentFiles(): RecentFile[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecentFile(file: RecentFile) {
  if (typeof localStorage === "undefined") return;
  const all = listRecentFiles();
  const idx = all.findIndex((f) => f.id === file.id);
  if (idx >= 0) all[idx] = file; else all.unshift(file);
  localStorage.setItem(FILES_KEY, JSON.stringify(all.slice(0, 50))); // Keep last 50 files
}

export function removeRecentFile(id: string) {
  const all = listRecentFiles().filter((f) => f.id !== id);
  localStorage.setItem(FILES_KEY, JSON.stringify(all));
}

export function updateFileChartCount(id: string, chartCount: number) {
  const all = listRecentFiles();
  const file = all.find((f) => f.id === id);
  if (file) {
    file.chartCount = chartCount;
    localStorage.setItem(FILES_KEY, JSON.stringify(all));
  }
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 7) {
    return new Date(timestamp).toLocaleDateString();
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}

// Initialize with sample data if none exists
export function initializeSampleFiles() {
  if (typeof localStorage === "undefined") return;
  const existing = listRecentFiles();
  if (existing.length === 0) {
    const sampleFiles: RecentFile[] = [
      {
        id: "sample-1",
        name: "sales-data-q3.xlsx",
        uploadedAt: Date.now() - 86400000, // 1 day ago
        chartCount: 3,
        size: 1024 * 1024 * 2.5, // 2.5MB
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        tags: ["sales", "quarterly"]
      },
      {
        id: "sample-2",
        name: "marketing-metrics.xlsx",
        uploadedAt: Date.now() - 172800000, // 2 days ago
        chartCount: 5,
        size: 1024 * 1024 * 1.8, // 1.8MB
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        tags: ["marketing", "metrics"]
      },
      {
        id: "sample-3",
        name: "employee-survey.xlsx",
        uploadedAt: Date.now() - 259200000, // 3 days ago
        chartCount: 2,
        size: 1024 * 1024 * 0.9, // 0.9MB
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        tags: ["hr", "survey"]
      }
    ];
    
    localStorage.setItem(FILES_KEY, JSON.stringify(sampleFiles));
  }
}