import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'academic_central.db');

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    try {
      db.run('ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT "password123";');
      // Set distinct demo passwords for seeded users
      db.run('UPDATE users SET password = "student123" WHERE role = "student" AND password = "password123"');
      db.run('UPDATE users SET password = "teacher123" WHERE role = "teacher" AND password = "password123"');
      db.run('UPDATE users SET password = "admin123" WHERE role = "admin" AND password = "password123"');
    } catch (_) {}
  } else {
    db = new SQL.Database();
    initSchema(db);
    seedInitialData(db);
    saveDb();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function runQuery(sql: string, params: any[] = []): void {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  saveDb();
}

function initSchema(database: Database) {
  database.run(`
    -- 1. USERS
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'password123',
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    -- 2. CLASSES
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      branch TEXT NOT NULL,
      year TEXT NOT NULL,
      section TEXT NOT NULL,
      semester INTEGER NOT NULL,
      class_teacher_id TEXT,
      class_teacher_name TEXT,
      room_number TEXT,
      student_count INTEGER DEFAULT 0
    );

    -- 3. STUDENTS
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
      branch TEXT NOT NULL,
      year TEXT NOT NULL,
      section TEXT NOT NULL,
      semester INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      phone TEXT,
      cgpa REAL DEFAULT 0.0
    );

    -- 4. TEACHERS
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE,
      email TEXT NOT NULL,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      qualification TEXT,
      experience TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'Active'
    );

    -- 5. ADMINS
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      department TEXT DEFAULT 'Office of Academic Affairs',
      role_title TEXT DEFAULT 'Dean of Academics'
    );

    -- 6. SUBJECTS
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      year TEXT,
      semester INTEGER NOT NULL,
      teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
      teacher_name TEXT,
      credits INTEGER NOT NULL DEFAULT 3,
      description TEXT
    );

    -- 7. TEACHER SUBJECT ALLOCATIONS (Many-to-Many)
    CREATE TABLE IF NOT EXISTS teacher_subjects (
      teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      PRIMARY KEY (teacher_id, subject_id)
    );

    -- 8. ASSIGNMENTS
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      subject_name TEXT NOT NULL,
      teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
      teacher_name TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      file_url TEXT,
      file_name TEXT,
      file_size TEXT,
      due_date TEXT NOT NULL,
      max_marks INTEGER NOT NULL DEFAULT 10,
      status TEXT NOT NULL DEFAULT 'Published',
      created_at TEXT NOT NULL
    );

    -- 9. ASSIGNMENT SUBMISSIONS
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      file_url TEXT,
      file_name TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'Submitted',
      obtained_marks REAL,
      feedback TEXT,
      submitted_at TEXT NOT NULL,
      UNIQUE(assignment_id, student_id)
    );

    -- 10. ASSESSMENTS
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      subject_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      venue TEXT,
      max_marks INTEGER NOT NULL DEFAULT 30,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Upcoming',
      created_by TEXT NOT NULL
    );

    -- 11. MARKS (Continuous Internal Assessment)
    CREATE TABLE IF NOT EXISTS marks (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      subject_name TEXT NOT NULL,
      subject_code TEXT NOT NULL,
      mid1 REAL DEFAULT 0,
      mid1_max REAL DEFAULT 30,
      mid2 REAL DEFAULT 0,
      mid2_max REAL DEFAULT 30,
      class_test REAL DEFAULT 0,
      class_test_max REAL DEFAULT 20,
      assignment REAL DEFAULT 0,
      assignment_max REAL DEFAULT 10,
      lab_internal REAL DEFAULT 0,
      lab_internal_max REAL DEFAULT 20,
      remarks TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(student_id, subject_id)
    );

    -- 12. SEMESTER RESULTS (Academic History / Transcripts)
    CREATE TABLE IF NOT EXISTS semester_results (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      semester INTEGER NOT NULL,
      academic_year TEXT NOT NULL,
      sgpa REAL NOT NULL,
      credits_registered INTEGER NOT NULL,
      credits_earned INTEGER NOT NULL,
      result_status TEXT NOT NULL DEFAULT 'Pass',
      subjects_json TEXT NOT NULL,
      published_date TEXT NOT NULL
    );

    -- 13. LAB MATERIALS
    CREATE TABLE IF NOT EXISTS lab_materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      subject_name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'Lab Manual',
      file_url TEXT,
      file_name TEXT NOT NULL,
      file_size TEXT NOT NULL,
      experiments_count INTEGER DEFAULT 0,
      uploaded_by TEXT NOT NULL,
      uploaded_by_id TEXT,
      visibility TEXT DEFAULT 'Public to Class',
      created_at TEXT NOT NULL
    );

    -- 14. NOTIFICATIONS
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_role TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    -- 15. AUDIT LOGS
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
    CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
    CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
    CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON assignments(subject_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON assignment_submissions(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON assignment_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
    CREATE INDEX IF NOT EXISTS idx_marks_subject_id ON marks(subject_id);
    CREATE INDEX IF NOT EXISTS idx_semester_results_student_id ON semester_results(student_id);
    CREATE INDEX IF NOT EXISTS idx_lab_materials_subject_id ON lab_materials(subject_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  `);
}

function seedInitialData(database: Database) {
  // 1. Users
  database.run(`
    INSERT INTO users (id, name, email, password, role, avatar_url, created_at) VALUES
    ('user-student-1', 'Rahul Sharma', 'student@academiccentral.demo', 'student123', 'student', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', '2026-08-01 09:00:00'),
    ('user-student-2', 'Ananya Patel', 'ananya.p@academiccentral.demo', 'ananya123', 'student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '2026-08-01 09:15:00'),
    ('user-student-3', 'Vikram Singh', 'vikram.s@academiccentral.demo', 'vikram123', 'student', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2026-08-01 09:30:00'),
    ('user-student-4', 'Sneha Reddy', 'sneha.r@academiccentral.demo', 'sneha123', 'student', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '2026-08-01 09:45:00'),
    ('user-student-5', 'Amit Verma', 'amit.v@academiccentral.demo', 'amit123', 'student', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '2026-08-01 10:00:00'),
    ('user-teacher-1', 'Dr. Priya Kumar', 'teacher@academiccentral.demo', 'teacher123', 'teacher', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '2026-07-15 08:30:00'),
    ('user-teacher-2', 'Prof. Rajesh Verma', 'rajesh.v@academiccentral.demo', 'rajesh123', 'teacher', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', '2026-07-15 09:00:00'),
    ('user-teacher-3', 'Dr. Sunita Rao', 'sunita.r@academiccentral.demo', 'sunita123', 'teacher', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '2026-07-15 09:30:00'),
    ('user-teacher-4', 'Prof. Arvind Menon', 'arvind.m@academiccentral.demo', 'arvind123', 'teacher', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', '2026-07-15 10:00:00'),
    ('user-admin-1', 'Dr. K. S. Rao', 'admin@academiccentral.demo', 'admin123', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '2026-06-01 08:00:00');
  `);

  // 2. Teachers
  database.run(`
    INSERT INTO teachers (id, user_id, name, employee_id, email, department, designation, qualification, experience, phone, status) VALUES
    ('teach-1', 'user-teacher-1', 'Dr. Priya Kumar', 'EMP-CS-101', 'teacher@academiccentral.demo', 'Computer Science & Engineering', 'Professor & Head', 'Ph.D. in Computer Science', '14 Years', '+91 98451 22345', 'Active'),
    ('teach-2', 'user-teacher-2', 'Prof. Rajesh Verma', 'EMP-CS-108', 'rajesh.v@academiccentral.demo', 'Computer Science & Engineering', 'Associate Professor', 'M.Tech in Software Engineering', '9 Years', '+91 98452 33456', 'Active'),
    ('teach-3', 'user-teacher-3', 'Dr. Sunita Rao', 'EMP-CS-112', 'sunita.r@academiccentral.demo', 'Information Technology', 'Assistant Professor', 'Ph.D. in Distributed Systems', '6 Years', '+91 98453 44567', 'Active'),
    ('teach-4', 'user-teacher-4', 'Prof. Arvind Menon', 'EMP-CS-119', 'arvind.m@academiccentral.demo', 'Computer Science & Engineering', 'Assistant Professor', 'M.Tech in Cyber Security', '5 Years', '+91 98454 55678', 'Active');
  `);

  // 3. Classes
  database.run(`
    INSERT INTO classes (id, name, branch, year, section, semester, class_teacher_id, class_teacher_name, room_number, student_count) VALUES
    ('cls-1', 'CSE 2nd Year - Sec A', 'Computer Science & Engineering', '2nd Year', 'A', 4, 'teach-1', 'Dr. Priya Kumar', 'LH-201', 64),
    ('cls-2', 'CSE 2nd Year - Sec B', 'Computer Science & Engineering', '2nd Year', 'B', 4, 'teach-2', 'Prof. Rajesh Verma', 'LH-202', 62),
    ('cls-3', 'CSE 3rd Year - Sec A', 'Computer Science & Engineering', '3rd Year', 'A', 6, 'teach-3', 'Dr. Sunita Rao', 'LH-305', 58),
    ('cls-4', 'IT 2nd Year - Sec A', 'Information Technology', '2nd Year', 'A', 4, 'teach-4', 'Prof. Arvind Menon', 'LH-104', 60);
  `);

  // 4. Students
  database.run(`
    INSERT INTO students (id, user_id, name, email, roll_number, class_id, branch, year, section, semester, status, phone, cgpa) VALUES
    ('stud-1', 'user-student-1', 'Rahul Sharma', 'student@academiccentral.demo', '23CS101', 'cls-1', 'Computer Science', '2nd Year', 'A', 4, 'Active', '+91 98765 43210', 8.42),
    ('stud-2', 'user-student-2', 'Ananya Patel', 'ananya.p@academiccentral.demo', '23CS102', 'cls-1', 'Computer Science', '2nd Year', 'A', 4, 'Active', '+91 98765 43211', 9.15),
    ('stud-3', 'user-student-3', 'Vikram Singh', 'vikram.s@academiccentral.demo', '23CS103', 'cls-1', 'Computer Science', '2nd Year', 'A', 4, 'Active', '+91 98765 43212', 7.85),
    ('stud-4', 'user-student-4', 'Sneha Reddy', 'sneha.r@academiccentral.demo', '23CS104', 'cls-1', 'Computer Science', '2nd Year', 'A', 4, 'Active', '+91 98765 43213', 8.90),
    ('stud-5', 'user-student-5', 'Amit Verma', 'amit.v@academiccentral.demo', '23CS105', 'cls-1', 'Computer Science', '2nd Year', 'A', 4, 'Active', '+91 98765 43214', 7.60);
  `);

  // 5. Admins
  database.run(`
    INSERT INTO admins (id, user_id, name, email, department, role_title) VALUES
    ('adm-1', 'user-admin-1', 'Dr. K. S. Rao', 'admin@academiccentral.demo', 'Office of Academic Affairs', 'Dean of Academics');
  `);

  // 6. Subjects
  database.run(`
    INSERT INTO subjects (id, code, name, department, year, semester, teacher_id, teacher_name, credits, description) VALUES
    ('sub-1', 'CS401', 'Data Structures & Algorithms', 'Computer Science', '2nd Year', 4, 'teach-1', 'Dr. Priya Kumar', 4, 'Advanced algorithmic techniques, trees, graphs, dynamic programming, and complexity.'),
    ('sub-2', 'CS402', 'Operating Systems', 'Computer Science', '2nd Year', 4, 'teach-2', 'Prof. Rajesh Verma', 4, 'Process management, concurrency, virtual memory, file systems, and scheduling algorithms.'),
    ('sub-3', 'CS403', 'Database Management Systems', 'Computer Science', '2nd Year', 4, 'teach-1', 'Dr. Priya Kumar', 4, 'Relational algebra, SQL, normalization, concurrency control, and indexing.'),
    ('sub-4', 'CS404', 'Computer Networks', 'Computer Science', '2nd Year', 4, 'teach-3', 'Dr. Sunita Rao', 3, 'OSI layers, TCP/IP protocol suite, routing protocols, and network socket programming.'),
    ('sub-5', 'CS405', 'Web Technologies', 'Computer Science', '2nd Year', 4, 'teach-4', 'Prof. Arvind Menon', 3, 'Full-stack web architecture, React, Node.js, RESTful services, and modern cloud deployment.');
  `);

  // 7. Teacher Subjects
  database.run(`
    INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
    ('teach-1', 'sub-1'),
    ('teach-1', 'sub-3'),
    ('teach-2', 'sub-2'),
    ('teach-3', 'sub-4'),
    ('teach-4', 'sub-5');
  `);

  // 8. Assignments
  database.run(`
    INSERT INTO assignments (id, title, subject_id, subject_name, teacher_id, teacher_name, description, instructions, file_url, file_name, file_size, due_date, max_marks, status, created_at) VALUES
    ('asg-1', 'Implementation of AVL Trees & Red-Black Trees', 'sub-1', 'Data Structures & Algorithms', 'teach-1', 'Dr. Priya Kumar', 'Implement self-balancing binary search trees with insertion, deletion, and rotation operations in C++ or Java.', 'Submit complete source code with sample test executions and analysis report as PDF.', '/api/files/assignments/CS401_Assignment_2_BalancedTrees.pdf', 'CS401_Assignment_2_BalancedTrees.pdf', '2.4 MB', '2026-09-28', 10, 'Published', '2026-09-10 10:00:00'),
    ('asg-2', 'Process Synchronization with Mutex & Semaphores', 'sub-2', 'Operating Systems', 'teach-2', 'Prof. Rajesh Verma', 'Solve the Classical Dining Philosophers problem avoiding deadlocks using POSIX pthread semaphores.', 'Include synchronization diagrams and trace logs.', '/api/files/assignments/CS402_Sync_Assignment.pdf', 'CS402_Sync_Assignment.pdf', '1.8 MB', '2026-09-30', 10, 'Published', '2026-09-12 11:30:00'),
    ('asg-3', 'E-Commerce Schema Design & Normalization (3NF/BCNF)', 'sub-3', 'Database Management Systems', 'teach-1', 'Dr. Priya Kumar', 'Design complete ER diagram and relational schemas with 3NF decomposition for multi-vendor retail store.', 'Provide DDL statements and sample relational algebra queries.', '/api/files/assignments/CS403_Schema_Normalization_Case.pdf', 'CS403_Schema_Normalization_Case.pdf', '3.1 MB', '2026-10-04', 10, 'Published', '2026-09-14 14:00:00'),
    ('asg-4', 'Subnetting & Network Packet Analysis using Wireshark', 'sub-4', 'Computer Networks', 'teach-3', 'Dr. Sunita Rao', 'Capture TCP handshake, DNS lookup, and HTTP requests using Wireshark and answer packet analysis questions.', 'Submit Wireshark packet breakdown with labeled screenshots.', '/api/files/assignments/CS404_Wireshark_Lab_Assignment.pdf', 'CS404_Wireshark_Lab_Assignment.pdf', '4.2 MB', '2026-10-08', 10, 'Published', '2026-09-15 09:15:00');
  `);

  // 9. Assignment Submissions
  database.run(`
    INSERT INTO assignment_submissions (id, assignment_id, student_id, student_name, roll_number, file_url, file_name, notes, status, obtained_marks, feedback, submitted_at) VALUES
    ('subm-1', 'asg-1', 'stud-1', 'Rahul Sharma', '23CS101', '/api/files/submissions/RahulSharma_23CS101_AVL_Trees.pdf', 'RahulSharma_23CS101_AVL_Trees.pdf', 'Implemented AVL tree rotations with complete unit test suites and complexity analysis.', 'Evaluated', 9.5, 'Excellent tree balancing implementations and clear asymptotic proofs.', '2026-09-22 14:20:00'),
    ('subm-2', 'asg-2', 'stud-1', 'Rahul Sharma', '23CS101', '/api/files/submissions/RahulSharma_23CS101_POSIX_Semaphores.pdf', 'RahulSharma_23CS101_POSIX_Semaphores.pdf', 'Added deadlock-free resource ordering solution with test cases.', 'Submitted', NULL, NULL, '2026-09-24 16:45:00'),
    ('subm-3', 'asg-1', 'stud-2', 'Ananya Patel', '23CS102', '/api/files/submissions/Ananya_23CS102_BalancedTrees.pdf', 'Ananya_23CS102_BalancedTrees.pdf', 'All test cases verified with Valgrind memory leak checks.', 'Evaluated', 10.0, 'Flawless code architecture and exceptional documentation.', '2026-09-21 11:10:00'),
    ('subm-4', 'asg-2', 'stud-2', 'Ananya Patel', '23CS102', '/api/files/submissions/Ananya_23CS102_OS_Sync.pdf', 'Ananya_23CS102_OS_Sync.pdf', 'Complete with deadlock analysis trace diagrams.', 'Evaluated', 9.5, 'Well designed semaphore hierarchy.', '2026-09-23 09:30:00');
  `);

  // 10. Assessments
  database.run(`
    INSERT INTO assessments (id, title, subject_id, subject_name, date, time, venue, max_marks, description, status, created_by) VALUES
    ('ass-1', 'Mid-Term Examination 1 (Mid-1)', 'sub-1', 'Data Structures & Algorithms', '2026-10-12', '10:00 AM - 12:00 PM', 'Examination Hall A (LH-201)', 30, 'Covers Units 1 & 2: Asymptotic Analysis, Stacks, Queues, Linked Lists, Trees and Traversals.', 'Upcoming', 'Dr. Priya Kumar'),
    ('ass-2', 'Mid-Term Examination 1 (Mid-1)', 'sub-2', 'Operating Systems', '2026-10-14', '10:00 AM - 12:00 PM', 'Examination Hall B (LH-202)', 30, 'Covers Units 1 & 2: Process Management, Threads, Synchronization and Deadlocks.', 'Upcoming', 'Prof. Rajesh Verma'),
    ('ass-3', 'DBMS Practical Internal Examination', 'sub-3', 'Database Management Systems', '2026-10-18', '02:00 PM - 05:00 PM', 'Computer Lab 3 (Systems Lab)', 20, 'Hands-on query optimization, triggers, stored procedures, and complex joins on PostgreSQL/MySQL.', 'Upcoming', 'Dr. Priya Kumar'),
    ('ass-4', 'Class Test 2 (Quiz & Short Questions)', 'sub-4', 'Computer Networks', '2026-10-22', '11:00 AM - 12:00 PM', 'Classroom LH-305', 20, 'Covers Data Link Layer protocols, Framing, Error Detection, and MAC addressing.', 'Upcoming', 'Dr. Sunita Rao');
  `);

  // 11. Marks (Assessment and Continuous Internal Assessment)
  database.run(`
    INSERT INTO marks (id, student_id, subject_id, subject_name, subject_code, mid1, mid1_max, mid2, mid2_max, class_test, class_test_max, assignment, assignment_max, lab_internal, lab_internal_max, remarks, updated_at) VALUES
    ('mrk-1', 'stud-1', 'sub-1', 'Data Structures & Algorithms', 'CS401', 27, 30, 26, 30, 18, 20, 9.5, 10, 19, 20, 'Consistent distinction performer in algorithm proofs.', '2026-09-15 12:00:00'),
    ('mrk-2', 'stud-1', 'sub-2', 'Operating Systems', 'CS402', 25, 30, 24, 30, 17, 20, 9.0, 10, 18, 20, 'Good understanding of scheduling and semaphore concepts.', '2026-09-15 12:00:00'),
    ('mrk-3', 'stud-1', 'sub-3', 'Database Management Systems', 'CS403', 28, 30, 27, 30, 19, 20, 9.5, 10, 19, 20, 'Superior SQL schema design and normalization proficiency.', '2026-09-15 12:00:00'),
    ('mrk-4', 'stud-1', 'sub-4', 'Computer Networks', 'CS404', 24, 30, 25, 30, 16, 20, 8.5, 10, 17, 20, 'Good progress in packet trace analysis.', '2026-09-15 12:00:00'),
    ('mrk-5', 'stud-1', 'sub-5', 'Web Technologies', 'CS405', 29, 30, 28, 30, 19, 20, 10.0, 10, 20, 20, 'Exceptional full-stack architecture implementation.', '2026-09-15 12:00:00'),
    ('mrk-6', 'stud-2', 'sub-1', 'Data Structures & Algorithms', 'CS401', 29, 30, 29, 30, 20, 20, 10.0, 10, 20, 20, 'Top ranker across all theory and laboratory modules.', '2026-09-15 12:00:00'),
    ('mrk-7', 'stud-2', 'sub-2', 'Operating Systems', 'CS402', 28, 30, 27, 30, 19, 20, 9.5, 10, 19, 20, 'Excellent technical clarity.', '2026-09-15 12:00:00');
  `);

  // 12. Semester Results (Previous Semester Results & Transcripts)
  database.run(`
    INSERT INTO semester_results (id, student_id, semester, academic_year, sgpa, credits_registered, credits_earned, result_status, subjects_json, published_date) VALUES
    ('res-1', 'stud-1', 1, '2024-2025', 8.62, 21, 21, 'Pass', '[{"code":"MA101","name":"Engineering Mathematics I","grade":"A+","credits":4,"points":9,"marks":88,"maxMarks":100},{"code":"PH101","name":"Engineering Physics","grade":"A","credits":4,"points":8,"marks":82,"maxMarks":100},{"code":"CS101","name":"Programming for Problem Solving in C","grade":"O","credits":4,"points":10,"marks":95,"maxMarks":100},{"code":"EE101","name":"Basic Electrical Engineering","grade":"B+","credits":3,"points":7,"marks":76,"maxMarks":100},{"code":"CS102","name":"Computer Programming Laboratory","grade":"O","credits":2,"points":10,"marks":98,"maxMarks":100},{"code":"PH102","name":"Physics Laboratory","grade":"A+","credits":2,"points":9,"marks":90,"maxMarks":100},{"code":"EN101","name":"English for Professional Communication","grade":"A","credits":2,"points":8,"marks":84,"maxMarks":100}]', '2025-01-20'),
    ('res-2', 'stud-1', 2, '2024-2025', 8.73, 22, 22, 'Pass', '[{"code":"MA201","name":"Engineering Mathematics II","grade":"A","credits":4,"points":8,"marks":85,"maxMarks":100},{"code":"CH201","name":"Engineering Chemistry","grade":"A+","credits":4,"points":9,"marks":89,"maxMarks":100},{"code":"CS201","name":"Object Oriented Programming via Java","grade":"O","credits":4,"points":10,"marks":97,"maxMarks":100},{"code":"EC201","name":"Digital Electronic Circuits","grade":"B+","credits":3,"points":7,"marks":78,"maxMarks":100},{"code":"CS202","name":"Java Programming Laboratory","grade":"O","credits":2,"points":10,"marks":96,"maxMarks":100},{"code":"CH202","name":"Chemistry Laboratory","grade":"A+","credits":2,"points":9,"marks":91,"maxMarks":100},{"code":"ME201","name":"Engineering Design & Drafting","grade":"A","credits":3,"points":8,"marks":83,"maxMarks":100}]', '2025-06-25'),
    ('res-3', 'stud-1', 3, '2025-2026', 8.91, 23, 23, 'Pass', '[{"code":"MA301","name":"Discrete Mathematical Structures","grade":"A+","credits":4,"points":9,"marks":92,"maxMarks":100},{"code":"CS301","name":"Design & Analysis of Algorithms","grade":"O","credits":4,"points":10,"marks":98,"maxMarks":100},{"code":"CS302","name":"Computer Organization & Architecture","grade":"A","credits":4,"points":8,"marks":86,"maxMarks":100},{"code":"CS303","name":"Software Engineering Principles","grade":"A+","credits":3,"points":9,"marks":90,"maxMarks":100},{"code":"CS304","name":"Python & Data Analysis Lab","grade":"O","credits":2,"points":10,"marks":99,"maxMarks":100},{"code":"CS305","name":"Algorithms Laboratory","grade":"O","credits":2,"points":10,"marks":97,"maxMarks":100},{"code":"HS301","name":"Universal Human Values & Professional Ethics","grade":"A","credits":4,"points":8,"marks":84,"maxMarks":100}]', '2026-01-18'),
    ('res-4', 'stud-2', 1, '2024-2025', 9.43, 21, 21, 'Pass', '[{"code":"MA101","name":"Engineering Mathematics I","grade":"O","credits":4,"points":10,"marks":96,"maxMarks":100},{"code":"PH101","name":"Engineering Physics","grade":"O","credits":4,"points":10,"marks":94,"maxMarks":100},{"code":"CS101","name":"Programming for Problem Solving in C","grade":"O","credits":4,"points":10,"marks":99,"maxMarks":100},{"code":"EE101","name":"Basic Electrical Engineering","grade":"A+","credits":3,"points":9,"marks":89,"maxMarks":100},{"code":"CS102","name":"Computer Programming Laboratory","grade":"O","credits":2,"points":10,"marks":100,"maxMarks":100},{"code":"PH102","name":"Physics Laboratory","grade":"O","credits":2,"points":10,"marks":96,"maxMarks":100},{"code":"EN101","name":"English for Professional Communication","grade":"A+","credits":2,"points":9,"marks":91,"maxMarks":100}]', '2025-01-20'),
    ('res-5', 'stud-2', 2, '2024-2025', 9.55, 22, 22, 'Pass', '[{"code":"MA201","name":"Engineering Mathematics II","grade":"O","credits":4,"points":10,"marks":97,"maxMarks":100},{"code":"CH201","name":"Engineering Chemistry","grade":"O","credits":4,"points":10,"marks":95,"maxMarks":100},{"code":"CS201","name":"Object Oriented Programming via Java","grade":"O","credits":4,"points":10,"marks":100,"maxMarks":100},{"code":"EC201","name":"Digital Electronic Circuits","grade":"A+","credits":3,"points":9,"marks":90,"maxMarks":100},{"code":"CS202","name":"Java Programming Laboratory","grade":"O","credits":2,"points":10,"marks":99,"maxMarks":100},{"code":"CH202","name":"Chemistry Laboratory","grade":"O","credits":2,"points":10,"marks":98,"maxMarks":100},{"code":"ME201","name":"Engineering Design & Drafting","grade":"A+","credits":3,"points":9,"marks":89,"maxMarks":100}]', '2025-06-25'),
    ('res-6', 'stud-2', 3, '2025-2026', 9.61, 23, 23, 'Pass', '[{"code":"MA301","name":"Discrete Mathematical Structures","grade":"O","credits":4,"points":10,"marks":98,"maxMarks":100},{"code":"CS301","name":"Design & Analysis of Algorithms","grade":"O","credits":4,"points":10,"marks":100,"maxMarks":100},{"code":"CS302","name":"Computer Organization & Architecture","grade":"O","credits":4,"points":10,"marks":95,"maxMarks":100},{"code":"CS303","name":"Software Engineering Principles","grade":"A+","credits":3,"points":9,"marks":92,"maxMarks":100},{"code":"CS304","name":"Python & Data Analysis Lab","grade":"O","credits":2,"points":10,"marks":100,"maxMarks":100},{"code":"CS305","name":"Algorithms Laboratory","grade":"O","credits":2,"points":10,"marks":100,"maxMarks":100},{"code":"HS301","name":"Universal Human Values & Professional Ethics","grade":"A+","credits":4,"points":9,"marks":91,"maxMarks":100}]', '2026-01-18');
  `);

  // 13. Lab Materials
  database.run(`
    INSERT INTO lab_materials (id, title, subject_id, subject_name, description, type, file_url, file_name, file_size, experiments_count, uploaded_by, uploaded_by_id, visibility, created_at) VALUES
    ('lab-1', 'Data Structures Laboratory Manual (Cycle 1 & Cycle 2)', 'sub-1', 'Data Structures & Algorithms', 'Comprehensive experimental guide covering linked lists, binary trees, heaps, and graph algorithms with verified sample test executions.', 'Lab Manual', '/api/files/lab-materials/CS401_DS_Lab_Manual_Rev3.pdf', 'CS401_DS_Lab_Manual_Rev3.pdf', '4.6 MB', 12, 'Dr. Priya Kumar', 'teach-1', 'Public to Class', '2026-08-10 10:00:00'),
    ('lab-2', 'Operating Systems UNIX/Linux System Calls & Threading Lab Guide', 'sub-2', 'Operating Systems', 'Step-by-step practical manual for fork(), exec(), pipes, shared memory IPC, and POSIX multithreading implementations.', 'Lab Manual', '/api/files/lab-materials/CS402_OS_Kernel_LabManual.pdf', 'CS402_OS_Kernel_LabManual.pdf', '3.8 MB', 10, 'Prof. Rajesh Verma', 'teach-2', 'Public to Class', '2026-08-12 11:30:00'),
    ('lab-3', 'DBMS Practical Manual & Query Optimization Workbook', 'sub-3', 'Database Management Systems', 'Laboratory experiments for ER diagramming, SQL schema definition, complex joins, triggers, cursors, and transaction isolation levels.', 'Lab Manual', '/api/files/lab-materials/CS403_DBMS_Workbook_2026.pdf', 'CS403_DBMS_Workbook_2026.pdf', '5.2 MB', 14, 'Dr. Priya Kumar', 'teach-1', 'Public to Class', '2026-08-14 09:00:00'),
    ('lab-4', 'Socket Programming & Packet Sniffing Experiments', 'sub-4', 'Computer Networks', 'Covers client-server TCP/UDP socket programs, packet tracing with Wireshark, and subnet routing simulations using Cisco Packet Tracer.', 'Lab Manual', '/api/files/lab-materials/CS404_Network_Sockets_Lab.pdf', 'CS404_Network_Sockets_Lab.pdf', '3.4 MB', 8, 'Dr. Sunita Rao', 'teach-3', 'Public to Class', '2026-08-15 14:15:00'),
    ('lab-5', 'Full-Stack React & Node.js Application Development Guide', 'sub-5', 'Web Technologies', 'Hands-on guided laboratory for building single page applications, JWT authentication, and RESTful API integration.', 'Notes', '/api/files/lab-materials/CS405_WebTech_FullStackGuide.pdf', 'CS405_WebTech_FullStackGuide.pdf', '6.1 MB', 10, 'Prof. Arvind Menon', 'teach-4', 'Public to Class', '2026-08-16 16:00:00');
  `);

  // 14. Notifications
  database.run(`
    INSERT INTO notifications (id, user_id, target_role, title, message, read, type, created_at) VALUES
    ('notif-1', 'user-student-1', 'student', 'Mid-Term 1 Datesheet Announced', 'Mid-Term 1 examinations will commence from October 12, 2026. Review syllabus scopes under Assessments tab.', 0, 'assessment', '2026-09-16 09:30:00'),
    ('notif-2', 'user-student-1', 'student', 'Assignment 1 Evaluated', 'Dr. Priya Kumar published grades for AVL & Red-Black Trees assignment (Score: 9.5/10).', 1, 'assignment', '2026-09-15 15:45:00'),
    ('notif-3', 'user-student-1', 'student', 'New Material Uploaded', 'Prof. Rajesh Verma added OS UNIX/Linux System Calls Lab Guide to your course repository.', 1, 'lab', '2026-09-14 11:20:00'),
    ('notif-4', 'user-teacher-1', 'teacher', 'New Student Submissions Awaiting Evaluation', '2 new submissions received for CS401 AVL Trees Assignment.', 0, 'assignment', '2026-09-16 08:15:00'),
    ('notif-5', 'user-admin-1', 'admin', 'Semester Audit Readiness Completed', 'All faculty have completed internal marks entries for cycle 1.', 0, 'admin', '2026-09-16 08:00:00');
  `);

  // 15. Audit Logs
  database.run(`
    INSERT INTO audit_logs (id, user_id, user_name, role, action, description, timestamp) VALUES
    ('log-1', 'user-admin-1', 'Dr. K. S. Rao', 'admin', 'Database System Initialization', 'Initialized persistent academic database with courses, faculty allocations, and student rosters.', '2026-09-16 08:00'),
    ('log-2', 'user-teacher-1', 'Dr. Priya Kumar', 'teacher', 'Upload Material', 'Published Data Structures Laboratory Manual (Rev 3) for CSE 2nd Year.', '2026-09-16 08:45'),
    ('log-3', 'user-teacher-1', 'Dr. Priya Kumar', 'teacher', 'Publish Assignment', 'Assigned AVL Trees & Red-Black Trees coursework for CS401.', '2026-09-16 09:15'),
    ('log-4', 'user-student-1', 'Rahul Sharma', 'student', 'Submit Coursework', 'Submitted solution for AVL Trees & Red-Black Trees (asg-1).', '2026-09-16 10:20'),
    ('log-5', 'user-teacher-1', 'Dr. Priya Kumar', 'teacher', 'Grade Submission', 'Evaluated submission for Rahul Sharma (23CS101) with 9.5 marks.', '2026-09-16 11:00');
  `);
}
