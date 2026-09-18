import {
  User,
  StudentProfile,
  TeacherProfile,
  Subject,
  CollegeClass,
  Assignment,
  StudentSubmission,
  SubjectMarks,
  LabMaterial,
  Assessment,
  NotificationItem,
  AuditLogItem,
  SemesterResult,
  SubjectGrade,
  Role,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_MARKS,
  INITIAL_LAB_MATERIALS,
  INITIAL_ASSESSMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SEMESTER_RESULTS,
} from '../data/initialData';
import { apiClient } from './api';

const STORAGE_KEYS = {
  CURRENT_USER: 'academic_central_current_user',
  USERS: 'academic_central_users',
  STUDENTS: 'academic_central_students',
  TEACHERS: 'academic_central_teachers',
  SUBJECTS: 'academic_central_subjects',
  CLASSES: 'academic_central_classes',
  ASSIGNMENTS: 'academic_central_assignments',
  SUBMISSIONS: 'academic_central_submissions',
  MARKS: 'academic_central_marks',
  SEMESTER_RESULTS: 'academic_central_semester_results',
  LAB_MATERIALS: 'academic_central_lab_materials',
  ASSESSMENTS: 'academic_central_assessments',
  NOTIFICATIONS: 'academic_central_notifications',
  AUDIT_LOGS: 'academic_central_audit_logs',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const storeCache: Record<string, any> = {};

function clearStoreCache(): void {
  for (const key of Object.keys(storeCache)) {
    delete storeCache[key];
  }
}

function getStored<T>(key: string, defaultValue: T): T {
  if (Object.prototype.hasOwnProperty.call(storeCache, key)) {
    return storeCache[key];
  }
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) {
      storeCache[key] = defaultValue;
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    storeCache[key] = parsed;
    return parsed;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    storeCache[key] = defaultValue;
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  storeCache[key] = value;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

class AcademicStore {
  // Current user / Auth
  getCurrentUser(): User | null {
    return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: User | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    notify();
  }

  async authenticateWithServer(
    identifier: string,
    password?: string,
    role?: Role,
    isDemoLogin?: boolean,
    strictSupabaseAuth: boolean = true
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await apiClient.login(identifier, password, role, isDemoLogin, strictSupabaseAuth);
      if (response && response.user) {
        this.setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response?.message || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login request failed' };
    }
  }

  async loginWithSupabase(
    identifier: string,
    pass: string,
    role?: Role
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await apiClient.supabaseLogin(identifier, pass, role);
      if (response && response.user) {
        this.setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response?.message || 'Supabase authentication failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Supabase authentication failed' };
    }
  }

  async registerWithSupabase(payload: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    rollNumber?: string;
    employeeId?: string;
    branch?: string;
    year?: string;
    section?: string;
    semester?: number;
    department?: string;
  }): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      const res = await apiClient.supabaseRegister(payload);
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'Supabase registration failed' };
    }
  }

  async loginWithDemo(role: Role): Promise<User> {
    try {
      const res = await apiClient.login(undefined, undefined, role, true);
      if (res && res.user) {
        this.setCurrentUser(res.user);
        return res.user;
      }
    } catch (e) {
      console.error('Demo auth failed, falling back to local user:', e);
    }
    const users = this.getUsers();
    let matched = users.find((u) => u.role === role) || INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    this.setCurrentUser(matched);
    return matched;
  }

  loginAsRole(role: Role): Promise<User> {
    return this.loginWithDemo(role);
  }

  async loginWithEmail(
    identifier: string,
    pass: string,
    role?: Role
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    return this.authenticateWithServer(identifier, pass, role, false);
  }

  logout(): void {
    apiClient.logout().catch(() => {});
    this.setCurrentUser(null);
  }

  // Users
  getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  // Students
  getStudents(): StudentProfile[] {
    const list = getStored<StudentProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    return list.map((s, idx) => ({
      ...s,
      userId: s.userId || (s as any).user_id || `user-student-${idx + 1}`,
      rollNumber: s.rollNumber || (s as any).roll_number || `23CS${100 + idx}`,
      bloodGroup: s.bloodGroup || (s as any).blood_group || 'O+',
      attendancePercentage: s.attendancePercentage ?? (s as any).attendance_percentage ?? 85,
    }));
  }

  getStudentByUserId(userId: string): StudentProfile | undefined {
    return this.getStudents().find((s) => s.userId === userId);
  }

  getStudentById(id: string): StudentProfile | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  addStudent(student: Omit<StudentProfile, 'id'>): StudentProfile {
    const list = this.getStudents();
    const newStudent: StudentProfile = {
      ...student,
      id: `stud-${Date.now()}`,
    };
    const updated = [newStudent, ...list];
    setStored(STORAGE_KEYS.STUDENTS, updated);
    this.addAuditLog(
      'admin-1',
      'Admin Office',
      'admin',
      'Add Student',
      `Registered new student ${newStudent.name} (${newStudent.rollNumber}).`
    );
    notify();
    return newStudent;
  }

  updateStudent(studentOrId: StudentProfile | string, partial?: Partial<StudentProfile>): void {
    const list = this.getStudents();
    const targetId = typeof studentOrId === 'string' ? studentOrId : studentOrId.id;
    const updates = typeof studentOrId === 'string' ? (partial || {}) : studentOrId;

    const updated = list.map((s) => (s.id === targetId ? { ...s, ...updates } : s));
    setStored(STORAGE_KEYS.STUDENTS, updated);

    const target = updated.find((s) => s.id === targetId);
    if (target) {
      this.addAuditLog(
        'admin-1',
        'Admin Office',
        'admin',
        'Update Student',
        `Updated academic record for ${target.name} (${target.rollNumber}).`
      );
    }
    notify();
  }

  deleteStudent(id: string): void {
    const list = this.getStudents();
    const target = list.find((s) => s.id === id);
    const updated = list.filter((s) => s.id !== id);
    setStored(STORAGE_KEYS.STUDENTS, updated);
    if (target) {
      this.addAuditLog(
        'admin-1',
        'Admin Office',
        'admin',
        'Deactivate Student',
        `Deactivated student record ${target.name} (${target.rollNumber}).`
      );
    }
    notify();
  }

  // Teachers
  getTeachers(): TeacherProfile[] {
    const list = getStored<TeacherProfile[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    if ((list as any)._normalized) {
      return list;
    }
    const normalized = list.map((t, idx) => ({
      ...t,
      userId: t.userId || (t as any).user_id || `user-teacher-${idx + 1}`,
      employeeId: t.employeeId || (t as any).employee_id || `EMP-CS-${100 + idx}`,
      status: t.status || 'Active',
      subjectsAssigned: t.subjectsAssigned || [],
      assignedSubjectIds: t.assignedSubjectIds || [],
    }));
    Object.defineProperty(normalized, '_normalized', { value: true, enumerable: false });
    storeCache[STORAGE_KEYS.TEACHERS] = normalized;
    return normalized;
  }

  getTeacherByUserId(userId: string): TeacherProfile | undefined {
    return this.getTeachers().find((t) => t.userId === userId);
  }

  addTeacher(teacher: Omit<TeacherProfile, 'id'>): TeacherProfile {
    const list = this.getTeachers();
    const newTeacher: TeacherProfile = {
      ...teacher,
      id: `teacher-${Date.now()}`,
      employeeId: teacher.employeeId || `EMP-CS-${Date.now().toString().slice(-4)}`,
      status: teacher.status || 'Active',
      subjectsAssigned: teacher.subjectsAssigned || [],
    };
    const updated = [newTeacher, ...list];
    setStored(STORAGE_KEYS.TEACHERS, updated);
    this.addAuditLog(
      'admin-1',
      'Admin Office',
      'admin',
      'Add Teacher',
      `Added faculty member ${newTeacher.name} (${newTeacher.employeeId}).`
    );
    notify();
    apiClient.addTeacher(newTeacher).catch(() => {});
    return newTeacher;
  }

  updateTeacher(teacherOrId: TeacherProfile | string, partial?: Partial<TeacherProfile>): void {
    const list = this.getTeachers();
    const targetId = typeof teacherOrId === 'string' ? teacherOrId : teacherOrId.id;
    const updates = typeof teacherOrId === 'string' ? (partial || {}) : teacherOrId;

    const updated = list.map((t) => (t.id === targetId ? { ...t, ...updates } : t));
    setStored(STORAGE_KEYS.TEACHERS, updated);
    const target = updated.find((t) => t.id === targetId);
    if (target) {
      this.addAuditLog(
        'admin-1',
        'Admin Office',
        'admin',
        'Update Teacher',
        `Updated faculty member ${target.name} (${target.employeeId || target.id}).`
      );
      apiClient.updateTeacher(targetId, target).catch(() => {});
    }
    notify();
  }

  toggleTeacherStatus(id: string): TeacherProfile | undefined {
    const list = this.getTeachers();
    const target = list.find((t) => t.id === id);
    if (target) {
      const nextStatus: 'Active' | 'Inactive' = target.status === 'Active' ? 'Inactive' : 'Active';
      this.updateTeacher(id, { status: nextStatus });
      this.addAuditLog(
        'admin-1',
        'Admin Office',
        'admin',
        nextStatus === 'Active' ? 'Activate Faculty' : 'Deactivate Faculty',
        `${nextStatus === 'Active' ? 'Activated' : 'Deactivated'} faculty profile for ${target.name} (${target.employeeId || target.id}).`
      );
      return { ...target, status: nextStatus };
    }
    return undefined;
  }

  deleteTeacher(id: string): void {
    const list = this.getTeachers();
    const target = list.find((t) => t.id === id);
    const updated = list.filter((t) => t.id !== id);
    setStored(STORAGE_KEYS.TEACHERS, updated);
    if (target) {
      this.addAuditLog(
        'admin-1',
        'Admin Office',
        'admin',
        'Delete Teacher',
        `Removed faculty record for ${target.name} (${target.employeeId || target.id}).`
      );
      apiClient.deleteTeacher(id).catch(() => {});
    }
    notify();
  }

  // Subjects
  getSubjects(): Subject[] {
    const list = getStored<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    return list.map((s) => ({
      ...s,
      teacherId: s.teacherId || (s as any).teacher_id || 'teach-1',
      teacherName: s.teacherName || (s as any).teacher_name || 'Faculty',
    }));
  }

  addSubject(subject: Omit<Subject, 'id'>): Subject {
    const list = this.getSubjects();
    const newSubject: Subject = {
      ...subject,
      id: `sub-${Date.now()}`,
    };
    const updated = [newSubject, ...list];
    setStored(STORAGE_KEYS.SUBJECTS, updated);
    this.addAuditLog(
      'admin-1',
      'Admin Office',
      'admin',
      'Add Subject',
      `Created course subject ${newSubject.name} (${newSubject.code}).`
    );
    notify();
    return newSubject;
  }

  updateSubject(subjectOrId: Subject | string, partial?: Partial<Subject>): void {
    const list = this.getSubjects();
    const targetId = typeof subjectOrId === 'string' ? subjectOrId : subjectOrId.id;
    const updates = typeof subjectOrId === 'string' ? (partial || {}) : subjectOrId;

    const updated = list.map((s) => (s.id === targetId ? { ...s, ...updates } : s));
    setStored(STORAGE_KEYS.SUBJECTS, updated);

    const target = updated.find((s) => s.id === targetId);
    if (target) {
      this.addAuditLog(
        'admin-1',
        'Admin Office',
        'admin',
        'Update Subject',
        `Updated subject specifications for ${target.name}.`
      );
    }
    notify();
  }

  deleteSubject(id: string): void {
    const list = this.getSubjects();
    const updated = list.filter((s) => s.id !== id);
    setStored(STORAGE_KEYS.SUBJECTS, updated);
    notify();
  }

  // Classes
  getClasses(): CollegeClass[] {
    return getStored<CollegeClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }

  addClass(collegeClass: Omit<CollegeClass, 'id'>): CollegeClass {
    const list = this.getClasses();
    const newClass: CollegeClass = {
      ...collegeClass,
      id: `cls-${Date.now()}`,
    };
    const updated = [newClass, ...list];
    setStored(STORAGE_KEYS.CLASSES, updated);
    notify();
    return newClass;
  }

  updateClass(collegeClass: CollegeClass): void {
    const list = this.getClasses();
    const updated = list.map((c) => (c.id === collegeClass.id ? collegeClass : c));
    setStored(STORAGE_KEYS.CLASSES, updated);
    notify();
  }

  deleteClass(id: string): void {
    const list = this.getClasses();
    const updated = list.filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CLASSES, updated);
    notify();
  }

  // Assignments
  getAssignments(): Assignment[] {
    const list = getStored<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    return list.map((a) => ({
      ...a,
      subjectId: a.subjectId || (a as any).subject_id || '',
      subjectName: a.subjectName || (a as any).subject_name || 'Subject',
      teacherId: a.teacherId || (a as any).teacher_id || 'teach-1',
      teacherName: a.teacherName || (a as any).teacher_name || 'Faculty',
      fileUrl: a.fileUrl || (a as any).file_url || null,
      fileName: a.fileName || (a as any).file_name || 'Assignment.pdf',
      fileSize: a.fileSize || (a as any).file_size || '1.2 MB',
      dueDate: a.dueDate || (a as any).due_date || new Date().toISOString(),
      maxMarks: a.maxMarks ?? (a as any).max_marks ?? 10,
    }));
  }

  addAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
    const list = this.getAssignments();
    const newAssignment: Assignment = {
      ...assignment,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newAssignment, ...list];
    setStored(STORAGE_KEYS.ASSIGNMENTS, updated);

    // Notify students
    this.addNotification({
      userId: 'user-student-1',
      targetRole: 'student',
      title: 'New Assignment Uploaded',
      message: `${newAssignment.teacherName} published "${newAssignment.title}" for ${newAssignment.subjectName}.`,
      type: 'assignment',
    });

    this.addAuditLog(
      newAssignment.teacherId,
      newAssignment.teacherName,
      'teacher',
      'Create Assignment',
      `Published assignment: ${newAssignment.title} for ${newAssignment.subjectName}.`
    );

    // Sync to backend SQLite database
    apiClient.addAssignment(newAssignment).catch((err) => {
      console.warn('Sync assignment to DB warning:', err);
    });

    notify();
    return newAssignment;
  }

  updateAssignment(assignment: Assignment): void {
    const list = this.getAssignments();
    const updated = list.map((a) => (a.id === assignment.id ? assignment : a));
    setStored(STORAGE_KEYS.ASSIGNMENTS, updated);
    notify();
  }

  deleteAssignment(id: string): void {
    const list = this.getAssignments();
    const updated = list.filter((a) => a.id !== id);
    setStored(STORAGE_KEYS.ASSIGNMENTS, updated);
    notify();
  }

  // Submissions
  getSubmissions(): StudentSubmission[] {
    return getStored<StudentSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  }

  submitAssignment(
    assignmentId: string,
    studentId: string,
    studentName: string,
    rollNumber: string,
    fileName: string,
    notes?: string,
    fileUrl?: string
  ): StudentSubmission {
    const list = this.getSubmissions();
    const existingIndex = list.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    );

    const submission: StudentSubmission = {
      id: `subm-${Date.now()}`,
      assignmentId,
      studentId,
      studentName,
      rollNumber,
      submittedAt: new Date().toISOString(),
      fileName: fileName || 'Assignment_Submission.pdf',
      fileUrl: fileUrl || `/api/files/submissions/${fileName || 'Assignment_Submission.pdf'}`,
      notes,
      status: 'Submitted',
    };

    let updated: StudentSubmission[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = submission;
    } else {
      updated = [submission, ...list];
    }
    setStored(STORAGE_KEYS.SUBMISSIONS, updated);

    // Sync to backend SQLite database
    apiClient.submitAssignment({
      assignmentId,
      studentId,
      studentName,
      rollNumber,
      fileName: submission.fileName,
      fileUrl: submission.fileUrl,
      notes: submission.notes,
      status: submission.status,
    }).catch((err) => {
      console.warn('Sync submission to DB warning:', err);
    });

    this.addNotification({
      userId: 'user-teacher-1',
      targetRole: 'teacher',
      title: 'New Student Submission',
      message: `${studentName} (${rollNumber}) submitted assignment.`,
      type: 'assignment',
    });

    this.addAuditLog(
      studentId,
      studentName,
      'student',
      'Assignment Submission',
      `${studentName} submitted work for assignment #${assignmentId.slice(-4)}.`
    );

    notify();
    return submission;
  }

  evaluateSubmission(submissionId: string, marks: number, feedback: string = ''): void {
    const list = this.getSubmissions();
    const target = list.find((s) => s.id === submissionId);
    const updated = list.map((s) =>
      s.id === submissionId
        ? { ...s, obtainedMarks: marks, feedback, status: 'Evaluated' as const }
        : s
    );
    setStored(STORAGE_KEYS.SUBMISSIONS, updated);
    if (target) {
      this.addNotification({
        userId: target.studentId,
        targetRole: 'student',
        title: 'Assignment Graded',
        message: `Your assignment submission was evaluated: ${marks} marks. Feedback: ${feedback || 'Graded'}`,
        type: 'assignment',
      });
      this.addAuditLog(
        'teacher-1',
        'Faculty Evaluator',
        'teacher',
        'Grade Assignment',
        `Graded submission for ${target.studentName}: ${marks} marks.`
      );
    }
    notify();
  }

  // Marks
  getMarks(): SubjectMarks[] {
    const list = getStored<SubjectMarks[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    return list.map((m) => ({
      ...m,
      studentId: m.studentId || (m as any).student_id || '',
      studentName: m.studentName || (m as any).student_name || 'Student',
      subjectId: m.subjectId || (m as any).subject_id || '',
      subjectName: m.subjectName || (m as any).subject_name || 'Subject',
      subjectCode: m.subjectCode || (m as any).subject_code || '',
      classTest: m.classTest ?? (m as any).class_test ?? 0,
      labInternal: m.labInternal ?? (m as any).lab_internal ?? 0,
      totalInternal: m.totalInternal ?? (m as any).total_internal ?? 0,
    }));
  }

  getStudentMarks(studentId: string): SubjectMarks[] {
    return this.getMarks().filter((m) => m.studentId === studentId);
  }

  updateStudentMarks(
    studentId: string,
    subjectId: string,
    assessmentType: string,
    score: number,
    remark: string = '',
    teacherName: string = 'Faculty'
  ): void {
    const allMarks = this.getMarks();
    const subjects = this.getSubjects();
    const currentSubject = subjects.find((s) => s.id === subjectId);
    const subjectName = currentSubject ? currentSubject.name : 'Subject';
    const subjectCode = currentSubject ? currentSubject.code : 'CS';

    const existing = allMarks.find((m) => m.studentId === studentId && m.subjectId === subjectId);
    const normalizedType = assessmentType.toLowerCase().replace(/[\s-]/g, '');

    if (existing) {
      if (normalizedType.includes('mid1')) existing.mid1 = Number(score);
      else if (normalizedType.includes('mid2')) existing.mid2 = Number(score);
      else if (normalizedType.includes('class') || normalizedType.includes('test')) existing.classTest = Number(score);
      else if (normalizedType.includes('assign')) existing.assignment = Number(score);
      else if (normalizedType.includes('lab') || normalizedType.includes('internal')) existing.labInternal = Number(score);
      if (remark) existing.remarks = remark;
      existing.updatedAt = new Date().toISOString();
    } else {
      const newRecord: SubjectMarks = {
        id: `mark-${Date.now()}-${studentId}`,
        studentId,
        subjectId,
        subjectName,
        subjectCode,
        mid1: normalizedType.includes('mid1') ? Number(score) : 0,
        mid1Max: 30,
        mid2: normalizedType.includes('mid2') ? Number(score) : 0,
        mid2Max: 30,
        classTest: normalizedType.includes('class') || normalizedType.includes('test') ? Number(score) : 0,
        classTestMax: 20,
        assignment: normalizedType.includes('assign') ? Number(score) : 0,
        assignmentMax: 10,
        labInternal: normalizedType.includes('lab') || normalizedType.includes('internal') ? Number(score) : 0,
        labInternalMax: 20,
        remarks: remark,
        updatedAt: new Date().toISOString(),
      };
      allMarks.push(newRecord);
    }

    setStored(STORAGE_KEYS.MARKS, allMarks);
    this.addAuditLog(
      'teacher-1',
      teacherName,
      'teacher',
      'Marks Evaluation',
      `Recorded ${assessmentType} marks for student in ${subjectName}: ${score} pts.`
    );
    notify();
  }

  batchUpdateStudentMarks(
    updates: Array<{
      studentId: string;
      subjectId: string;
      assessmentType: string;
      score: number;
      remark?: string;
    }>,
    teacherName: string = 'Faculty'
  ): void {
    if (!updates.length) return;
    const allMarks = [...this.getMarks()];
    const subjects = this.getSubjects();

    updates.forEach(({ studentId, subjectId, assessmentType, score, remark }) => {
      const currentSubject = subjects.find((s) => s.id === subjectId);
      const subjectName = currentSubject ? currentSubject.name : 'Subject';
      const subjectCode = currentSubject ? currentSubject.code : 'CS';
      const normalizedType = assessmentType.toLowerCase().replace(/[\s-]/g, '');

      const existingIndex = allMarks.findIndex(
        (m) => m.studentId === studentId && m.subjectId === subjectId
      );

      if (existingIndex >= 0) {
        const existing = { ...allMarks[existingIndex] };
        if (normalizedType.includes('mid1')) existing.mid1 = Number(score);
        else if (normalizedType.includes('mid2')) existing.mid2 = Number(score);
        else if (normalizedType.includes('class') || normalizedType.includes('test')) existing.classTest = Number(score);
        else if (normalizedType.includes('assign')) existing.assignment = Number(score);
        else if (normalizedType.includes('lab') || normalizedType.includes('internal')) existing.labInternal = Number(score);
        if (remark !== undefined) existing.remarks = remark;
        existing.updatedAt = new Date().toISOString();
        allMarks[existingIndex] = existing;
      } else {
        const newRecord: SubjectMarks = {
          id: `mark-${Date.now()}-${studentId}`,
          studentId,
          subjectId,
          subjectName,
          subjectCode,
          mid1: normalizedType.includes('mid1') ? Number(score) : 0,
          mid1Max: 30,
          mid2: normalizedType.includes('mid2') ? Number(score) : 0,
          mid2Max: 30,
          classTest: normalizedType.includes('class') || normalizedType.includes('test') ? Number(score) : 0,
          classTestMax: 20,
          assignment: normalizedType.includes('assign') ? Number(score) : 0,
          assignmentMax: 10,
          labInternal: normalizedType.includes('lab') || normalizedType.includes('internal') ? Number(score) : 0,
          labInternalMax: 20,
          remarks: remark || '',
          updatedAt: new Date().toISOString(),
        };
        allMarks.push(newRecord);
      }
    });

    setStored(STORAGE_KEYS.MARKS, allMarks);
    this.addAuditLog(
      'teacher-1',
      teacherName,
      'teacher',
      'Marks Evaluation',
      `Batch updated ${updates[0]?.assessmentType || 'assessment'} marks for ${updates.length} students.`
    );
    notify();
  }

  saveMarks(
    subjectId: string,
    assessmentType: 'mid1' | 'mid2' | 'classTest' | 'assignment' | 'labInternal',
    studentMarksEntries: Array<{ studentId: string; marks: number; maxMarks: number }>
  ): void {
    const allMarks = this.getMarks();
    const subjects = this.getSubjects();
    const currentSubject = subjects.find((s) => s.id === subjectId);
    const subjectName = currentSubject ? currentSubject.name : 'Subject';
    const subjectCode = currentSubject ? currentSubject.code : 'CS';

    studentMarksEntries.forEach(({ studentId, marks, maxMarks }) => {
      const existing = allMarks.find((m) => m.studentId === studentId && m.subjectId === subjectId);
      if (existing) {
        existing[assessmentType] = Number(marks);
        if (assessmentType === 'mid1') existing.mid1Max = maxMarks;
        if (assessmentType === 'mid2') existing.mid2Max = maxMarks;
        if (assessmentType === 'classTest') existing.classTestMax = maxMarks;
        if (assessmentType === 'assignment') existing.assignmentMax = maxMarks;
        if (assessmentType === 'labInternal') existing.labInternalMax = maxMarks;
        existing.updatedAt = new Date().toISOString();
      } else {
        const newRecord: SubjectMarks = {
          id: `mark-${Date.now()}-${studentId}`,
          studentId,
          subjectId,
          subjectName,
          subjectCode,
          mid1: assessmentType === 'mid1' ? Number(marks) : 0,
          mid1Max: assessmentType === 'mid1' ? maxMarks : 30,
          mid2: assessmentType === 'mid2' ? Number(marks) : 0,
          mid2Max: assessmentType === 'mid2' ? maxMarks : 30,
          classTest: assessmentType === 'classTest' ? Number(marks) : 0,
          classTestMax: assessmentType === 'classTest' ? maxMarks : 20,
          assignment: assessmentType === 'assignment' ? Number(marks) : 0,
          assignmentMax: assessmentType === 'assignment' ? maxMarks : 10,
          labInternal: assessmentType === 'labInternal' ? Number(marks) : 0,
          labInternalMax: assessmentType === 'labInternal' ? maxMarks : 20,
          updatedAt: new Date().toISOString(),
        };
        allMarks.push(newRecord);
      }
    });

    setStored(STORAGE_KEYS.MARKS, allMarks);

    this.addNotification({
      userId: 'user-student-1',
      targetRole: 'student',
      title: 'Marks Updated',
      message: `Faculty updated ${assessmentType.toUpperCase()} marks for ${subjectName}.`,
      type: 'mark',
    });

    const user = this.getCurrentUser();
    this.addAuditLog(
      user ? user.id : 'teacher-1',
      user ? user.name : 'Faculty',
      'teacher',
      'Marks Entry',
      `Updated ${assessmentType} marks for ${studentMarksEntries.length} students in ${subjectName}.`
    );

    notify();
  }

  // Lab Materials
  getLabMaterials(): LabMaterial[] {
    return getStored<LabMaterial[]>(STORAGE_KEYS.LAB_MATERIALS, INITIAL_LAB_MATERIALS);
  }

  addLabMaterial(material: Omit<LabMaterial, 'id' | 'createdAt'>): LabMaterial {
    const list = this.getLabMaterials();
    const newMaterial: LabMaterial = {
      ...material,
      id: `lab-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newMaterial, ...list];
    setStored(STORAGE_KEYS.LAB_MATERIALS, updated);

    this.addNotification({
      userId: 'user-student-1',
      targetRole: 'student',
      title: `New ${newMaterial.type} Uploaded`,
      message: `${newMaterial.uploadedBy} uploaded "${newMaterial.title}" for ${newMaterial.subjectName}.`,
      type: 'lab',
    });

    this.addAuditLog(
      newMaterial.uploadedById,
      newMaterial.uploadedBy,
      'teacher',
      'Upload Material',
      `Uploaded academic file: ${newMaterial.title} (${newMaterial.type}).`
    );

    notify();
    return newMaterial;
  }

  deleteLabMaterial(id: string): void {
    const list = this.getLabMaterials();
    const updated = list.filter((m) => m.id !== id);
    setStored(STORAGE_KEYS.LAB_MATERIALS, updated);
    notify();
  }

  // Assessments
  getAssessments(): Assessment[] {
    return getStored<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
  }

  addAssessment(assessment: Omit<Assessment, 'id'>): Assessment {
    const list = this.getAssessments();
    const newAssessment: Assessment = {
      ...assessment,
      id: `ass-${Date.now()}`,
    };
    const updated = [newAssessment, ...list];
    setStored(STORAGE_KEYS.ASSESSMENTS, updated);

    this.addNotification({
      userId: 'user-student-1',
      targetRole: 'student',
      title: 'Assessment Scheduled',
      message: `${newAssessment.title} has been scheduled for ${newAssessment.date}.`,
      type: 'assessment',
    });

    const user = this.getCurrentUser();
    this.addAuditLog(
      user ? user.id : 'faculty',
      user ? user.name : 'Faculty',
      'teacher',
      'Schedule Assessment',
      `Created assessment: ${newAssessment.title} for ${newAssessment.subjectName}.`
    );

    notify();
    return newAssessment;
  }

  updateAssessment(assessment: Assessment): void {
    const list = this.getAssessments();
    const updated = list.map((a) => (a.id === assessment.id ? assessment : a));
    setStored(STORAGE_KEYS.ASSESSMENTS, updated);
    notify();
  }

  deleteAssessment(id: string): void {
    const list = this.getAssessments();
    const updated = list.filter((a) => a.id !== id);
    setStored(STORAGE_KEYS.ASSESSMENTS, updated);
    notify();
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...list]);
    notify();
  }

  markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notify();
  }

  markAllNotificationsAsRead(): void {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    notify();
  }

  // Audit Logs
  getAuditLogs(): AuditLogItem[] {
    return getStored<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  addAuditLog(
    userId: string,
    userName: string,
    role: Role,
    action: string,
    description: string
  ): void {
    const list = this.getAuditLogs();
    const date = new Date();
    const formatted = `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      userId,
      userName,
      performedBy: userName,
      role,
      action,
      description,
      details: description,
      timestamp: formatted,
    };
    // Keep last 100 logs
    const updated = [newLog, ...list].slice(0, 100);
    setStored(STORAGE_KEYS.AUDIT_LOGS, updated);
    notify();
  }

  // Semester Results
  getSemesterResults(studentId?: string): SemesterResult[] {
    const all = getStored<SemesterResult[]>(STORAGE_KEYS.SEMESTER_RESULTS, INITIAL_SEMESTER_RESULTS);
    if (!studentId) return all;
    return all.filter((r) => r.studentId === studentId);
  }

  getStudentSemesterResults(studentId: string): SemesterResult[] {
    return this.getSemesterResults(studentId);
  }

  addSemesterResult(result: Partial<SemesterResult> & { studentId: string; semester: number; subjects: SubjectGrade[] }): SemesterResult {
    const list = this.getSemesterResults();
    const semNum = Number(result.semester) || 1;

    // Calculate credits & SGPA
    let totalCredits = 0;
    let earnedCredits = 0;
    let totalPoints = 0;
    result.subjects.forEach((sub) => {
      const cr = Number(sub.credits) || 0;
      const pts = Number(sub.points) || 0;
      totalCredits += cr;
      if (sub.grade !== 'F') earnedCredits += cr;
      totalPoints += cr * pts;
    });

    const calculatedSgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 8.0;
    const finalSgpa = result.sgpa !== undefined ? Number(result.sgpa) : calculatedSgpa;

    const newResult: SemesterResult = {
      id: result.id || `res-${Date.now()}-${result.studentId}`,
      studentId: result.studentId,
      semester: semNum,
      academicYear: result.academicYear || '2025-2026',
      sgpa: finalSgpa,
      creditsRegistered: result.creditsRegistered !== undefined ? Number(result.creditsRegistered) : totalCredits,
      creditsEarned: result.creditsEarned !== undefined ? Number(result.creditsEarned) : earnedCredits,
      resultStatus: result.resultStatus || (result.subjects.some((s) => s.grade === 'F') ? 'Fail' : 'Pass'),
      subjects: result.subjects,
      publishedDate: result.publishedDate || new Date().toISOString().split('T')[0],
    };

    // If result for student + sem exists, replace it, else push
    const existingIndex = list.findIndex((r) => r.studentId === result.studentId && r.semester === semNum);
    let updated: SemesterResult[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = newResult;
    } else {
      updated = [...list, newResult];
    }
    setStored(STORAGE_KEYS.SEMESTER_RESULTS, updated);

    // Update student CGPA
    this.recalculateStudentCgpa(result.studentId);

    // Send to server in background
    apiClient.addSemesterResult(newResult).catch((err) => {
      console.warn('Deferred server sync for addSemesterResult:', err);
    });

    const user = this.getCurrentUser();
    this.addAuditLog(
      user ? user.id : 'admin-1',
      user ? user.name : 'Admin',
      'admin',
      'Semester Result Published',
      `Published Semester ${semNum} result (SGPA: ${finalSgpa}) for student ${result.studentId}.`
    );

    notify();
    return newResult;
  }

  updateSemesterResult(id: string, updates: Partial<SemesterResult>): void {
    const list = this.getSemesterResults();
    const existing = list.find((r) => r.id === id);
    if (!existing) return;

    const subjects = updates.subjects !== undefined ? updates.subjects : existing.subjects;
    let totalCredits = 0;
    let earnedCredits = 0;
    let totalPoints = 0;
    subjects.forEach((sub) => {
      const cr = Number(sub.credits) || 0;
      const pts = Number(sub.points) || 0;
      totalCredits += cr;
      if (sub.grade !== 'F') earnedCredits += cr;
      totalPoints += cr * pts;
    });

    const calculatedSgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : existing.sgpa;
    const finalSgpa = updates.sgpa !== undefined ? Number(updates.sgpa) : calculatedSgpa;

    const updatedResult: SemesterResult = {
      ...existing,
      ...updates,
      subjects,
      sgpa: finalSgpa,
      creditsRegistered: updates.creditsRegistered !== undefined ? Number(updates.creditsRegistered) : (totalCredits > 0 ? totalCredits : existing.creditsRegistered),
      creditsEarned: updates.creditsEarned !== undefined ? Number(updates.creditsEarned) : (earnedCredits > 0 ? earnedCredits : existing.creditsEarned),
    };

    const updated = list.map((r) => (r.id === id ? updatedResult : r));
    setStored(STORAGE_KEYS.SEMESTER_RESULTS, updated);

    this.recalculateStudentCgpa(existing.studentId);

    apiClient.updateSemesterResult(id, updatedResult).catch((err) => {
      console.warn('Deferred server sync for updateSemesterResult:', err);
    });

    notify();
  }

  deleteSemesterResult(id: string): void {
    const list = this.getSemesterResults();
    const existing = list.find((r) => r.id === id);
    const updated = list.filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.SEMESTER_RESULTS, updated);

    if (existing) {
      this.recalculateStudentCgpa(existing.studentId);
    }

    apiClient.deleteSemesterResult(id).catch((err) => {
      console.warn('Deferred server sync for deleteSemesterResult:', err);
    });

    notify();
  }

  private recalculateStudentCgpa(studentId: string): void {
    const results = this.getSemesterResults(studentId);
    if (results.length === 0) return;

    let cumulativeCredits = 0;
    let cumulativeWeighted = 0;
    results.forEach((r) => {
      const cr = Number(r.creditsRegistered) || 20;
      cumulativeCredits += cr;
      cumulativeWeighted += (Number(r.sgpa) || 0) * cr;
    });

    const newCgpa = cumulativeCredits > 0 ? Number((cumulativeWeighted / cumulativeCredits).toFixed(2)) : 8.0;
    const students = this.getStudents();
    const studIndex = students.findIndex((s) => s.id === studentId);
    if (studIndex >= 0) {
      students[studIndex] = { ...students[studIndex], cgpa: newCgpa };
      setStored(STORAGE_KEYS.STUDENTS, students);
    }
  }

  // Sync with persistent SQLite server database
  async syncWithServer(): Promise<void> {
    try {
      const res = await apiClient.getBootstrapData();
      if (res && res.success && res.data) {
        const d = res.data;
        if (d.users?.length) setStored(STORAGE_KEYS.USERS, d.users);
        if (d.students?.length) setStored(STORAGE_KEYS.STUDENTS, d.students);
        if (d.teachers?.length) setStored(STORAGE_KEYS.TEACHERS, d.teachers);
        if (d.subjects?.length) setStored(STORAGE_KEYS.SUBJECTS, d.subjects);
        if (d.classes?.length) setStored(STORAGE_KEYS.CLASSES, d.classes);
        if (d.assignments?.length) setStored(STORAGE_KEYS.ASSIGNMENTS, d.assignments);
        if (d.submissions?.length) setStored(STORAGE_KEYS.SUBMISSIONS, d.submissions);
        if (d.marks?.length) setStored(STORAGE_KEYS.MARKS, d.marks);
        if (d.semesterResults?.length) setStored(STORAGE_KEYS.SEMESTER_RESULTS, d.semesterResults);
        if (d.labMaterials?.length) setStored(STORAGE_KEYS.LAB_MATERIALS, d.labMaterials);
        if (d.assessments?.length) setStored(STORAGE_KEYS.ASSESSMENTS, d.assessments);
        if (d.notifications?.length) setStored(STORAGE_KEYS.NOTIFICATIONS, d.notifications);
        if (d.auditLogs?.length) setStored(STORAGE_KEYS.AUDIT_LOGS, d.auditLogs);
        notify();
      }
    } catch (e) {
      console.warn('Backend server database sync deferred, serving local cache:', e);
    }
  }

  // Reset to default seed
  resetToDefaultData(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    clearStoreCache();
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setStored(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    setStored(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    setStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    setStored(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    setStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    setStored(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    setStored(STORAGE_KEYS.SEMESTER_RESULTS, INITIAL_SEMESTER_RESULTS);
    setStored(STORAGE_KEYS.LAB_MATERIALS, INITIAL_LAB_MATERIALS);
    setStored(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.setCurrentUser(INITIAL_USERS[0]);
    apiClient.resetSystem().catch(() => {});
    notify();
  }

  resetToDemoData(): void {
    this.resetToDefaultData();
  }
}

export const storage = new AcademicStore();
storage.syncWithServer();
