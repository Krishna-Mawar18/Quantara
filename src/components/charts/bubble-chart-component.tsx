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

interface BubbleChartProps {
  config: ChartConfig;
  height?: number;
}

export function BubbleChartComponent({ config, height = 300 }: BubbleChartProps) {
  const { data, axis, styling, hue } = config;
  
  if (!data.length || !axis.xKey || !axis.yKey || !axis.sizeKey) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const processedData = data.map((d) => ({
    ...d,
    [axis.xKey!]: d[axis.xKey!],
    [axis.yKey!]: d[axis.yKey!],
    size: Math.abs(Number(d[axis.sizeKey!]) || 10),
  }));

  const hasHue = hue?.column && data[0]?.[hue.column] !== undefined;
  const categories = hasHue 
    ? [...new Set(data.map((d) => String(d[hue.column!])))]
    : ["default"];

  const colors = hue?.palette || DEFAULT_COLORS;

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
        <ZAxis
          dataKey="size"
          range={[50, 400]}
          domain={[0, "auto"]}
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
        {hasHue ? (
          categories.map((cat, i) => (
            <Scatter
              key={cat}
              name={cat}
              data={processedData.filter((d) => String(d[hue.column!]) === cat)}
              fill={colors[i % colors.length]}
              opacity={styling.opacity || 0.8}
            />
          ))
        ) : (
          <Scatter
            name={axis.yKey}
            data={processedData}
            fill={styling.color || "#7c3aed"}
            opacity={styling.opacity || 0.8}
          />
        )}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
}
