import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlaygroundStep = "setup" | "training" | "results" | "predict";

export interface DerivedFeature {
  id: string;
  name: string;
  formula: {
    operation: string;
    [key: string]: unknown;
  };
}

export interface TrainingResult {
  accuracy: number;
  model_type: string;
  model_key: string;
  feature_importance: { feature: string; importance: number }[];
  metrics: Record<string, number | number[]>;
  test_size: number;
  features_used: string[];
}

export interface ColumnInfo {
  name: string;
  type: "numeric" | "categorical" | "datetime" | "text";
  count: number;
  missing: number;
  unique: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  top_values?: { value: string; count: number }[];
}

interface PlaygroundState {
  step: PlaygroundStep;
  datasetId: string | null;
  datasetName: string | null;
  rows: number;
  columns: ColumnInfo[];
  previewData: Record<string, unknown>[];
  
  targetColumn: string;
  featureColumns: string[];
  useAllFeatures: boolean;
  derivedFeatures: DerivedFeature[];
  
  selectedModel: string;
  hyperparameters: Record<string, number | string>;
  
  trainingResult: TrainingResult | null;
  predictions: {
    predictions: Record<string, unknown>[];
    total_rows: number;
    model_type: string;
  } | null;
  
  isLoading: boolean;
  isTraining: boolean;
  error: string | null;
  
  setStep: (step: PlaygroundStep) => void;
  setDataset: (id: string, name: string, rows: number, columns: ColumnInfo[], preview: Record<string, unknown>[]) => void;
  setTargetColumn: (col: string) => void;
  toggleFeatureColumn: (col: string) => void;
  setFeatureColumns: (cols: string[]) => void;
  setUseAllFeatures: (useAll: boolean) => void;
  addDerivedFeature: (feature: DerivedFeature) => void;
  removeDerivedFeature: (id: string) => void;
  setSelectedModel: (model: string) => void;
  setHyperparameter: (key: string, value: number | string) => void;
  setTrainingResult: (result: TrainingResult | null) => void;
  setPredictions: (predictions: { predictions: Record<string, unknown>[]; total_rows: number; model_type: string } | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsTraining: (training: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: "setup" as PlaygroundStep,
  datasetId: null,
  datasetName: null,
  rows: 0,
  columns: [],
  previewData: [],
  targetColumn: "",
  featureColumns: [],
  useAllFeatures: true,
  derivedFeatures: [],
  selectedModel: "random_forest",
  hyperparameters: {} as Record<string, number | string>,
  trainingResult: null,
  predictions: null,
  isLoading: false,
  isTraining: false,
  error: null,
};

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setStep: (step) => set({ step }),
      
      setDataset: (id, name, rows, columns, preview) => set({
        datasetId: id,
        datasetName: name,
        rows,
        columns,
        previewData: preview,
        targetColumn: "",
        featureColumns: [],
        useAllFeatures: true,
        derivedFeatures: [],
        trainingResult: null,
        predictions: null,
        error: null,
      }),
      
      setTargetColumn: (col) => set({ targetColumn: col }),
      
      toggleFeatureColumn: (col) => set((state) => ({
        featureColumns: state.featureColumns.includes(col)
          ? state.featureColumns.filter((c) => c !== col)
          : [...state.featureColumns, col],
      })),
      
      setFeatureColumns: (cols) => set({ featureColumns: cols }),
      
      setUseAllFeatures: (useAll) => set({ useAllFeatures: useAll }),
      
      addDerivedFeature: (feature) => set((state) => ({
        derivedFeatures: [...state.derivedFeatures, feature],
      })),
      
      removeDerivedFeature: (id) => set((state) => ({
        derivedFeatures: state.derivedFeatures.filter((f) => f.id !== id),
      })),
      
      setSelectedModel: (model) => set({ selectedModel: model }),
      
      setHyperparameter: (key, value) => set((state) => ({
        hyperparameters: { ...state.hyperparameters, [key]: value },
      })),
      
      setTrainingResult: (result) => set({ trainingResult: result, step: result ? "results" : "training" }),
      
      setPredictions: (predictions) => set({ predictions }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setIsTraining: (training) => set({ isTraining: training }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: "quantara-playground",
      partialize: (state) => ({
        step: state.step,
        datasetId: state.datasetId,
        datasetName: state.datasetName,
        rows: state.rows,
        columns: state.columns,
        previewData: state.previewData,
        targetColumn: state.targetColumn,
        featureColumns: state.featureColumns,
        derivedFeatures: state.derivedFeatures,
        selectedModel: state.selectedModel,
        hyperparameters: state.hyperparameters,
        trainingResult: state.trainingResult,
      }),
    }
  )
);
