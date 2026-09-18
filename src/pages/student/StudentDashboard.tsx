import React, { useState } from 'react';
import {
  Award,
  FileCheck2,
  CalendarDays,
  BookOpen,
  ArrowRight,
  Bell,
  Clock,
  Sparkles,
  BookText,
  User,
  CheckCircle2,
  History,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { useAcademicData } from '../../hooks/useAcademicData';
import { PerformanceBarChart } from '../../components/charts/BarChart';
import { SemesterResult } from '../../types';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenPdf: (doc: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onOpenPdf,
}) => {
  const { students, subjects, assignments, marks, assessments, labMaterials, semesterResults } = useAcademicData();

  // Find the primary demo student
  const currentStudent = students[0] || {
    id: 'stud-1',
    name: 'Rahul Sharma',
    rollNumber: '23CS101',
    branch: 'Computer Science',
    year: '2nd Year',
    section: 'A',
    semester: 4,
    cgpa: 8.75,
  };

  // Get marks for this student (Current Semester)
  const studentMarks = marks.filter((m) => m.studentId === currentStudent.id || m.studentId === 'stud-1');

  // Calculate overall percentage for current semester
  let totalObtained = 0;
  let totalMax = 0;
  studentMarks.forEach((m) => {
    totalObtained += m.mid1 + m.mid2 + m.classTest + m.assignment + m.labInternal;
    totalMax += m.mid1Max + m.mid2Max + m.classTestMax + m.assignmentMax + m.labInternalMax;
  });
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 82;

  // Previous Semester Results from database
  const studentSemesterResults = semesterResults
    .filter((r) => r.studentId === currentStudent.id || r.studentId === 'stud-1')
    .sort((a, b) => a.semester - b.semester);

  // Expanded semester state for preview accordion
  const [expandedSemester, setExpandedSemester] = useState<number>(
    studentSemesterResults.length > 0 ? studentSemesterResults[studentSemesterResults.length - 1].semester : 1
  );

  // Compute overall CGPA
  let totalRegCredits = 0;
  let totalEarnedCredits = 0;
  let totalWeightedSgpa = 0;
  studentSemesterResults.forEach((r) => {
    const cr = r.creditsRegistered || 20;
    totalRegCredits += cr;
    totalEarnedCredits += r.creditsEarned || cr;
    totalWeightedSgpa += (r.sgpa || 0) * cr;
  });

  const cumulativeCgpa =
    totalRegCredits > 0
      ? Number((totalWeightedSgpa / totalRegCredits).toFixed(2))
      : currentStudent.cgpa || 8.75;

  // Chart data for current semester
  const chartData = studentMarks.map((m) => {
    const obtained = m.mid1 + m.mid2 + m.classTest + m.assignment + m.labInternal;
    const max = m.mid1Max + m.mid2Max + m.classTestMax + m.assignmentMax + m.labInternalMax;
    const pct = max > 0 ? Math.round((obtained / max) * 100) : 75;
    return {
      label: m.subjectName,
      code: m.subjectCode,
      value: pct,
      totalMarks: `${obtained}/${max}`,
    };
  });

  const pendingAssignmentsCount = assignments.filter((a) => a.status === 'Published').length;
  const upcomingAssessmentsCount = assessments.filter((a) => a.status === 'Upcoming').length;

  const getGradeBadgeClass = (grade: string) => {
    switch (grade) {
      case 'O':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'A+':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'A':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'B+':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'B':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'F':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const recentUpdates = [
    {
      id: 'up-1',
      title: 'Semester 3 official grade card published by Examination Branch',
      time: '1 hour ago',
      category: 'Semester Results',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      action: () => onNavigateTab('academic-history'),
    },
    {
      id: 'up-2',
      title: 'New assignment uploaded for Data Structures',
      time: '2 hours ago',
      category: 'Assignment',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      action: () => onNavigateTab('assignments'),
    },
    {
      id: 'up-3',
      title: 'Internal marks updated for DBMS',
      time: 'Yesterday',
      category: 'Marks',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => onNavigateTab('internal-marks'),
    },
    {
      id: 'up-4',
      title: 'Mid examination schedule updated',
      time: '3 days ago',
      category: 'Assessments',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      action: () => onNavigateTab('assessments'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner & Profile Info Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Current Term: Semester IV &bull; AY 2025-2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentStudent.name.split(' ')[0]}!
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
              Access your current semester coursework alongside official previous semester grade transcripts.
            </p>
          </div>

          {/* Student Profile Overview Card with CGPA */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex flex-wrap sm:flex-nowrap items-center gap-4 min-w-max">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {currentStudent.name.charAt(0)}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>{currentStudent.name}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/40 text-emerald-200 text-[10px]">
                  Roll: {currentStudent.rollNumber}
                </span>
              </div>
              <p className="text-indigo-200">
                <span className="font-medium text-white">Branch:</span> {currentStudent.branch} ({currentStudent.year})
              </p>
              <div className="flex items-center gap-3 pt-0.5">
                <span className="text-indigo-200">
                  CGPA: <strong className="text-emerald-300 text-xs">{cumulativeCgpa.toFixed(2)}</strong> / 10.0
                </span>
                <span className="text-indigo-200">&bull;</span>
                <span className="text-indigo-200">
                  Semesters: <strong className="text-white">{studentSemesterResults.length}</strong> Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Semester Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentage"
          value={`${overallPercentage}%`}
          subtitle="Current semester internals"
          badgeText="First Class Dist."
          badgeType="positive"
          color="emerald"
          icon={Award}
          onClick={() => onNavigateTab('marks')}
        />
        <StatCard
          title="Cumulative CGPA"
          value={cumulativeCgpa.toFixed(2)}
          subtitle="All previous semesters"
          badgeText={`${totalEarnedCredits} Credits Earned`}
          badgeType="primary"
          color="purple"
          icon={History}
          onClick={() => onNavigateTab('academic-history')}
        />
        <StatCard
          title="Pending Assignments"
          value={pendingAssignmentsCount}
          subtitle="Coursework submissions due"
          badgeText="Action Needed"
          badgeType="warning"
          color="indigo"
          icon={FileCheck2}
          onClick={() => onNavigateTab('assignments')}
        />
        <StatCard
          title="Upcoming Assessments"
          value={upcomingAssessmentsCount}
          subtitle="Mid exams & class tests"
          badgeText="Next: Oct 15"
          badgeType="neutral"
          color="amber"
          icon={CalendarDays}
          onClick={() => onNavigateTab('assessments')}
        />
      </div>

      {/* ============================================================ */}
      {/* ACADEMIC HISTORY & PREVIOUS SEMESTER RESULTS SECTION */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Academic History & Previous Semester Results
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official verified university transcripts. View subject credits, marks, grades, SGPA, and cumulative CGPA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500">Overall CGPA:</span>
              <span className="font-black text-indigo-700 text-sm">{cumulativeCgpa.toFixed(2)}</span>
            </div>

            <button
              id="view-full-academic-history-btn"
              onClick={() => onNavigateTab('academic-history')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <span>View Full History</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Semester SGPA Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {studentSemesterResults.map((r) => {
            const isExpanded = expandedSemester === r.semester;
            return (
              <div
                key={`dash-sem-btn-${r.semester}`}
                id={`dash-sem-card-${r.semester}`}
                onClick={() => setExpandedSemester(r.semester)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isExpanded
                    ? 'border-indigo-500 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Semester {r.semester}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                    {r.resultStatus}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{r.sgpa.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-slate-400">SGPA</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{r.creditsEarned} Credits</span>
                  <span className="text-indigo-600 font-semibold">{isExpanded ? 'Active' : 'View'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Semester Detail Box */}
        {studentSemesterResults.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
            {(() => {
              const activeRes =
                studentSemesterResults.find((r) => r.semester === expandedSemester) ||
                studentSemesterResults[0];
              if (!activeRes) return null;

              return (
                <div>
                  <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                        S{activeRes.semester}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">
                          Semester {activeRes.semester} Subject Grades & Marks
                        </h4>
                        <span className="text-[11px] text-slate-300">
                          Academic Session: {activeRes.academicYear} &bull; Published: {activeRes.publishedDate || 'Official Ledger'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Semester SGPA</span>
                        <span className="text-base font-black text-emerald-400">{activeRes.sgpa.toFixed(2)}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Credits Earned</span>
                        <span className="text-sm font-bold text-white">{activeRes.creditsEarned} / {activeRes.creditsRegistered}</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                          <th className="py-2.5 px-4">Subject Code</th>
                          <th className="py-2.5 px-4">Subject Name</th>
                          <th className="py-2.5 px-4 text-center">Credits</th>
                          <th className="py-2.5 px-4 text-center">Marks</th>
                          <th className="py-2.5 px-4 text-center">Grade</th>
                          <th className="py-2.5 px-4 text-center">Grade Points</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs bg-white">
                        {activeRes.subjects && activeRes.subjects.length > 0 ? (
                          activeRes.subjects.map((sub, idx) => (
                            <tr key={`dash-sub-${idx}`} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                                {sub.code}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-900">
                                {sub.name}
                              </td>
                              <td className="py-2.5 px-4 text-center font-bold text-slate-700">
                                {sub.credits}
                              </td>
                              <td className="py-2.5 px-4 text-center font-medium text-slate-800">
                                {sub.marks !== undefined ? `${sub.marks} / ${sub.maxMarks || 100}` : '-'}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getGradeBadgeClass(
                                    sub.grade
                                  )}`}
                                >
                                  {sub.grade}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center font-extrabold text-slate-900">
                                {sub.points}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Passed
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-4 text-center text-slate-400 text-xs">
                              No subject entries available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Performance Chart & Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceBarChart
            data={chartData}
            title="Current Semester Performance by Subject (Semester IV)"
            subtitle="Internal marks combining Mid tests, Class tests, Assignments, and Lab"
            benchmark={75}
          />
        </div>

        {/* Recent Updates Section */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Recent Updates</h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Live Feed
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {recentUpdates.map((item) => (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeClass}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1.5 group-hover:text-indigo-600 transition-colors leading-snug">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <span className="text-[11px] text-slate-500">
              Verified by Academic Registrar &bull; Auto-synced
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Quick Access Portals
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <button
            id="quick-access-academic-history"
            onClick={() => onNavigateTab('academic-history')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                Academic History
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            id="quick-access-marks"
            onClick={() => onNavigateTab('marks')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                Current Marks
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            id="quick-access-assignments"
            onClick={() => onNavigateTab('assignments')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                Assignments
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            id="quick-access-lab-manuals"
            onClick={() => onNavigateTab('lab-manuals')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookText className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                Lab Manuals
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            id="quick-access-assessments"
            onClick={() => onNavigateTab('assessments')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                Assessments
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

