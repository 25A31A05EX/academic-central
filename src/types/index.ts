export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  rollNumber: string;
  branch: string;
  year: string;
  section: string;
  semester: number;
  status: 'Active' | 'Inactive';
  phone?: string;
  bloodGroup?: string;
  attendancePercentage?: number;
  cgpa: number;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  name: string;
  employeeId?: string;
  email: string;
  department: string;
  designation: string;
  qualification?: string;
  experience?: string;
  subjectsAssigned?: string[];
  assignedSubjectIds?: string[];
  status?: 'Active' | 'On Leave' | 'Inactive';
  phone?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  year?: string;
  semester: number;
  teacherId: string;
  teacherName: string;
  credits: number;
  totalAssignments?: number;
  description?: string;
}

export interface CollegeClass {
  id: string;
  name?: string;
  year: string;
  branch: string;
  section: string;
  semester: number;
  classTeacher?: string;
  classTeacherId?: string;
  studentCount: number;
  roomNumber?: string;
}

export type ClassSection = CollegeClass;

export type AssignmentStatus = 'Pending' | 'Submitted' | 'Due Soon' | 'Completed';

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  description: string;
  instructions?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
  dueDate: string;
  maxMarks: number;
  status: 'Draft' | 'Published';
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  submittedAt: string;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  status: 'Submitted' | 'Evaluated' | 'Late';
  obtainedMarks?: number;
  feedback?: string;
}

export type Submission = StudentSubmission;

export interface SubjectMarks {
  id: string;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  mid1: number;
  mid1Max: number;
  mid2: number;
  mid2Max: number;
  classTest: number;
  classTestMax: number;
  assignment: number;
  assignmentMax: number;
  labInternal: number;
  labInternalMax: number;
  totalInternal?: number;
  remarks?: string;
  updatedAt: string;
}

export type MaterialType = 'Lab Manual' | 'Assignment PDF' | 'Notes' | 'Study Material';

export interface LabMaterial {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description: string;
  type: MaterialType;
  fileUrl?: string;
  fileName: string;
  fileSize: string;
  experimentsCount?: number;
  uploadedBy: string;
  uploadedById?: string;
  createdAt: string;
  visibility?: 'Public to Class' | 'Draft';
}

export type AssessmentType = 'Mid-1' | 'Mid-2' | 'Class Test' | 'Assignment' | 'Lab Internal';

export interface Assessment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  date: string;
  time?: string;
  maxMarks: number;
  description: string;
  status: 'Upcoming' | 'Completed';
  createdBy: string;
  venue?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  targetRole?: Role;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'assignment' | 'mark' | 'lab' | 'assessment' | 'admin';
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userName?: string;
  performedBy?: string;
  role: Role;
  action: string;
  description?: string;
  details?: string;
  timestamp: string;
}

export interface SubjectGrade {
  code: string;
  name: string;
  grade: string;
  credits: number;
  points: number;
  marks?: number;
  maxMarks?: number;
}

export interface SemesterResult {
  id: string;
  studentId: string;
  semester: number;
  academicYear: string;
  sgpa: number;
  creditsRegistered: number;
  creditsEarned: number;
  resultStatus: 'Pass' | 'Fail' | 'Promoted';
  subjects: SubjectGrade[];
  publishedDate: string;
}

