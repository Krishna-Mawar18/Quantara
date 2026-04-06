import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChartConfig, ChartType, ChartAxis, ChartHue, ChartStyling } from "@/types/charts";

interface ChartStoreState {
  chartsByDataset: Record<string, ChartConfig[]>;
  activeChartId: string | null;
  isBuilderOpen: boolean;
  editingChart: ChartConfig | null;
  
  addChart: (datasetId: string, chart: ChartConfig) => void;
  updateChart: (datasetId: string, chartId: string, updates: Partial<ChartConfig>) => void;
  removeChart: (datasetId: string, chartId: string) => void;
  clearDatasetCharts: (datasetId: string) => void;
  getDatasetCharts: (datasetId: string) => ChartConfig[];
  
  setActiveChart: (chartId: string | null) => void;
  setBuilderOpen: (isOpen: boolean) => void;
  setEditingChart: (chart: ChartConfig | null) => void;
  
  duplicateChart: (datasetId: string, chartId: string) => void;
  reorderCharts: (datasetId: string, fromIndex: number, toIndex: number) => void;
  
  createDefaultChart: (type: ChartType, datasetId: string) => ChartConfig;
}

export const useChartStore = create<ChartStoreState>()(
  persist(
    (set, get) => ({
      chartsByDataset: {},
      activeChartId: null,
      isBuilderOpen: false,
      editingChart: null,

      addChart: (datasetId, chart) => {
        set((state) => ({
          chartsByDataset: {
            ...state.chartsByDataset,
            [datasetId]: [...(state.chartsByDataset[datasetId] || []), chart],
          },
        }));
      },

      updateChart: (datasetId, chartId, updates) => {
        set((state) => ({
          chartsByDataset: {
            ...state.chartsByDataset,
            [datasetId]: (state.chartsByDataset[datasetId] || []).map((c) =>
              c.id === chartId ? { ...c, ...updates } : c
            ),
          },
        }));
      },

      removeChart: (datasetId, chartId) => {
        set((state) => ({
          chartsByDataset: {
            ...state.chartsByDataset,
            [datasetId]: (state.chartsByDataset[datasetId] || []).filter(
              (c) => c.id !== chartId
            ),
          },
          activeChartId: state.activeChartId === chartId ? null : state.activeChartId,
        }));
      },

      clearDatasetCharts: (datasetId) => {
        set((state) => {
          const { [datasetId]: _, ...rest } = state.chartsByDataset;
          return { chartsByDataset: rest };
        });
      },

      getDatasetCharts: (datasetId) => {
        return get().chartsByDataset[datasetId] || [];
      },

      setActiveChart: (chartId) => {
        set({ activeChartId: chartId });
      },

      setBuilderOpen: (isOpen) => {
        set({ isBuilderOpen: isOpen });
      },

      setEditingChart: (chart) => {
        set({ editingChart: chart });
      },

      duplicateChart: (datasetId, chartId) => {
        const chart = get().chartsByDataset[datasetId]?.find((c) => c.id === chartId);
        if (chart) {
          const newChart: ChartConfig = {
            ...chart,
            id: crypto.randomUUID(),
            title: `${chart.title} (Copy)`,
            createdAt: Date.now(),
          };
          get().addChart(datasetId, newChart);
        }
      },

      reorderCharts: (datasetId, fromIndex, toIndex) => {
        const charts = [...(get().chartsByDataset[datasetId] || [])];
        const [removed] = charts.splice(fromIndex, 1);
        charts.splice(toIndex, 0, removed);
        set((state) => ({
          chartsByDataset: {
            ...state.chartsByDataset,
            [datasetId]: charts,
          },
        }));
      },

      createDefaultChart: (type, datasetId) => {
        const id = crypto.randomUUID();
        const typeLabels: Record<ChartType, string> = {
          bar: "Bar Chart",
          line: "Line Chart",
          area: "Area Chart",
          scatter: "Scatter Plot",
          histogram: "Histogram",
          heatmap: "Heatmap",
          pie: "Pie Chart",
          donut: "Donut Chart",
          radar: "Radar Chart",
          bubble: "Bubble Chart",
          boxplot: "Box Plot",
          stacked: "Stacked Bar",
          overlay: "Overlay Line",
        };

        return {
          id,
          type,
          title: typeLabels[type] || "Chart",
          data: [],
          axis: {},
          styling: {
            showGrid: true,
            showLegend: true,
            showTooltip: true,
            showDataLabels: false,
            opacity: 0.8,
            strokeWidth: 2,
            barRadius: 4,
          },
          createdAt: Date.now(),
        };
      },
    }),
    {
      name: "quantara-charts",
      partialize: (state) => ({
        chartsByDataset: state.chartsByDataset,
      }),
    }
  )
);

