import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Mail,
  Award,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';

export const TeacherStudents: React.FC = () => {
  const { students, subjects, marks } = useAcademicData();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Enrolled Students Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Class cohort enrolled in Computer Science & Engineering 2nd Year
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
          Total Enrolled: {students.length} Students
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students by name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Branch & Year</th>
                <th className="py-3.5 px-3 text-center">Section</th>
                <th className="py-3.5 px-3 text-center">CGPA</th>
                <th className="py-3.5 px-4 text-right">Enrollment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((stud) => (
                <tr key={stud.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {stud.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{stud.name}</p>
                        <p className="text-[11px] text-slate-500">{stud.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {stud.rollNumber}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {stud.branch} &bull; {stud.year}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {stud.section}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold font-mono text-emerald-700">
                    {stud.cgpa || 8.2}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
