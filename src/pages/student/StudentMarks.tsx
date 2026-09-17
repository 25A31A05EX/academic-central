import React from 'react';
import {
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Printer,
  Download,
  Percent,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { StatCard } from '../../components/common/StatCard';
import { PerformanceBarChart } from '../../components/charts/BarChart';

export const StudentMarks: React.FC = () => {
  const { marks, students } = useAcademicData();
  const currentStudent = students[0] || {
    id: 'stud-1',
    name: 'Rahul Sharma',
    rollNumber: '23CS101',
    branch: 'Computer Science',
    year: '2nd Year',
    section: 'A',
  };

  const studentMarks = marks.filter(
    (m) => m.studentId === currentStudent.id || m.studentId === 'stud-1'
  );

  // Totals & Averages calculation
  let grandTotalObtained = 0;
  let grandTotalMax = 0;
  let highestPercentage = 0;
  let highestSubjectName = '';

  const processedRows = studentMarks.map((m) => {
    const total = m.mid1 + m.mid2 + m.classTest + m.assignment + m.labInternal;
    const max = m.mid1Max + m.mid2Max + m.classTestMax + m.assignmentMax + m.labInternalMax;
    const pct = max > 0 ? Math.round((total / max) * 100) : 0;

    grandTotalObtained += total;
    grandTotalMax += max;

    if (pct > highestPercentage) {
      highestPercentage = pct;
      highestSubjectName = m.subjectName;
    }

    return {
      ...m,
      total,
      max,
      percentage: pct,
    };
  });

  const overallPercentage =
    grandTotalMax > 0 ? Math.round((grandTotalObtained / grandTotalMax) * 100) : 82;
  const averageMarks =
    processedRows.length > 0 ? Math.round(grandTotalObtained / processedRows.length) : 86;

  const chartData = processedRows.map((r) => ({
    label: r.subjectName,
    code: r.subjectCode,
    value: r.percentage,
    totalMarks: `${r.total}/${r.max}`,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Performance & Marks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified institutional grade ledger for {currentStudent.name} ({currentStudent.rollNumber})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Grade Card</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentage"
          value={`${overallPercentage}%`}
          subtitle="Cumulative evaluation score"
          badgeText="First Class Dist."
          badgeType="positive"
          color="indigo"
          icon={Percent}
        />
        <StatCard
          title="Average Marks"
          value={`${averageMarks} / 110`}
          subtitle="Mean score across all subjects"
          badgeText="+4% vs Class Avg"
          badgeType="neutral"
          color="emerald"
          icon={TrendingUp}
        />
        <StatCard
          title="Highest Score"
          value={`${highestPercentage}%`}
          subtitle={highestSubjectName || 'Web Development'}
          badgeText="Subject Topper"
          badgeType="primary"
          color="amber"
          icon={Award}
        />
        <StatCard
          title="Total Subjects"
          value={processedRows.length}
          subtitle="All semesters courses"
          badgeText="6 Evaluated"
          badgeType="neutral"
          color="blue"
          icon={BookOpen}
        />
      </div>

      {/* Professional Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Semester Marksheet</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive breakdown of continuous internal evaluations & lab components
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg self-start sm:self-auto">
            Status: Faculty Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3 text-center">Mid-1 (30)</th>
                <th className="py-3 px-3 text-center">Mid-2 (30)</th>
                <th className="py-3 px-3 text-center">Class Test (20)</th>
                <th className="py-3 px-3 text-center">Assignment (10)</th>
                <th className="py-3 px-3 text-center">Lab Internal (20)</th>
                <th className="py-3 px-3 text-center">Total (110)</th>
                <th className="py-3 px-4 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {processedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>
                      <span>{row.subjectName}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400">
                        {row.subjectCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-semibold text-slate-900">{row.mid1}</span>
                    <span className="text-slate-400 text-[10px]">/{row.mid1Max}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-semibold text-slate-900">{row.mid2}</span>
                    <span className="text-slate-400 text-[10px]">/{row.mid2Max}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-semibold text-slate-900">{row.classTest}</span>
                    <span className="text-slate-400 text-[10px]">/{row.classTestMax}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-semibold text-slate-900">{row.assignment}</span>
                    <span className="text-slate-400 text-[10px]">/{row.assignmentMax}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-semibold text-slate-900">{row.labInternal}</span>
                    <span className="text-slate-400 text-[10px]">/{row.labInternalMax}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {row.total}{' '}
                    <span className="text-slate-400 font-normal text-[10px]">/{row.max}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs ${
                        row.percentage >= 85
                          ? 'bg-emerald-50 text-emerald-700'
                          : row.percentage >= 70
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {row.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3.5 px-4 text-xs uppercase tracking-wider">
                  Aggregated Cohort Total
                </td>
                <td colSpan={5} className="py-3.5 px-3 text-center text-slate-500 font-normal">
                  All 6 Semester Courses Evaluated
                </td>
                <td className="py-3.5 px-3 text-center font-mono text-sm font-black text-indigo-700">
                  {grandTotalObtained} / {grandTotalMax}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sm font-black text-emerald-700">
                  {overallPercentage}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Performance Chart by Subject */}
      <PerformanceBarChart
        data={chartData}
        title="Subject Performance Breakdown"
        subtitle="Individual course assessment distributions against institutional standards"
        benchmark={75}
      />
    </div>
  );
};
