import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';

export const StudentAssessments: React.FC = () => {
  const { assessments } = useAcademicData();
  const [filterStatus, setFilterStatus] = useState<'all' | 'Upcoming' | 'Completed'>('all');

  const filtered = assessments.filter(
    (a) => filterStatus === 'all' || a.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Assessments & Examinations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional examination timetable, venue allocations, and maximum weightage
          </p>
        </div>

        {/* Filter */}
        <div className="flex rounded-lg bg-slate-200/80 p-1 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({assessments.length})
          </button>
          <button
            onClick={() => setFilterStatus('Upcoming')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterStatus === 'Upcoming'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterStatus === 'Completed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ass) => {
          const isUpcoming = ass.status === 'Upcoming';

          return (
            <div
              key={ass.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                isUpcoming
                  ? 'border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                  : 'border-slate-200 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                  {ass.subjectName}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                    isUpcoming
                      ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isUpcoming ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Upcoming</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </>
                  )}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ass.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ass.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {new Date(ass.date).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Max Marks: <strong className="text-slate-900">{ass.maxMarks}</strong>
                  </span>
                </div>

                {ass.time && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{ass.time}</span>
                  </div>
                )}

                {ass.venue && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{ass.venue}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Coordinated by: {ass.createdBy}</span>
                {isUpcoming && (
                  <span className="font-bold text-indigo-600">Hall Ticket Required</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
