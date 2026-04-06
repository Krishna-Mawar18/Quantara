import { getFirebaseAuth } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth";
import type { AnalyticsResult } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getToken(): Promise<string | null> {
  // First try from persisted store (faster on page refresh)
  const storedToken = useAuthStore.getState().token;
  if (storedToken) {
    // Verify token is still valid by checking Firebase
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    if (user) {
      try {
        // Refresh token if needed
        return await user.getIdToken();
      } catch {
        return storedToken;
      }
    }
    return storedToken;
  }
  
  // Fall back to Firebase current user
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

export async function apiFetchFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

export async function uploadFile(file: File): Promise<{
  file_id: string;
  filename: string;
  rows: number;
  columns: string[];
}> {
  const token = await getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Upload failed");
  }

  return res.json();
}

export async function fetchDatasets(): Promise<
  {
    id: string;
    filename: string;
    rows: number;
    columns: string[];
    size: number;
    status: string;
    uploaded_at: string;
  }[]
> {
  return apiFetch("/api/datasets");
}

export async function fetchDataset(id: string): Promise<{
  id: string;
  filename: string;
  rows: number;
  columns: string[];
  size: number;
  status: string;
  uploaded_at: string;
}> {
  return apiFetch(`/api/datasets/${id}`);
}

export async function fetchDatasetData(id: string, limit = 1000): Promise<Record<string, unknown>[]> {
  return apiFetch(`/api/datasets/${id}/data?limit=${limit}`);
}

export async function deleteDataset(id: string): Promise<{ status: string }> {
  return apiFetch(`/api/datasets/${id}`, { method: "DELETE" });
}

export async function getAnalytics(fileId: string): Promise<AnalyticsResult> {
  return apiFetch(`/api/analytics/${fileId}`);
}

