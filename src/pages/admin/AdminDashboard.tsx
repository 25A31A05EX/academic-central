import React from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { useAcademicData } from '../../hooks/useAcademicData';
import { ReportCharts } from '../../components/charts/ReportCharts';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { students, teachers, subjects, assignments, auditLogs, submissions } = useAcademicData();

  const totalEvaluated = submissions.filter((s) => s.status === 'Evaluated').length;

  return (
    <div className="space-y-6">
      {/* Admin Hero Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Institutional Central Registrar &bull; Full Access Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Administration Central
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
              Real-time oversight over faculty curricula, student continuous evaluations, department
              courses, and immutable audit logs.
            </p>

            {/* Quick Navigation Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                id="btn-admin-quick-teachers"
                onClick={() => onNavigateTab('teachers')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-purple-200" />
                <span>Faculty Directory</span>
              </button>
              <button
                id="btn-admin-quick-students"
                onClick={() => onNavigateTab('students')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-200" />
                <span>Students</span>
              </button>
              <button
                id="btn-admin-quick-subjects"
                onClick={() => onNavigateTab('subjects')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-200" />
                <span>Subjects</span>
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg">
              AC
            </div>
            <div className="text-xs">
              <p className="font-black text-white text-sm">Autonomous College Portal</p>
              <p className="text-purple-200">System Version 2026.4</p>
              <p className="text-emerald-300 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> System Healthy & Synchronized
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Enrolled active scholars"
          badgeText="Active Roster"
          badgeType="positive"
          color="emerald"
          icon={GraduationCap}
          onClick={() => onNavigateTab('students')}
        />
        <StatCard
          id="stat-card-teachers"
          title="Total Teachers"
          value={teachers.length}
          subtitle="Accredited department faculty"
          badgeText="Verified Faculty"
          badgeType="neutral"
          color="indigo"
          icon={Users}
          onClick={() => onNavigateTab('teachers')}
        />
        <StatCard
          title="Total Subjects"
          value={subjects.length}
          subtitle="Core & elective courses"
          badgeText="Semesters 1-8"
          badgeType="neutral"
          color="blue"
          icon={BookOpen}
          onClick={() => onNavigateTab('subjects')}
        />
        <StatCard
          title="Total Coursework"
          value={assignments.length}
          subtitle="Assignments & tasks posted"
          badgeText={`${totalEvaluated} Graded`}
          badgeType="primary"
          color="amber"
          icon={FileCheck2}
          onClick={() => onNavigateTab('assignments')}
        />
      </div>

      {/* Analytics Visualization Module */}
      <ReportCharts />

      {/* Recent System Activity & Audit Trail Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Live College Activity & Audit Stream
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('audit-logs')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Complete Audit Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    log.role === 'admin'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : log.role === 'teacher'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {log.role}
                </span>
                <span className="font-bold text-slate-900">{log.action}</span>
                <span className="text-slate-500 hidden md:inline">&bull;</span>
                <span className="text-slate-600 truncate max-w-md">{log.details}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
                <span>By {log.performedBy}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
