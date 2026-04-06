"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, AlertDialog } from "@/components/ui/dialog";
import { useConfirm, useAlert } from "@/hooks/use-dialog";
import {
  BarChart3,
  TrendingUp,
  Crown,
  Plus,
  Database,
  Trash2,
  ArrowUpRight,
  Sparkles,
  HardDrive,
  Clock,
  FileText,
  Lightbulb,
  FlaskConical,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { CustomLineChart } from "@/components/charts/line-chart";
import { useDatasetStore } from "@/store/dataset";
import { deleteDataset } from "@/lib/api";
import { cachedGetPlanInfo } from "@/lib/cached-api";
import { formatBytes } from "@/lib/utils";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const { datasets, isLoading, fetchDatasets, invalidateCache } = useDatasetStore();
  const [planInfo, setPlanInfo] = useState<{
    plan: string;
    limits: { datasets: number; rows_per_dataset: number; predictions_per_month: number };
    usage: { datasets: number };
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  useEffect(() => {
    fetchDatasets();
    
    cachedGetPlanInfo()
      .then(setPlanInfo)
      .catch(() => cachedGetPlanInfo({ skipCache: false }).then(setPlanInfo).catch(() => {}));
  }, [fetchDatasets]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDatasets(true);
    await cachedGetPlanInfo({ skipCache: true })
      .then(setPlanInfo)
      .catch(() => {});
    setIsRefreshing(false);
  }, [fetchDatasets]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Dataset",
      message: "This will permanently delete this dataset.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDataset(id);
      invalidateCache();
      await fetchDatasets(true);
    } catch {
      alertDialog.alert({
        title: "Error",
        message: "Failed to delete dataset",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const readyDatasets = datasets.filter((d) => d.status === "ready");
  const totalRows = datasets.reduce((sum, d) => sum + (d.rows || 0), 0);
  const totalStorage = datasets.reduce((sum, d) => sum + (d.size || 0), 0);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const uploadsPerDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split("T")[0];
    const count = datasets.filter((d) => {
      if (!d.uploaded_at) return false;
      return d.uploaded_at.startsWith(dayStr);
    }).length;
    return { day: dayNames[date.getDay()], uploads: count };
  });

  const insights: string[] = [];
  
  if (datasets.length === 0) {
    insights.push("Upload your first dataset to get started with analytics");
    insights.push("CSV and Excel files are supported for upload");
    insights.push("Your data is processed securely in the cloud");
    insights.push("Get insights from your data in minutes");
    insights.push("Start by clicking the Add Dataset button above");
  } else {
    insights.push(`You have ${datasets.length} dataset${datasets.length > 1 ? "s" : ""} with ${totalRows.toLocaleString()} total rows of data`);
    
    if (readyDatasets.length > 0) {
      insights.push(`${readyDatasets.length} dataset${readyDatasets.length > 1 ? "s are" : " is"} ready for analysis and predictions`);
    }
    
    if (totalRows > 10000) {
      insights.push("Large dataset detected - ML models can extract deeper patterns");
    }
    
    if (totalRows > 1000 && totalRows <= 10000) {
      insights.push("Good dataset size for exploratory data analysis");
    }
    
    if (totalRows < 1000) {
      insights.push("Small dataset - consider adding more data for better insights");
    }
    
    const avgColumns = datasets.reduce((sum, d) => sum + (d.columns?.length || 0), 0) / datasets.length;
    if (avgColumns > 10) {
      insights.push("High dimensionality detected - feature selection may improve model accuracy");
    } else if (avgColumns > 5) {
      insights.push("Moderate number of features - good for balanced analysis");
    } else {
      insights.push("Simple dataset structure - easy to analyze and visualize");
    }
    
    insights.push("Use the Playground for custom ML model training");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
            <p className="text-sm text-zinc-500">Welcome back</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-[1px]">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{datasets.length}</p>
                <p className="text-xs text-zinc-500">Datasets</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-[1px]">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{readyDatasets.length}</p>
                <p className="text-xs text-zinc-500">Ready</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-[1px]">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{totalRows > 999 ? `${(totalRows / 1000).toFixed(1)}k` : totalRows}</p>
                <p className="text-xs text-zinc-500">Total Rows</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-[1px]">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{formatBytes(totalStorage)}</p>
                <p className="text-xs text-zinc-500">Storage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
        <div className="bg-white rounded-xl p-4 border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700">Dataset Limits</span>
            <span className="text-sm text-zinc-500">
              {planInfo ? `${planInfo.usage.datasets} / ${planInfo.limits.datasets === -1 ? "∞" : planInfo.limits.datasets}` : "Loading..."}
            </span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${planInfo && planInfo.usage.datasets >= planInfo.limits.datasets ? "bg-red-500" : "bg-violet-600"}`}
              style={{ width: planInfo ? `${Math.min((planInfo.usage.datasets / (planInfo.limits.datasets === -1 ? planInfo.usage.datasets : planInfo.limits.datasets)) * 100, 100)}%` : "0%" }}
            />
          </div>
        </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-[1px]">
        <div className="bg-white rounded-xl p-4 border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700">Prediction Limits</span>
            <span className="text-sm text-zinc-500">
              {planInfo ? `${planInfo.usage.datasets} / ${planInfo.limits.predictions_per_month === -1 ? "∞" : planInfo.limits.predictions_per_month}` : "Loading..."}
            </span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-violet-600"
              style={{ width: planInfo ? `${Math.min((planInfo.usage.datasets / (planInfo.limits.predictions_per_month === -1 ? planInfo.usage.datasets : planInfo.limits.predictions_per_month)) * 100, 100)}%` : "0%" }}
            />
          </div>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
          <div className="bg-white rounded-3xl p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Your Datasets</h2>
                  <p className="text-sm text-zinc-500">{datasets.length} files uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/upload">
                  <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Dataset
                  </Button>
                </Link>
              </div>
            </div>

            {isLoading && !isRefreshing ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : datasets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500">No datasets uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="group relative p-4 rounded-xl border-2 border-zinc-200 hover:border-violet-300 hover:bg-zinc-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 text-sm truncate" title={dataset.filename}>
                            {dataset.filename}
                          </p>
                          <p className="text-xs text-zinc-500">{formatBytes(dataset.size ?? 0)}</p>
                        </div>
                      </div>
                      <Badge variant={dataset.status === "ready" ? "success" : "warning"} className="text-xs">
                        {dataset.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                      <span>{dataset.rows?.toLocaleString() ?? 0} rows</span>
                      <span>·</span>
                      <span>{dataset.columns?.length ?? 0} cols</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-1 text-xs text-zinc-600">
                        <Clock className="w-3 h-3" />
                        {dataset.uploaded_at ? timeAgo(dataset.uploaded_at) : "Unknown"}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(dataset.id)}
                          disabled={deletingId === dataset.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Uploads</h2>
                  <p className="text-sm text-zinc-500">Last 7 days</p>
                </div>
              </div>
            </div>
            <CustomLineChart data={uploadsPerDay} xKey="day" yKey="uploads" color="#9146FF" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Insights</h2>
                  <p className="text-sm text-zinc-500">Quick Info</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-violet-500" />
            </div>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-zinc-50">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleCancel}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        variant={confirmDialog.options.variant}
        isLoading={confirmDialog.isLoading}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={alertDialog.handleClose}
        title={alertDialog.options.title}
        message={alertDialog.options.message}
        variant={alertDialog.options.variant}
      />
    </div>
  );
}
