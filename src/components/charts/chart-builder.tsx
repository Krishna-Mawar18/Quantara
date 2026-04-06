"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChartType,
  ChartConfig,
  CHART_TYPES_INFO,
  COLOR_PALETTES,
  ChartStyling,
  ChartAxis,
  ChartHue,
} from "@/types/charts";
import { createChartConfig, transformDataForChart, generateSampleData } from "@/store/chart-builder";
import { Button } from "@/components/ui/button";
import { ChartRenderer } from "./chart-renderer";
import {
  Plus,
  Settings2,
  Palette,
  BarChart3,
  TrendingUp,
  AreaChart,
  ScatterChart,
  PieChart,
  Circle,
  Hexagon,
  BarChart2,
  Grid3x3,
  CircleDot,
  Box,
  Layers,
  GitCompare,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Wand2,
} from "lucide-react";

const CHART_ICONS: Record<ChartType, React.ElementType> = {
  bar: BarChart3,
  line: TrendingUp,
  area: AreaChart,
  scatter: ScatterChart,
  pie: PieChart,
  donut: Circle,
  radar: Hexagon,
  histogram: BarChart2,
  heatmap: Grid3x3,
  bubble: CircleDot,
  boxplot: Box,
  stacked: Layers,
  overlay: GitCompare,
};

interface ChartBuilderProps {
  data: Record<string, unknown>[];
  columns: { name: string; type: string }[];
  onAddChartAction: (chart: ChartConfig) => void;
  initialChart?: ChartConfig | null;
}

