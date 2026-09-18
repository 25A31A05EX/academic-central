import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  GraduationCap,
  History,
  BookOpen,
  Calendar,
  Sparkles,
  Layers,
  Save,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { SemesterResult, SubjectGrade } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminSemesterResults: React.FC = () => {
  const { students, semesterResults } = useAcademicData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<SemesterResult | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState(students[0]?.id || 'stud-1');
  const [semester, setSemester] = useState(1);
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [sgpa, setSgpa] = useState<string>('8.50');
  const [resultStatus, setResultStatus] = useState<'Pass' | 'Fail' | 'Promoted'>('Pass');
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().split('T')[0]);

  // Subjects Array for the result
  const [subjectsList, setSubjectsList] = useState<SubjectGrade[]>([
    { code: 'CS101', name: 'Programming in C', grade: 'O', credits: 4, points: 10, marks: 95, maxMarks: 100 },
    { code: 'MA101', name: 'Engineering Mathematics I', grade: 'A+', credits: 4, points: 9, marks: 88, maxMarks: 100 },
    { code: 'PH101', name: 'Engineering Physics', grade: 'A', credits: 4, points: 8, marks: 82, maxMarks: 100 },
  ]);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<SemesterResult | null>(null);

  // Quick helper to convert grade to points
  const gradeToPoints = (grade: string): number => {
    switch (grade) {
      case 'O': return 10;
      case 'A+': return 9;
      case 'A': return 8;
      case 'B+': return 7;
      case 'B': return 6;
      case 'C': return 5;
      case 'F': return 0;
      default: return 8;
    }
  };

  // Quick helper to convert marks to suggested grade
  const marksToGrade = (marks: number): string => {
    if (marks >= 90) return 'O';
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B+';
    if (marks >= 55) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
  };

  // Recalculate SGPA dynamically based on subjects
  const calculateDerivedSgpa = (subs: SubjectGrade[]) => {
    let totalCredits = 0;
    let totalPoints = 0;
    subs.forEach((s) => {
      const cr = Number(s.credits) || 0;
      const pt = Number(s.points) || 0;
      totalCredits += cr;
      totalPoints += cr * pt;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '8.00';
  };

  const handleAddSubjectRow = () => {
    const newSubject: SubjectGrade = {
      code: `CS${Math.floor(100 + Math.random() * 899)}`,
      name: 'New Course Subject',
      credits: 4,
      marks: 85,
      maxMarks: 100,
      grade: 'A',
      points: 8,
    };
    const updated = [...subjectsList, newSubject];
    setSubjectsList(updated);
    setSgpa(calculateDerivedSgpa(updated));
  };

  const handleRemoveSubjectRow = (index: number) => {
    const updated = subjectsList.filter((_, i) => i !== index);
    setSubjectsList(updated);
    setSgpa(calculateDerivedSgpa(updated));
  };

  const handleSubjectChange = (index: number, field: keyof SubjectGrade, val: any) => {
    const updated = [...subjectsList];
    const item = { ...updated[index], [field]: val };

    if (field === 'marks') {
      const m = Number(val) || 0;
      const g = marksToGrade(m);
      item.grade = g;
      item.points = gradeToPoints(g);
    } else if (field === 'grade') {
      item.points = gradeToPoints(val);
    }

    updated[index] = item;
    setSubjectsList(updated);
    setSgpa(calculateDerivedSgpa(updated));
  };

  const openAddModal = () => {
    setEditingResult(null);
    setStudentId(students[0]?.id || 'stud-1');
    setSemester(1);
    setAcademicYear('2024-2025');
    setPublishedDate(new Date().toISOString().split('T')[0]);
    setResultStatus('Pass');

    const defaultSubs: SubjectGrade[] = [
      { code: 'CS101', name: 'Programming for Problem Solving in C', grade: 'O', credits: 4, points: 10, marks: 95, maxMarks: 100 },
      { code: 'MA101', name: 'Engineering Mathematics I', grade: 'A+', credits: 4, points: 9, marks: 88, maxMarks: 100 },
      { code: 'PH101', name: 'Engineering Physics', grade: 'A', credits: 4, points: 8, marks: 82, maxMarks: 100 },
      { code: 'EE101', name: 'Basic Electrical Engineering', grade: 'B+', credits: 3, points: 7, marks: 76, maxMarks: 100 },
      { code: 'CS102', name: 'Computer Programming Laboratory', grade: 'O', credits: 2, points: 10, marks: 98, maxMarks: 100 },
    ];
    setSubjectsList(defaultSubs);
    setSgpa(calculateDerivedSgpa(defaultSubs));
    setIsModalOpen(true);
  };

  const openEditModal = (res: SemesterResult) => {
    setEditingResult(res);
    setStudentId(res.studentId);
    setSemester(res.semester);
    setAcademicYear(res.academicYear);
    setSgpa(res.sgpa.toFixed(2));
    setResultStatus(res.resultStatus);
    setPublishedDate(res.publishedDate || new Date().toISOString().split('T')[0]);
    setSubjectsList(
      res.subjects && res.subjects.length > 0
        ? res.subjects.map((s) => ({
            ...s,
            marks: s.marks ?? 85,
            maxMarks: s.maxMarks ?? 100,
          }))
        : []
    );
    setIsModalOpen(true);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();

    let totalCredits = 0;
    let earnedCredits = 0;
    subjectsList.forEach((s) => {
      const cr = Number(s.credits) || 0;
      totalCredits += cr;
      if (s.grade !== 'F') earnedCredits += cr;
    });

    const parsedSgpa = Number(sgpa) || 8.0;

    if (editingResult) {
      storage.updateSemesterResult(editingResult.id, {
        semester: Number(semester),
        academicYear,
        sgpa: parsedSgpa,
        creditsRegistered: totalCredits,
        creditsEarned: earnedCredits,
        resultStatus,
        publishedDate,
        subjects: subjectsList,
      });
    } else {
      storage.addSemesterResult({
        studentId,
        semester: Number(semester),
        academicYear,
        sgpa: parsedSgpa,
        creditsRegistered: totalCredits,
        creditsEarned: earnedCredits,
        resultStatus,
        publishedDate,
        subjects: subjectsList,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      storage.deleteSemesterResult(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Filter results
  const filteredResults = semesterResults.filter((res) => {
    const student = students.find((s) => s.id === res.studentId);
    const studentName = student ? student.name.toLowerCase() : '';
    const rollNumber = student ? student.rollNumber.toLowerCase() : '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      studentName.includes(q) ||
      rollNumber.includes(q) ||
      res.academicYear.toLowerCase().includes(q) ||
      `semester ${res.semester}`.includes(q);

    const matchesStudent = selectedStudentFilter === 'all' || res.studentId === selectedStudentFilter;
    const matchesSemester = semesterFilter === 'all' || String(res.semester) === semesterFilter;

    return matchesSearch && matchesStudent && matchesSemester;
  });

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Institutional Academic Records Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Semester Results & Academic History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish, edit, and audit student semester marks, grade points, SGPA, and cumulative CGPA.
          </p>
        </div>

        <button
          id="add-semester-result-btn"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Semester Result</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-semester-results"
            type="text"
            placeholder="Search student, roll number, year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Student Filter */}
          <select
            id="filter-student-select"
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Students ({students.length})</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.rollNumber})
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            id="filter-semester-select"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4 text-center">SGPA</th>
                <th className="py-3 px-4 text-center">Credits (Earned / Reg.)</th>
                <th className="py-3 px-4 text-center">Subjects</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No semester results found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => {
                  const student = students.find((s) => s.id === res.studentId);
                  return (
                    <tr
                      key={res.id}
                      id={`row-semester-result-${res.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {student?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student?.name || res.studentId}</p>
                            <p className="text-[11px] text-slate-500">{student?.rollNumber || '-'} &bull; {student?.branch || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold">
                          Semester {res.semester}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {res.academicYear}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm font-black text-indigo-700">
                          {res.sgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {res.creditsEarned} / {res.creditsRegistered}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {res.subjects?.length || 0} courses
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            res.resultStatus === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {res.resultStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-res-${res.id}`}
                            onClick={() => openEditModal(res)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Semester Result"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-res-${res.id}`}
                            onClick={() => setDeleteTarget(res)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Semester Result"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingResult ? 'Edit Semester Result' : 'Publish New Semester Result'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in subject grades, marks, and credit allocations.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveResult} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student *
                  </label>
                  <select
                    id="modal-student-select"
                    disabled={!!editingResult}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100"
                    required
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber} - {s.branch})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester Number *
                  </label>
                  <select
                    id="modal-semester-select"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        Semester {n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Year *
                  </label>
                  <input
                    id="modal-academic-year"
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2024-2025"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Published Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Published Date
                  </label>
                  <input
                    id="modal-published-date"
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Subject Breakdown Editor */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Subject Marks & Grade Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Enter marks or grades. SGPA will be auto-calculated.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubjectRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {subjectsList.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs"
                    >
                      <input
                        type="text"
                        value={sub.code}
                        onChange={(e) => handleSubjectChange(idx, 'code', e.target.value)}
                        placeholder="Code"
                        className="w-20 p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                        required
                      />
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                        placeholder="Subject Name"
                        className="flex-1 p-1.5 rounded-lg border border-slate-200 bg-white min-w-[120px]"
                        required
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Credits:</span>
                        <input
                          type="number"
                          value={sub.credits}
                          min={1}
                          max={6}
                          onChange={(e) => handleSubjectChange(idx, 'credits', Number(e.target.value))}
                          className="w-12 p-1.5 rounded-lg border border-slate-200 bg-white text-center"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Marks:</span>
                        <input
                          type="number"
                          value={sub.marks ?? 85}
                          min={0}
                          max={100}
                          onChange={(e) => handleSubjectChange(idx, 'marks', Number(e.target.value))}
                          className="w-14 p-1.5 rounded-lg border border-slate-200 bg-white text-center font-bold"
                          required
                        />
                      </div>
                      <select
                        value={sub.grade}
                        onChange={(e) => handleSubjectChange(idx, 'grade', e.target.value)}
                        className="w-16 p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-center"
                      >
                        <option value="O">O (10)</option>
                        <option value="A+">A+ (9)</option>
                        <option value="A">A (8)</option>
                        <option value="B+">B+ (7)</option>
                        <option value="B">B (6)</option>
                        <option value="C">C (5)</option>
                        <option value="F">F (0)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectRow(idx)}
                        disabled={subjectsList.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SGPA Calculation & Result Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-bold text-indigo-900 mb-1">
                    Calculated SGPA (Override if needed)
                  </label>
                  <input
                    id="modal-sgpa-input"
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={sgpa}
                    onChange={(e) => setSgpa(e.target.value)}
                    className="w-full text-sm font-black p-2 rounded-xl border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-900 mb-1">
                    Result Status
                  </label>
                  <select
                    id="modal-status-select"
                    value={resultStatus}
                    onChange={(e) => setResultStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Pass">Pass</option>
                    <option value="Promoted">Promoted with Backlog</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-semester-result-submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingResult ? 'Save Changes' : 'Publish Result'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Semester Result"
        message={`Are you sure you want to delete the Semester ${deleteTarget?.semester} record? Student CGPA will be automatically recalculated.`}
        confirmText="Delete Record"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
