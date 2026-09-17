import React from 'react';
import {
  ShieldAlert,
  Award,
  Info,
  CheckCircle2,
  FileCheck2,
  Calculator,
  Printer,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';

export const StudentInternalMarks: React.FC = () => {
  const { marks, students } = useAcademicData();
  const currentStudent = students[0] || {
    id: 'stud-1',
    name: 'Rahul Sharma',
    rollNumber: '23CS101',
    branch: 'Computer Science',
    year: '2nd Year',
    section: 'A',
    semester: 4,
  };

  const studentMarks = marks.filter(
    (m) => m.studentId === currentStudent.id || m.studentId === 'stud-1'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Internal Assessment Marks (CIE)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous Internal Evaluation component record for 2nd Year, Semester IV
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print CIE Record</span>
        </button>
      </div>

      {/* Faculty Authority Note banner as explicitly requested */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Official Evaluation Notice
          </h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            "Marks are maintained and updated by authorized faculty."
          </p>
          <p className="text-[11px] text-amber-700 mt-1">
            Students can view their Continuous Internal Evaluation (CIE) marks but cannot modify
            them. For grading discrepancies or attendance verification, contact your respective
            course instructor during office hours.
          </p>
        </div>
      </div>

      {/* Internal Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Continuous Internal Evaluation Breakdown
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Regulation: 2026 Academic Scheme
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3 text-center">Mid Examination (Avg of 2)</th>
                <th className="py-3 px-3 text-center">Class Test (20)</th>
                <th className="py-3 px-3 text-center">Assignment Marks (10)</th>
                <th className="py-3 px-3 text-center">Lab Internal (20)</th>
                <th className="py-3 px-4 text-right">Total Internal Marks (80)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentMarks.map((m) => {
                // Mid exam is average of mid1 and mid2 (out of 30)
                const midAvg = Math.round((m.mid1 + m.mid2) / 2);
                const totalInternal = midAvg + m.classTest + m.assignment + m.labInternal;
                const maxInternal = 30 + m.classTestMax + m.assignmentMax + m.labInternalMax;
                const isPassing = totalInternal >= maxInternal * 0.5;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>
                        <span>{m.subjectName}</span>
                        <span className="block font-mono text-[10px] text-slate-400">
                          {m.subjectCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      <span className="font-bold text-slate-800">{midAvg}</span>
                      <span className="text-slate-400 text-[10px]"> / 30</span>
                      <span className="block text-[10px] text-slate-400 font-sans">
                        (M1: {m.mid1}, M2: {m.mid2})
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {m.classTest} <span className="text-slate-400 text-[10px]">/{m.classTestMax}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {m.assignment} <span className="text-slate-400 text-[10px]">/{m.assignmentMax}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {m.labInternal} <span className="text-slate-400 text-[10px]">/{m.labInternalMax}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700 text-sm">
                      {totalInternal}{' '}
                      <span className="text-slate-400 font-normal text-xs">/ {maxInternal}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPassing
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Qualified for Finals
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Scheme Guide */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
          Internal Evaluation Weightage Matrix
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-indigo-700 text-base">30 Marks</p>
            <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Mid Examinations</p>
            <p className="text-slate-400 text-[10px]">Best/Average of Mid 1 & Mid 2</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-indigo-700 text-base">20 Marks</p>
            <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Continuous Class Test</p>
            <p className="text-slate-400 text-[10px]">Surprise & announced tests</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-indigo-700 text-base">10 Marks</p>
            <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Assignments</p>
            <p className="text-slate-400 text-[10px]">Timely problem sheet solutions</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-indigo-700 text-base">20 Marks</p>
            <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Laboratory Internal</p>
            <p className="text-slate-400 text-[10px]">Observation notebook & viva</p>
          </div>
        </div>
      </div>
    </div>
  );
};