export function ChartBuilder({
  data,
  columns,
  onAddChartAction,
  initialChart,
}: ChartBuilderProps) {
  const numericColumns = columns.filter(
    (c) => c.type === "numeric" || c.type === "datetime"
  );
  const categoricalColumns = columns.filter(
    (c) => c.type === "categorical" || c.type === "text"
  );

  const getInitialState = () => {
    if (initialChart) {
      return {
        selectedType: initialChart.type as ChartType,
        axis: initialChart.axis,
        hue: initialChart.hue,
        styling: initialChart.styling,
      };
    }
    return {
      selectedType: "bar" as ChartType,
      axis: {} as ChartAxis,
      hue: undefined as ChartHue | undefined,
      styling: {
        showGrid: true,
        showLegend: true,
        showTooltip: true,
        showDataLabels: false,
        opacity: 0.8,
        strokeWidth: 2,
        barRadius: 4,
      } as ChartStyling,
    };
  };

  const initialState = getInitialState();
  const [selectedType, setSelectedType] = useState<ChartType>(initialState.selectedType);
  const [axis, setAxis] = useState<ChartAxis>(initialState.axis);
  const [hue, setHue] = useState<ChartHue | undefined>(initialState.hue);
  const [styling, setStyling] = useState<ChartStyling>(initialState.styling);
  const [bins, setBins] = useState<number>(10);
  const [showConfig, setShowConfig] = useState(true);
  const [showStyling, setShowStyling] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<ChartConfig | null>(null);

  const chartInfo = useMemo(() => CHART_TYPES_INFO.find((c) => c.type === selectedType), [selectedType]);

  const getData = useMemo(() => {
    if (data.length > 0) return data;
    if (columns.length > 0) return generateSampleData(columns, 20);
    return [];
  }, [data, columns]);

  const generatePreview = useCallback(
    (type: ChartType, ax: ChartAxis, h: ChartHue | undefined, s: ChartStyling) => {
      const info = CHART_TYPES_INFO.find((c) => c.type === type);
      const currentData = getData;
      const transformedData = transformDataForChart(currentData, type, ax, h);
      const config: ChartConfig = {
        id: crypto.randomUUID(),
        type,
        title: `${info?.label || type} Chart`,
        data: transformedData,
        axis: ax,
        hue: h,
        styling: s,
        bins,
        createdAt: Date.now(),
      };
      setPreviewConfig(config);
    },
    [getData, bins]
  );

  useEffect(() => {
    if (initialChart) {
      generatePreview(initialChart.type, initialChart.axis, initialChart.hue, initialChart.styling);
    }
  }, []);

  useEffect(() => {
    if (canGenerate(axis, hue)) {
      generatePreview(selectedType, axis, hue, styling);
    }
  }, [axis, hue, selectedType, styling]);

  const handleTypeChange = (type: ChartType) => {
    setSelectedType(type);
    setAxis({});
    setHue(undefined);
    setPreviewConfig(null);
  };

  const handleAxisChange = (key: keyof ChartAxis, value: string | string[]) => {
    setAxis(prevAxis => ({ ...prevAxis, [key]: value || undefined }));
  };

  const handleHueChange = (column: string) => {
    const newHue = column ? { column, palette: COLOR_PALETTES.violet } : undefined;
    setHue(newHue);
  };

  const handleStylingChange = (key: keyof ChartStyling, value: unknown) => {
    const newStyling = { ...styling, [key]: value };
    setStyling(newStyling);
  };

  const canGenerate = useCallback((ax: ChartAxis, h: ChartHue | undefined): boolean => {
    if (!chartInfo) return false;
    
    const needsX = chartInfo.needsX && !ax.xKey;
    const needsY = chartInfo.needsY && !ax.yKey;
    const needsYKeys = chartInfo.needsYKeys && (!ax.yKeys || ax.yKeys.length === 0);
    const needsSize = chartInfo.needsSize && !ax.sizeKey;

    return !needsX && !needsY && !needsYKeys && !needsSize;
  }, [chartInfo]);

  const handleAddChart = () => {
    if (!previewConfig) return;
    
    const chart = createChartConfig(
      selectedType,
      previewConfig.title,
      previewConfig.data,
      axis,
      hue,
      styling
    );
    onAddChartAction(chart);
    resetForm();
  };

  const resetForm = () => {
    setAxis({});
    setHue(undefined);
    setStyling({
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      showDataLabels: false,
      opacity: 0.8,
      strokeWidth: 2,
      barRadius: 4,
    });
    setPreviewConfig(null);
  };

  const handleGenerate = () => {
    if (!canGenerate(axis, hue)) return;
    generatePreview(selectedType, axis, hue, styling);
  };

  const isReady = canGenerate(axis, hue);
  const isUsingSampleData = data.length === 0 && columns.length > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
      <div className="bg-white rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Chart Builder</h3>
            <p className="text-sm text-zinc-500">Create custom visualizations from your data</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-zinc-700 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            Select Chart Type
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2">
            {CHART_TYPES_INFO.map((info) => {
              const Icon = CHART_ICONS[info.type];
              const isSelected = selectedType === info.type;
              return (
                <button
                  key={info.type}
                  onClick={() => handleTypeChange(info.type)}
                  className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg shadow-violet-500/20"
                      : "border-zinc-200 bg-white hover:border-violet-300 hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50"
                  }`}
                  title={info.description}
                >
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                    isSelected
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-md"
                      : "bg-zinc-100 group-hover:bg-violet-100"
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-zinc-600 group-hover:text-violet-600"}`} />
                  </div>
                  <span className={`text-[10px] font-medium text-center ${isSelected ? "text-violet-700" : "text-zinc-600"}`}>
                    {info.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-50/50 hover:border-violet-300 hover:from-violet-50 hover:to-purple-50/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showConfig ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-md" : "bg-zinc-200"}`}>
                <Settings2 className={`w-5 h-5 ${showConfig ? "text-white" : "text-zinc-500"}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-zinc-900">Data Configuration</p>
                <p className="text-xs text-zinc-500">
                  {chartInfo?.needsY ? "X & Y axis columns" : chartInfo?.needsYKeys ? "X axis & multiple Y columns" : "Select columns"}
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showConfig ? "bg-violet-100 rotate-180" : "bg-zinc-100"}`}>
              <ChevronDown className={`w-4 h-4 ${showConfig ? "text-violet-600" : "text-zinc-500"}`} />
            </div>
          </button>
          
          {showConfig && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-violet-50/30 border border-zinc-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chartInfo?.needsX && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      <div className="w-5 h-5 rounded bg-violet-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">X</span>
                      </div>
                      {chartInfo.type === "histogram" ? "Column" : "X Axis"}
                    </label>
                    <select
                      value={axis.xKey || ""}
                      onChange={(e) => handleAxisChange("xKey", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
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

                {chartInfo?.needsY && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">Y</span>
                      </div>
                      Y Axis
                    </label>
                    <select
                      value={axis.yKey || ""}
                      onChange={(e) => handleAxisChange("yKey", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    >
                      <option value="">Select column</option>
                      {numericColumns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {chartInfo?.needsYKeys && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
                        <Layers className="w-3 h-3 text-white" />
                      </div>
                      Y Columns (Multiple)
                    </label>
                    <div className="p-3 rounded-xl bg-white border-2 border-zinc-200 max-h-32 overflow-y-auto">
                      <div className="space-y-1">
                        {numericColumns.map((c) => (
                          <label key={c.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={(Array.isArray(axis.yKeys) ? axis.yKeys : []).includes(c.name)}
                              onChange={(e) => {
                                const current = Array.isArray(axis.yKeys) ? axis.yKeys : [];
                                const newKeys = e.target.checked
                                  ? [...current, c.name]
                                  : current.filter((k) => k !== c.name);
                                handleAxisChange("yKeys", newKeys);
                              }}
                              className="w-4 h-4 rounded text-violet-600"
                            />
                            <span className="text-sm text-zinc-700">{c.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {chartInfo?.needsSize && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      <div className="w-5 h-5 rounded bg-pink-500 flex items-center justify-center">
                        <CircleDot className="w-3 h-3 text-white" />
                      </div>
                      Size Column
                    </label>
                    <select
                      value={axis.sizeKey || ""}
                      onChange={(e) => handleAxisChange("sizeKey", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    >
                      <option value="">Select column</option>
                      {numericColumns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {chartInfo?.supportsHue && (
                  <div className={`space-y-2 ${chartInfo?.needsY ? "" : "md:col-span-2"}`}>
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <Palette className="w-3 h-3 text-white" />
                      </div>
                      Group By (Hue)
                    </label>
                    <select
                      value={hue?.column || ""}
                      onChange={(e) => handleHueChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    >
                      <option value="">None</option>
                      {categoricalColumns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {chartInfo?.supportsBins && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center">
                        <BarChart2 className="w-3 h-3 text-white" />
                      </div>
                      Number of Bins: <span className="text-violet-600">{bins}</span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={50}
                      value={bins}
                      onChange={(e) => setBins(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowStyling(!showStyling)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-50/50 hover:border-violet-300 hover:from-violet-50 hover:to-purple-50/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showStyling ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-md" : "bg-zinc-200"}`}>
                <Palette className={`w-5 h-5 ${showStyling ? "text-white" : "text-zinc-500"}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-zinc-900">Styling Options</p>
                <p className="text-xs text-zinc-500">Customize colors, opacity, and more</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showStyling ? "bg-violet-100 rotate-180" : "bg-zinc-100"}`}>
              <ChevronDown className={`w-4 h-4 ${showStyling ? "text-violet-600" : "text-zinc-500"}`} />
            </div>
          </button>
          
          {showStyling && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-violet-50/30 border border-zinc-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: styling.color || "#7c3aed" }} />
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={styling.color || "#7c3aed"}
                      onChange={(e) => handleStylingChange("color", e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-zinc-200"
                    />
                    <input
                      type="text"
                      value={styling.color || "#7c3aed"}
                      onChange={(e) => handleStylingChange("color", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-zinc-200 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Opacity: <span className="text-violet-600">{Math.round((styling.opacity || 0.8) * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={styling.opacity || 0.8}
                    onChange={(e) => handleStylingChange("opacity", Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {(selectedType === "line" || selectedType === "overlay") && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Line Type</label>
                    <div className="flex gap-2">
                      {["solid", "dashed", "dotted"].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleStylingChange("lineType", type)}
                          className={`flex-1 px-3 py-2 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                            styling.lineType === type
                              ? "border-violet-500 bg-violet-50 text-violet-700"
                              : "border-zinc-200 hover:border-violet-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedType === "bar" || selectedType === "stacked") && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Bar Radius: <span className="text-violet-600">{styling.barRadius || 4}</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={styling.barRadius || 4}
                      onChange={(e) => handleStylingChange("barRadius", Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                )}

                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Display Options</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { key: "showGrid", label: "Grid" },
                      { key: "showLegend", label: "Legend" },
                      { key: "showTooltip", label: "Tooltip" },
                      { key: "showDataLabels", label: "Data Labels" },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          styling[key as keyof ChartStyling] !== false
                            ? "border-violet-300 bg-violet-50"
                            : "border-zinc-200 hover:border-violet-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={styling[key as keyof ChartStyling] !== false}
                          onChange={(e) => handleStylingChange(key as keyof ChartStyling, e.target.checked)}
                          className="w-4 h-4 rounded text-violet-600"
                        />
                        <span className={`text-sm ${styling[key as keyof ChartStyling] !== false ? "text-violet-700" : "text-zinc-600"}`}>
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Color Palette</label>
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(COLOR_PALETTES).map(([name, colors]) => (
                      <button
                        key={name}
                        onClick={() => handleStylingChange("color", colors[0])}
                        className="flex rounded-xl overflow-hidden border-2 border-zinc-200 hover:border-violet-400 transition-colors"
                        title={name.charAt(0).toUpperCase() + name.slice(1)}
                      >
                        {colors.map((c, i) => (
                          <div key={i} className="w-6 h-8" style={{ backgroundColor: c }} />
                        ))}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={!isReady}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-2 border-zinc-200 hover:border-violet-300 hover:bg-violet-50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Preview
          </Button>
          <Button
            onClick={resetForm}
            variant="ghost"
            className="h-12 px-4 rounded-xl hover:bg-zinc-100"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {previewConfig && (
        <div className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-600">Live Preview</span>
              </div>
              <Button
                onClick={handleAddChart}
                size="sm"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Dashboard
              </Button>
            </div>
            <div className="bg-gradient-to-br from-zinc-50 to-violet-50/30 rounded-2xl p-4 border border-zinc-200">
              <ChartRenderer config={previewConfig} height={320} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartBuilder;
