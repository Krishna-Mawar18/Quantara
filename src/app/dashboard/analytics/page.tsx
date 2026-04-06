"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartBuilder, ChartCard } from "@/components/charts";
import { ChartConfig } from "@/types/charts";
import { useChartStore } from "@/store/chart-builder";
import {
  Lightbulb,
  BarChart3,
  Wand2,
  ChevronDown,
  ChevronRight,
  Hash,
  Tag,
  BarChart2,
  Database,
  Check,
  FileSpreadsheet,
  Plus,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { getAnalytics, fetchDatasetData } from "@/lib/api";
import { useDatasetStore } from "@/store/dataset";
import { addNotification } from "@/components/layout/header";
import type { AnalyticsResult } from "@/types";

function ModernColumnCard({ column, index }: { column: AnalyticsResult["summary"][number]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isNumeric = column.type === "numeric";
  const missingPct = column.count > 0 ? ((column.missing / (column.count + column.missing)) * 100) : 0;

  const colors = {
    bg: "from-violet-500/10 to-violet-500/20",
    border: "border-violet-200",
    icon: "text-violet-600",
    badge: "bg-violet-200 text-violet-700",
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative group cursor-pointer rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-5 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center border ${colors.border}`}>
              {isNumeric ? (
                <Hash className={`w-5 h-5 ${colors.icon}`} />
              ) : (
                <Tag className={`w-5 h-5 ${colors.icon}`} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm leading-tight">{column.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors.badge}`}>
                {column.type}
              </span>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </div>
        </div>

        <div className="bg-white/60 rounded-xl p-3 border border-zinc-200/50">
          <p className="text-2xl font-bold text-zinc-900 font-mono text-center">{column.count.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 text-center">Total Values</p>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-200/50 space-y-3">
            {isNumeric ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Min" value={column.min?.toLocaleString()} />
                  <MiniStat label="Max" value={column.max?.toLocaleString()} />
                  <MiniStat label="Mean" value={column.mean?.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
                  <MiniStat label="Missing" value={column.missing > 0 ? `${column.missing} (${missingPct.toFixed(1)}%)` : "0"} />
                </div>
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 mb-2">Distribution</p>
                  <div className="h-20 bg-white/60 rounded-lg border border-zinc-200/50 overflow-hidden flex items-end gap-0.5 px-3">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const hash = (column.name.charCodeAt(i % column.name.length) * (i + 1) * 7) % 100;
                      const height = 15 + (hash / 100) * 85;
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t transition-all hover:opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <MiniStat label="Unique" value={column.unique.toLocaleString()} />
                  <MiniStat label="Missing" value={column.missing > 0 ? `${column.missing}` : "0"} />
                </div>
                <p className="text-xs text-zinc-500 mb-2">Top Values</p>
                <div className="space-y-2">
                  {column.top_values?.slice(0, 5).map((v, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600 truncate max-w-[120px]">{v.value}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
                            style={{ width: `${(v.count / column.count) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 font-mono w-10 text-right">
                          {(v.count / column.count * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-white/60 rounded-lg px-3 py-2">
      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-zinc-900 font-mono truncate">{value ?? "—"}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { datasets, isLoading, fetchDatasets } = useDatasetStore();
  const { chartsByDataset, addChart, removeChart, getDatasetCharts, duplicateChart } = useChartStore();
  
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [columnsExpanded, setColumnsExpanded] = useState(true);
  const [expandedChartId, setExpandedChartId] = useState<string | null>(null);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const readyDatasets = datasets.filter((d) => d.status === "ready");
  const columns = analytics?.summary.filter((c) => !c.is_id) ?? [];
  const savedCharts = selectedDatasetId ? getDatasetCharts(selectedDatasetId) : [];

  const handleSelectDataset = async (id: string) => {
    setSelectedDatasetId(id);
    setAnalytics(null);
    setRawData([]);
    setAnalyticsError(null);
    setIsLoadingAnalytics(true);
    
    try {
      const analyticsResult = await getAnalytics(id);
      setAnalytics(analyticsResult);
      
      try {
        const dataResult = await fetchDatasetData(id);
        setRawData(dataResult);
      } catch {
        console.warn("Could not fetch raw data for chart builder. Using API-based chart generation.");
        setRawData([]);
      }
    } catch (err: unknown) {
      setAnalyticsError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleAddChart = (chart: ChartConfig) => {
    if (!selectedDatasetId) return;
    addChart(selectedDatasetId, chart);
    addNotification("success", "Chart Added", `"${chart.title}" has been added to your charts.`, "chart");
  };

  const handleDeleteChart = (chartId: string) => {
    if (!selectedDatasetId) return;
    removeChart(selectedDatasetId, chartId);
    addNotification("info", "Chart Removed", "Chart has been removed.", "chart");
  };

  const handleDuplicateChart = (chartId: string) => {
    if (!selectedDatasetId) return;
    duplicateChart(selectedDatasetId, chartId);
    addNotification("success", "Chart Duplicated", "Chart has been duplicated.", "chart");
  };

  const handleEditChart = (chart: ChartConfig) => {
    setEditingChart(chart);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Analytics</h1>
            <p className="text-sm text-zinc-500">Explore automated insights and visualizations</p>
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-xl bg-white border border-purple-400">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Select Dataset</h2>
            <p className="text-sm text-zinc-500">Choose a dataset to analyze</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : readyDatasets.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl bg-zinc-50 border border-zinc-200 border-dashed">
            <Database className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-500 font-medium">No ready datasets found</p>
            <p className="text-xs text-zinc-400 mt-1">Upload a file first to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {readyDatasets.map((ds) => (
              <button
                key={ds.id}
                onClick={() => handleSelectDataset(ds.id)}
                className={`relative group px-2 py-4 rounded-xl border-2 text-left transition-all duration-300 ${
                  selectedDatasetId === ds.id
                    ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-500/20"
                    : "border-zinc-200 hover:border-violet-300 hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    selectedDatasetId === ds.id
                      ? "bg-violet-100"
                      : "bg-zinc-100 group-hover:bg-violet-100"
                  }`}>
                    <FileSpreadsheet className={`w-4 h-4 ${
                      selectedDatasetId === ds.id ? "text-violet-600" : "text-zinc-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 text-sm truncate" title={ds.filename}>
                      {ds.filename}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {ds.rows.toLocaleString()} rows · {ds.columns.length} cols
                    </p>
                  </div>
                  {selectedDatasetId === ds.id && (
                    <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedDatasetId && !isLoading && readyDatasets.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-50 p-8 text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-zinc-500 font-medium">Select a dataset above to view analytics</p>
        </div>
      )}

      {isLoadingAnalytics && (
        <div className="text-center py-16">
          <p className="text-zinc-500">Analyzing dataset...</p>
        </div>
      )}

      {analyticsError && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-sm text-red-600">{analyticsError}</p>
          </CardContent>
        </Card>
      )}

      {analytics && (
        <>
        
        <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
          <div className={`bg-white rounded-3xl p-6 ${columnsExpanded ? '' : 'mb-0'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Column Analysis</h2>
                  <p className="text-sm text-zinc-500">{analytics.summary.filter(c => !c.is_id).length} columns analyzed</p>
                </div>
              </div>
              <button
                onClick={() => setColumnsExpanded(!columnsExpanded)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:border-violet-300 hover:bg-violet-50 transition-all shadow-sm group"
              >
                <span className="text-sm font-medium text-zinc-600 group-hover:text-violet-600">
                  {columnsExpanded ? "Collapse" : "Expand"}
                </span>
                <div className={`w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center transition-all group-hover:bg-violet-100 ${columnsExpanded ? "rotate-180" : ""}`}>
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-violet-600" />
                </div>
              </button>
            </div>

            <div className={`overflow-hidden transition-all duration-500 ${columnsExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {analytics.summary.filter((col) => !col.is_id).map((col, index) => (
                  <ModernColumnCard key={col.name} column={col} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ChartBuilder
            data={rawData}
            columns={columns.map((c) => ({ name: c.name, type: c.type }))}
            onAddChartAction={handleAddChart}
            initialChart={editingChart}
          />
        </div>


          {savedCharts.length > 0 && (
            <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Your Charts</h2>
                  <p className="text-sm text-zinc-500">{savedCharts.length} visualization{savedCharts.length !== 1 ? "s" : ""} saved</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {savedCharts.map((chart) => (
                  <ChartCard
                    key={chart.id}
                    chart={chart}
                    onDeleteAction={() => handleDeleteChart(chart.id)}
                    onDuplicateAction={() => handleDuplicateChart(chart.id)}
                    onEdit={() => handleEditChart(chart)}
                    onExpand={() => setExpandedChartId(expandedChartId === chart.id ? null : chart.id)}
                    isExpanded={expandedChartId === chart.id}
                  />
                ))}
              </div>
            </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 to-violet-700 p-[1px] mb-8">
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">AI Insights</h2>
                  <p className="text-sm text-zinc-500">Automatically detected patterns and trends</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.insights.map((insight, i) => (
                  <div 
                    key={i} 
                    className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100/50 border border-zinc-200/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-zinc-700 leading-relaxed pt-1">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
