import React, { useState } from 'react';

interface BarData {
  label: string;
  value: number; // 0 - 100
  code?: string;
  totalMarks?: string;
  color?: string;
}

interface PerformanceBarChartProps {
  data: BarData[];
  title?: string;
  subtitle?: string;
  benchmark?: number;
}

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({
  data,
  title = 'Subject Performance Comparison',
  subtitle = 'Normalized score percentage across semester assessments',
  benchmark = 75,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" />
            <span>Subject Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-emerald-500 inline-block border-t border-dashed" />
            <span>College Target ({benchmark}%)</span>
          </div>
        </div>
      </div>

      {/* Responsive Bar Visualizer */}
      <div className="mt-6">
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 relative pt-6 pb-2">
          {/* Background grid lines */}
          <div className="absolute inset-x-0 top-6 border-b border-slate-100 text-[10px] text-slate-400 -mt-2">
            100%
          </div>
          <div className="absolute inset-x-0 top-1/2 border-b border-slate-100 text-[10px] text-slate-400 -mt-2">
            50%
          </div>
          <div
            className="absolute inset-x-0 border-b border-dashed border-emerald-400 z-10 pointer-events-none"
            style={{ bottom: `${(benchmark / 100) * 85 + 5}%` }}
          />

          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const barHeight = Math.max(8, (item.value / 100) * 85);
            const isAboveTarget = item.value >= benchmark;

            return (
              <div
                key={item.label + idx}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap animate-in fade-in duration-150">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-[11px] text-indigo-200">
                      Score: {item.value}% {item.totalMarks ? `(${item.totalMarks})` : ''}
                    </p>
                  </div>
                )}

                {/* Score value indicator atop bar */}
                <span
                  className={`text-[11px] font-bold mb-1 transition-colors ${
                    isAboveTarget ? 'text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  {item.value}%
                </span>

                {/* Bar */}
                <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                      isAboveTarget
                        ? 'bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400'
                        : 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>

                {/* Label */}
                <div className="mt-2 text-center w-full">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={item.label}>
                    {item.code || item.label.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
