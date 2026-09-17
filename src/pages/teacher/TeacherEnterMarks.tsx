import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Save,
  CheckCircle2,
  AlertCircle,
  Calculator,
  UserCheck,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { AssessmentType } from '../../types';

export const TeacherEnterMarks: React.FC = () => {
  const { subjects, students, marks, teachers } = useAcademicData();
  const currentTeacher = teachers[0] || {
    id: 'teach-1',
    name: 'Dr. Priya Kumar',
  };

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Mid-1');
  const [editableScores, setEditableScores] = useState<Record<string, number>>({});
  const [editableRemarks, setEditableRemarks] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Maximum marks mapping
  const maxMarksMap: Record<AssessmentType, number> = {
    'Mid-1': 30,
    'Mid-2': 30,
    'Class Test': 20,
    Assignment: 10,
    'Lab Internal': 20,
  };

  const maxMarks = maxMarksMap[assessmentType] || 30;
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Populate initial scores when subject or assessment type changes
  useEffect(() => {
    const scores: Record<string, number> = {};
    const remarks: Record<string, string> = {};

    students.forEach((student) => {
      const existing = marks.find(
        (m) => m.studentId === student.id && m.subjectId === selectedSubjectId
      );

      if (existing) {
        let val = 0;
        if (assessmentType === 'Mid-1') val = existing.mid1;
        else if (assessmentType === 'Mid-2') val = existing.mid2;
        else if (assessmentType === 'Class Test') val = existing.classTest;
        else if (assessmentType === 'Assignment') val = existing.assignment;
        else if (assessmentType === 'Lab Internal') val = existing.labInternal;

        scores[student.id] = val;
        remarks[student.id] = existing.remarks || 'Satisfactory';
      } else {
        scores[student.id] = Math.round(maxMarks * 0.8);
        remarks[student.id] = 'Active participation';
      }
    });

    setEditableScores(scores);
    setEditableRemarks(remarks);
    setErrors({});
  }, [selectedSubjectId, assessmentType, marks, students, maxMarks]);

  const handleScoreChange = (studentId: string, valStr: string) => {
    const val = Number(valStr);
    const newErrors = { ...errors };

    if (isNaN(val)) {
      newErrors[studentId] = 'Must be a valid number';
    } else if (val < 0) {
      newErrors[studentId] = 'Cannot be negative';
    } else if (val > maxMarks) {
      newErrors[studentId] = `Cannot exceed maximum (${maxMarks})`;
    } else {
      delete newErrors[studentId];
    }

    setErrors(newErrors);
    setEditableScores({
      ...editableScores,
      [studentId]: val,
    });
  };

  const handleRemarksChange = (studentId: string, text: string) => {
    setEditableRemarks({
      ...editableRemarks,
      [studentId]: text,
    });
  };

  const handleSaveAllMarks = () => {
    if (Object.keys(errors).length > 0) {
      alert('Please correct validation errors before saving marks.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      students.forEach((student) => {
        const score = editableScores[student.id] !== undefined ? editableScores[student.id] : 0;
        const remark = editableRemarks[student.id] || '';

        storage.updateStudentMarks(
          student.id,
          selectedSubjectId,
          assessmentType,
          score,
          remark,
          currentTeacher.name
        );
      });

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Marks Evaluation Entry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grade cohorts across Continuous Internal Evaluation (CIE) components with real-time audit
            synchronization
          </p>
        </div>

        <button
          id="btn-save-all-marks"
          onClick={handleSaveAllMarks}
          disabled={isSaving || Object.keys(errors).length > 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          {isSaving ? (
            <span>Saving Records...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Marks</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 shadow-xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Institutional Marksheet Updated Successfully!</p>
            <p className="text-emerald-700 text-[11px] mt-0.5">
              All enrolled students can view their updated grade cards immediately. Audit log event
              recorded under {currentTeacher.name}.
            </p>
          </div>
        </div>
      )}

      {/* Control Configuration Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Course Subject
          </label>
          <select
            id="marks-subject-select"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Evaluation Assessment Type
          </label>
          <select
            id="marks-assessment-select"
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
          >
            <option value="Mid-1">Mid Examination 1 (Max: 30)</option>
            <option value="Mid-2">Mid Examination 2 (Max: 30)</option>
            <option value="Class Test">Continuous Class Test (Max: 20)</option>
            <option value="Assignment">Coursework Assignment (Max: 10)</option>
            <option value="Lab Internal">Laboratory Practical CIE (Max: 20)</option>
          </select>
        </div>

        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-[10px] uppercase font-bold text-indigo-900 tracking-wider">
              Component Maximum
            </span>
            <p className="text-sm font-black text-indigo-700">
              {maxMarks} Marks Maximum
            </p>
            <p className="text-[10px] text-indigo-600">Enforced validation on input</p>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Cohort Marksheet: {currentSubject?.name} &bull; {assessmentType}
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {students.length} Enrolled Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4 text-center">Marks Input</th>
                <th className="py-3.5 px-3 text-center">Maximum Marks</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stud) => {
                const currentScore = editableScores[stud.id] ?? 0;
                const err = errors[stud.id];

                return (
                  <tr key={stud.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {stud.rollNumber}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {stud.name.charAt(0)}
                        </div>
                        <span>{stud.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block relative">
                        <input
                          id={`input-mark-${stud.rollNumber}`}
                          type="number"
                          min={0}
                          max={maxMarks}
                          value={currentScore}
                          onChange={(e) => handleScoreChange(stud.id, e.target.value)}
                          className={`w-24 text-center py-1.5 px-2 font-mono font-bold rounded-lg border text-sm transition-all ${
                            err
                              ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                              : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20'
                          }`}
                        />
                        {err && (
                          <span className="block text-[10px] text-rose-600 font-semibold mt-1">
                            {err}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-500">
                      / {maxMarks}
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        placeholder="e.g. Excellent analytical performance"
                        value={editableRemarks[stud.id] || ''}
                        onChange={(e) => handleRemarksChange(stud.id, e.target.value)}
                        className="w-full max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          currentScore >= maxMarks * 0.75
                            ? 'bg-emerald-50 text-emerald-700'
                            : currentScore >= maxMarks * 0.5
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {Math.round((currentScore / maxMarks) * 100)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400" />
            <span>
              Changes are immediately synchronized to students' Continuous Internal Evaluation tables.
            </span>
          </div>

          <button
            onClick={handleSaveAllMarks}
            disabled={isSaving || Object.keys(errors).length > 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-end sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Confirm & Save All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
