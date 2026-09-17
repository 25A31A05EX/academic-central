import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'positive' | 'neutral' | 'warning' | 'primary';
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'primary',
  color = 'indigo',
  onClick,
}) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${colorStyles[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {badgeText && (
            <span
              className={`px-2 py-0.5 rounded-full font-semibold text-[11px] border ml-auto shrink-0 ${badgeStyles[badgeType]}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
