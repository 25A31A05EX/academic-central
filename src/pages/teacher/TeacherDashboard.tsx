import React from 'react';
import {
  BookOpen,
  FileCheck2,
  FileEdit,
  GraduationCap,
  ArrowRight,
  UploadCloud,
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { useAcademicData } from '../../hooks/useAcademicData';

interface TeacherDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenPdf: (doc: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigateTab,
  onOpenPdf,
}) => {
  const { teachers, subjects, assignments, submissions, students } = useAcademicData();

  const currentTeacher = teachers[0] || {
    id: 'teach-1',
    name: 'Dr. Priya Kumar',
    department: 'Computer Science & Engineering',
    designation: 'Professor & Head',
    subjectsAssigned: ['Data Structures', 'Web Development'],
  };

  // Filter teacher's subjects
  const mySubjects = subjects.filter(
    (s) =>
      s.teacherName === currentTeacher.name ||
      s.teacherId === currentTeacher.id ||
      s.teacherId === 'teach-1'
  );

  const mySubjectIds = mySubjects.map((s) => s.id);
  const myAssignments = assignments.filter((a) => mySubjectIds.includes(a.subjectId));
  const myAssignmentIds = myAssignments.map((a) => a.id);

  // Submissions for this teacher's assignments
  const pendingSubmissions = submissions.filter(
    (s) => myAssignmentIds.includes(s.assignmentId) && s.status === 'Submitted'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Department of Computer Science &bull; Faculty Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentTeacher.name}
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
              {currentTeacher.designation} &bull; Manage coursework, grade assignments, and post
              laboratory resources.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {currentTeacher.name.charAt(0)}
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-extrabold text-white text-sm">{currentTeacher.name}</p>
              <p className="text-indigo-200">{currentTeacher.department}</p>
              <p className="text-emerald-300 font-semibold text-[11px]">
                Active Courses: {mySubjects.map((s) => s.code).join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Assigned Subjects"
          value={mySubjects.length}
          subtitle="Theory & laboratory classes"
          badgeText="Semester IV"
          badgeType="primary"
          color="indigo"
          icon={BookOpen}
          onClick={() => onNavigateTab('my-subjects')}
        />
        <StatCard
          title="Assignments Uploaded"
          value={myAssignments.length}
          subtitle="Coursework problem sheets"
          badgeText="Active Tasks"
          badgeType="neutral"
          color="blue"
          icon={FileCheck2}
          onClick={() => onNavigateTab('assignments')}
        />
        <StatCard
          title="Pending Submissions"
          value={pendingSubmissions.length}
          subtitle="Student submissions to grade"
          badgeText={pendingSubmissions.length > 0 ? 'Needs Evaluation' : 'All Clear'}
          badgeType={pendingSubmissions.length > 0 ? 'warning' : 'positive'}
          color="amber"
          icon={FileEdit}
          onClick={() => onNavigateTab('assignments')}
        />
        <StatCard
          title="Total Students Enrolled"
          value={students.length}
          subtitle="CSE 2nd Year Cohort"
          badgeText="Section A & B"
          badgeType="neutral"
          color="emerald"
          icon={GraduationCap}
          onClick={() => onNavigateTab('students')}
        />
      </div>

      {/* Pending Evaluations & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Evaluations Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Pending Submissions Awaiting Evaluation
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {pendingSubmissions.length} Pending
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {pendingSubmissions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">All student submissions are graded!</p>
                <p className="text-[11px] text-slate-400">New uploads will appear here in real-time.</p>
              </div>
            ) : (
              pendingSubmissions.map((sub) => {
                const asg = assignments.find((a) => a.id === sub.assignmentId);
                return (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{sub.studentName}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.2 bg-slate-200 rounded text-slate-700">
                          {sub.rollNumber}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                        {asg?.title || 'Assignment Task'} &bull; {asg?.subjectName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        File: <span className="font-mono">{sub.fileName}</span> &bull; Submitted:{' '}
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          onOpenPdf({
                            title: `Solution: ${sub.studentName} (${sub.rollNumber})`,
                            fileName: sub.fileName,
                            subjectName: asg?.subjectName || 'Coursework',
                            type: 'Student Submission',
                            uploadedBy: sub.studentName,
                            description: sub.notes || 'Code verification and test suite output.',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Inspect Work
                      </button>
                      <button
                        onClick={() => onNavigateTab('assignments')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Evaluate & Grade
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Faculty Quick Actions
            </h3>

            <div className="space-y-2.5">
              <button
                id="quick-teacher-upload-asg"
                onClick={() => onNavigateTab('assignments')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                      Upload Assignment
                    </p>
                    <p className="text-[10px] text-slate-500">Post new problem statement</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="quick-teacher-enter-marks"
                onClick={() => onNavigateTab('enter-marks')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Enter Marks
                    </p>
                    <p className="text-[10px] text-slate-500">Mid tests, quiz & lab internals</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="quick-teacher-upload-lab"
                onClick={() => onNavigateTab('upload-materials')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                      Upload Lab Manual
                    </p>
                    <p className="text-[10px] text-slate-500">Notes and experiment manuals</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="quick-teacher-schedule-assessment"
                onClick={() => onNavigateTab('assessments')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                      Schedule Assessment
                    </p>
                    <p className="text-[10px] text-slate-500">Add examination date to calendar</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Department of Computer Science &bull; Autonomous Scheme
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
