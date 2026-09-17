import React from 'react';
import {
  User,
  Mail,
  BookOpen,
  Briefcase,
  Award,
  CheckCircle2,
  Building,
  School,
  GraduationCap,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';

export const TeacherProfile: React.FC = () => {
  const { teachers, subjects } = useAcademicData();
  const currentTeacher = teachers[0] || {
    name: 'Dr. Priya Kumar',
    email: 'priya.kumar@academiccentral.demo',
    department: 'Computer Science & Engineering',
    designation: 'Professor & Head',
    subjectsAssigned: ['Data Structures', 'Web Development'],
    qualification: 'Ph.D in Computer Science (IIT Bombay)',
    experience: '14 Years Academic & Research',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Faculty Profile
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Academic credentials and institutional designation
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Authorized Evaluator</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md border border-slate-200">
              <div className="w-full h-full rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl">
                {currentTeacher.name.charAt(0)}
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              {currentTeacher.designation}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">{currentTeacher.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentTeacher.department} &bull; Emp ID: FAC-CSE-042
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-600" />
                {currentTeacher.department}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Qualifications</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                {currentTeacher.qualification || 'Ph.D in Computer Science'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">College Email</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{currentTeacher.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Portfolio */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Assigned Academic Courses</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.slice(0, 2).map((sub) => (
            <div
              key={sub.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mr-2">
                  {sub.code}
                </span>
                <span className="font-bold text-slate-800">{sub.name}</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Semester {sub.semester} &bull; {sub.credits} Credits
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[10px] border border-emerald-200">
                Primary Faculty
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
