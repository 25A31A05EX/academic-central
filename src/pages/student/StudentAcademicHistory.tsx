import React, { useState } from 'react';
import {
  Award,
  History,
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Layers,
  GraduationCap,
  Info,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { SemesterResult } from '../../types';

export const StudentAcademicHistory: React.FC = () => {
  const { students, currentUser, semesterResults } = useAcademicData();

  // Find the current logged in student
  const currentStudent =
    students.find((s) => s.userId === currentUser?.id || s.id === currentUser?.id) ||
    students[0] || {
      id: 'stud-1',
      name: 'Rahul Sharma',
      rollNumber: '23CS101',
      branch: 'Computer Science',
      year: '2nd Year',
      section: 'A',
      semester: 4,
      cgpa: 8.75,
    };

  // Filter semester results for this student, sorted by semester ascending
  const studentResults = semesterResults
    .filter((r) => r.studentId === currentStudent.id || r.studentId === 'stud-1')
    .sort((a, b) => a.semester - b.semester);

  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');

  // Compute overall statistics
  let totalCreditsRegistered = 0;
  let totalCreditsEarned = 0;
  let totalWeightedSgpa = 0;

  studentResults.forEach((r) => {
    const credits = r.creditsRegistered || 20;
    totalCreditsRegistered += credits;
    totalCreditsEarned += r.creditsEarned || credits;
    totalWeightedSgpa += (r.sgpa || 0) * credits;
  });

  const calculatedCgpa =
    totalCreditsRegistered > 0
      ? Number((totalWeightedSgpa / totalCreditsRegistered).toFixed(2))
      : currentStudent.cgpa || 8.4;

  const filteredResults =
    selectedSemester === 'all'
      ? studentResults
      : studentResults.filter((r) => r.semester === selectedSemester);

  const getGradeBadgeClass = (grade: string) => {
    switch (grade) {
      case 'O':
        return 'bg-purple-100 text-purple-800 border-purple-200 font-extrabold';
      case 'A+':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
      case 'A':
        return 'bg-teal-100 text-teal-800 border-teal-200 font-bold';
      case 'B+':
        return 'bg-blue-100 text-blue-800 border-blue-200 font-medium';
      case 'B':
        return 'bg-sky-100 text-sky-800 border-sky-200 font-medium';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-medium';
      case 'F':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Official University Grade Records</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic History & Previous Semester Results
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cumulative semester performance transcripts and credit ledger for {currentStudent.name} ({currentStudent.rollNumber})
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            id="print-academic-history-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Official Transcript</span>
          </button>
        </div>
      </div>

      {/* Student Transcript Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {/* CGPA Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col justify-between">
            <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">
              Cumulative CGPA
            </span>
            <div className="my-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {calculatedCgpa.toFixed(2)}
              </span>
              <span className="text-xs text-indigo-300 ml-1.5 font-medium">/ 10.00</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>First Class with Distinction</span>
            </div>
          </div>

          {/* Credits Completed */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col justify-between">
            <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">
              Total Credits Earned
            </span>
            <div className="my-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {totalCreditsEarned}
              </span>
              <span className="text-xs text-indigo-300 ml-1.5 font-medium">
                / {totalCreditsRegistered} Reg.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Course Completion Rate</span>
            </div>
          </div>

          {/* Semesters Completed */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col justify-between">
            <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">
              Semesters Published
            </span>
            <div className="my-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {studentResults.length}
              </span>
              <span className="text-xs text-indigo-300 ml-1.5 font-medium">Semesters</span>
            </div>
            <div className="text-[11px] text-indigo-200">
              Current: <span className="font-bold text-white">Semester {currentStudent.semester}</span>
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col justify-between">
            <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">
              Student Information
            </span>
            <div className="my-1 text-xs space-y-1">
              <p className="font-extrabold text-sm text-white">{currentStudent.name}</p>
              <p className="text-indigo-200">Roll No: <span className="font-mono text-white font-semibold">{currentStudent.rollNumber}</span></p>
              <p className="text-indigo-200">Branch: <span className="text-white font-medium">{currentStudent.branch}</span></p>
            </div>
            <div className="text-[10px] text-indigo-300">
              Regulation: 2023 Autonomous CBCS
            </div>
          </div>
        </div>
      </div>

      {/* SGPA Progression Trajectory & Filter Tabs */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Semester SGPA Progression Trajectory</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Semester Grade Point Average (SGPA) performance across each term
            </p>
          </div>

          {/* Semester Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              id="filter-all-semesters"
              onClick={() => setSelectedSemester('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                selectedSemester === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Semesters ({studentResults.length})
            </button>
            {studentResults.map((r) => (
              <button
                key={`sem-btn-${r.semester}`}
                id={`filter-sem-${r.semester}`}
                onClick={() => setSelectedSemester(r.semester)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedSemester === r.semester
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semester {r.semester}
              </button>
            ))}
          </div>
        </div>

        {/* SGPA Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {studentResults.map((r) => {
            const isSelected = selectedSemester === r.semester || selectedSemester === 'all';
            return (
              <div
                key={`sgpa-card-${r.semester}`}
                onClick={() => setSelectedSemester(r.semester)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedSemester === r.semester
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50/70 hover:border-indigo-200 hover:bg-indigo-50/20'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Semester {r.semester}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                    {r.resultStatus}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{r.sgpa.toFixed(2)}</span>
                  <span className="text-[10px] font-semibold text-slate-400">SGPA</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {r.creditsEarned} Credits Earned
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Semester Results List */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Semester Results Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no published semester records available for this filter yet. Results are uploaded by the Examination Branch.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredResults.map((res: SemesterResult) => (
            <div
              key={`sem-res-card-${res.id || res.semester}`}
              id={`semester-result-${res.semester}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Semester Header */}
              <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-xs">
                    S{res.semester}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>Semester {res.semester} Grade Sheet</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-semibold">
                        {res.resultStatus}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Academic Session: {res.academicYear} &bull; Published: {res.publishedDate || 'Official Ledger'}
                    </p>
                  </div>
                </div>

                {/* Semester Summary Pills */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Semester SGPA
                    </span>
                    <span className="text-xl font-black text-emerald-400">{res.sgpa.toFixed(2)}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Credits (Earned / Reg.)
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {res.creditsEarned} / {res.creditsRegistered}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                      <th className="py-3 px-4">Subject Code</th>
                      <th className="py-3 px-4">Subject Title</th>
                      <th className="py-3 px-4 text-center">Credits</th>
                      <th className="py-3 px-4 text-center">Marks</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-center">Grade Points</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {res.subjects && res.subjects.length > 0 ? (
                      res.subjects.map((sub, idx) => (
                        <tr
                          key={`sub-${res.semester}-${sub.code || idx}`}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {sub.code}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {sub.name}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">
                            {sub.credits}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-800">
                            {sub.marks !== undefined ? `${sub.marks} / ${sub.maxMarks || 100}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-xs border ${getGradeBadgeClass(
                                sub.grade
                              )}`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                            {sub.points} <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {sub.grade === 'F' ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                Backlog
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Passed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                          No individual subject breakdown recorded for this semester.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {/* Semester Table Footer Summary */}
                  <tfoot className="bg-slate-50/90 border-t border-slate-200 text-xs font-bold text-slate-800">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 text-right">
                        Semester {res.semester} Summary:
                      </td>
                      <td className="py-3 px-4 text-center text-indigo-700">
                        {res.creditsEarned} Credits
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-right">
                        Semester SGPA:
                      </td>
                      <td className="py-3 px-4 text-center text-indigo-700 text-sm font-black">
                        {res.sgpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {res.resultStatus}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Institutional Grading Scale Reference */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">
            Institutional Grading Scale (10-Point UGC Reference)
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center">
          <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50">
            <span className="text-xs font-extrabold text-purple-800 block">Grade O</span>
            <span className="text-[10px] text-purple-600 font-semibold block">Outstanding (10 Pts)</span>
            <span className="text-[10px] text-slate-500">90% - 100%</span>
          </div>
          <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <span className="text-xs font-extrabold text-emerald-800 block">Grade A+</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Excellent (9 Pts)</span>
            <span className="text-[10px] text-slate-500">80% - 89%</span>
          </div>
          <div className="p-2.5 rounded-lg border border-teal-200 bg-teal-50/50">
            <span className="text-xs font-extrabold text-teal-800 block">Grade A</span>
            <span className="text-[10px] text-teal-600 font-semibold block">Very Good (8 Pts)</span>
            <span className="text-[10px] text-slate-500">70% - 79%</span>
          </div>
          <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
            <span className="text-xs font-extrabold text-blue-800 block">Grade B+</span>
            <span className="text-[10px] text-blue-600 font-semibold block">Good (7 Pts)</span>
            <span className="text-[10px] text-slate-500">60% - 69%</span>
          </div>
          <div className="p-2.5 rounded-lg border border-sky-200 bg-sky-50/50">
            <span className="text-xs font-extrabold text-sky-800 block">Grade B</span>
            <span className="text-[10px] text-sky-600 font-semibold block">Above Average (6 Pts)</span>
            <span className="text-[10px] text-slate-500">55% - 59%</span>
          </div>
          <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
            <span className="text-xs font-extrabold text-amber-800 block">Grade C</span>
            <span className="text-[10px] text-amber-600 font-semibold block">Average (5 Pts)</span>
            <span className="text-[10px] text-slate-500">50% - 54%</span>
          </div>
          <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50">
            <span className="text-xs font-extrabold text-rose-800 block">Grade F</span>
            <span className="text-[10px] text-rose-600 font-semibold block">Fail / Backlog (0 Pts)</span>
            <span className="text-[10px] text-slate-500">&lt; 50%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