export function createChartConfig(
  type: ChartType,
  title: string,
  data: Record<string, unknown>[],
  axis: ChartAxis,
  hue?: ChartHue,
  styling?: Partial<ChartStyling>
): ChartConfig {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    data,
    axis,
    hue,
    styling: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      showDataLabels: false,
      opacity: 0.8,
      strokeWidth: 2,
      barRadius: 4,
      ...styling,
    },
    createdAt: Date.now(),
  };
}

export function transformDataForChart(
  data: Record<string, unknown>[],
  type: ChartType,
  axis: ChartAxis,
  hue?: ChartHue
): Record<string, unknown>[] {
  if (!data.length) return [];

  switch (type) {
    case "bar":
    case "line":
    case "area":
    case "stacked":
    case "overlay": {
      if (!axis.xKey || !axis.yKey) return data;
      
      if (hue?.column) {
        const categories = [...new Set(data.map((d) => String(d[hue.column])))];
        const xValues = [...new Set(data.map((d) => String(d[axis.xKey!])))];
        
        return xValues.map((x) => {
          const row: Record<string, unknown> = { [axis.xKey!]: x };
          for (const cat of categories) {
            const match = data.find(
              (d) => String(d[axis.xKey!]) === x && String(d[hue.column!]) === cat
            );
            row[cat] = match ? Number(match[axis.yKey!]) || 0 : 0;
          }
          return row;
        });
      }
      return data;
    }

    case "histogram": {
      if (!axis.xKey) return data;
      const values = data.map((d) => Number(d[axis.xKey!])).filter((v) => !isNaN(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      const binCount = 10;
      const binWidth = range / binCount;
      
      return Array.from({ length: binCount }, (_, i) => ({
        range: `${(min + i * binWidth).toFixed(2)}-${(min + (i + 1) * binWidth).toFixed(2)}`,
        count: values.filter(
          (v) => v >= min + i * binWidth && v < min + (i + 1) * binWidth
        ).length,
      }));
    }

    case "radar": {
      if (!axis.xKey || !axis.yKey) return data;
      const categories = [...new Set(data.map((d) => String(d[axis.xKey!])))];
      return categories.map((cat) => {
        const items = data.filter((d) => String(d[axis.xKey!]) === cat);
        const row: Record<string, unknown> = { subject: cat };
        if (items.length > 0) {
          row[axis.yKey!] = items.reduce((sum, d) => sum + (Number(d[axis.yKey!]) || 0), 0) / items.length;
        }
        return row;
      });
    }

    case "scatter":
    case "bubble": {
      return data;
    }

    case "pie":
    case "donut": {
      if (!axis.xKey || !axis.yKey) return data;
      const grouped: Record<string, number> = {};
      for (const d of data) {
        const key = String(d[axis.xKey!]);
        grouped[key] = (grouped[key] || 0) + (Number(d[axis.yKey!]) || 0);
      }
      
      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }

    case "heatmap": {
      if (!axis.xKey || !axis.yKey) return data;
      return data;
    }

    case "boxplot": {
      if (!axis.xKey || !axis.yKey) return data;
      const categories = [...new Set(data.map((d) => String(d[axis.xKey!])))];
      return categories.map((cat) => {
        const values = data
          .filter((d) => String(d[axis.xKey!]) === cat)
          .map((d) => Number(d[axis.yKey!]))
          .filter((v) => !isNaN(v))
          .sort((a, b) => a - b);
        
        if (values.length === 0) return { category: cat, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
        
        const min = values[0];
        const max = values[values.length - 1];
        const median = values[Math.floor(values.length / 2)];
        const q1 = values[Math.floor(values.length / 4)];
        const q3 = values[Math.floor((3 * values.length) / 4)];
        
        return { category: cat, min, q1, median, q3, max };
      });
    }

    default:
      return data;
  }
}

export function generateSampleData(
  columns: { name: string; type: string }[],
  rows = 20
): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = [];
  
  for (let i = 0; i < rows; i++) {
    const row: Record<string, unknown> = {};
    for (const col of columns) {
      if (col.type === "numeric") {
        row[col.name] = Math.round(Math.random() * 100 * 100) / 100;
      } else if (col.type === "categorical") {
        const categories = ["A", "B", "C", "D", "E"];
        row[col.name] = categories[Math.floor(Math.random() * categories.length)];
      } else if (col.type === "datetime") {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));
        row[col.name] = date.toISOString().split("T")[0];
      } else {
        row[col.name] = `Item ${i + 1}`;
      }
    }
    data.push(row);
  }
  
  return data;
}