export async function generateChart(
  fileId: string,
  params: {
    chart_type: string;
    x_column: string;
    y_column?: string;
    hue?: string[];
  }
): Promise<{
  type: string;
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  seriesKey?: string;
  yKeys?: string[];
}> {
  return apiFetch(`/api/chart/${fileId}`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getPrediction(
  fileId: string,
  params: {
    target_column: string;
    feature_columns?: string[];
    model_type?: string;
  }
): Promise<{
  accuracy: number;
  model_type: string;
  feature_importance: { feature: string; importance: number }[];
  metrics: Record<string, number>;
}> {
  return apiFetch(`/api/predict/${fileId}`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function predictOnData(
  datasetId: string,
  file: File,
  params: {
    target_column: string;
    feature_columns?: string[];
    model_type?: string;
  }
): Promise<{
  predictions: Record<string, unknown>[];
  total_rows: number;
  model_type: string;
}> {
  const token = await getToken();
  const formData = new FormData();
  formData.append("file", file);

  const query = new URLSearchParams({
    target_column: params.target_column,
    model_type: params.model_type || "auto",
    feature_columns: params.feature_columns ? params.feature_columns.join(",") : "",
  });

  const res = await fetch(`${API_BASE}/api/predict/${datasetId}/data?${query}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Prediction failed" }));
    throw new Error(error.detail || "Prediction failed");
  }

  return res.json();
}

export async function getPlans(): Promise<
  {
    id: string;
    name: string;
    price: number;
    features: string[];
    limits: Record<string, number>;
    popular?: boolean;
  }[]
> {
  return apiFetch("/api/billing/plans");
}

export async function getSubscription(): Promise<{
  id?: string;
  plan: string;
  status: string;
  current_period_end?: string;
  razorpay_subscription_id?: string;
}> {
  return apiFetch("/api/billing/subscription");
}

export async function createCheckout(planId: string): Promise<{
  subscription_id?: string;
  plan_id: string;
  status?: string;
}> {
  return apiFetch("/api/billing/create-checkout", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  });
}

export async function getPlanInfo(): Promise<{
  plan: string;
  limits: {
    datasets: number;
    rows_per_dataset: number;
    predictions_per_month: number;
  };
  features: string[];
  usage: {
    datasets: number;
  };
}> {
  return apiFetch("/api/plan");
}

export async function playgroundGetDatasetPreview(datasetId: string): Promise<{
  id: string;
  filename: string;
  rows: number;
  columns: string[];
  preview: Record<string, unknown>[];
}> {
  return apiFetch(`/api/playground/datasets/${datasetId}/preview`);
}

export async function playgroundGetColumns(datasetId: string): Promise<{
  columns: Array<{
    name: string;
    type: string;
    count: number;
    missing: number;
    unique: number;
    is_id?: boolean;
    mean?: number;
    median?: number;
    std?: number;
    min?: number;
    max?: number;
    top_values?: { value: string; count: number }[];
  }>;
}> {
  return apiFetch(`/api/playground/datasets/${datasetId}/columns`);
}

export async function playgroundCreateFeature(
  datasetId: string,
  name: string,
  formula: Record<string, unknown>
): Promise<{
  success: boolean;
  name: string;
  result_type: string;
  preview: { name: string; preview: unknown[]; sample_values: unknown[] };
  columns: string[];
}> {
  return apiFetch(`/api/playground/datasets/${datasetId}/features`, {
    method: "POST",
    body: JSON.stringify({ name, formula }),
  });
}

export async function playgroundPreviewWithFeatures(
  datasetId: string,
  derivedFeatures: Array<{ name: string; formula: Record<string, unknown> }>
): Promise<{
  preview: Record<string, unknown>[];
  columns: string[];
  total_rows: number;
}> {
  return apiFetch(`/api/playground/datasets/${datasetId}/preview`, {
    method: "POST",
    body: JSON.stringify({ derived_features: derivedFeatures }),
  });
}

export async function playgroundGetModelSchema(
  datasetId: string,
  targetColumn: string
): Promise<{
  type: string;
  models: Record<string, { params: Record<string, unknown> }>;
}> {
  return apiFetch(`/api/playground/models/schema?dataset_id=${datasetId}&target_column=${targetColumn}`);
}

export interface PlaygroundTrainingParams {
  dataset_id: string;
  target_column: string;
  feature_columns: string[];
  model_key: string;
  hyperparameters: Record<string, number | string>;
  validation_config: { test_size: number; cv_folds: number };
  derived_features: Array<{ name: string; formula: Record<string, unknown> }>;
}

export async function playgroundTrain(
  params: PlaygroundTrainingParams
): Promise<{
  accuracy: number;
  model_type: string;
  model_key: string;
  feature_importance: { feature: string; importance: number }[];
  metrics: Record<string, number | number[]>;
  test_size: number;
  features_used: string[];
}> {
  return apiFetch("/api/playground/train", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function playgroundPredict(
  datasetId: string,
  file: File,
  params: Omit<PlaygroundTrainingParams, "dataset_id">
): Promise<{
  predictions: Record<string, unknown>[];
  total_rows: number;
  model_type: string;
  model_name: string;
}> {
  const token = await getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dataset_id", datasetId);
  formData.append("target_column", params.target_column);
  formData.append("feature_columns", JSON.stringify(params.feature_columns));
  formData.append("model_key", params.model_key);
  formData.append("hyperparameters", JSON.stringify(params.hyperparameters));
  formData.append("validation_config", JSON.stringify(params.validation_config));
  formData.append("derived_features", JSON.stringify(params.derived_features));

  const res = await fetch(`${API_BASE}/api/playground/predict`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Prediction failed" }));
    throw new Error(error.detail || "Prediction failed");
  }

  return res.json();
}

export async function playgroundValidateFormula(
  datasetId: string,
  formula: Record<string, unknown>
): Promise<{
  valid: boolean;
  result_type?: string;
  error?: string;
}> {
  return apiFetch("/api/playground/validate-formula", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId, formula }),
  });
}
