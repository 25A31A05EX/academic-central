import {
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
  User,
} from '../types';

const API_BASE = '/api';

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('academic_central_token');
  const storedUserRaw = localStorage.getItem('academic_central_current_user');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (storedUserRaw) {
    try {
      const u = JSON.parse(storedUserRaw);
      if (u && u.id) headers['x-user-id'] = u.id;
      if (u && u.role) headers['x-user-role'] = u.role;
    } catch (_) {}
  }
  return headers;
}

export const apiClient = {
  // Bootstrap data
  async getBootstrapData() {
    const res = await fetch(`${API_BASE}/bootstrap`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // Auth
  async login(identifier?: string, password?: string, role?: string, isDemoLogin?: boolean, strictSupabaseAuth?: boolean) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, role, isDemoLogin, strictSupabaseAuth }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Authentication failed (${res.status})`);
    }
    if (data.token) {
      localStorage.setItem('academic_central_token', data.token);
    }
    if (data.supabaseSession) {
      localStorage.setItem('academic_central_supabase_session', JSON.stringify(data.supabaseSession));
    }
    return data;
  },

  async supabaseLogin(identifier: string, password: string, role?: string) {
    const res = await fetch(`${API_BASE}/auth/supabase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, role }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Supabase authentication failed (${res.status})`);
    }
    if (data.token) {
      localStorage.setItem('academic_central_token', data.token);
    }
    if (data.supabaseSession) {
      localStorage.setItem('academic_central_supabase_session', JSON.stringify(data.supabaseSession));
    }
    return data;
  },

  async supabaseRegister(payload: {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'teacher' | 'admin';
    rollNumber?: string;
    employeeId?: string;
    branch?: string;
    year?: string;
    section?: string;
    semester?: number;
    department?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/supabase-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Supabase registration failed (${res.status})`);
    }
    return data;
  },

  async getAuthConfig() {
    try {
      const res = await fetch(`${API_BASE}/auth/config`);
      if (!res.ok) return { strictSupabaseAuth: true, supabaseConfigured: true };
      return await res.json();
    } catch (_) {
      return { strictSupabaseAuth: true, supabaseConfigured: true };
    }
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (_) {}
    localStorage.removeItem('academic_central_token');
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  // Students
  async getStudents(): Promise<StudentProfile[]> {
    const res = await fetch(`${API_BASE}/students`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.data;
  },

  async addStudent(student: Partial<StudentProfile>): Promise<any> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(student),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to add student');
    return json;
  },

  async updateStudent(id: string, updates: Partial<StudentProfile>): Promise<any> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update student');
    return json;
  },

  async deleteStudent(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete student');
    return json;
  },

  // Teachers
  async getTeachers(): Promise<TeacherProfile[]> {
    const res = await fetch(`${API_BASE}/teachers`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async addTeacher(teacher: Partial<TeacherProfile>): Promise<any> {
    const res = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(teacher),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to add faculty');
    return json;
  },

  async updateTeacher(id: string, updates: Partial<TeacherProfile>): Promise<any> {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update faculty');
    return json;
  },

  async deleteTeacher(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete faculty');
    return json;
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${API_BASE}/subjects`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async addSubject(subject: Partial<Subject>): Promise<any> {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subject),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create subject');
    return json;
  },

  // Classes
  async getClasses(): Promise<CollegeClass[]> {
    const res = await fetch(`${API_BASE}/classes`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async addClass(collegeClass: Partial<CollegeClass>): Promise<any> {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(collegeClass),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create class');
    return json;
  },

  // File Storage & Upload
  async uploadPdfFile(
    category: 'assignments' | 'lab-materials' | 'submissions',
    file: File | { fileName: string; fileBase64: string }
  ): Promise<{ fileName: string; originalName: string; fileUrl: string; fileSize: string }> {
    if (file instanceof File) {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('file', file);

      const headers: Record<string, string> = {};
      const token = localStorage.getItem('academic_central_token');
      const storedUserRaw = localStorage.getItem('academic_central_current_user');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (storedUserRaw) {
        try {
          const u = JSON.parse(storedUserRaw);
          if (u && u.id) headers['x-user-id'] = u.id;
          if (u && u.role) headers['x-user-role'] = u.role;
        } catch (_) {}
      }

      const res = await fetch(`${API_BASE}/files/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to upload PDF document to server.');
      }
      return json.data;
    }

    let fileName = '';
    let fileBase64 = '';

    if ('fileName' in file && 'fileBase64' in file) {
      fileName = file.fileName;
      fileBase64 = file.fileBase64;
    }

    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        category,
        fileName,
        fileBase64,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to upload PDF document to server.');
    }
    return json.data;
  },

  // Assignments & Submissions
  async getAssignments(): Promise<Assignment[]> {
    const res = await fetch(`${API_BASE}/assignments`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async addAssignment(assignment: Partial<Assignment>): Promise<any> {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignment),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create assignment');
    return json;
  },

  async getSubmissions(): Promise<StudentSubmission[]> {
    const res = await fetch(`${API_BASE}/submissions`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async submitAssignment(submission: Partial<StudentSubmission>): Promise<any> {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(submission),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to submit assignment');
    return json;
  },

  async evaluateSubmission(id: string, obtainedMarks: number, feedback: string, teacherName?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/submissions/${id}/evaluate`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ obtainedMarks, feedback, teacherName }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to evaluate submission');
    return json;
  },

  // Marks
  async getMarks(): Promise<SubjectMarks[]> {
    const res = await fetch(`${API_BASE}/marks`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async updateMarksBatch(updates: SubjectMarks[], teacherName?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/marks/batch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ updates, teacherName }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update marks');
    return json;
  },

  // Lab Materials
  async getLabMaterials(): Promise<LabMaterial[]> {
    const res = await fetch(`${API_BASE}/lab-materials`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async addLabMaterial(material: Partial<LabMaterial>): Promise<any> {
    const res = await fetch(`${API_BASE}/lab-materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(material),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to add lab resource');
    return json;
  },

  async deleteLabMaterial(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/lab-materials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete lab material');
    return json;
  },

  // Assessments
  async getAssessments(): Promise<Assessment[]> {
    const res = await fetch(`${API_BASE}/assessments`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async addAssessment(assessment: Partial<Assessment>): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assessment),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to add assessment');
    return json;
  },

  // Notifications
  async getNotifications(userId?: string, role?: string): Promise<NotificationItem[]> {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    if (role) query.append('role', role);
    const res = await fetch(`${API_BASE}/notifications?${query.toString()}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async markNotificationRead(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch(`${API_BASE}/audit-logs`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch audit logs');
    return json.data;
  },

  // Semester Results (Academic History)
  async getSemesterResults(studentId?: string): Promise<SemesterResult[]> {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`${API_BASE}/semester-results${query}`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch semester results');
    return json.data;
  },

  async getStudentSemesterResults(studentId: string): Promise<SemesterResult[]> {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}/semester-results`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch student semester results');
    return json.data;
  },

  async addSemesterResult(result: Partial<SemesterResult>): Promise<any> {
    const res = await fetch(`${API_BASE}/semester-results`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(result),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to save semester result');
    return json;
  },

  async updateSemesterResult(id: string, updates: Partial<SemesterResult>): Promise<any> {
    const res = await fetch(`${API_BASE}/semester-results/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update semester result');
    return json;
  },

  async deleteSemesterResult(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/semester-results/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete semester result');
    return json;
  },

  // System Reset
  async resetSystem(): Promise<any> {
    const res = await fetch(`${API_BASE}/system/reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to reset system');
    return json;
  },

  // Supabase Cloud Integration
  async getSupabaseStatus(): Promise<{
    success: boolean;
    data: {
      isConfigured: boolean;
      url: string | null;
      isServiceRole: boolean;
      hasDatabaseUrl: boolean;
      platform: string;
      message: string;
    };
  }> {
    const res = await fetch(`${API_BASE}/supabase/status`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async testSupabaseConnection(): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
    tablesCount?: number;
    details?: any;
  }> {
    const res = await fetch(`${API_BASE}/supabase/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getSupabaseSchema(): Promise<{
    success: boolean;
    schema: string;
  }> {
    const res = await fetch(`${API_BASE}/supabase/schema`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async initSupabaseTables(): Promise<{
    success: boolean;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/supabase/init-tables`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async syncSupabaseData(): Promise<{
    success: boolean;
    syncedTables: Record<string, number>;
    errors?: string[];
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/supabase/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};

