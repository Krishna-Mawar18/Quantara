"use client";

import { ChartConfig } from "@/types/charts";

interface HeatmapChartProps {
  config: ChartConfig;
  height?: number;
}

export function HeatmapChartComponent({ config, height = 300 }: HeatmapChartProps) {
  const { data, axis, styling } = config;
  
  if (!data.length || !axis.xKey || !axis.yKey) {
    return (
      <div className="flex items-center justify-center h-[300px] text-zinc-400">
        No data available
      </div>
    );
  }

  const xValues = [...new Set(data.map((d) => String(d[axis.xKey!])))];
  const yValues = [...new Set(data.map((d) => String(d[axis.yKey!])))];

  const getColor = (value: number) => {
    const max = Math.max(...data.map((d) => Number(d.value || 0)));
    const intensity = max > 0 ? (value / max) : 0;
    const colors = [
      "#f3f4f6",
      "#ddd6fe",
      "#a78bfa",
      "#7c3aed",
      "#5b21b6",
    ];
    const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[index];
  };

  return (
    <div className="overflow-auto" style={{ height }}>
      <div className="min-w-full">
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          {xValues.map((x) => (
            <div
              key={x}
              className="flex-1 px-1 py-2 text-center text-xs font-medium text-zinc-600 border-l border-zinc-200"
            >
              <span className="block truncate">{x}</span>
            </div>
          ))}
        </div>
        {yValues.map((y) => (
          <div key={y} className="flex border-b border-zinc-200">
            <div className="w-24 flex-shrink-0 px-2 py-3 text-xs font-medium text-zinc-600 truncate border-r border-zinc-200">
              {y}
            </div>
            {xValues.map((x) => {
              const cell = data.find(
                (d) => String(d[axis.xKey!]) === x && String(d[axis.yKey!]) === y
              );
              const value = cell ? Number(cell.value || cell.count || 0) : 0;
              return (
                <div
                  key={`${x}-${y}`}
                  className="flex-1 aspect-square flex items-center justify-center border-l border-zinc-200 transition-colors hover:ring-2 hover:ring-violet-400 cursor-pointer"
                  style={{ backgroundColor: getColor(value) }}
                  title={`${x} x ${y}: ${value}`}
                >
                  {styling.showDataLabels && (
                    <span className="text-[10px] font-mono text-zinc-700">
                      {value.toFixed(0)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
