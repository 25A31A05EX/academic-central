import React, { useState } from 'react';
import {
  BookOpen,
  FileCheck2,
  BookText,
  FileEdit,
  GraduationCap,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { Subject } from '../../types';

interface TeacherMySubjectsProps {
  onNavigateTab: (tab: string) => void;
  onOpenPdf: (doc: any) => void;
}

export const TeacherMySubjects: React.FC<TeacherMySubjectsProps> = ({
  onNavigateTab,
  onOpenPdf,
}) => {
  const { subjects, assignments, labMaterials, students, marks } = useAcademicData();

  // Primary teacher Dr. Priya Kumar
  const mySubjects = subjects.filter(
    (s) =>
      s.teacherName.includes('Priya') ||
      s.teacherId === 'teach-1' ||
      s.code === 'CS401' ||
      s.code === 'CS404'
  );

  const [activeSubject, setActiveSubject] = useState<Subject>(mySubjects[0] || subjects[0]);

  const subjectAssignments = assignments.filter((a) => a.subjectId === activeSubject.id);
  const subjectMaterials = labMaterials.filter((m) => m.subjectId === activeSubject.id);
  const subjectMarks = marks.filter((m) => m.subjectId === activeSubject.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Teaching Courses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Class curriculum, active coursework assignments, and syllabus repository
          </p>
        </div>
      </div>

      {/* Subject Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {mySubjects.map((sub) => {
          const isSelected = activeSubject.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{sub.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {sub.code}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Subject Control Board */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                {activeSubject.code}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Semester {activeSubject.semester} &bull; {activeSubject.credits} Credits
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">{activeSubject.name}</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">{activeSubject.description}</p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => onNavigateTab('enter-marks')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileEdit className="w-4 h-4" />
              <span>Enter Marks</span>
            </button>
            <button
              onClick={() => onNavigateTab('assignments')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>New Assignment</span>
            </button>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{students.length} Students</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Section A & Section B</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Posted Assignments</span>
            <p className="text-xl font-black text-indigo-700 mt-0.5">
              {subjectAssignments.length} Assignments
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">Syllabus milestones</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Materials Uploaded</span>
            <p className="text-xl font-black text-purple-700 mt-0.5">
              {subjectMaterials.length} Resources
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">Manuals, slides, lecture notes</p>
          </div>
        </div>

        {/* Section Tabs: Assignments & Lab Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Active Assignments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                Active Assignments ({subjectAssignments.length})
              </h4>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {subjectAssignments.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{a.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Due: {new Date(a.dueDate).toLocaleDateString()} &bull; Max Marks: {a.maxMarks}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onOpenPdf({
                        title: a.title,
                        fileName: a.fileName,
                        subjectName: a.subjectName,
                        type: 'Assignment PDF',
                        uploadedBy: a.teacherName,
                        description: a.description,
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    View PDF
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookText className="w-4 h-4 text-purple-600" />
                Lab Manuals & Resources ({subjectMaterials.length})
              </h4>
              <button
                onClick={() => onNavigateTab('upload-materials')}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                Upload
              </button>
            </div>

            <div className="space-y-2">
              {subjectMaterials.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{m.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {m.type} &bull; {m.fileSize}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onOpenPdf({
                        title: m.title,
                        fileName: m.fileName,
                        subjectName: m.subjectName,
                        type: m.type,
                        uploadedBy: m.uploadedBy,
                        description: m.description,
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-purple-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
