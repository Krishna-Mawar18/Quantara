"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface BarChartProps {
  config: ChartConfig;
  height?: number;
}

export function BarChartComponent({ config, height = 300 }: BarChartProps) {
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

  const renderBars = () => {
    if (hasHue) {
      return series.map((s, i) => (
        <Bar
          key={s}
          dataKey={s}
          fill={colors[i % colors.length]}
          radius={[styling.barRadius || 4, styling.barRadius || 4, 0, 0]}
          opacity={styling.opacity || 0.9}
        />
      ));
    }
    return (
      <Bar
        dataKey={axis.yKey}
        fill={styling.color || "#7c3aed"}
        radius={[styling.barRadius || 4, styling.barRadius || 4, 0, 0]}
        opacity={styling.opacity || 0.9}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
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
            cursor={{ fill: "rgba(124, 58, 237, 0.1)" }}
          />
        )}
        {styling.showLegend !== false && hasHue && (
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {renderBars()}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
