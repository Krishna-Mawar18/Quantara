"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomBarChart } from "@/components/charts/bar-chart";
import { CustomLineChart } from "@/components/charts/line-chart";
import { CustomPieChart } from "@/components/charts/pie-chart";
import { CustomScatterChart } from "@/components/charts/scatter-chart";
import { CustomAreaChart } from "@/components/charts/area-chart";
import { CustomStackedBarChart } from "@/components/charts/stacked-bar-chart";
import { CustomRadarChart } from "@/components/charts/radar-chart";
import { Lightbulb, BarChart3, Wand2, Plus, X, ChevronDown, ChevronRight, BarChart2, Hash, Tag, Layers, Sparkles, Database, Check, FileSpreadsheet } from "lucide-react";
import { getAnalytics, generateChart } from "@/lib/api";
import { useDatasetStore } from "@/store/dataset";
import { useChartStore, type SavedChart } from "@/store/charts";
import { addNotification } from "@/components/layout/header";
import type { AnalyticsResult } from "@/types";

const CHART_TYPES = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
  { value: "scatter", label: "Scatter" },
  { value: "histogram", label: "Histogram" },
  { value: "stacked", label: "Stacked Bar" },
  { value: "radar", label: "Radar" },
];

function ChartRenderer({ chart }: { chart: SavedChart }) {
  if (chart.type === "bar") {
    if (chart.seriesKey) {
      const series = [...new Set(chart.data.map((d) => String(d[chart.seriesKey!])))];
      const xValues = [...new Set(chart.data.map((d) => String(d[chart.xKey])))];
      const merged = xValues.map((x) => {
        const row: Record<string, unknown> = { [chart.xKey]: x };
        for (const s of series) {
          const match = chart.data.find(
            (d) => String(d[chart.xKey]) === x && String(d[chart.seriesKey!]) === s
          );
          row[s] = match ? match[chart.yKey] : 0;
        }
        return row;
      });
      return <CustomBarChart data={merged} xKey={chart.xKey} yKey={series[0]} />;
    }
    return <CustomBarChart data={chart.data} xKey={chart.xKey} yKey={chart.yKey} />;
  }
  if (chart.type === "line") {
    if (chart.seriesKey) {
      const series = [...new Set(chart.data.map((d) => String(d[chart.seriesKey!])))];
      const xValues = [...new Set(chart.data.map((d) => String(d[chart.xKey])))];
      const merged = xValues.map((x) => {
        const row: Record<string, unknown> = { [chart.xKey]: x };
        for (const s of series) {
          const match = chart.data.find(
            (d) => String(d[chart.xKey]) === x && String(d[chart.seriesKey!]) === s
          );
          row[s] = match ? match[chart.yKey] : 0;
        }
        return row;
      });
      return <CustomLineChart data={merged} xKey={chart.xKey} yKey={series[0]} />;
    }
    return <CustomLineChart data={chart.data} xKey={chart.xKey} yKey={chart.yKey} />;
  }
  if (chart.type === "pie") {
    return <CustomPieChart data={chart.data} nameKey={chart.xKey} valueKey={chart.yKey} />;
  }
  if (chart.type === "scatter") {
    return (
      <CustomScatterChart
        data={chart.data}
        xKey={chart.xKey}
        yKey={chart.yKey}
        seriesKey={chart.seriesKey}
      />
    );
  }
  if (chart.type === "histogram") {
    return <CustomBarChart data={chart.data} xKey={chart.xKey} yKey={chart.yKey} color="#7c3aed" />;
  }
  if (chart.type === "area") {
    if (chart.seriesKey) {
      const series = [...new Set(chart.data.map((d) => String(d[chart.seriesKey!])))];
      const xValues = [...new Set(chart.data.map((d) => String(d[chart.xKey])))];
      const merged = xValues.map((x) => {
        const row: Record<string, unknown> = { [chart.xKey]: x };
        for (const s of series) {
          const match = chart.data.find(
            (d) => String(d[chart.xKey]) === x && String(d[chart.seriesKey!]) === s
          );
          row[s] = match ? match[chart.yKey] : 0;
        }
        return row;
      });
      return <CustomAreaChart data={merged} xKey={chart.xKey} yKey={series[0]} />;
    }
    return <CustomAreaChart data={chart.data} xKey={chart.xKey} yKey={chart.yKey} />;
  }
  if (chart.type === "stacked") {
    if (chart.seriesKey) {
      const series = [...new Set(chart.data.map((d) => String(d[chart.seriesKey!])))];
      const xValues = [...new Set(chart.data.map((d) => String(d[chart.xKey])))];
      const merged = xValues.map((x) => {
        const row: Record<string, unknown> = { [chart.xKey]: x };
        for (const s of series) {
          const match = chart.data.find(
            (d) => String(d[chart.xKey]) === x && String(d[chart.seriesKey!]) === s
          );
          row[s] = match ? match[chart.yKey] : 0;
        }
        return row;
      });
      return <CustomStackedBarChart data={merged} xKey={chart.xKey} yKeys={series} />;
    }
    return <CustomStackedBarChart data={chart.data} xKey={chart.xKey} yKeys={[chart.yKey]} />;
  }
  if (chart.type === "radar") {
    if (chart.yKeys && chart.yKeys.length > 0) {
      return <CustomRadarChart data={chart.data} keys={chart.yKeys} />;
    }
    return <CustomRadarChart data={chart.data.map(d => ({ subject: String(d[chart.xKey]), [chart.yKey]: d[chart.yKey] }))} keys={[chart.yKey]} />;
  }
  return null;
}

