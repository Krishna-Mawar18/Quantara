"use client";

import { ChartConfig, DEFAULT_COLORS } from "@/types/charts";

interface BoxPlotChartProps {
  config: ChartConfig;
  height?: number;
}

interface BoxPlotData {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

export function BoxPlotChartComponent({ config, height = 300 }: BoxPlotChartProps) {
  const { data, axis, styling } = config;
  
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const boxData = data as unknown as BoxPlotData[];
  const colors = styling.color ? [styling.color] : DEFAULT_COLORS;

  const minVal = Math.min(...boxData.map((d) => d.min));
  const maxVal = Math.max(...boxData.map((d) => d.max));
  const padding = (maxVal - minVal) * 0.1;
  const chartHeight = 250;
  const chartWidth = 80;

  const scaleY = (value: number) => {
    return ((value + padding - minVal) / ((maxVal - minVal) + 2 * padding)) * chartHeight + 25;
  };

  const renderBoxPlots = () => {
    return boxData.map((item, index) => {
      const color = colors[index % colors.length];
      const x = index * chartWidth + 50;

      return (
        <g key={item.category}>
          <line
            x1={x}
            y1={scaleY(item.max)}
            x2={x}
            y2={scaleY(item.q3)}
            stroke={color}
            strokeWidth={2}
          />
          <line
            x1={x - 10}
            y1={scaleY(item.max)}
            x2={x + 10}
            y2={scaleY(item.max)}
            stroke={color}
            strokeWidth={2}
          />
          <rect
            x={x - 20}
            y={scaleY(item.q3)}
            width={40}
            height={Math.max(1, scaleY(item.q1) - scaleY(item.q3))}
            fill={color}
            fillOpacity={styling.opacity || 0.7}
            stroke={color}
            strokeWidth={2}
            rx={4}
          />
          <line
            x1={x - 20}
            y1={scaleY(item.median)}
            x2={x + 20}
            y2={scaleY(item.median)}
            stroke="#fff"
            strokeWidth={2}
          />
          <line
            x1={x}
            y1={scaleY(item.q1)}
            x2={x}
            y2={scaleY(item.min)}
            stroke={color}
            strokeWidth={2}
          />
          <line
            x1={x - 10}
            y1={scaleY(item.min)}
            x2={x + 10}
            y2={scaleY(item.min)}
            stroke={color}
            strokeWidth={2}
          />
        </g>
      );
    });
  };

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
        <g>
          {boxData.map((item, index) => (
            <text
              key={`label-${item.category}`}
              x={index * chartWidth + 50}
              y={280}
              textAnchor="middle"
              fontSize={12}
              fill="#71717a"
            >
              {item.category.length > 10 ? item.category.slice(0, 10) + "..." : item.category}
            </text>
          ))}
        </g>
        {renderBoxPlots()}
      </svg>
      {styling.showTooltip !== false && (
        <div className="absolute top-2 right-2 bg-white p-3 rounded-lg border border-zinc-200 shadow-lg text-xs max-w-[200px]">
          <p className="font-semibold mb-2">Statistics</p>
          {boxData.slice(0, 3).map((item) => (
            <div key={item.category} className="mb-2 last:mb-0">
              <p className="font-medium">{item.category}</p>
              <div className="grid grid-cols-2 gap-x-2 text-zinc-500">
                <span>Min:</span><span className="text-right">{item.min.toFixed(2)}</span>
                <span>Q1:</span><span className="text-right">{item.q1.toFixed(2)}</span>
                <span>Median:</span><span className="text-right">{item.median.toFixed(2)}</span>
                <span>Q3:</span><span className="text-right">{item.q3.toFixed(2)}</span>
                <span>Max:</span><span className="text-right">{item.max.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
