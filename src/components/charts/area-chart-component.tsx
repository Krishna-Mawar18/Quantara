"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface AreaChartProps {
  config: ChartConfig;
  height?: number;
}

export function AreaChartComponent({ config, height = 300 }: AreaChartProps) {
  const { data, axis, styling, hue } = config;
  
  if (!data.length || !axis.xKey || !axis.yKey) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const hasHue = hue?.column && data[0]?.[hue.column] !== undefined;
  const series = hasHue 
    ? [...new Set(data.map((d) => String(d[hue.column!])))]
    : [axis.yKey!];

  const colors = hue?.palette || DEFAULT_COLORS;
  const yKey = axis.yKey!;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          {hasHue ? (
            series.map((s, i) => (
              <linearGradient key={s} id={`gradient-${s.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={styling.opacity || 0.6} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.1} />
              </linearGradient>
            ))
          ) : (
            <linearGradient id="gradient-default" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={styling.color || "#7c3aed"} stopOpacity={styling.opacity || 0.6} />
              <stop offset="95%" stopColor={styling.color || "#7c3aed"} stopOpacity={0.1} />
            </linearGradient>
          )}
        </defs>
        {styling.showGrid !== false && (
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        )}
        <XAxis
          dataKey={axis.xKey}
          tick={{ fontSize: 12, fill: "#71717a" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          angle={axis.rotateXLabel || 0}
          textAnchor={axis.rotateXLabel ? "end" : "middle"}
          height={axis.rotateXLabel ? 60 : 30}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#71717a" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          angle={axis.rotateYLabel || 0}
          label={axis.labelY ? { value: axis.labelY, angle: -90, position: "insideLeft" } : undefined}
        />
        {styling.showTooltip !== false && (
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
        )}
        {styling.showLegend !== false && hasHue && (
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {hasHue
          ? series.map((s, i) => (
              <Area
                key={s}
                type={styling.areaType === "step" ? "step" : "monotone"}
                dataKey={s}
                stroke={colors[i % colors.length]}
                strokeWidth={styling.strokeWidth || 2}
                fill={`url(#gradient-${s.replace(/\s+/g, "-")})`}
              />
            ))
          : [
              <Area
                key={yKey}
                type={styling.areaType === "step" ? "step" : "monotone"}
                dataKey={yKey}
                stroke={styling.color || "#7c3aed"}
                strokeWidth={styling.strokeWidth || 2}
                fill="url(#gradient-default)"
              />,
            ]}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
