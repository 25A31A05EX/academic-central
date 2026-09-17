import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { ReportCharts } from '../../components/charts/ReportCharts';
import { StatCard } from '../../components/common/StatCard';

export const AdminReports: React.FC = () => {
  const { students, subjects, assignments, marks, submissions } = useAcademicData();

  // Export report as CSV simulation
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Roll Number,Student Name,Subject,Mid-1,Mid-2,Class Test,Assignment,Lab Internal,Total Marks,Percentage\n';

    marks.forEach((m) => {
      const stud = students.find((s) => s.id === m.studentId);
      const total = m.mid1 + m.mid2 + m.classTest + m.assignment + m.labInternal;
      const max = m.mid1Max + m.mid2Max + m.classTestMax + m.assignmentMax + m.labInternalMax;
      const pct = max > 0 ? Math.round((total / max) * 100) : 0;

      csvContent += `${stud?.rollNumber || '23CS101'},${stud?.name || 'Student'},${m.subjectName},${m.mid1},${m.mid2},${m.classTest},${m.assignment},${m.labInternal},${total}/${max},${pct}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Academic_Central_Semester_Report_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Performance & Analytics Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort aggregate scores, pass percentages, subject distributions, and completion indices
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            id="btn-export-report-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <ReportCharts />

      {/* Cohort Grade Distribution Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Departmental Course Grade Summary
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous evaluation analytics across Semester IV courses
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            Cohort Average: 81.6%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Assigned Instructor</th>
                <th className="py-3 px-3 text-center">Enrolled Scholars</th>
                <th className="py-3 px-3 text-center">Class Average</th>
                <th className="py-3 px-4 text-right">Pass Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjects.map((sub, idx) => {
                const averages = [83, 79, 85, 81, 88, 76];
                const avg = averages[idx % averages.length];
                const passPct = avg >= 80 ? 98 : 94;

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{sub.code}</td>
                    <td className="py-3.5 px-4">{sub.teacherName}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                      {students.length}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                      {avg}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {passPct}% Pass Rate
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
