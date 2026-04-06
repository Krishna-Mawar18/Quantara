"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Target,
  Layers,
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePlaygroundStore } from "@/store/playground";
import { useDatasetStore } from "@/store/dataset";
import { Button } from "@/components/ui/button";
import { playgroundTrain, playgroundGetDatasetPreview, playgroundGetColumns } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";

const MODELS = [
  { key: "random_forest", name: "Random Forest", desc: "Best overall", icon: "🌲" },
  { key: "gradient_boosting", name: "Gradient Boosting", desc: "High accuracy", icon: "📈" },
  { key: "extra_trees", name: "Extra Trees", desc: "Fast & robust", icon: "🌳" },
  { key: "decision_tree", name: "Decision Tree", desc: "Simple interpretable", icon: "🌿" },
  { key: "logistic_regression", name: "Logistic Regression", desc: "Linear baseline", icon: "📊" },
  { key: "knn", name: "K-Nearest Neighbors", desc: "Instance based", icon: "🎯" },
  { key: "svm", name: "Support Vector", desc: "Complex patterns", icon: "⭕" },
  { key: "mlp", name: "Neural Network", desc: "Deep learning", icon: "🧠" },
  { key: "naive_bayes", name: "Naive Bayes", desc: "Probabilistic", icon: "📉" },
  { key: "ada_boost", name: "AdaBoost", desc: "Adaptive", icon: "🔄" },
];

