"use client";

import { useState } from "react";
import { ChartConfig, CHART_TYPES_INFO } from "@/types/charts";
import { ChartRenderer } from "./chart-renderer";
import {
  X,
  Copy,
  Edit3,
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
  Maximize2,
  Minimize2,
  MoreHorizontal,
} from "lucide-react";

const CHART_ICONS: Record<string, React.ElementType> = {
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

interface ChartCardProps {
  chart: ChartConfig;
  onDeleteAction: () => void;
  onDuplicateAction: () => void;
  onEdit?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export function ChartCard({
  chart,
  onDeleteAction,
  onDuplicateAction,
  onEdit,
  onExpand,
  isExpanded,
}: ChartCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const chartInfo = CHART_TYPES_INFO.find((c) => c.type === chart.type);
  const Icon = CHART_ICONS[chart.type] || BarChart3;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50" : ""
      }`}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[2px]">
        <div className="w-full h-full rounded-3xl bg-white" />
      </div>
      
      <div className="relative bg-white rounded-[22px] overflow-hidden">
        <div className="p-4 border-b border-zinc-100/50 flex items-center justify-between bg-gradient-to-r from-zinc-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">{chart.title}</h3>
              <p className="text-xs text-zinc-500">{chartInfo?.label || chart.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onExpand && (
              <button
                onClick={onExpand}
                className="p-2 rounded-xl hover:bg-violet-100 text-zinc-500 hover:text-violet-600 transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-xl transition-colors ${
                  showMenu
                    ? "bg-violet-100 text-violet-600"
                    : "hover:bg-zinc-100 text-zinc-500"
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-zinc-200 shadow-xl py-2 z-20">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-3 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Chart
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDuplicateAction();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-3 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <hr className="my-2 border-zinc-100" />
                  <button
                    onClick={() => {
                      onDeleteAction();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-zinc-50/50 to-violet-50/20">
          <ChartRenderer config={chart} height={isExpanded ? 450 : 300} />
        </div>

        <div className="px-4 pb-4 pt-2 flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{chart.data.length} data points</span>
          </div>
          {chart.hue && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-300">·</span>
              <span>Grouped by <span className="text-violet-500 font-medium">{chart.hue.column}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartCard;
