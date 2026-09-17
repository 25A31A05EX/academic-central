import React from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Award,
  Phone,
  CheckCircle2,
  Building,
  School,
  FileCheck2,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';

export const StudentProfile: React.FC = () => {
  const { students, subjects, marks } = useAcademicData();
  const currentStudent = students[0] || {
    id: 'stud-1',
    name: 'Rahul Sharma',
    rollNumber: '23CS101',
    email: 'rahul.sharma@academiccentral.demo',
    branch: 'Computer Science',
    year: '2nd Year',
    section: 'A',
    semester: 4,
    cgpa: 8.42,
    status: 'Active',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Student Academic Profile
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Official enrollment and institutional identity credentials
        </p>
      </div>

      {/* Main Profile Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Enrolled & Verified</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md border border-slate-200">
              <div className="w-full h-full rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl">
                {currentStudent.name.charAt(0)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                CGPA: {currentStudent.cgpa || 8.42}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                Semester {currentStudent.semester}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">{currentStudent.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Roll Number: {currentStudent.rollNumber} &bull; University Reg ID: REG2023-CS-101
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-600" />
                {currentStudent.branch}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                {currentStudent.year} &bull; Section {currentStudent.section}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">College Email</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{currentStudent.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Enrolled Semester IV Courses</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mr-2">
                  {sub.code}
                </span>
                <span className="font-semibold text-slate-800">{sub.name}</span>
                <p className="text-[11px] text-slate-500 mt-1">Instructor: {sub.teacherName}</p>
              </div>
              <span className="font-bold text-slate-700">{sub.credits} Credits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StudentProfilePage = StudentProfile;

