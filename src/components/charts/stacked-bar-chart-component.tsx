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
} from "recharts";
import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface StackedBarChartProps {
  config: ChartConfig;
  height?: number;
}

export function StackedBarChartComponent({ config, height = 300 }: StackedBarChartProps) {
  const { data, axis, styling } = config;
  
  const yKeys = Array.isArray(axis.yKeys) ? axis.yKeys : [];
  
  if (!data.length || !axis.xKey || yKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const colors = styling.color ? [styling.color] : DEFAULT_COLORS;

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
          />
        )}
        {styling.showLegend !== false && (
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="stack"
            fill={colors[index % colors.length]}
            opacity={styling.opacity || 0.9}
            radius={index === yKeys.length - 1 
              ? [styling.barRadius || 4, styling.barRadius || 4, 0, 0] 
              : [0, 0, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
