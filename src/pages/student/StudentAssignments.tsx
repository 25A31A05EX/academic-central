import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Calendar,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  X,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { Assignment, AssignmentStatus } from '../../types';

interface StudentAssignmentsProps {
  onOpenPdf: (doc: any) => void;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({ onOpenPdf }) => {
  const { assignments, submissions, subjects, students } = useAcademicData();
  const currentStudent = students[0] || {
    id: 'stud-1',
    name: 'Rahul Sharma',
    rollNumber: '23CS101',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Submit Assignment Modal state
  const [activeSubmissionAssignment, setActiveSubmissionAssignment] =
    useState<Assignment | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Derive status for current student
  const getSubmissionForAssignment = (asgId: string) => {
    return submissions.find(
      (s) => s.assignmentId === asgId && (s.studentId === currentStudent.id || s.studentId === 'stud-1')
    );
  };

  const calculateDisplayStatus = (asg: Assignment): AssignmentStatus => {
    const sub = getSubmissionForAssignment(asg.id);
    if (sub) {
      return sub.status === 'Evaluated' ? 'Completed' : 'Submitted';
    }
    const dueTime = new Date(asg.dueDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = (dueTime - nowTime) / (1000 * 3600 * 24);

    if (diffDays < 3 && diffDays > 0) return 'Due Soon';
    if (diffDays <= 0) return 'Pending';
    return 'Pending';
  };

  const filteredAssignments = assignments.filter((asg) => {
    const matchesSearch =
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === 'all' || asg.subjectId === selectedSubjectFilter;

    const status = calculateDisplayStatus(asg);
    const matchesStatus =
      selectedStatusFilter === 'all' || status === selectedStatusFilter;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleOpenSubmitModal = (asg: Assignment) => {
    setActiveSubmissionAssignment(asg);
    setUploadFileName(`Rahul_Sharma_${currentStudent.rollNumber}_${asg.title.slice(0, 15).replace(/\s+/g, '_')}.pdf`);
    setUploadNotes('');
    setSubmitSuccess(false);
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmissionAssignment) return;

    setIsSubmitting(true);
    setTimeout(() => {
      storage.submitAssignment(
        activeSubmissionAssignment.id,
        currentStudent.id,
        currentStudent.name,
        currentStudent.rollNumber,
        uploadFileName,
        uploadNotes
      );
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveSubmissionAssignment(null);
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Coursework Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit coursework, download problem sheets, and review evaluation feedback
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments by title, topic, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Due Soon">Due Soon</option>
            <option value="Submitted">Submitted</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No assignments match criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or subject filters.
            </p>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const status = calculateDisplayStatus(asg);
            const submission = getSubmissionForAssignment(asg.id);

            const statusStyles = {
              Pending: 'bg-slate-100 text-slate-700 border-slate-200',
              'Due Soon': 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
              Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
              Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            };

            return (
              <div
                key={asg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        {asg.subjectName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Posted by {asg.teacherName}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{asg.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Uploaded: {new Date(asg.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Due:{' '}
                        {new Date(asg.dueDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>Max Marks: {asg.maxMarks}</span>
                    </div>

                    {submission && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Submitted File: {submission.fileName}
                        </p>
                        {submission.obtainedMarks !== undefined && (
                          <p className="text-emerald-700 font-bold">
                            Evaluation Score: {submission.obtainedMarks} / {asg.maxMarks}
                            {submission.feedback && ` — Feedback: "${submission.feedback}"`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      id={`view-pdf-${asg.id}`}
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
                      id={`submit-asg-${asg.id}`}
                      onClick={() => handleOpenSubmitModal(asg)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{submission ? 'Resubmit Work' : 'Submit Assignment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {activeSubmissionAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Assignment Solution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeSubmissionAssignment.title} &bull; {activeSubmissionAssignment.subjectName}
                </p>
              </div>
              <button
                onClick={() => setActiveSubmissionAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">
                  Assignment Submitted Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Faculty notification and timestamp logged in audit trail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAssignment} className="mt-4 space-y-4">
                {/* File Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Upload Solution PDF / Archive
                  </label>
                  <div className="p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl bg-indigo-50/40 text-center cursor-pointer transition-colors">
                    <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800">
                      {uploadFileName || 'Click or drop PDF / ZIP file here'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Accepted formats: PDF, DOCX, ZIP (Up to 25MB)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Document Filename
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Notes / Implementation Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe algorithm edge cases tested or compiler environment..."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubmissionAssignment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm & Submit</span>
                      </>
                    )}
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
