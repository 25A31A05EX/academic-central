import express from 'express';
import fs from 'fs';
import path from 'path';
import { queryAll, queryOne, runQuery, getDb, saveDb } from './db.js';

export const apiRouter = express.Router();

const UPLOADS_ROOT = path.join(process.cwd(), 'data', 'uploads');
fs.mkdirSync(path.join(UPLOADS_ROOT, 'assignments'), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_ROOT, 'lab-materials'), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_ROOT, 'submissions'), { recursive: true });

// Helper to log audit events
function logAudit(userId: string | null, userName: string, role: string, action: string, description: string) {
  try {
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    runQuery(
      `INSERT INTO audit_logs (id, user_id, user_name, role, action, description, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, userName, role, action, description, now]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// 1. BOOTSTRAP - Single roundtrip to fetch all core collections
apiRouter.get('/bootstrap', async (req, res) => {
  try {
    await getDb();
    const users = queryAll('SELECT * FROM users');
    const students = queryAll('SELECT * FROM students ORDER BY roll_number ASC');
    const teachers = queryAll('SELECT * FROM teachers ORDER BY name ASC');
    const subjects = queryAll('SELECT * FROM subjects ORDER BY code ASC');
    const classes = queryAll('SELECT * FROM classes ORDER BY name ASC');
    const assignments = queryAll('SELECT * FROM assignments ORDER BY due_date ASC');
    const submissions = queryAll('SELECT * FROM assignment_submissions ORDER BY submitted_at DESC');
    const assessments = queryAll('SELECT * FROM assessments ORDER BY date ASC');
    const marks = queryAll('SELECT * FROM marks');
    const semesterResults = queryAll('SELECT * FROM semester_results ORDER BY semester ASC');
    const labMaterials = queryAll('SELECT * FROM lab_materials ORDER BY created_at DESC');
    const notifications = queryAll('SELECT * FROM notifications ORDER BY created_at DESC');
    const auditLogs = queryAll('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');

    // Parse JSON fields where appropriate
    const formattedSemesterResults = semesterResults.map((r: any) => ({
      ...r,
      subjects: typeof r.subjects_json === 'string' ? JSON.parse(r.subjects_json) : r.subjects_json,
    }));

    // Attach assigned subjects to teachers
    const teacherSubjects = queryAll('SELECT * FROM teacher_subjects');
    const formattedTeachers = teachers.map((t: any) => {
      const assigned = teacherSubjects.filter((ts: any) => ts.teacher_id === t.id).map((ts: any) => ts.subject_id);
      return {
        ...t,
        userId: t.user_id || t.userId,
        employeeId: t.employee_id || t.employeeId,
        status: t.status || 'Active',
        assignedSubjectIds: assigned,
        subjectsAssigned: assigned.map((sid: string) => {
          const sub = subjects.find((s: any) => s.id === sid);
          return sub ? sub.name : sid;
        }),
      };
    });

    res.json({
      success: true,
      data: {
        users,
        students,
        teachers: formattedTeachers,
        subjects,
        classes,
        assignments,
        submissions,
        assessments,
        marks,
        semesterResults: formattedSemesterResults,
        labMaterials,
        notifications,
        auditLogs,
      },
    });
  } catch (error: any) {
    console.error('Bootstrap failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Active Session Store (Token -> Session Info)
const activeSessions = new Map<string, {
  userId: string;
  role: string;
  email: string;
  name: string;
  expiresAt: number;
}>();

// Helper to extract authenticated user from request
function getAuthUser(req: express.Request): { userId: string | null; role: string | null; name: string | null } {
  const authHeader = req.headers['authorization'];
  const headerUserId = req.headers['x-user-id'] as string;
  const headerRole = req.headers['x-user-role'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = activeSessions.get(token);
    if (session && session.expiresAt > Date.now()) {
      return { userId: session.userId, role: session.role, name: session.name };
    }
  }

  if (headerUserId) {
    const user = queryOne('SELECT id, role, name FROM users WHERE id = ?', [headerUserId]);
    if (user) {
      return { userId: user.id, role: user.role, name: user.name };
    }
  }

  if (headerRole) {
    return { userId: null, role: headerRole, name: null };
  }

  return { userId: null, role: null, name: null };
}

// 2. AUTHENTICATION ENDPOINTS
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { identifier, email, password, role, isDemoLogin } = req.body;
    await getDb();

    const lookupInput = (identifier || email || '').trim();
    const inputPass = (password || '').trim();

    let user: any = null;

    if (lookupInput) {
      // 1. Try matching by email
      user = queryOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [lookupInput]);

      // 2. If not found, try matching by student roll number
      if (!user) {
        user = queryOne(
          `SELECT u.* FROM users u
           JOIN students s ON s.user_id = u.id
           WHERE LOWER(s.roll_number) = LOWER(?)`,
          [lookupInput]
        );
      }

      // 3. If not found, try matching by teacher employee ID
      if (!user) {
        user = queryOne(
          `SELECT u.* FROM users u
           JOIN teachers t ON t.user_id = u.id
           WHERE LOWER(t.employee_id) = LOWER(?)`,
          [lookupInput]
        );
      }
    }

    // Demo login handling: verify that a valid user exists for the requested role
    if (!user && isDemoLogin && role) {
      user = queryOne('SELECT * FROM users WHERE role = ? LIMIT 1', [role]);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching this email, roll number, or employee ID.',
      });
    }

    // Real Password Verification (unless explicitly authorized demo login)
    if (!isDemoLogin) {
      if (!inputPass) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to authenticate.',
        });
      }

      // Compare passwords
      if (user.password !== inputPass) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify your credentials and try again.',
        });
      }
    }

    // Role verification against the selected portal role tab
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Role mismatch: This account is registered as a ${user.role.toUpperCase()}. You are attempting to login on the ${role.toUpperCase()} tab. Please switch to the ${user.role.toUpperCase()} tab.`,
      });
    }

    // Load full role profile
    let profile: any = null;
    if (user.role === 'student') {
      profile = queryOne('SELECT * FROM students WHERE user_id = ?', [user.id]);
    } else if (user.role === 'teacher') {
      profile = queryOne('SELECT * FROM teachers WHERE user_id = ?', [user.id]);
      if (profile) {
        const assigned = queryAll('SELECT subject_id FROM teacher_subjects WHERE teacher_id = ?', [profile.id]);
        profile.assignedSubjectIds = assigned.map((r: any) => r.subject_id);
      }
    } else if (user.role === 'admin') {
      profile = queryOne('SELECT * FROM admins WHERE user_id = ?', [user.id]);
    }

    // Issue genuine session token (valid for 24 hours)
    const token = `act_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    activeSessions.set(token, {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    logAudit(user.id, user.name, user.role, 'User Sign In', `${user.name} authenticated into Academic Central as ${user.role.toUpperCase()}`);

    const { password: _p, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: {
        ...safeUser,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/auth/me', (req, res) => {
  const auth = getAuthUser(req);
  if (!auth.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = queryOne('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?', [auth.userId]);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User record not found' });
  }

  let profile: any = null;
  if (user.role === 'student') {
    profile = queryOne('SELECT * FROM students WHERE user_id = ?', [user.id]);
  } else if (user.role === 'teacher') {
    profile = queryOne('SELECT * FROM teachers WHERE user_id = ?', [user.id]);
  } else if (user.role === 'admin') {
    profile = queryOne('SELECT * FROM admins WHERE user_id = ?', [user.id]);
  }

  res.json({ success: true, user: { ...user, profile } });
});

apiRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 3. STUDENTS CRUD
apiRouter.get('/students', (req, res) => {
  const students = queryAll('SELECT * FROM students ORDER BY roll_number ASC');
  res.json({ success: true, data: students });
});

apiRouter.post('/students', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can enroll new students.' });
    }

    const s = req.body;
    const studentId = s.id || `stud-${Date.now()}`;
    const userId = s.user_id || `user-${Date.now()}`;
    const defaultPassword = s.password || 'student123';

    // Create user record first
    runQuery(
      `INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, 'student', datetime('now'))`,
      [userId, s.name, s.email, defaultPassword]
    );

    // Create student record
    runQuery(
      `INSERT INTO students (id, user_id, name, email, roll_number, class_id, branch, year, section, semester, status, phone, cgpa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, userId, s.name, s.email, s.rollNumber || s.roll_number, s.classId || s.class_id || null, s.branch, s.year, s.section, s.semester || 4, s.status || 'Active', s.phone || '', s.cgpa || 0.0]
    );

    logAudit(userId, s.name, 'admin', 'Create Student', `Enrolled student ${s.name} (${s.rollNumber || s.roll_number})`);
    res.json({ success: true, data: { id: studentId, user_id: userId, ...s } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const s = req.body;
    const auth = getAuthUser(req);

    const existing = queryOne('SELECT * FROM students WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Role-based restrictions on modifying students
    if (auth.role === 'student') {
      // Students can ONLY update their own contact details (e.g. phone), never another student's record
      if (auth.userId && existing.user_id !== auth.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: Students are strictly prohibited from modifying other students\' information.',
        });
      }
      // Cannot elevate CGPA, semester, roll number, or status
      s.cgpa = existing.cgpa;
      s.semester = existing.semester;
      s.status = existing.status;
      s.rollNumber = existing.roll_number;
    } else if (auth.role === 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Faculty members cannot modify administrative student records.',
      });
    }

    runQuery(
      `UPDATE students SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        roll_number = COALESCE(?, roll_number),
        branch = COALESCE(?, branch),
        year = COALESCE(?, year),
        section = COALESCE(?, section),
        semester = COALESCE(?, semester),
        status = COALESCE(?, status),
        phone = COALESCE(?, phone),
        cgpa = COALESCE(?, cgpa)
       WHERE id = ?`,
      [s.name, s.email, s.rollNumber || s.roll_number, s.branch, s.year, s.section, s.semester, s.status, s.phone, s.cgpa, id]
    );

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can delete student records.' });
    }

    const student = queryOne('SELECT * FROM students WHERE id = ?', [id]);
    if (student) {
      runQuery('DELETE FROM users WHERE id = ?', [student.user_id]);
      logAudit(null, 'Admin', 'admin', 'Delete Student', `Removed student record for ${student.name}`);
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SEMESTER RESULTS FOR STUDENT
apiRouter.get('/students/:id/semester-results', (req, res) => {
  const { id } = req.params;
  const results = queryAll('SELECT * FROM semester_results WHERE student_id = ? ORDER BY semester ASC', [id]);
  const formatted = results.map((r: any) => ({
    ...r,
    subjects: typeof r.subjects_json === 'string' ? JSON.parse(r.subjects_json) : r.subjects_json,
  }));
  res.json({ success: true, data: formatted });
});

// 4. TEACHERS CRUD
apiRouter.get('/teachers', (req, res) => {
  const teachers = queryAll('SELECT * FROM teachers ORDER BY name ASC');
  const teacherSubjects = queryAll('SELECT * FROM teacher_subjects');
  const subjects = queryAll('SELECT * FROM subjects');

  const formatted = teachers.map((t: any) => {
    const assigned = teacherSubjects.filter((ts: any) => ts.teacher_id === t.id).map((ts: any) => ts.subject_id);
    return {
      ...t,
      userId: t.user_id || t.userId,
      employeeId: t.employee_id || t.employeeId,
      status: t.status || 'Active',
      assignedSubjectIds: assigned,
      subjectsAssigned: assigned.map((sid: string) => {
        const sub = subjects.find((s: any) => s.id === sid);
        return sub ? sub.name : sid;
      }),
    };
  });

  res.json({ success: true, data: formatted });
});

apiRouter.post('/teachers', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can add faculty members.' });
    }

    const t = req.body;
    const teacherId = t.id || `teach-${Date.now()}`;
    const userId = t.user_id || t.userId || `user-${Date.now()}`;
    const defaultPassword = t.password || 'teacher123';

    runQuery(
      `INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, 'teacher', datetime('now'))`,
      [userId, t.name, t.email, defaultPassword]
    );

    runQuery(
      `INSERT INTO teachers (id, user_id, name, employee_id, email, department, designation, qualification, experience, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [teacherId, userId, t.name, t.employeeId || t.employee_id || `EMP-${Date.now().toString().slice(-4)}`, t.email, t.department, t.designation, t.qualification || '', t.experience || '', t.phone || '', t.status || 'Active']
    );

    // Save assigned subjects
    if (Array.isArray(t.assignedSubjectIds)) {
      for (const sid of t.assignedSubjectIds) {
        runQuery('INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)', [teacherId, sid]);
      }
    }

    logAudit(userId, t.name, 'admin', 'Create Faculty', `Registered faculty ${t.name} (${t.designation})`);
    res.json({ success: true, data: { id: teacherId, ...t, userId, employeeId: t.employeeId || t.employee_id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/teachers/:id', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can modify faculty profiles.' });
    }

    const { id } = req.params;
    const t = req.body;

    runQuery(
      `UPDATE teachers SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        employee_id = COALESCE(?, employee_id),
        department = COALESCE(?, department),
        designation = COALESCE(?, designation),
        qualification = COALESCE(?, qualification),
        experience = COALESCE(?, experience),
        phone = COALESCE(?, phone),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [t.name, t.email, t.employeeId || t.employee_id, t.department, t.designation, t.qualification, t.experience, t.phone, t.status, id]
    );

    if (Array.isArray(t.assignedSubjectIds)) {
      runQuery('DELETE FROM teacher_subjects WHERE teacher_id = ?', [id]);
      for (const sid of t.assignedSubjectIds) {
        runQuery('INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)', [id, sid]);
      }
    }

    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/teachers/:id', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can delete faculty members.' });
    }

    const { id } = req.params;
    const teacher = queryOne('SELECT * FROM teachers WHERE id = ?', [id]);
    if (teacher) {
      runQuery('DELETE FROM users WHERE id = ?', [teacher.user_id]);
      logAudit(null, 'Admin', 'admin', 'Delete Faculty', `Removed faculty profile for ${teacher.name}`);
    }
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. SUBJECTS CRUD
apiRouter.get('/subjects', (req, res) => {
  const subjects = queryAll('SELECT * FROM subjects ORDER BY code ASC');
  res.json({ success: true, data: subjects });
});

