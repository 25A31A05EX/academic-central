import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  BookOpen,
  Eye,
  Power,
  UserCheck,
  UserX,
  Award,
  Briefcase,
  Filter,
  Check,
  Building2,
  FileBadge,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { TeacherProfile } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminTeachers: React.FC = () => {
  const { teachers, subjects } = useAcademicData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<TeacherProfile | null>(null);
  const [statusActionTarget, setStatusActionTarget] = useState<TeacherProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherProfile | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('Ph.D, M.Tech');
  const [experience, setExperience] = useState('5 Years');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'On Leave'>('Active');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    // Add defaults if missing
    set.add('Computer Science & Engineering');
    set.add('Information Technology');
    set.add('Electronics & Communication');
    return Array.from(set);
  }, [teachers]);

  // Open Add Teacher Modal
  const openAddModal = () => {
    setEditingTeacher(null);
    setName('');
    const randomCode = Math.floor(100 + Math.random() * 899);
    setEmployeeId(`EMP-CS-${randomCode}`);
    setEmail('');
    setPhone('+91 98450 ' + Math.floor(10000 + Math.random() * 89999));
    setDepartment('Computer Science & Engineering');
    setDesignation('Assistant Professor');
    setQualification('Ph.D, M.Tech');
    setExperience('5 Years');
    setStatus('Active');
    // Pre-select first subject if available
    setSelectedSubjectIds(subjects.length > 0 ? [subjects[0].id] : []);
    setIsModalOpen(true);
  };

  // Open Edit Teacher Modal
  const openEditModal = (t: TeacherProfile) => {
    setEditingTeacher(t);
    setName(t.name);
    setEmployeeId(t.employeeId || `EMP-CS-${Date.now().toString().slice(-3)}`);
    setEmail(t.email);
    setPhone(t.phone || '');
    setDepartment(t.department);
    setDesignation(t.designation);
    setQualification(t.qualification || 'M.Tech');
    setExperience(t.experience || '4 Years');
    setStatus(t.status || 'Active');

    // Resolve assigned subject IDs
    const ids: string[] = [];
    if (t.assignedSubjectIds && t.assignedSubjectIds.length > 0) {
      ids.push(...t.assignedSubjectIds);
    }
    if (t.subjectsAssigned && t.subjectsAssigned.length > 0) {
      t.subjectsAssigned.forEach((subName) => {
        const found = subjects.find((s) => s.name === subName || s.code === subName);
        if (found && !ids.includes(found.id)) {
          ids.push(found.id);
        }
      });
    }
    setSelectedSubjectIds(ids);
    setIsModalOpen(true);
  };

  // Save Teacher Form
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();

    const assignedSubjectNames = selectedSubjectIds
      .map((sid) => subjects.find((s) => s.id === sid)?.name)
      .filter((n): n is string => !!n);

    if (editingTeacher) {
      storage.updateTeacher(editingTeacher.id, {
        name,
        employeeId,
        email,
        phone,
        department,
        designation,
        qualification,
        experience,
        status,
        assignedSubjectIds: selectedSubjectIds,
        subjectsAssigned: assignedSubjectNames,
      });

      // Update viewing teacher if currently open
      if (viewingTeacher && viewingTeacher.id === editingTeacher.id) {
        setViewingTeacher({
          ...viewingTeacher,
          name,
          employeeId,
          email,
          phone,
          department,
          designation,
          qualification,
          experience,
          status,
          assignedSubjectIds: selectedSubjectIds,
          subjectsAssigned: assignedSubjectNames,
        });
      }
    } else {
      storage.addTeacher({
        userId: `user-teach-${Date.now()}`,
        name,
        employeeId,
        email,
        phone,
        department,
        designation,
        qualification,
        experience,
        status,
        assignedSubjectIds: selectedSubjectIds,
        subjectsAssigned: assignedSubjectNames,
      });
    }

    setIsModalOpen(false);
  };

  // Toggle Subject Selection in Form
  const toggleSubjectSelection = (subjectId: string) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subjectId));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subjectId]);
    }
  };

  // Toggle Status (Activate / Deactivate)
  const handleConfirmToggleStatus = () => {
    if (statusActionTarget) {
      const updated = storage.toggleTeacherStatus(statusActionTarget.id);
      if (viewingTeacher && viewingTeacher.id === statusActionTarget.id && updated) {
        setViewingTeacher(updated);
      }
      setStatusActionTarget(null);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      storage.deleteTeacher(deleteTarget.id);
      if (viewingTeacher && viewingTeacher.id === deleteTarget.id) {
        setViewingTeacher(null);
      }
      setDeleteTarget(null);
    }
  };

  // Copy email helper
  const handleCopyEmail = (emailStr: string) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedEmail(emailStr);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Helper to get formatted subjects list for a teacher
  const getTeacherSubjects = (teacher: TeacherProfile) => {
    const list: { id: string; code: string; name: string }[] = [];

    // From assignedSubjectIds
    if (Array.isArray(teacher.assignedSubjectIds)) {
      teacher.assignedSubjectIds.forEach((sid) => {
        const found = subjects.find((s) => s.id === sid);
        if (found && !list.some((item) => item.id === found.id)) {
          list.push({ id: found.id, code: found.code, name: found.name });
        }
      });
    }

    // From subjectsAssigned strings
    if (Array.isArray(teacher.subjectsAssigned)) {
      teacher.subjectsAssigned.forEach((subName) => {
        const found = subjects.find((s) => s.name === subName || s.code === subName);
        if (found) {
          if (!list.some((item) => item.id === found.id)) {
            list.push({ id: found.id, code: found.code, name: found.name });
          }
        } else if (!list.some((item) => item.name === subName)) {
          list.push({ id: subName, code: 'CRS', name: subName });
        }
      });
    }

    return list;
  };

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (t.name || '').toLowerCase().includes(q);
      const empMatch = (t.employeeId || (t as any).employee_id || '').toLowerCase().includes(q);
      const emailMatch = (t.email || '').toLowerCase().includes(q);
      const deptMatch = (t.department || '').toLowerCase().includes(q);

      // Search inside subjects as well
      const teacherSubs = getTeacherSubjects(t);
      const subMatch = teacherSubs.some(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );

      const matchesSearch = !q || nameMatch || empMatch || emailMatch || deptMatch || subMatch;

      const matchesDept = departmentFilter === 'all' || t.department === departmentFilter;

      const currentStatus = t.status || 'Active';
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [teachers, searchQuery, departmentFilter, statusFilter, subjects]);

  const activeCount = teachers.filter((t) => (t.status || 'Active') === 'Active').length;
  const inactiveCount = teachers.filter((t) => t.status === 'Inactive').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Admin</span>
            <span>&bull;</span>
            <span className="text-indigo-600">Faculty Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            Teacher Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage faculty profiles, employee credentials, department allocations, and teaching course assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-add-teacher"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Teacher</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Teachers</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{teachers.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Faculty</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inactive / On Leave</p>
            <p className="text-2xl font-extrabold text-slate-600 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Teacher Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-teacher"
            type="text"
            placeholder="Search by name, employee ID, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-department-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              id="filter-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({teachers.length})
            </button>
            <button
              id="filter-status-active"
              onClick={() => setStatusFilter('Active')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                statusFilter === 'Active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              id="filter-status-inactive"
              onClick={() => setStatusFilter('Inactive')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                statusFilter === 'Inactive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Teacher Name</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Assigned Subjects</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">No teachers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery
                        ? `No faculty matched "${searchQuery}". Try modifying your filter.`
                        : 'Click "Add Teacher" above to register faculty members.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => {
                  const teacherSubjects = getTeacherSubjects(t);
                  const isTeacherActive = (t.status || 'Active') === 'Active';
                  const empId = t.employeeId || (t as any).employee_id || 'EMP-CS-000';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Teacher Name & Designation */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {t.name ? t.name.charAt(0) : 'T'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {t.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {t.designation || 'Faculty Member'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {empId}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span className="truncate max-w-[180px] font-medium">{t.email}</span>
                          <button
                            onClick={() => handleCopyEmail(t.email)}
                            title="Copy Email"
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                          >
                            {copiedEmail === t.email ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {t.phone && (
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{t.phone}</span>
                          </p>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{t.department}</span>
                      </td>

                      {/* Assigned Subjects */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {teacherSubjects.length > 0 ? (
                            teacherSubjects.map((sub, idx) => (
                              <span
                                key={idx}
                                title={sub.name}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-100"
                              >
                                <span className="font-mono text-[9px] text-indigo-400 uppercase">{sub.code}:</span>
                                <span className="truncate max-w-[110px]">{sub.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">None assigned</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isTeacherActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Teacher */}
                          <button
                            id={`btn-view-${t.id}`}
                            onClick={() => setViewingTeacher(t)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Teacher Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Teacher */}
                          <button
                            id={`btn-edit-${t.id}`}
                            onClick={() => openEditModal(t)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Teacher Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate Teacher */}
                          <button
                            id={`btn-toggle-status-${t.id}`}
                            onClick={() => setStatusActionTarget(t)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isTeacherActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isTeacherActive ? 'Deactivate Teacher' : 'Activate Teacher'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Delete Teacher */}
                          <button
                            id={`btn-delete-${t.id}`}
                            onClick={() => setDeleteTarget(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Teacher Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ========================================================================= */}
      {/* 1. VIEW TEACHER MODAL                                                     */}
      {/* ========================================================================= */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-base shadow-md shadow-indigo-600/20">
                  {viewingTeacher.name ? viewingTeacher.name.charAt(0) : 'T'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{viewingTeacher.name}</h3>
                    {(viewingTeacher.status || 'Active') === 'Active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {viewingTeacher.designation} &bull; {viewingTeacher.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingTeacher(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Employee ID</span>
                  <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                    {viewingTeacher.employeeId || (viewingTeacher as any).employee_id || 'EMP-CS-000'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Department</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{viewingTeacher.department}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Official Email</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">{viewingTeacher.email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Phone</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">{viewingTeacher.phone || 'Not recorded'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Qualifications</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {viewingTeacher.qualification || 'M.Tech, Ph.D'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teaching Experience</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {viewingTeacher.experience || '5+ Years'}
                  </p>
                </div>
              </div>

              {/* Assigned Subjects Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Assigned Teaching Courses
                </h4>
                {getTeacherSubjects(viewingTeacher).length > 0 ? (
                  <div className="space-y-2">
                    {getTeacherSubjects(viewingTeacher).map((sub, idx) => {
                      const fullSub = subjects.find((s) => s.id === sub.id || s.name === sub.name);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold text-[10px] flex items-center justify-center">
                              {sub.code}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{sub.name}</p>
                              {fullSub && (
                                <p className="text-[10px] text-slate-400">
                                  {fullSub.year} &bull; Sem {fullSub.semester} &bull; {fullSub.credits} Credits
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100">
                            Active Teaching
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 text-xs">No courses currently assigned</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Edit Details" below to allocate subjects.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = viewingTeacher;
                  setViewingTeacher(null);
                  setStatusActionTarget(target);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  (viewingTeacher.status || 'Active') === 'Active'
                    ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>
                  {(viewingTeacher.status || 'Active') === 'Active' ? 'Deactivate Faculty' : 'Activate Faculty'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingTeacher;
                    setViewingTeacher(null);
                    openEditModal(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingTeacher(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD / EDIT TEACHER MODAL                                               */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingTeacher ? 'Edit Faculty Details' : 'Add New Faculty Member'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {editingTeacher
                    ? `Updating record for ${editingTeacher.name}`
                    : 'Register an accredited teacher and allocate subjects.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="mt-4 space-y-3.5 overflow-y-auto flex-1 pr-1">
              {/* Teacher Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teacher Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-teacher-name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Employee ID & Status Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-teacher-employee-id"
                    type="text"
                    required
                    placeholder="EMP-CS-101"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty Status
                  </label>
                  <select
                    id="select-teacher-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-teacher-email"
                    type="email"
                    required
                    placeholder="rajesh.v@academiccentral.demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    id="input-teacher-phone"
                    type="text"
                    placeholder="+91 98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Department & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    id="select-teacher-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Basic Sciences">Basic Sciences</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    id="select-teacher-designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Professor & Head">Professor & Head</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Guest Lecturer">Guest Lecturer</option>
                  </select>
                </div>
              </div>

              {/* Qualifications & Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Qualifications
                  </label>
                  <input
                    id="input-teacher-qualification"
                    type="text"
                    placeholder="Ph.D, M.Tech (IIT Madras)"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Experience
                  </label>
                  <input
                    id="input-teacher-experience"
                    type="text"
                    placeholder="e.g. 8 Years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Assigned Subjects Allocation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Assigned Teaching Subjects ({selectedSubjectIds.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSubjectIds.length === subjects.length) {
                        setSelectedSubjectIds([]);
                      } else {
                        setSelectedSubjectIds(subjects.map((s) => s.id));
                      }
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    {selectedSubjectIds.length === subjects.length ? 'Clear all' : 'Select all'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto">
                  {subjects.map((sub) => {
                    const isChecked = selectedSubjectIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubjectSelection(sub.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="truncate">
                          <span className="font-mono text-[10px] text-indigo-500 mr-1">{sub.code}</span>
                          <span>{sub.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-teacher-submit"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  {editingTeacher ? 'Update Teacher' : 'Save Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVATE / DEACTIVATE CONFIRMATION DIALOG                              */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={!!statusActionTarget}
        title={
          (statusActionTarget?.status || 'Active') === 'Active'
            ? 'Deactivate Teacher Account'
            : 'Activate Teacher Account'
        }
        message={
          (statusActionTarget?.status || 'Active') === 'Active'
            ? `Are you sure you want to deactivate ${statusActionTarget?.name} (${statusActionTarget?.employeeId || (statusActionTarget as any)?.employee_id})? The teacher will not be able to log in or post marks until reactivated.`
            : `Are you sure you want to activate ${statusActionTarget?.name} (${statusActionTarget?.employeeId || (statusActionTarget as any)?.employee_id})? Full teaching portal privileges will be restored immediately.`
        }
        confirmText={
          (statusActionTarget?.status || 'Active') === 'Active'
            ? 'Deactivate Account'
            : 'Activate Account'
        }
        confirmVariant={(statusActionTarget?.status || 'Active') === 'Active' ? 'danger' : 'primary'}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setStatusActionTarget(null)}
      />

      {/* ========================================================================= */}
      {/* 4. PERMANENT DELETE CONFIRMATION DIALOG                                  */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Teacher Profile"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name} (${deleteTarget?.employeeId || (deleteTarget as any)?.employee_id})? This will remove all associated user authentication credentials and subject teaching allocations.`}
        confirmText="Confirm Permanent Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
