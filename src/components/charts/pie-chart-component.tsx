"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface PieChartProps {
  config: ChartConfig;
  height?: number;
}

export function PieChartComponent({ config, height = 300 }: PieChartProps) {
  const { data, styling } = config;
  
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const colors = styling.color ? [styling.color] : DEFAULT_COLORS;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={styling.showDataLabels !== false ? ({ name, percent }) => 
            `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`
          : false}
          labelLine={styling.showDataLabels !== false}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              opacity={styling.opacity || 0.9}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
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
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export function DonutChartComponent({ config, height = 300 }: PieChartProps) {
  const { data, styling } = config;
  
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const colors = styling.color ? [styling.color] : DEFAULT_COLORS;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={styling.showDataLabels !== false ? ({ name, percent }) => 
            `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`
          : false}
          labelLine={styling.showDataLabels !== false}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              opacity={styling.opacity || 0.9}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
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
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
