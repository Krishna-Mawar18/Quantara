import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedChart {
  id: string;
  type: string;
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  seriesKey?: string;
  yKeys?: string[];
}

interface ChartStoreState {
  chartsByDataset: Record<string, SavedChart[]>;
  addChart: (datasetId: string, chart: SavedChart) => void;
  removeChart: (datasetId: string, chartId: string) => void;
  clearDatasetCharts: (datasetId: string) => void;
  getDatasetCharts: (datasetId: string) => SavedChart[];
}

export const useChartStore = create<ChartStoreState>()(
  persist(
    (set, get) => ({
      chartsByDataset: {},

      addChart: (datasetId, chart) => {
        set((state) => ({
          chartsByDataset: {
            ...state.chartsByDataset,
            [datasetId]: [...(state.chartsByDataset[datasetId] || []), chart],
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
    }),
    {
      name: "quantara-charts",
    }
  )
);
