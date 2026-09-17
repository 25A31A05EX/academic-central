import React from 'react';
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
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { useAcademicData } from '../../hooks/useAcademicData';
import { PerformanceBarChart } from '../../components/charts/BarChart';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenPdf: (doc: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onOpenPdf,
}) => {
  const { students, subjects, assignments, marks, assessments, labMaterials } = useAcademicData();

  // Find the primary demo student Rahul Sharma
  const currentStudent = students[0] || {
    id: 'stud-1',
    name: 'Rahul Sharma',
    rollNumber: '23CS101',
    branch: 'Computer Science',
    year: '2nd Year',
    section: 'A',
    semester: 4,
    cgpa: 8.4,
  };

  // Get marks for this student
  const studentMarks = marks.filter((m) => m.studentId === currentStudent.id || m.studentId === 'stud-1');

  // Calculate overall percentage
  let totalObtained = 0;
  let totalMax = 0;
  studentMarks.forEach((m) => {
    totalObtained += m.mid1 + m.mid2 + m.classTest + m.assignment + m.labInternal;
    totalMax += m.mid1Max + m.mid2Max + m.classTestMax + m.assignmentMax + m.labInternalMax;
  });
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 82;

  // Chart data
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

  const recentUpdates = [
    {
      id: 'up-1',
      title: 'New assignment uploaded for Data Structures',
      time: '2 hours ago',
      category: 'Assignment',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      action: () => onNavigateTab('assignments'),
    },
    {
      id: 'up-2',
      title: 'Internal marks updated for DBMS',
      time: 'Yesterday',
      category: 'Marks',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => onNavigateTab('internal-marks'),
    },
    {
      id: 'up-3',
      title: 'New lab manual uploaded for Computer Networks',
      time: '2 days ago',
      category: 'Lab Manual',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      action: () => onNavigateTab('lab-manuals'),
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
              <span>Academic Year 2026 &bull; Semester IV</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentStudent.name.split(' ')[0]}!
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
              All your assignments, internal scores, syllabus schedules, and lab manuals are
              consolidated below.
            </p>
          </div>

          {/* Student Profile Overview Card */}
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
                <span className="font-medium text-white">Branch:</span> {currentStudent.branch}
              </p>
              <p className="text-indigo-200">
                <span className="font-medium text-white">Year & Sec:</span> {currentStudent.year} (Section {currentStudent.section})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentage"
          value={`${overallPercentage}%`}
          subtitle="Cumulative internal performance"
          badgeText="First Class with Dist."
          badgeType="positive"
          color="emerald"
          icon={Award}
          onClick={() => onNavigateTab('marks')}
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
        <StatCard
          title="Registered Subjects"
          value={subjects.length}
          subtitle="Active theory & lab courses"
          badgeText="22 Credits"
          badgeType="primary"
          color="blue"
          icon={BookOpen}
          onClick={() => onNavigateTab('subjects')}
        />
      </div>

      {/* Performance Chart & Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceBarChart
            data={chartData}
            title="My Academic Performance by Subject"
            subtitle="Overall calculated percentage combining Mid tests, Class tests, Assignments, and Lab"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
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
                View Assignments
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
                View Marks
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
                View Lab Manuals
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
                View Assessments
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
