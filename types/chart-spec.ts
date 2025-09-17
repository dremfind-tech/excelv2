export type ChartType = "bar" | "line" | "pie";

export type ChartDataset = {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
};

export type ChartSpec = {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  labels: string[]; // x-axis or categories
  datasets: ChartDataset[];
  options?: any; // Chart.js options
};

export type TablePreview = {
  sheets: string[];
  firstSheetName: string | null;
  rows: Array<Record<string, any>>; // first 10 rows of first sheet
};

