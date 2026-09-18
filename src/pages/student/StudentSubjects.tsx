import React, { useState } from 'react';
import {
  BookOpen,
  User,
  GraduationCap,
  Layers,
  FileCheck2,
  Award,
  BookText,
  CalendarDays,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { Subject } from '../../types';

interface StudentSubjectsProps {
  onOpenPdf: (doc: any) => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentSubjects: React.FC<StudentSubjectsProps> = ({
  onOpenPdf,
  onNavigateTab,
}) => {
  const { subjects, assignments, marks, labMaterials, assessments } = useAcademicData();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Helper to get stats for a subject
  const getSubjectAssignments = (subId: string) =>
    assignments.filter((a) => a.subjectId === subId);
  const getSubjectLabMaterials = (subId: string) =>
    labMaterials.filter((m) => m.subjectId === subId);
  const getSubjectAssessments = (subId: string) =>
    assessments.filter((a) => a.subjectId === subId);
  const getSubjectMarks = (subId: string) =>
    marks.find((m) => m.subjectId === subId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registered Subjects
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Core departmental courses and lab practicals enrolled for Semester IV
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Total Credits: 21 Credits
        </span>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const subAssignments = getSubjectAssignments(sub.id);
          const subMarks = getSubjectMarks(sub.id);
          const percentage = subMarks
            ? Math.round(
                ((subMarks.mid1 +
                  subMarks.mid2 +
                  subMarks.classTest +
                  subMarks.assignment +
                  subMarks.labInternal) /
                  (subMarks.mid1Max +
                    subMarks.mid2Max +
                    subMarks.classTestMax +
                    subMarks.assignmentMax +
                    subMarks.labInternalMax)) *
                  100
              )
            : null;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100">
                    {sub.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Sem {sub.semester} &bull; {sub.credits} Credits
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{sub.name}</h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {sub.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Faculty:{' '}
                      <strong className="text-slate-800 font-semibold">{sub.teacherName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Assignments:{' '}
                      <strong className="text-slate-800 font-semibold">
                        {subAssignments.length} Posted
                      </strong>
                    </span>
                  </div>
                  {percentage !== null && (
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Current Score:{' '}
                        <strong className="text-emerald-700 font-bold">{percentage}%</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  id={`view-subject-${sub.code}`}
                  onClick={() => setSelectedSubject(sub)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-800 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Subject Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/40 text-indigo-200 font-bold">
                      {selectedSubject.code}
                    </span>
                    <span className="text-xs text-slate-300">
                      Semester {selectedSubject.semester}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {selectedSubject.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Teacher Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Course Instructor
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedSubject.teacherName}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Department of {selectedSubject.department}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                  Active Faculty
                </span>
              </div>

              {/* Subject Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Course Overview & Syllabus
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedSubject.description}
                </p>
              </div>

              {/* Assignments in this Subject */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                    Assignments ({getSubjectAssignments(selectedSubject.id).length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedSubject(null);
                      onNavigateTab('assignments');
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    View All in Assignments Tab &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {getSubjectAssignments(selectedSubject.id).map((asg) => (
                    <div
                      key={asg.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{asg.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Due:{' '}
                          {new Date(asg.dueDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          &bull; Max Marks: {asg.maxMarks}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSubject(null);
                          onOpenPdf({
                            title: asg.title,
                            fileName: asg.fileName,
                            subjectName: asg.subjectName,
                            type: 'Assignment PDF',
                            uploadedBy: asg.teacherName,
                            description: asg.description,
                            fileUrl: asg.fileUrl,
                            fileSize: asg.fileSize,
                          });
                        }}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg text-xs transition-colors"
                      >
                        View PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Materials for this Subject */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookText className="w-3.5 h-3.5 text-indigo-600" />
                    Lab Manuals & Materials ({getSubjectLabMaterials(selectedSubject.id).length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {getSubjectLabMaterials(selectedSubject.id).map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{mat.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {mat.type} &bull; {mat.fileSize} &bull; By {mat.uploadedBy}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSubject(null);
                          onOpenPdf({
                            title: mat.title,
                            fileName: mat.fileName,
                            subjectName: mat.subjectName,
                            type: mat.type,
                            uploadedBy: mat.uploadedBy,
                            description: mat.description,
                            fileUrl: mat.fileUrl,
                            fileSize: mat.fileSize,
                          });
                        }}
                        className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-lg text-xs transition-colors"
                      >
                        Open Material
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessments */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                  Scheduled Examinations
                </h4>
                <div className="space-y-2">
                  {getSubjectAssessments(selectedSubject.id).map((ass) => (
                    <div
                      key={ass.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{ass.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Date: {ass.date} &bull; Max Marks: {ass.maxMarks} &bull; Venue: {ass.venue || 'Academic Block'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ass.status === 'Upcoming'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ass.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
