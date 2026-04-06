"use client";

import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface ScatterChartProps {
  config: ChartConfig;
  height?: number;
}

export function ScatterChartComponent({ config, height = 300 }: ScatterChartProps) {
  const { data, axis, styling, hue } = config;
  
  if (!data.length || !axis.xKey || !axis.yKey) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const hasHue = hue?.column && data[0]?.[hue.column] !== undefined;
  const categories = hasHue 
    ? [...new Set(data.map((d) => String(d[hue.column!])))]
    : ["default"];

  const colors = hue?.palette || DEFAULT_COLORS;

  const renderScatters = () => {
    if (hasHue) {
      return categories.map((cat, i) => (
        <Scatter
          key={cat}
          name={cat}
          data={data.filter((d) => String(d[hue.column!]) === cat)}
          fill={colors[i % colors.length]}
          opacity={styling.opacity || 0.8}
        />
      ));
    }
    return (
      <Scatter
        name={axis.yKey}
        data={data}
        fill={styling.color || "#7c3aed"}
        opacity={styling.opacity || 0.8}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsScatterChart
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {styling.showGrid !== false && (
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        )}
        <XAxis
          dataKey={axis.xKey}
          name={axis.labelX || axis.xKey}
          type="number"
          tick={{ fontSize: 12, fill: "#71717a" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          angle={axis.rotateXLabel || 0}
          textAnchor={axis.rotateXLabel ? "end" : "middle"}
          height={axis.rotateXLabel ? 60 : 30}
        />
        <YAxis
          dataKey={axis.yKey}
          name={axis.labelY || axis.yKey}
          type="number"
          tick={{ fontSize: 12, fill: "#71717a" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          angle={axis.rotateYLabel || 0}
          label={axis.labelY ? { value: axis.labelY, angle: -90, position: "insideLeft" } : undefined}
        />
        <ZAxis range={[20, 200]} />
        {styling.showTooltip !== false && (
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            cursor={{ strokeDasharray: "3 3" }}
          />
        )}
        {styling.showLegend !== false && hasHue && (
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {renderScatters()}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
}