export default function PlaygroundPage() {
  const store = usePlaygroundStore();
  const { datasets, fetchDatasets } = useDatasetStore();
  const [expandedSection, setExpandedSection] = useState<string | null>("data");
  const [predictFile, setPredictFile] = useState<File | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const loadDataset = async (datasetId: string, datasetName: string) => {
    store.setIsLoading(true);
    try {
      const [preview, columns] = await Promise.all([
        playgroundGetDatasetPreview(datasetId),
        playgroundGetColumns(datasetId),
      ]);
      const typedColumns = columns.columns.map((col: { name: string; type: string; count: number; missing?: number; unique?: number; mean?: number; median?: number; std?: number; min?: number; max?: number; top_values?: { value: string; count: number }[] }) => ({
        name: col.name,
        type: col.type as "numeric" | "categorical" | "datetime" | "text",
        count: col.count,
        missing: col.missing ?? 0,
        unique: col.unique ?? 0,
        mean: col.mean,
        median: col.median,
        std: col.std,
        min: col.min,
        max: col.max,
        top_values: col.top_values,
      }));
      store.setDataset(datasetId, datasetName, preview.rows, typedColumns, preview.preview);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Failed to load dataset");
    } finally {
      store.setIsLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!store.datasetId || !store.targetColumn) return;
    store.setIsTraining(true);
    store.setError(null);
    try {
      const result = await playgroundTrain({
        dataset_id: store.datasetId,
        target_column: store.targetColumn,
        feature_columns: store.useAllFeatures ? [] : store.featureColumns,
        model_key: store.selectedModel,
        hyperparameters: store.hyperparameters,
        validation_config: { test_size: 0.2, cv_folds: 0 },
        derived_features: store.derivedFeatures.map((f) => ({ name: f.name, formula: f.formula })),
      });
      store.setTrainingResult(result);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Training failed");
    } finally {
      store.setIsTraining(false);
    }
  };

  const handlePredict = async () => {
    console.log("Predict state:", {
      hasFile: !!predictFile,
      hasDatasetId: !!store.datasetId,
      hasTargetColumn: !!store.targetColumn,
      targetColumn: store.targetColumn
    });
    
    if (!predictFile) {
      setPredictError("Please select a file");
      return;
    }
    if (!store.datasetId || !store.targetColumn) {
      setPredictError("Please train a model first (select dataset and target)");
      return;
    }
    
    setIsPredicting(true);
    setPredictError(null);
    try {
      const auth = getFirebaseAuth();
      const token = await auth?.currentUser?.getIdToken() ?? "";
      
      const formData = new FormData();
      formData.append("file", predictFile);
      formData.append("dataset_id", store.datasetId);
      formData.append("target_column", store.targetColumn);
      formData.append("feature_columns", JSON.stringify(store.useAllFeatures ? [] : store.featureColumns));
      formData.append("model_key", store.selectedModel);
      formData.append("hyperparameters", JSON.stringify(store.hyperparameters));
      formData.append("validation_config", JSON.stringify({ test_size: 0.2, cv_folds: 0 }));
      formData.append("derived_features", JSON.stringify(store.derivedFeatures.map((f) => ({ name: f.name, formula: f.formula }))));
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/playground/predict`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Predict error:", response.status, errorData);
        throw new Error(errorData || "Prediction failed");
      }
      
      const result = await response.json();
      store.setPredictions(result);
    } catch (err) {
      setPredictError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setIsPredicting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const availableFeatures = store.columns.filter((c) => c.name !== store.targetColumn);
  const isClassification = store.trainingResult?.model_type?.toLowerCase().includes("classifier");
  const primaryMetric = isClassification ? "accuracy" : "r2_score";
  const primaryValue = store.trainingResult?.metrics?.[primaryMetric];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-violet-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            ML Playground
          </h1>
          <p className="text-zinc-600 mt-1">Build and train machine learning models in minutes</p>
        </div>

        {/* Error Banner */}
        {store.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{store.error}</span>
            <button onClick={() => store.setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 1. Data Selection */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("data")}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-zinc-900">1. Select Dataset</h3>
                    <p className="text-sm text-zinc-500">
                      {store.datasetName ? `${store.datasetName} (${store.rows.toLocaleString()} rows)` : "Choose a dataset"}
                    </p>
                  </div>
                </div>
                {expandedSection === "data" ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>
              
              {expandedSection === "data" && (
                <div className="px-6 pb-6 border-t border-zinc-100">
                  <div className="pt-4 space-y-2">
                    {datasets.map((ds) => (
                      <button
                        key={ds.id}
                        onClick={() => loadDataset(ds.id, ds.filename)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          store.datasetId === ds.id
                            ? "border-violet-500 bg-violet-50"
                            : "border-zinc-200 hover:border-violet-300 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-zinc-900">{ds.filename}</p>
                            <p className="text-sm text-zinc-500">{ds.rows.toLocaleString()} rows • {ds.columns.length} columns</p>
                          </div>
                          {store.datasetId === ds.id && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
                        </div>
                      </button>
                    ))}
                    {datasets.length === 0 && (
                      <div className="text-center py-8 text-zinc-500">
                        <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No datasets available. Upload one first.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Target & Features */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("target")}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-zinc-900">2. Target & Features</h3>
                    <p className="text-sm text-zinc-500">
                      {store.targetColumn ? `Target: ${store.targetColumn}` : "Select target column"}
                    </p>
                  </div>
                </div>
                {expandedSection === "target" ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>
              
              {expandedSection === "target" && (
                <div className="px-6 pb-6 border-t border-zinc-100">
                  <div className="pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Target Column (what to predict)</label>
                      <select
                        value={store.targetColumn}
                        onChange={(e) => store.setTargetColumn(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                      >
                        <option value="">Select column...</option>
                        {store.columns.map((col) => (
                          <option key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-zinc-700">Features (use all or select)</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={store.useAllFeatures}
                            onChange={(e) => store.setUseAllFeatures(e.target.checked)}
                            className="rounded border-zinc-300 text-violet-600"
                          />
                          <span className="text-sm text-zinc-600">Use all</span>
                        </label>
                      </div>
                      
                      {store.useAllFeatures ? (
                        <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                          <p className="text-sm text-violet-700">
                            ✓ Using all {availableFeatures.length} columns as features (excluding target)
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                          {availableFeatures.map((col) => (
                            <button
                              key={col.name}
                              onClick={() => store.toggleFeatureColumn(col.name)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                store.featureColumns.includes(col.name)
                                  ? "bg-violet-600 text-white"
                                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-violet-300"
                              }`}
                            >
                              {col.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Model Selection */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("model")}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-zinc-900">3. Choose Model</h3>
                    <p className="text-sm text-zinc-500">
                      {MODELS.find((m) => m.key === store.selectedModel)?.name || "Random Forest"}
                    </p>
                  </div>
                </div>
                {expandedSection === "model" ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>
              
              {expandedSection === "model" && (
                <div className="px-6 pb-6 border-t border-zinc-100">
                  <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MODELS.map((model) => (
                      <button
                        key={model.key}
                        onClick={() => store.setSelectedModel(model.key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          store.selectedModel === model.key
                            ? "border-violet-500 bg-violet-50"
                            : "border-zinc-200 hover:border-violet-300 hover:bg-zinc-50"
                        }`}
                      >
                        <p className="text-lg mb-1">{model.icon}</p>
                        <p className="font-medium text-sm text-zinc-900">{model.name}</p>
                        <p className="text-xs text-zinc-500">{model.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Train Button */}
            <Button
              onClick={handleTrain}
              disabled={!store.datasetId || !store.targetColumn || store.isTraining}
              isLoading={store.isTraining}
              className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-200"
            >
              <Play className="w-5 h-5 mr-2" />
              {store.isTraining ? "Training..." : "Train Model"}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-600" />
                Configuration
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dataset</span>
                  <span className="font-medium truncate ml-2 max-w-[120px]">{store.datasetName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rows</span>
                  <span className="font-medium">{store.rows > 0 ? store.rows.toLocaleString() : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target</span>
                  <span className="font-medium">{store.targetColumn || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Features</span>
                  <span className="font-medium">
                    {store.useAllFeatures ? "All" : store.featureColumns.length || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Model</span>
                  <span className="font-medium">{MODELS.find((m) => m.key === store.selectedModel)?.name || "-"}</span>
                </div>
              </div>
            </div>

            {/* Results */}
            {store.trainingResult && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                {(() => {
                  const result = store.trainingResult;
                  return (
                    <>
                      <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Results
                      </h3>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl mb-4">
                        <p className="text-sm text-zinc-500 mb-1">{isClassification ? "Accuracy" : "R² Score"}</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          {typeof primaryValue === "number" ? `${(primaryValue * 100).toFixed(1)}%` : "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-zinc-50 rounded-lg">
                          <p className="text-xs text-zinc-500">Model</p>
                          <p className="font-medium text-sm">{result.model_type}</p>
                        </div>
                        <div className="p-3 bg-zinc-50 rounded-lg">
                          <p className="text-xs text-zinc-500">Features</p>
                          <p className="font-medium text-sm">{result.features_used?.length || 0}</p>
                        </div>
                      </div>

                      {result.feature_importance && result.feature_importance.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-zinc-700 mb-2">Top Features</p>
                          <div className="space-y-2">
                            {result.feature_importance.slice(0, 5).map((f) => (
                              <div key={f.feature} className="flex items-center gap-2">
                                <span className="text-sm text-zinc-600 truncate flex-1">{f.feature}</span>
                                <div className="w-20 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                    style={{ width: `${(f.importance / (result.feature_importance[0]?.importance ?? 1)) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Predict */}
            {store.trainingResult && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-violet-600" />
                  Predict on New Data
                </h3>
                
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setPredictFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                
                {predictError && (
                  <p className="text-sm text-red-600 mt-2">{predictError}</p>
                )}
                
                <Button
                  onClick={handlePredict}
                  disabled={!predictFile || isPredicting}
                  isLoading={isPredicting}
                  variant="outline"
                  className="w-full mt-3"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Get Predictions
                </Button>

                {store.predictions && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-700">
                      ✓ {store.predictions.total_rows} predictions generated
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