interface ColumnRowProps {
  column: AnalyticsResult["summary"][number];
}

function ColumnRow({ column }: ColumnRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isNumeric = column.type === "numeric";

  const missingPct = column.count > 0 ? ((column.missing / (column.count + column.missing)) * 100).toFixed(1) : "0";

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-zinc-50 cursor-pointer transition-colors"
      >
        <td className="px-4 py-3">
          <button className="p-1 rounded hover:bg-zinc-200 transition-colors">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            )}
          </button>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isNumeric ? (
              <Hash className="w-4 h-4 text-violet-600" />
            ) : column.type === "categorical" ? (
              <Tag className="w-4 h-4 text-indigo-600" />
            ) : (
              <BarChart2 className="w-4 h-4 text-zinc-400" />
            )}
            <span className="font-medium text-zinc-900 text-sm">{column.name}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge
            variant={
              column.type === "numeric"
                ? "info"
                : column.type === "categorical"
                ? "default"
                : "warning"
            }
            className="text-xs"
          >
            {column.type}
          </Badge>
        </td>
        <td className="px-4 py-3 text-right text-sm text-zinc-600 font-mono">
          {column.count.toLocaleString()}
        </td>
        <td className="px-4 py-3 text-right text-sm text-zinc-600 font-mono">
          {column.unique.toLocaleString()}
        </td>
        <td className="px-4 py-3 text-right">
          <span className={`text-sm font-mono ${Number(missingPct) > 10 ? "text-violet-600" : "text-zinc-500"}`}>
            {column.missing > 0 ? `${column.missing} (${missingPct}%)` : "0"}
          </span>
        </td>
        <td className="px-4 py-3 text-right text-sm text-zinc-600 font-mono">
          {column.mean !== undefined ? column.mean.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ""}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-zinc-50/50">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {isNumeric ? (
                <>
                  <StatBox label="Min" value={column.min?.toLocaleString()} />
                  <StatBox label="Max" value={column.max?.toLocaleString()} />
                  <StatBox label="Mean" value={column.mean?.toLocaleString()} />
                  <StatBox label="Median" value={column.median?.toLocaleString()} />
                  <StatBox label="Std Dev" value={column.std?.toLocaleString()} />
                </>
              ) : (
                <>
                  <div className="md:col-span-2">
                    <p className="text-xs text-zinc-500 mb-2">Top Values</p>
                    <div className="space-y-1.5">
                      {column.top_values?.slice(0, 5).map((v, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-700 truncate max-w-[150px]">{v.value}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${(v.count / column.count) * 100}%` }}
                              />
                            </div>
                            <span className="text-zinc-500 text-xs w-12 text-right">{v.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <StatBox label="Mode" value={column.top_values?.[0]?.value} />
                  <StatBox label="Missing" value={`${column.missing} (${missingPct}%)`} />
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatBox({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-3">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-zinc-900 truncate" title={String(value ?? "-")}>
        {value ?? "-"}
      </p>
    </div>
  );
}

function ModernColumnCard({ column, index }: { column: AnalyticsResult["summary"][number]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isNumeric = column.type === "numeric";
  const missingPct = column.count > 0 ? ((column.missing / (column.count + column.missing)) * 100) : 0;

  const typeColors = {
    numeric: { bg: "from-violet-500/10 to-violet-500/20", border: "border-violet-200", icon: "text-violet-600", badge: "bg-violet-200 text-violet-700" },
    categorical: { bg: "from-violet-500/10 to-violet-500/20", border: "border-violet-200", icon: "text-violet-600", badge: "bg-violet-200 text-violet-700" },
    text: { bg: "from-violet-500/10 to-violet-500/20", border: "border-violet-200", icon: "text-violet-600", badge: "bg-violet-200 text-violet-700" },
    datetime: { bg: "from-violet-500/10 to-violet-500/20", border: "border-violet-200", icon: "text-violet-600", badge: "bg-violet-200 text-violet-700" },
  };

  const colors = typeColors[column.type as keyof typeof typeColors] || typeColors.text;

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
  const { addChart, removeChart, getDatasetCharts } = useChartStore();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Chart builder state
  const [chartType, setChartType] = useState("bar");
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [hueColumns, setHueColumns] = useState<string[]>([]);
  const [previewChart, setPreviewChart] = useState<SavedChart | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // Added charts (from store, per dataset)
  const addedCharts = selectedDatasetId ? getDatasetCharts(selectedDatasetId) : [];

  // Column analysis collapse state
  const [columnsExpanded, setColumnsExpanded] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const readyDatasets = datasets.filter((d) => d.status === "ready");
  const columns = analytics?.summary.filter((c) => !c.is_id) ?? [];
  const numericColumns = columns.filter((c) => c.type === "numeric");

  const handleSelectDataset = async (id: string) => {
    setSelectedDatasetId(id);
    setAnalytics(null);
    setAnalyticsError(null);
    setPreviewChart(null);
    setXColumn("");
    setYColumn("");
    setHueColumns([]);
    setIsLoadingAnalytics(true);
    try {
      const result = await getAnalytics(id);
      setAnalytics(result);
    } catch (err: unknown) {
      setAnalyticsError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleGenerateChart = async () => {
    if (!selectedDatasetId || !xColumn) return;
    if ((chartType === "line" || chartType === "scatter") && !yColumn) return;
    setIsGeneratingChart(true);
    setChartError(null);
    try {
      const result = await generateChart(selectedDatasetId, {
        chart_type: chartType,
        x_column: xColumn,
        y_column: yColumn || undefined,
        hue: hueColumns.length > 0 ? hueColumns : undefined,
      });
      setPreviewChart({ ...result, id: crypto.randomUUID() });
    } catch (err: unknown) {
      setChartError(err instanceof Error ? err.message : "Failed to generate chart");
    } finally {
      setIsGeneratingChart(false);
    }
  };

  const handleAddChart = () => {
    if (!previewChart || !selectedDatasetId) return;
    addChart(selectedDatasetId, previewChart);
    addNotification("success", "Chart Added", `"${previewChart.title}" added to your charts.`, "chart");
    setPreviewChart(null);
  };

  const handleRemoveChart = (id: string) => {
    if (!selectedDatasetId) return;
    removeChart(selectedDatasetId, id);
  };

  const toggleHue = (col: string) => {
    setHueColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
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
        <div className="flex items-center gap-3 mb-4 ">
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
                className={`relative group px-2  py-4 rounded-xl border-2 text-left transition-all duration-300 ${
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
          <div className={`mb-6 transition-all duration-500 ${columnsExpanded ? '' : 'mb-0'}`}>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 p-[1px]">
                <div className="bg-white rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-900">
                        {analytics.summary.filter(c => c.type === "numeric" && !c.is_id).length}
                      </p>
                      <p className="text-xs text-zinc-500">Numeric</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-[1px]">
                <div className="bg-white rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-900">
                        {analytics.summary.filter(c => c.missing > 0 && !c.is_id).length}
                      </p>
                      <p className="text-xs text-zinc-500">With Missing</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-900">
                        {analytics.summary.filter(c => c.type === "categorical" && !c.is_id).length}
                      </p>
                      <p className="text-xs text-zinc-500">Categorical</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-[1px]">
                <div className="bg-white rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-900">
                        {analytics.summary.filter(c => c.missing === 0 && !c.is_id).length}
                      </p>
                      <p className="text-xs text-zinc-500">Complete</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[1px]">
                <div className="bg-white rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-900">
                        {analytics.summary.filter(c => c.missing === 0 && !c.is_id).length}
                      </p>
                      <p className="text-xs text-zinc-500">Complete</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-900">
                        {analytics.summary.filter(c => c.missing > 0 && !c.is_id).length}
                      </p>
                      <p className="text-xs text-zinc-500">With Missing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {analytics.summary.filter((col) => !col.is_id).map((col, index) => (
                <ModernColumnCard key={col.name} column={col} index={index} />
              ))}
            </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px] mb-8">
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Chart Builder</h2>
                  <p className="text-sm text-zinc-500">Create stunning visualizations from your data</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => {
                      setChartType(e.target.value);
                      setPreviewChart(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {CHART_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">X</span>
                    </div>
                    X Axis
                  </label>
                  <select
                    value={xColumn}
                    onChange={(e) => setXColumn(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Select column</option>
                    {columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {chartType !== "histogram" && chartType !== "pie" && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Y</span>
                      </div>
                      Y Axis
                    </label>
                  <select
                    value={yColumn}
                    onChange={(e) => setYColumn(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Select column</option>
                    {columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    Group By
                  </label>
                  <select
                    value={hueColumns[0] || ""}
                    onChange={(e) => setHueColumns(e.target.value ? [e.target.value] : [])}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleGenerateChart}
                    isLoading={isGeneratingChart}
                    disabled={
                      !xColumn ||
                      ((chartType === "line" || chartType === "scatter") && !yColumn)
                    }
                    className="w-full h-[50px] rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {chartError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-sm text-red-600">{chartError}</p>
                </div>
              )}

              {previewChart && (
                <div className="relative">
                  <div className="absolute -top-3 -right-3 z-10">
                    <Button 
                      onClick={handleAddChart}
                      size="sm"
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Dashboard
                    </Button>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <p className="text-sm font-medium text-zinc-600">Preview</p>
                    </div>
                    <ChartRenderer chart={previewChart} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {addedCharts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Your Charts</h2>
                  <p className="text-sm text-zinc-500">{addedCharts.length} visualization{addedCharts.length !== 1 ? "s" : ""} saved</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {addedCharts.map((chart) => (
                  <div key={chart.id} className="relative group">
                    <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveChart(chart.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 shadow-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-violet-500 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <h3 className="font-semibold text-zinc-900">{chart.title}</h3>
                      </div>
                      <ChartRenderer chart={chart} />
                    </div>
                  </div>
                ))}
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
