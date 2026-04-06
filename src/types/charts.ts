export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "scatter"
  | "histogram"
  | "heatmap"
  | "radar"
  | "bubble"
  | "boxplot"
  | "stacked"
  | "overlay";

export interface ChartStyling {
  color?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDataLabels?: boolean;
  opacity?: number;
  strokeWidth?: number;
  barRadius?: number;
  lineType?: "solid" | "dashed" | "dotted";
  areaType?: "normal" | "step" | "monotone";
}

export interface ChartAxis {
  xKey?: string;
  yKey?: string;
  yKeys?: string[];
  sizeKey?: string;
  colorKey?: string;
  labelX?: string;
  labelY?: string;
  scaleX?: "linear" | "category" | "time" | "log";
  scaleY?: "linear" | "category" | "log";
  rotateXLabel?: number;
  rotateYLabel?: number;
}

export interface ChartHue {
  column: string;
  palette?: string[];
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  data: Record<string, unknown>[];
  axis: ChartAxis;
  hue?: ChartHue;
  styling: ChartStyling;
  bins?: number;
  createdAt: number;
}

export interface ChartTypeInfo {
  type: ChartType;
  label: string;
  description: string;
  icon: string;
  needsX: boolean;
  needsY: boolean;
  needsYKeys: boolean;
  needsSize: boolean;
  supportsHue: boolean;
  supportsBins: boolean;
  dataFormat: "aggregate" | "raw" | "matrix";
}

export const CHART_TYPES_INFO: ChartTypeInfo[] = [
  {
    type: "bar",
    label: "Bar Chart",
    description: "Compare values across categories",
    icon: "BarChart3",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: true,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "line",
    label: "Line Chart",
    description: "Show trends over time",
    icon: "TrendingUp",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: true,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "area",
    label: "Area Chart",
    description: "Visualize cumulative trends",
    icon: "AreaChart",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: true,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "scatter",
    label: "Scatter Plot",
    description: "Explore relationships between variables",
    icon: "ScatterChart",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: true,
    supportsBins: false,
    dataFormat: "raw",
  },
  {
    type: "histogram",
    label: "Histogram",
    description: "Distribution of a single variable",
    icon: "BarChart2",
    needsX: true,
    needsY: false,
    needsYKeys: false,
    needsSize: false,
    supportsHue: false,
    supportsBins: true,
    dataFormat: "aggregate",
  },
  {
    type: "heatmap",
    label: "Heatmap",
    description: "Matrix visualization of correlations",
    icon: "Grid3x3",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: false,
    supportsBins: false,
    dataFormat: "matrix",
  },
  {
    type: "pie",
    label: "Pie Chart",
    description: "Show proportions of a whole",
    icon: "PieChart",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: false,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "donut",
    label: "Donut Chart",
    description: "Pie chart with center cutout",
    icon: "Circle",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: false,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "radar",
    label: "Radar/Spider",
    description: "Multi-axis comparison",
    icon: "Hexagon",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: true,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "bubble",
    label: "Bubble Chart",
    description: "Three-dimensional data points",
    icon: "CircleDot",
    needsX: true,
    needsY: true,
    needsSize: true,
    needsYKeys: false,
    supportsHue: true,
    supportsBins: false,
    dataFormat: "raw",
  },
  {
    type: "boxplot",
    label: "Box Plot",
    description: "Statistical distribution view",
    icon: "Box",
    needsX: true,
    needsY: true,
    needsYKeys: false,
    needsSize: false,
    supportsHue: true,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "stacked",
    label: "Stacked Bar",
    description: "Compare totals with composition",
    icon: "Layers",
    needsX: true,
    needsY: true,
    needsYKeys: true,
    needsSize: false,
    supportsHue: false,
    supportsBins: false,
    dataFormat: "aggregate",
  },
  {
    type: "overlay",
    label: "Overlay Line",
    description: "Multiple lines on same axes",
    icon: "GitCompare",
    needsX: true,
    needsY: true,
    needsYKeys: true,
    needsSize: false,
    supportsHue: false,
    supportsBins: false,
    dataFormat: "aggregate",
  },
];

export const DEFAULT_COLORS = [
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95",
  "#7c3aed",
  "#ec4899",
  "#f472b6",
  "#f9a8d4",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#f59e0b",
  "#fbbf24",
  "#fcd34d",
  "#ef4444",
  "#f87171",
  "#fca5a5",
];

export const COLOR_PALETTES = {
  violet: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#6d28d9"],
  rose: ["#e11d48", "#f43f5e", "#fb7185", "#fda4af", "#fecdd3"],
  blue: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
  green: ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"],
  amber: ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d", "#fef3c7"],
  cyan: ["#0891b2", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc"],
  pink: ["#db2777", "#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8"],
  slate: ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"],
};