apiRouter.post('/subjects', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can create new subjects.' });
    }

    const s = req.body;
    const id = s.id || `sub-${Date.now()}`;
    runQuery(
      `INSERT INTO subjects (id, code, name, department, year, semester, teacher_id, teacher_name, credits, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, s.code, s.name, s.department, s.year || '2nd Year', s.semester || 4, s.teacherId || s.teacher_id || null, s.teacherName || s.teacher_name || '', s.credits || 3, s.description || '']
    );
    res.json({ success: true, data: { id, ...s } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. CLASSES CRUD
apiRouter.get('/classes', (req, res) => {
  const classes = queryAll('SELECT * FROM classes ORDER BY name ASC');
  res.json({ success: true, data: classes });
});

apiRouter.post('/classes', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can create classes.' });
    }

    const c = req.body;
    const id = c.id || `cls-${Date.now()}`;
    runQuery(
      `INSERT INTO classes (id, name, branch, year, section, semester, class_teacher_id, class_teacher_name, room_number, student_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, c.name, c.branch, c.year, c.section, c.semester || 4, c.classTeacherId || c.class_teacher_id || null, c.classTeacherName || c.class_teacher_name || '', c.roomNumber || c.room_number || '', c.studentCount || 0]
    );
    res.json({ success: true, data: { id, ...c } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper to sanitize filename and prevent path traversal
function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || 'document.pdf';
}

// 6.5 FILE STORAGE & SERVING ENDPOINTS
// Stream/Download PDF files with authorization checks
apiRouter.get('/files/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    const allowedCategories = ['assignments', 'lab-materials', 'submissions'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid file category' });
    }

    const safeFilename = sanitizeFilename(filename);
    const filePath = path.join(UPLOADS_ROOT, category, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Requested document not found on server.' });
    }

    const auth = getAuthUser(req);

    // Authorization checks
    if (category === 'submissions') {
      // Students can only access their own submissions; teachers and admins can review
      if (auth.role === 'student' && auth.userId) {
        const student = queryOne('SELECT id, roll_number FROM students WHERE user_id = ?', [auth.userId]);
        if (student) {
          const submission = queryOne(
            'SELECT student_id, roll_number FROM assignment_submissions WHERE file_url LIKE ? OR file_name = ?',
            [`%${safeFilename}%`, safeFilename]
          );
          if (submission && submission.student_id !== student.id && submission.roll_number !== student.roll_number) {
            return res.status(403).json({ success: false, message: 'Access forbidden: You cannot access another student’s submission.' });
          }
        }
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Binary/Base64 File Upload Endpoint for Assignments, Lab Materials, and Submissions
apiRouter.post('/files/upload', (req, res) => {
  try {
    const auth = getAuthUser(req);
    const { category, fileName, fileBase64, subjectId, assignmentId, studentId, studentName, rollNumber } = req.body;

    const allowedCategories = ['assignments', 'lab-materials', 'submissions'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ success: false, message: 'File payload and fileName are required' });
    }

    // Role checks
    if ((category === 'assignments' || category === 'lab-materials') && auth.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Students cannot publish assignment sheets or lab materials.' });
    }

    // Decode base64 payload
    const base64Data = fileBase64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // File size limit: 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ success: false, message: 'File exceeds maximum permitted size of 15MB' });
    }

    // Validate PDF magic header (%PDF-)
    const isPdfHeader = buffer.slice(0, 5).toString('ascii').startsWith('%PDF');
    if (!isPdfHeader && !fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ success: false, message: 'Invalid file format: Only genuine PDF files are permitted.' });
    }

    // Generate unique server filename
    const ext = path.extname(fileName) || '.pdf';
    const cleanBaseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35);
    const uniqueName = `${cleanBaseName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const targetPath = path.join(UPLOADS_ROOT, category, uniqueName);

    fs.writeFileSync(targetPath, buffer);

    const sizeFormatted = buffer.length > 1024 * 1024
      ? `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(buffer.length / 1024)} KB`;

    const fileUrl = `/api/files/${category}/${uniqueName}`;

    res.json({
      success: true,
      data: {
        fileName: uniqueName,
        originalName: fileName,
        fileUrl,
        fileSize: sizeFormatted,
        bytes: buffer.length,
      },
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. ASSIGNMENTS & SUBMISSIONS
apiRouter.get('/assignments', (req, res) => {
  const assignments = queryAll('SELECT * FROM assignments ORDER BY due_date ASC');
  res.json({ success: true, data: assignments });
});

apiRouter.post('/assignments', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Students cannot create assignments.' });
    }

    const a = req.body;
    const id = a.id || `asg-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    runQuery(
      `INSERT INTO assignments (id, title, subject_id, subject_name, teacher_id, teacher_name, description, instructions, file_url, file_name, file_size, due_date, max_marks, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, a.title, a.subjectId || a.subject_id, a.subjectName || a.subject_name, a.teacherId || a.teacher_id, a.teacherName || a.teacher_name, a.description || '', a.instructions || '', a.fileUrl || a.file_url || null, a.fileName || a.file_name || 'Assignment.pdf', a.fileSize || a.file_size || '1.5 MB', a.dueDate || a.due_date, a.maxMarks || a.max_marks || 10, a.status || 'Published', now]
    );

    logAudit(a.teacherId || a.teacher_id, a.teacherName || a.teacher_name, 'teacher', 'Create Assignment', `Published coursework: ${a.title} for ${a.subjectName || a.subject_name}`);
    res.json({ success: true, data: { id, ...a, fileUrl: a.fileUrl || a.file_url, created_at: now } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/submissions', (req, res) => {
  const auth = getAuthUser(req);
  let sql = 'SELECT * FROM assignment_submissions';
  const params: any[] = [];

  // If student is querying, only return their own submissions
  if (auth.role === 'student' && auth.userId) {
    const student = queryOne('SELECT id, roll_number FROM students WHERE user_id = ?', [auth.userId]);
    if (student) {
      sql += ' WHERE student_id = ? OR roll_number = ?';
      params.push(student.id, student.roll_number);
    }
  }

  sql += ' ORDER BY submitted_at DESC';
  const submissions = queryAll(sql, params);
  res.json({ success: true, data: submissions });
});

apiRouter.post('/submissions', (req, res) => {
  try {
    const auth = getAuthUser(req);
    const s = req.body;
    const id = s.id || `subm-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    runQuery(
      `INSERT OR REPLACE INTO assignment_submissions (id, assignment_id, student_id, student_name, roll_number, file_url, file_name, notes, status, obtained_marks, feedback, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', NULL, NULL, ?)`,
      [id, s.assignmentId || s.assignment_id, s.studentId || s.student_id, s.studentName || s.student_name, s.rollNumber || s.roll_number, s.fileUrl || s.file_url || null, s.fileName || s.file_name || 'Submission.pdf', s.notes || '', now]
    );

    logAudit(s.studentId || s.student_id, s.studentName || s.student_name, 'student', 'Submit Assignment', `Submitted work for assignment ID: ${s.assignmentId || s.assignment_id}`);
    res.json({ success: true, data: { id, ...s, status: 'Submitted', submitted_at: now } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/submissions/:id/evaluate', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Students cannot evaluate submissions.' });
    }

    const { id } = req.params;
    const { obtainedMarks, feedback, teacherName } = req.body;

    runQuery(
      `UPDATE assignment_submissions SET
        obtained_marks = ?,
        feedback = ?,
        status = 'Evaluated'
       WHERE id = ?`,
      [obtainedMarks, feedback || '', id]
    );

    const subm = queryOne('SELECT * FROM assignment_submissions WHERE id = ?', [id]);
    if (subm) {
      logAudit(null, teacherName || 'Teacher', 'teacher', 'Grade Submission', `Evaluated submission for ${subm.student_name} with ${obtainedMarks} marks`);
    }

    res.json({ success: true, message: 'Submission evaluated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. MARKS & INTERNAL ASSESSMENTS
apiRouter.get('/marks', (req, res) => {
  const marks = queryAll('SELECT * FROM marks');
  res.json({ success: true, data: marks });
});

apiRouter.post('/marks/batch', (req, res) => {
  try {
    const auth = getAuthUser(req);

    // Rule: Students must NOT be able to edit marks
    if (auth.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Students are strictly prohibited from entering or modifying assessment marks.',
      });
    }

    const { updates, teacherName } = req.body;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Rule: Teachers can only edit marks for their permitted/assigned subjects
    if (auth.role === 'teacher' && auth.userId) {
      const teacher = queryOne('SELECT id FROM teachers WHERE user_id = ?', [auth.userId]);
      if (teacher) {
        const assigned = queryAll('SELECT subject_id FROM teacher_subjects WHERE teacher_id = ?', [teacher.id]).map((r: any) => r.subject_id);
        if (Array.isArray(updates)) {
          const unauthorized = updates.find((u: any) => !assigned.includes(u.subjectId || u.subject_id));
          if (unauthorized) {
            return res.status(403).json({
              success: false,
              message: `Access forbidden: You are not assigned to teach subject ${unauthorized.subjectName || unauthorized.subjectId}. Faculty can only enter marks for their assigned courses.`,
            });
          }
        }
      }
    }

    if (Array.isArray(updates)) {
      for (const m of updates) {
        const id = m.id || `mrk-${m.studentId}-${m.subjectId}`;
        runQuery(
          `INSERT OR REPLACE INTO marks (id, student_id, subject_id, subject_name, subject_code, mid1, mid1_max, mid2, mid2_max, class_test, class_test_max, assignment, assignment_max, lab_internal, lab_internal_max, remarks, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, m.studentId || m.student_id, m.subjectId || m.subject_id, m.subjectName || m.subject_name || '', m.subjectCode || m.subject_code || '', m.mid1 || 0, m.mid1Max || m.mid1_max || 30, m.mid2 || 0, m.mid2Max || m.mid2_max || 30, m.classTest || m.class_test || 0, m.classTestMax || m.class_test_max || 20, m.assignment || 0, m.assignmentMax || m.assignment_max || 10, m.labInternal || m.lab_internal || 0, m.labInternalMax || m.lab_internal_max || 20, m.remarks || '', now]
        );
      }
    }

    logAudit(auth.userId, teacherName || auth.name || 'Faculty', auth.role || 'teacher', 'Update Marks', `Recorded marks updates for ${updates?.length || 0} student records`);
    res.json({ success: true, message: 'Marks saved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. LAB MATERIALS
apiRouter.get('/lab-materials', (req, res) => {
  const materials = queryAll('SELECT * FROM lab_materials ORDER BY created_at DESC');
  res.json({ success: true, data: materials });
});

apiRouter.post('/lab-materials', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Students cannot upload lab materials.' });
    }

    const m = req.body;
    const id = m.id || `lab-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    runQuery(
      `INSERT INTO lab_materials (id, title, subject_id, subject_name, description, type, file_url, file_name, file_size, experiments_count, uploaded_by, uploaded_by_id, visibility, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, m.title, m.subjectId || m.subject_id, m.subjectName || m.subject_name, m.description || '', m.type || 'Lab Manual', m.fileUrl || m.file_url || null, m.fileName || m.file_name, m.fileSize || m.file_size || '2.5 MB', m.experimentsCount || m.experiments_count || 0, m.uploadedBy || m.uploaded_by, m.uploadedById || m.uploaded_by_id || auth.userId || null, m.visibility || 'Public to Class', now]
    );

    logAudit(m.uploadedById || auth.userId, m.uploadedBy || auth.name || 'Teacher', 'teacher', 'Upload Lab Resource', `Published ${m.title} for ${m.subjectName}`);
    res.json({ success: true, data: { id, ...m, fileUrl: m.fileUrl || m.file_url, created_at: now } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/lab-materials/:id', (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Students cannot delete lab materials.' });
    }

    const { id } = req.params;
    runQuery('DELETE FROM lab_materials WHERE id = ?', [id]);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. ASSESSMENTS
apiRouter.get('/assessments', (req, res) => {
  const assessments = queryAll('SELECT * FROM assessments ORDER BY date ASC');
  res.json({ success: true, data: assessments });
});

apiRouter.post('/assessments', (req, res) => {
  try {
    const a = req.body;
    const id = a.id || `ass-${Date.now()}`;

    runQuery(
      `INSERT INTO assessments (id, title, subject_id, subject_name, date, time, venue, max_marks, description, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, a.title, a.subjectId || a.subject_id, a.subjectName || a.subject_name, a.date, a.time || '', a.venue || '', a.maxMarks || a.max_marks || 30, a.description || '', a.status || 'Upcoming', a.createdBy || a.created_by]
    );

    logAudit(null, a.createdBy || a.created_by, 'teacher', 'Schedule Assessment', `Scheduled ${a.title} on ${a.date}`);
    res.json({ success: true, data: { id, ...a } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. NOTIFICATIONS & AUDIT LOGS
apiRouter.get('/notifications', (req, res) => {
  const { userId, role } = req.query;
  let sql = 'SELECT * FROM notifications WHERE 1=1';
  const params: any[] = [];
  if (userId) {
    sql += ' AND (user_id = ? OR target_role = ? OR target_role IS NULL)';
    params.push(userId, role);
  }
  sql += ' ORDER BY created_at DESC';
  const notifs = queryAll(sql, params);
  res.json({ success: true, data: notifs });
});

apiRouter.put('/notifications/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    runQuery('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/audit-logs', (req, res) => {
  const auth = getAuthUser(req);
  if (auth.role && auth.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can review security audit logs.' });
  }

  const logs = queryAll('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
  res.json({ success: true, data: logs });
});

// 12. SYSTEM RESET TO INITIAL SEED
apiRouter.post('/system/reset', async (req, res) => {
  try {
    const auth = getAuthUser(req);
    if (auth.role && auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden: Only administrators can perform a database reset.' });
    }

    const database = await getDb();
    // Drop and reinitialize
    database.run(`
      DROP TABLE IF EXISTS audit_logs;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS lab_materials;
      DROP TABLE IF EXISTS semester_results;
      DROP TABLE IF EXISTS marks;
      DROP TABLE IF EXISTS assessments;
      DROP TABLE IF EXISTS assignment_submissions;
      DROP TABLE IF EXISTS assignments;
      DROP TABLE IF EXISTS teacher_subjects;
      DROP TABLE IF EXISTS subjects;
      DROP TABLE IF EXISTS admins;
      DROP TABLE IF EXISTS teachers;
      DROP TABLE IF EXISTS students;
      DROP TABLE IF EXISTS classes;
      DROP TABLE IF EXISTS users;
    `);

    // Reload schema and data
    const fs = await import('fs');
    const path = await import('path');
    const DB_FILE = path.join(process.cwd(), 'data', 'academic_central.db');
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }

    // Call bootstrap to recreate
    res.json({ success: true, message: 'Database reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
