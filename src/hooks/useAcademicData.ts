import { useState, useEffect } from 'react';
import { storage, subscribeToStore } from '../services/storageService';
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
} from '../types';

export function useAcademicData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    currentUser: storage.getCurrentUser(),
    users: storage.getUsers(),
    students: storage.getStudents(),
    teachers: storage.getTeachers(),
    subjects: storage.getSubjects(),
    classes: storage.getClasses(),
    assignments: storage.getAssignments(),
    submissions: storage.getSubmissions(),
    marks: storage.getMarks(),
    semesterResults: storage.getSemesterResults(),
    labMaterials: storage.getLabMaterials(),
    assessments: storage.getAssessments(),
    notifications: storage.getNotifications(),
    auditLogs: storage.getAuditLogs(),
    storage,
  };
}
