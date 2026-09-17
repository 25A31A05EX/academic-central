import React, { useState } from 'react';
import {
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ChevronDown,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { User, Role } from '../../types';
import { storage } from '../../services/storageService';
import { useAcademicData } from '../../hooks/useAcademicData';

interface NavbarProps {
  currentUser: User;
  onToggleSidebar: () => void;
  onRoleSwitch?: (role: Role) => void;
  onNavigateLanding?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onToggleSidebar,
  onRoleSwitch,
  onNavigateLanding,
  searchQuery = '',
  onSearchChange,
}) => {
  const { notifications } = useAcademicData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filter notifications for current user/role
  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || n.targetRole === currentUser.role
  );
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const roleMeta = {
    student: {
      label: 'Student',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: GraduationCap,
    },
    teacher: {
      label: 'Faculty / Teacher',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Briefcase,
    },
    admin: {
      label: 'College Administrator',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: ShieldCheck,
    },
  };

  const currentRoleMeta = roleMeta[currentUser.role];
  const RoleIcon = currentRoleMeta.icon;

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 justify-between">
      {/* Left side: Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${currentUser.role === 'student' ? 'subjects, assignments, materials...' : currentUser.role === 'teacher' ? 'students, assignments, exams...' : 'records, teachers, students, subjects...'}`}
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Right side: Notifications, Role quick switch, User profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Demo Switcher Button for presentations */}
        {onRoleSwitch && (
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <span className="px-2 text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Demo:
            </span>
            <button
              onClick={() => onRoleSwitch('student')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentUser.role === 'student'
                  ? 'bg-white shadow-xs text-indigo-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => onRoleSwitch('teacher')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentUser.role === 'teacher'
                  ? 'bg-white shadow-xs text-indigo-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => onRoleSwitch('admin')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentUser.role === 'admin'
                  ? 'bg-white shadow-xs text-indigo-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Academic Alerts
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No new notifications right now.
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => storage.markNotificationAsRead(notif.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer ${
                        !notif.read ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 sm:p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-indigo-100 flex items-center justify-center shrink-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-xs text-indigo-700">
                  {currentUser.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                {currentUser.name}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold border ${currentRoleMeta.badgeClass}`}
              >
                <RoleIcon className="w-2.5 h-2.5" />
                {currentRoleMeta.label}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in duration-150 divide-y divide-slate-100"
            >
              <div className="px-4 py-2.5">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${currentRoleMeta.badgeClass}`}
                >
                  <RoleIcon className="w-3 h-3" />
                  {currentRoleMeta.label}
                </span>
              </div>

              {onRoleSwitch && (
                <div className="py-1">
                  <p className="px-4 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Active Role
                  </p>
                  <button
                    onClick={() => {
                      onRoleSwitch('student');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Student Dashboard</span>
                    {currentUser.role === 'student' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onRoleSwitch('teacher');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Teacher Portal</span>
                    {currentUser.role === 'teacher' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onRoleSwitch('admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Admin Console</span>
                    {currentUser.role === 'admin' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    )}
                  </button>
                </div>
              )}

              <div className="py-1">
                {onNavigateLanding && (
                  <button
                    onClick={() => {
                      onNavigateLanding();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50"
                  >
                    College Portal Home
                  </button>
                )}
                <button
                  id="navbar-logout-btn"
                  onClick={() => {
                    storage.logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-1.5 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
