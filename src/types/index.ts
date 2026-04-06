export interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  created_at: string;
}

export interface Dataset {
  id: string;
  filename: string;
  rows: number;
  columns: string[];
  size: number;
  uploaded_at: string;
  status: "processing" | "ready" | "error";
}

export interface AnalyticsResult {
  summary: ColumnSummary[];
  correlations: Record<string, Record<string, number>>;
  insights: string[];
  charts: ChartConfig[];
}

export interface ColumnSummary {
  name: string;
  type: "numeric" | "categorical" | "datetime" | "text";
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
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "scatter" | "histogram" | "heatmap";
  title: string;
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string;
  config?: Record<string, unknown>;
}

export interface PredictionResult {
  accuracy: number;
  feature_importance: { feature: string; importance: number }[];
  model_type: string;
  metrics: Record<string, number>;
}

export interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "expired";
  current_period_end: string;
  razorpay_subscription_id?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits: {
    datasets: number;
    rows_per_dataset: number;
    predictions_per_month: number;
  };
  popular?: boolean;
}
