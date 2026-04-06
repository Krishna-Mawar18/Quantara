"use client";

import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface RadarChartProps {
  config: ChartConfig;
  height?: number;
}

export function RadarChartComponent({ config, height = 300 }: RadarChartProps) {
  const { data, axis, styling, hue } = config;
  
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const hasHue = hue?.column && data[0]?.[hue.column] !== undefined;
  const series = hasHue 
    ? [...new Set(data.map((d) => String(d[hue.column!])))]
    : Object.keys(data[0] || {}).filter((k) => k !== "subject");

  const colors = hue?.palette || DEFAULT_COLORS;

  const getKeys = () => {
    if (series.length === 1 && !hasHue) {
      return [axis.yKey!];
    }
    return series;
  };

  const renderRadars = () => {
    const keys = getKeys();
    if (hasHue) {
      return keys.map((k, i) => (
        <Radar
          key={k}
          name={k}
          dataKey={k}
          stroke={colors[i % colors.length]}
          fill={colors[i % colors.length]}
          fillOpacity={styling.opacity || 0.4}
        />
      ));
    }
    return keys.map((k, i) => (
      <Radar
        key={k}
        name={k}
        dataKey={k}
        stroke={colors[i % colors.length]}
        fill={colors[i % colors.length]}
        fillOpacity={styling.opacity || 0.4}
      />
    ));
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart cx="50%" cy="50%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: "#71717a" }}
        />
        <PolarRadiusAxis
          tick={{ fontSize: 10, fill: "#71717a" }}
          angle={90}
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
        {renderRadars()}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
