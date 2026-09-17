import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  FileText,
  UploadCloud,
  Eye,
  Award,
  Search,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { Assignment, Submission } from '../../types';

interface TeacherAssignmentsProps {
  onOpenPdf: (doc: any) => void;
}

export const TeacherAssignments: React.FC<TeacherAssignmentsProps> = ({ onOpenPdf }) => {
  const { assignments, subjects, teachers, submissions, students } = useAcademicData();
  const currentTeacher = teachers[0] || {
    id: 'teach-1',
    name: 'Dr. Priya Kumar',
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeSubmissionAssignment, setActiveSubmissionAssignment] =
    useState<Assignment | null>(null);

  // Form State for creating assignment
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(10);
  const [fileName, setFileName] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  // Grading state for submissions
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingFeedback, setGradingFeedback] = useState<Record<string, string>>({});
  const [savedSubId, setSavedSubId] = useState<string | null>(null);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

    const generatedFileName =
      fileName || `${subj.code}_Assignment_${Date.now().toString().slice(-4)}.pdf`;

    storage.addAssignment({
      title,
      subjectId: subj.id,
      subjectName: subj.name,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.name,
      description,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      maxMarks: Number(maxMarks) || 10,
      fileName: generatedFileName,
      fileSize: '1.4 MB',
      status: 'Published',
    });

    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setFileName('');
    }, 1200);
  };

  const handleSaveGrade = (submission: Submission, assignment: Assignment) => {
    const score = gradingScores[submission.id] !== undefined ? gradingScores[submission.id] : 9;
    const feedback = gradingFeedback[submission.id] || 'Well documented code and logic.';

    storage.evaluateSubmission(submission.id, score, feedback);
    setSavedSubId(submission.id);

    setTimeout(() => {
      setSavedSubId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Assignment Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Post problem statements, configure deadlines, and review student code submissions
          </p>
        </div>

        <button
          id="btn-create-assignment"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((asg) => {
          const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
          const gradedCount = asgSubmissions.filter((s) => s.status === 'Evaluated').length;

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 font-mono">
                      {asg.subjectName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      {asg.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Instructor: {asg.teacherName}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Uploaded: {new Date(asg.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Due: {new Date(asg.dueDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-indigo-700">
                      Max Marks: {asg.maxMarks}
                    </span>
                    <span className="text-slate-600 font-medium">
                      Submissions: <strong>{asgSubmissions.length}</strong> (Graded: {gradedCount})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                  <button
                    onClick={() =>
                      onOpenPdf({
                        title: asg.title,
                        fileName: asg.fileName,
                        subjectName: asg.subjectName,
                        type: 'Assignment PDF',
                        uploadedBy: asg.teacherName,
                        description: asg.description,
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>View PDF</span>
                  </button>

                  <button
                    id={`btn-view-subs-${asg.id}`}
                    onClick={() => setActiveSubmissionAssignment(asg)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Submissions ({asgSubmissions.length})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submissions Review Modal */}
      {activeSubmissionAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-xs text-indigo-300 font-mono">
                  {activeSubmissionAssignment.subjectName}
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  Student Submissions: {activeSubmissionAssignment.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Maximum Evaluation Marks: {activeSubmissionAssignment.maxMarks}
                </p>
              </div>
              <button
                onClick={() => setActiveSubmissionAssignment(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {submissions.filter((s) => s.assignmentId === activeSubmissionAssignment.id).length ===
              0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No submissions uploaded yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Switch to student mode to test submitting coursework.
                  </p>
                </div>
              ) : (
                submissions
                  .filter((s) => s.assignmentId === activeSubmissionAssignment.id)
                  .map((sub) => {
                    const isSaved = savedSubId === sub.id;

                    return (
                      <div
                        key={sub.id}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {sub.studentName}
                              </span>
                              <span className="text-[11px] font-mono px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded">
                                {sub.rollNumber}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                                  sub.status === 'Evaluated'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Submitted:{' '}
                              {new Date(sub.submittedAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              &bull; File: <span className="font-mono">{sub.fileName}</span>
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              onOpenPdf({
                                title: `Submission: ${sub.studentName} (${sub.rollNumber})`,
                                fileName: sub.fileName,
                                subjectName: activeSubmissionAssignment.subjectName,
                                type: 'Student Submission',
                                uploadedBy: sub.studentName,
                                description: sub.notes || 'Solution source files and test logs.',
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Work</span>
                          </button>
                        </div>

                        {sub.notes && (
                          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                            <strong>Student notes:</strong> {sub.notes}
                          </div>
                        )}

                        {/* Grading Inputs */}
                        <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                              Enter Marks (Max: {activeSubmissionAssignment.maxMarks})
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={activeSubmissionAssignment.maxMarks}
                              defaultValue={
                                sub.obtainedMarks !== undefined ? sub.obtainedMarks : 9
                              }
                              onChange={(e) =>
                                setGradingScores({
                                  ...gradingScores,
                                  [sub.id]: Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                              Evaluation Feedback
                            </label>
                            <input
                              type="text"
                              defaultValue={
                                sub.feedback || 'Clean modular implementation; edge cases handled.'
                              }
                              onChange={(e) =>
                                setGradingFeedback({
                                  ...gradingFeedback,
                                  [sub.id]: e.target.value,
                                })
                              }
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                            />
                          </div>

                          <div>
                            <button
                              onClick={() => handleSaveGrade(sub, activeSubmissionAssignment)}
                              className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              {isSaved ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  <span>Grade Saved!</span>
                                </>
                              ) : (
                                <span>Save & Notify Student</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveSubmissionAssignment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close Submissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Publish New Coursework Assignment
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">
                  Assignment Published to Students!
                </h4>
                <p className="text-xs text-slate-500">
                  Notification dispatched to enrolled cohort and logged in audit trail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Binary Search Trees & AVL Balancing"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assignment Description & Objectives
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain the requirements, programming language versions, and test criteria..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Maximum Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* PDF Simulation Attachment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Upload Assignment PDF Document
                  </label>
                  <div className="p-3 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 text-center cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800">
                      {fileName || 'Drop assignment question paper PDF here'}
                    </p>
                    <input
                      type="text"
                      placeholder="Optional custom filename (e.g. DS_Lab_Asg_3.pdf)"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="mt-2 w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                  >
                    Publish Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
