"use client";

import { ChartConfig } from "@/types/charts";
import { BarChartComponent } from "./bar-chart-component";
import { LineChartComponent } from "./line-chart-component";
import { AreaChartComponent } from "./area-chart-component";
import { ScatterChartComponent } from "./scatter-chart-component";
import { PieChartComponent, DonutChartComponent } from "./pie-chart-component";
import { RadarChartComponent } from "./radar-chart-component";
import { HistogramChartComponent } from "./histogram-chart-component";
import { HeatmapChartComponent } from "./heatmap-chart-component";
import { BubbleChartComponent } from "./bubble-chart-component";
import { BoxPlotChartComponent } from "./boxplot-chart-component";
import { StackedBarChartComponent } from "./stacked-bar-chart-component";
import { OverlayLineChartComponent } from "./overlay-line-chart-component";

interface ChartRendererProps {
  config: ChartConfig;
  height?: number;
}

export function ChartRenderer({ config, height }: ChartRendererProps) {
  const { type } = config;

  switch (type) {
    case "bar":
      return <BarChartComponent config={config} height={height} />;
    case "line":
      return <LineChartComponent config={config} height={height} />;
    case "area":
      return <AreaChartComponent config={config} height={height} />;
    case "scatter":
      return <ScatterChartComponent config={config} height={height} />;
    case "pie":
      return <PieChartComponent config={config} height={height} />;
    case "donut":
      return <DonutChartComponent config={config} height={height} />;
    case "radar":
      return <RadarChartComponent config={config} height={height} />;
    case "histogram":
      return <HistogramChartComponent config={config} height={height} />;
    case "heatmap":
      return <HeatmapChartComponent config={config} height={height} />;
    case "bubble":
      return <BubbleChartComponent config={config} height={height} />;
    case "boxplot":
      return <BoxPlotChartComponent config={config} height={height} />;
    case "stacked":
      return <StackedBarChartComponent config={config} height={height} />;
    case "overlay":
      return <OverlayLineChartComponent config={config} height={height} />;
    default:
      return (
        <div className="flex items-center justify-center h-[300px] text-zinc-400">
          Unsupported chart type: {type}
        </div>
      );
  }
}

export default ChartRenderer;
