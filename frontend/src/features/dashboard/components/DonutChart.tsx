'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartSegment {
  label: string;
  value: number;
  color: string;
  hoverColor: string;
}

interface DonutChartProps {
  segments: ChartSegment[];
  title: string;
  className?: string;
}

export function DonutChart({ segments, title, className }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  
    if (total === 0) {
      return (
        <div className={cn("flex flex-col h-full", className)}>
          <div className="pb-2">
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-slate-400">No lead data available</p>
          </div>
        </div>
      );
    }

  // SVG donut chart parameters
  const size = 180;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate stroke segments
  let cumulativePercent = 0;
  const arcs = segments.map((segment) => {
    const percent = segment.value / total;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * cumulativePercent;
    cumulativePercent += percent;
    return { ...segment, strokeDasharray, strokeDashoffset, percent };
  });

  const hoveredSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="pb-4">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      </div>
      <div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-slate-800"
                strokeWidth={strokeWidth}
              />
              {/* Data segments */}
              {arcs.map((arc, i) => (
                <circle
                  key={arc.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={hoveredIndex === i ? arc.hoverColor : arc.color}
                  strokeWidth={hoveredIndex === i ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-100 tabular-nums">
                {hoveredSegment ? hoveredSegment.value : total}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {hoveredSegment ? hoveredSegment.label : 'Total'}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3 w-full">
            {segments.map((segment, i) => {
              const percent = total > 0 ? ((segment.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={segment.label}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-xl transition-all cursor-pointer border border-transparent",
                    hoveredIndex === i
                      ? "bg-slate-800/50 border-slate-700 scale-[1.02]"
                      : "hover:bg-slate-800/30"
                  )}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: segment.color, boxShadow: `0 0 10px ${segment.color}80` }}
                    />
                    <span className="text-sm font-medium text-slate-300">{segment.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-100 tabular-nums">{segment.value}</span>
                    <span className="text-xs text-slate-500 tabular-nums w-12 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
