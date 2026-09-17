import React from 'react';

interface DistributionItem {
  range: string;
  count: number;
  percentage: number;
  color: string;
  grade: string;
}

export const PerformanceDistributionChart: React.FC<{
  distributions?: DistributionItem[];
}> = ({
  distributions = [
    { range: '90% – 100%', count: 48, percentage: 18, color: 'bg-emerald-500', grade: 'A+ (Distinction)' },
    { range: '80% – 89%', count: 112, percentage: 42, color: 'bg-indigo-500', grade: 'A (First Class)' },
    { range: '70% – 79%', count: 76, percentage: 28, color: 'bg-blue-500', grade: 'B (Second Class)' },
    { range: '60% – 69%', count: 24, percentage: 9, color: 'bg-amber-500', grade: 'C (Pass Class)' },
    { range: '< 60%', count: 8, percentage: 3, color: 'bg-rose-500', grade: 'F (Needs Remedial)' },
  ],
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Student Performance Distribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">Aggregated grade brackets across active semester cohort</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
          268 Students Evaluated
        </span>
      </div>

      <div className="mt-5 space-y-3.5">
        {distributions.map((item) => (
          <div key={item.range} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">
                {item.range}{' '}
                <span className="text-slate-400 font-normal text-[11px]">({item.grade})</span>
              </span>
              <span className="font-bold text-slate-700">
                {item.count} students ({item.percentage}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-700`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CompletionDonutCard: React.FC<{
  completedPercentage?: number;
  totalSubmissions?: number;
  pendingReviews?: number;
}> = ({
  completedPercentage = 84,
  totalSubmissions = 342,
  pendingReviews = 28,
}) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (completedPercentage / 100) * circumference;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Assignment Completion</h3>
        <p className="text-xs text-slate-500 mt-0.5">Overall coursework delivery and submission rate</p>
      </div>

      <div className="flex items-center justify-around py-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f1f5f9"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#4f46e5"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-slate-900">{completedPercentage}%</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase">On Track</span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <p className="text-slate-500">Completed Submissions</p>
            <p className="text-lg font-bold text-slate-900">{totalSubmissions}</p>
          </div>
          <div>
            <p className="text-slate-500">Pending Teacher Review</p>
            <p className="text-lg font-bold text-amber-600">{pendingReviews}</p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Target: 80% submission</span>
        <span className="text-emerald-600 font-semibold">+4% above threshold</span>
      </div>
    </div>
  );
};

export const AssignmentCompletionDonutChart = CompletionDonutCard;

export const ReportCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <PerformanceDistributionChart />
      </div>
      <div>
        <CompletionDonutCard />
      </div>
    </div>
  );
};

