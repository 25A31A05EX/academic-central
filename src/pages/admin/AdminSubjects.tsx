import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { Subject } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminSubjects: React.FC = () => {
  const { subjects, teachers } = useAcademicData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState(4);
  const [credits, setCredits] = useState(4);
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [description, setDescription] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setCode(`CS40${subjects.length + 1}`);
    setDepartment('Computer Science');
    setSemester(4);
    setCredits(4);
    setTeacherId(teachers[0]?.id || '');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setDepartment(sub.department);
    setSemester(sub.semester);
    setCredits(sub.credits);
    setTeacherId(sub.teacherId);
    setDescription(sub.description);
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedTeacher = teachers.find((t) => t.id === teacherId) || teachers[0];

    if (editingSubject) {
      storage.updateSubject(editingSubject.id, {
        name,
        code,
        department,
        semester: Number(semester),
        credits: Number(credits),
        teacherId: assignedTeacher.id,
        teacherName: assignedTeacher.name,
        description,
      });
    } else {
      storage.addSubject({
        name,
        code,
        department,
        semester: Number(semester),
        credits: Number(credits),
        teacherId: assignedTeacher.id,
        teacherName: assignedTeacher.name,
        description,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      storage.deleteSubject(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (s.name || '').toLowerCase().includes(q);
    const codeMatch = (s.code || '').toLowerCase().includes(q);
    const teacherMatch = (s.teacherName || (s as any).teacher_name || '').toLowerCase().includes(q);
    return nameMatch || codeMatch || teacherMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Curriculum & Subject Catalogue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course codes, credit weightages, semester structures, and designated instructors
          </p>
        </div>

        <button
          id="btn-add-subject"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subjects by name, course code, or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Subject Name</th>
                <th className="py-3.5 px-4">Course Code</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-3 text-center">Semester</th>
                <th className="py-3.5 px-3 text-center">Credits</th>
                <th className="py-3.5 px-4">Designated Faculty</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sub.name}</td>

                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                    <span className="px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">
                      {sub.code}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">{sub.department}</td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    Sem {sub.semester}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {sub.credits} Credits
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sub.teacherName}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Subject"
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

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingSubject ? 'Edit Subject Details' : 'Register New Subject'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS405"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Course Faculty
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Syllabus Overview & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of course modules, prerequisites, and learning objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
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
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Course From Curriculum"
        message={`Are you sure you want to delete ${deleteTarget?.name} (${deleteTarget?.code})? Associated marks and assignment records will be unlinked.`}
        confirmText="Confirm Deletion"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
