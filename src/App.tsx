import React, { useState, useEffect, useRef } from 'react';
import { useAcademicData } from './hooks/useAcademicData';
import { storage } from './services/storageService';
import { Role } from './types';

// Common Layout Components
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { DocumentPreviewModal, PreviewDocument } from './components/common/DocumentPreviewModal';

// Landing and Auth Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentSubjects } from './pages/student/StudentSubjects';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { StudentMarks } from './pages/student/StudentMarks';
import { StudentInternalMarks } from './pages/student/StudentInternalMarks';
import { StudentLabManuals } from './pages/student/StudentLabManuals';
import { StudentAssessments } from './pages/student/StudentAssessments';
import { StudentProfilePage } from './pages/student/StudentProfile';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherMySubjects } from './pages/teacher/TeacherMySubjects';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { TeacherUploadMaterials } from './pages/teacher/TeacherUploadMaterials';
import { TeacherEnterMarks } from './pages/teacher/TeacherEnterMarks';
import { TeacherAssessments } from './pages/teacher/TeacherAssessments';
import { TeacherStudents } from './pages/teacher/TeacherStudents';
import { TeacherProfile } from './pages/teacher/TeacherProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  const { currentUser } = useAcademicData();

  // Navigation and View state - initialize from storage so page reload does not kick to landing
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>(() => {
    return storage.getCurrentUser() ? 'app' : 'landing';
  });
  const [loginRoleIntent, setLoginRoleIntent] = useState<Role>('student');

  // Persist activeTab across reloads using URL hash or local storage
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (hash) return hash;
    const stored = localStorage.getItem('academic_central_active_tab');
    return stored || 'dashboard';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global document preview state
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);

  // Tab selection handler that preserves URL hash & localStorage
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('academic_central_active_tab', tab);
    if (window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }
  };

  // Sync hash changes (e.g. browser back/forward buttons or direct URL change)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash && hash !== activeTab) {
        setActiveTab(hash);
        localStorage.setItem('academic_central_active_tab', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // If currentUser exists, switch view to 'app'
  useEffect(() => {
    if (currentUser) {
      setCurrentView((prev) => (prev !== 'app' ? 'app' : prev));
    } else {
      setCurrentView((prev) => (prev === 'app' ? 'landing' : prev));
    }
  }, [currentUser?.id]);

  // Only reset activeTab to 'dashboard' when the role ACTUALLY changes between different roles (not on initial mount/refresh)
  const prevRoleRef = useRef<Role | undefined>(currentUser?.role);
  useEffect(() => {
    if (prevRoleRef.current && currentUser?.role && prevRoleRef.current !== currentUser.role) {
      handleSelectTab('dashboard');
    }
    prevRoleRef.current = currentUser?.role;
  }, [currentUser?.role]);

  const handleOpenPdf = (doc: PreviewDocument) => {
    setPreviewDoc(doc);
  };

  const handleClosePdf = () => {
    setPreviewDoc(null);
  };

  const handleDemoLogin = async (role: Role) => {
    await storage.loginAsRole(role);
    setCurrentView('app');
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    handleSelectTab(hash || 'dashboard');
  };

  const handleRoleSwitch = async (role: Role) => {
    await storage.loginAsRole(role);
    handleSelectTab('dashboard');
  };

  // Render non-authenticated pages
  if (!currentUser || currentView === 'landing' || currentView === 'login') {
    if (currentView === 'login') {
      return (
        <LoginPage
          defaultRole={loginRoleIntent}
          onBackToHome={() => setCurrentView('landing')}
          onSuccessLogin={(role) => {
            setCurrentView('app');
            const hash = window.location.hash.replace(/^#\/?/, '').trim();
            handleSelectTab(hash || 'dashboard');
          }}
        />
      );
    }

    return (
      <LandingPage
        onOpenLogin={() => {
          setLoginRoleIntent('student');
          setCurrentView('login');
        }}
        onDemoLogin={handleDemoLogin}
      />
    );
  }

  // Render Authenticated Dashboard Layout
  const renderRolePage = () => {
    if (currentUser.role === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard onNavigateTab={handleSelectTab} onOpenPdf={handleOpenPdf} />;
        case 'subjects':
          return <StudentSubjects onNavigateTab={handleSelectTab} onOpenPdf={handleOpenPdf} />;
        case 'assignments':
          return <StudentAssignments onOpenPdf={handleOpenPdf} />;
        case 'marks':
          return <StudentMarks />;
        case 'internal-marks':
          return <StudentInternalMarks />;
        case 'lab-manuals':
          return <StudentLabManuals onOpenPdf={handleOpenPdf} />;
        case 'assessments':
          return <StudentAssessments />;
        case 'profile':
          return <StudentProfilePage />;
        default:
          return <StudentDashboard onNavigateTab={handleSelectTab} onOpenPdf={handleOpenPdf} />;
      }
    }

    if (currentUser.role === 'teacher') {
      switch (activeTab) {
        case 'dashboard':
          return <TeacherDashboard onNavigateTab={handleSelectTab} onOpenPdf={handleOpenPdf} />;
        case 'my-subjects':
          return <TeacherMySubjects onNavigateTab={handleSelectTab} onOpenPdf={handleOpenPdf} />;
        case 'assignments':
          return <TeacherAssignments onOpenPdf={handleOpenPdf} />;
        case 'upload-materials':
          return <TeacherUploadMaterials onOpenPdf={handleOpenPdf} />;
        case 'enter-marks':
          return <TeacherEnterMarks />;
        case 'assessments':
          return <TeacherAssessments />;
        case 'students':
          return <TeacherStudents />;
        case 'profile':
          return <TeacherProfile />;
        default:
          return <TeacherDashboard onNavigateTab={handleSelectTab} onOpenPdf={handleOpenPdf} />;
      }
    }

    if (currentUser.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard onNavigateTab={handleSelectTab} />;
        case 'students':
          return <AdminStudents />;
        case 'teachers':
          return <AdminTeachers />;
        case 'subjects':
          return <AdminSubjects />;
        case 'classes':
          return <AdminClasses />;
        case 'assignments':
          return <TeacherAssignments onOpenPdf={handleOpenPdf} />;
        case 'materials':
          return <TeacherUploadMaterials onOpenPdf={handleOpenPdf} />;
        case 'reports':
          return <AdminReports />;
        case 'audit-logs':
          return <AdminAuditLogs />;
        case 'settings':
          return <AdminSettings />;
        default:
          return <AdminDashboard onNavigateTab={handleSelectTab} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased text-slate-800">
      {/* Role-based Responsive Navigation Sidebar */}
      <Sidebar
        role={currentUser.role}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentUser={currentUser}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onRoleSwitch={handleRoleSwitch}
          onNavigateLanding={() => {
            storage.logout();
            localStorage.removeItem('academic_central_active_tab');
            window.location.hash = '';
            setCurrentView('landing');
            setActiveTab('dashboard');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderRolePage()}
        </main>
      </div>

      {/* Universal Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        doc={previewDoc}
        onClose={handleClosePdf}
      />
    </div>
  );
}
