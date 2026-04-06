"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface LineChartProps {
  config: ChartConfig;
  height?: number;
}

export function LineChartComponent({ config, height = 300 }: LineChartProps) {
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

  const getLineType = () => {
    switch (styling.lineType) {
      case "dashed":
        return "5 5";
      case "dotted":
        return "2 2";
      default:
        return undefined;
    }
  };

  const renderLines = () => {
    if (hasHue) {
      return series.map((s, i) => (
        <Line
          key={s}
          type={styling.areaType === "step" ? "step" : "monotone"}
          dataKey={s}
          stroke={colors[i % colors.length]}
          strokeWidth={styling.strokeWidth || 2}
          strokeDasharray={getLineType()}
          dot={{ r: 4, fill: colors[i % colors.length] }}
          activeDot={{ r: 6 }}
          opacity={styling.opacity || 0.9}
        />
      ));
    }
    return (
      <Line
        type={styling.areaType === "step" ? "step" : "monotone"}
        dataKey={axis.yKey}
        stroke={styling.color || "#7c3aed"}
        strokeWidth={styling.strokeWidth || 2}
        strokeDasharray={getLineType()}
        dot={{ r: 4, fill: styling.color || "#7c3aed" }}
        activeDot={{ r: 6 }}
        opacity={styling.opacity || 0.9}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
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
        {styling.showLegend !== false && hasHue && (
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {renderLines()}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
