import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { StudentProfile } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminStudents: React.FC = () => {
  const { students } = useAcademicData();

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [year, setYear] = useState('2nd Year');
  const [section, setSection] = useState('A');
  const [semester, setSemester] = useState(4);
  const [cgpa, setCgpa] = useState(8.2);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<StudentProfile | null>(null);

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setRollNumber(`23CS${Math.floor(100 + Math.random() * 899)}`);
    setBranch('Computer Science');
    setYear('2nd Year');
    setSection('A');
    setSemester(4);
    setCgpa(8.0);
    setIsModalOpen(true);
  };

  const openEditModal = (stud: StudentProfile) => {
    setEditingStudent(stud);
    setName(stud.name);
    setEmail(stud.email);
    setRollNumber(stud.rollNumber);
    setBranch(stud.branch);
    setYear(stud.year);
    setSection(stud.section);
    setSemester(stud.semester);
    setCgpa(stud.cgpa || 8.0);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudent) {
      storage.updateStudent(editingStudent.id, {
        name,
        email,
        rollNumber,
        branch,
        year,
        section,
        semester: Number(semester),
        cgpa: Number(cgpa),
      });
    } else {
      storage.addStudent({
        userId: `user-${Date.now()}`,
        name,
        email,
        rollNumber,
        branch,
        year,
        section,
        semester: Number(semester),
        cgpa: Number(cgpa),
        status: 'Active',
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      storage.deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNumber || (s as any).roll_number || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q);

    const matchesBranch = branchFilter === 'all' || s.branch === branchFilter;
    const matchesSection = sectionFilter === 'all' || s.section === sectionFilter;

    return matchesSearch && matchesBranch && matchesSection;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Cohort Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student enrollments, institutional roll allocations, and academic standings
          </p>
        </div>

        <button
          id="btn-add-student"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white"
          >
            <option value="all">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Student Profile</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Branch & Semester</th>
                <th className="py-3.5 px-3 text-center">Section</th>
                <th className="py-3.5 px-3 text-center">CGPA</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((stud) => (
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
                    {stud.branch} &bull; Sem {stud.semester}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {stud.section}
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700">
                    {stud.cgpa || 8.0}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {stud.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(stud)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(stud)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Deactivate / Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="aditi.rao@academiccentral.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="23CS105"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Section
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                >
                  {editingStudent ? 'Update Records' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Deactivate Student Roster Entry"
        message={`Are you sure you want to remove ${deleteTarget?.name} (${deleteTarget?.rollNumber}) from the active cohort? This action is logged in institutional audit logs.`}
        confirmText="Confirm Deletion"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
