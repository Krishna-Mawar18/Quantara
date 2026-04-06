import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Dataset, AnalyticsResult, PredictionResult } from "@/types";
import { cachedFetchDatasets, invalidateAllDatasetCache } from "@/lib/cached-api";
import { useCacheStore, cacheKeys } from "@/store/cache";

interface DatasetState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  analytics: AnalyticsResult | null;
  prediction: PredictionResult | null;
  isUploading: boolean;
  isAnalyzing: boolean;
  isLoading: boolean;
  lastFetchTime: number | null;
  setDatasets: (datasets: Dataset[]) => void;
  setCurrentDataset: (dataset: Dataset | null) => void;
  setAnalytics: (analytics: AnalyticsResult | null) => void;
  setPrediction: (prediction: PredictionResult | null) => void;
  setIsUploading: (val: boolean) => void;
  setIsAnalyzing: (val: boolean) => void;
  fetchDatasets: (forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set, get) => ({
      datasets: [],
      currentDataset: null,
      analytics: null,
      prediction: null,
      isUploading: false,
      isAnalyzing: false,
      isLoading: false,
      lastFetchTime: null,

      setDatasets: (datasets) => set({ datasets }),
      setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
      setAnalytics: (analytics) => set({ analytics }),
      setPrediction: (prediction) => set({ prediction }),
      setIsUploading: (val) => set({ isUploading: val }),
      setIsAnalyzing: (val) => set({ isAnalyzing: val }),

      fetchDatasets: async (forceRefresh = false) => {
        const { lastFetchTime } = get();
        const now = Date.now();
        
        if (!forceRefresh && lastFetchTime && now - lastFetchTime < 30000) {
          return;
        }

        set({ isLoading: true });
        try {
          const data = await cachedFetchDatasets({ skipCache: forceRefresh });
          set({ datasets: data, lastFetchTime: now });
        } catch {
          const { get } = useCacheStore.getState();
          const cached = get<Dataset[]>(cacheKeys.datasets);
          if (cached?.data) {
            set({ datasets: cached.data });
          } else {
            set({ datasets: [] });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      invalidateCache: () => {
        invalidateAllDatasetCache();
        set({ lastFetchTime: null });
      },
    }),
    {
      name: "quantara-datasets",
      partialize: (state) => ({
        currentDataset: state.currentDataset,
        analytics: state.analytics,
        prediction: state.prediction,
        datasets: state.datasets,
      }),
    }
  )
);
