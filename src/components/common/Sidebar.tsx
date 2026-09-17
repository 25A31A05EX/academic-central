import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Award,
  BarChart3,
  BookText,
  CalendarDays,
  User,
  LogOut,
  UploadCloud,
  FileEdit,
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  History,
  Settings,
  Layers,
  Sparkles,
  School,
  X,
} from 'lucide-react';
import { Role } from '../../types';
import { storage } from '../../services/storageService';

interface SidebarProps {
  role: Role;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Navigation definitions based on user role
  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileCheck2 },
    { id: 'marks', label: 'Marks', icon: Award },
    { id: 'internal-marks', label: 'Internal Marks', icon: BarChart3 },
    { id: 'lab-manuals', label: 'Lab Manuals', icon: BookText },
    { id: 'assessments', label: 'Assessments', icon: CalendarDays },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileCheck2 },
    { id: 'upload-materials', label: 'Upload Materials', icon: UploadCloud },
    { id: 'enter-marks', label: 'Enter Marks', icon: FileEdit },
    { id: 'assessments', label: 'Assessments', icon: CalendarDays },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'classes', label: 'Classes', icon: Layers },
    { id: 'assignments', label: 'Assignments', icon: FileCheck2 },
    { id: 'materials', label: 'Materials', icon: BookText },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'audit-logs', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentNav = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : adminNav;

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const handleLogout = () => {
    storage.logout();
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-tight">
                Academic Central
              </h1>
              <p className="text-[10px] text-indigo-300 font-medium tracking-wide uppercase">
                College Portal
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Identity Card */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Portal Mode
            </span>
            <span
              className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                role === 'student'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : role === 'teacher'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                  : 'bg-purple-950 text-purple-300 border-purple-800'
              }`}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
