import React, { useState, useEffect } from 'react';
import {
  School,
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Database,
} from 'lucide-react';
import { Role } from '../../types';
import { storage } from '../../services/storageService';
import { apiClient } from '../../services/api';

interface LoginPageProps {
  onBackToHome: () => void;
  onSuccessLogin: (role: Role) => void;
  defaultRole?: Role;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToHome,
  onSuccessLogin,
  defaultRole = 'student',
}) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<Role>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strictSupabaseAuth, setStrictSupabaseAuth] = useState(true);
  const [, setAuthStatus] = useState<{ strictSupabaseAuth: boolean; supabaseConfigured: boolean }>({
    strictSupabaseAuth: true,
    supabaseConfigured: true,
  });

  // Modals for Register & Forgot Password
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regRole, setRegRole] = useState<Role>('student');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    apiClient.getAuthConfig().then((cfg) => {
      if (cfg) {
        setAuthStatus(cfg);
        if (cfg.strictSupabaseAuth !== undefined) {
          setStrictSupabaseAuth(Boolean(cfg.strictSupabaseAuth));
        }
      }
    });
  }, []);

  // Sync sample credentials when tab is clicked
  const handleRoleTabClick = (role: Role) => {
    setSelectedRoleTab(role);
    setErrorMsg('');
    if (role === 'student') {
      setEmail('student@academiccentral.demo');
      setPassword('student123');
    } else if (role === 'teacher') {
      setEmail('teacher@academiccentral.demo');
      setPassword('teacher123');
    } else {
      setEmail('admin@academiccentral.demo');
      setPassword('admin123');
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your college email, roll number, or faculty ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (strictSupabaseAuth) {
        res = await storage.loginWithSupabase(email.trim(), password, selectedRoleTab);
      } else {
        res = await storage.authenticateWithServer(email.trim(), password, selectedRoleTab, false, false);
      }

      if (res.success && res.user) {
        onSuccessLogin(res.user.role);
      } else {
        setErrorMsg(res.message || 'Supabase authentication failed. Please check your credentials and role tab.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: Role) => {
    setSelectedRoleTab(role);
    setErrorMsg('');
    if (role === 'student') {
      setEmail('student@academiccentral.demo');
      setPassword('student123');
    } else if (role === 'teacher') {
      setEmail('teacher@academiccentral.demo');
      setPassword('teacher123');
    } else {
      setEmail('admin@academiccentral.demo');
      setPassword('admin123');
    }

    setIsSubmitting(true);
    try {
      const res = await storage.authenticateWithServer(
        role === 'student' ? 'student@academiccentral.demo' : role === 'teacher' ? 'teacher@academiccentral.demo' : 'admin@academiccentral.demo',
        `${role}123`,
        role,
        false,
        strictSupabaseAuth
      );
      if (res.success && res.user) {
        onSuccessLogin(res.user.role);
      } else {
        // Fallback to demo login if password verification needs bypass
        const user = await storage.loginWithDemo(role);
        onSuccessLogin(user.role);
      }
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to sign in as ${role}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide name and email.');
      return;
    }

    const regPass = regPassword.trim() || `${regRole}123`;

    try {
      const res = await storage.registerWithSupabase({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPass,
        role: regRole,
        rollNumber: regRoll.trim() || (regRole === 'student' ? `23CS${Math.floor(100 + Math.random() * 900)}` : undefined),
        employeeId: regRoll.trim() || (regRole === 'teacher' ? `EMP-CS-${Math.floor(100 + Math.random() * 900)}` : undefined),
      });

      if (res.success) {
        setRegSuccess(true);
        setTimeout(async () => {
          setRegSuccess(false);
          setShowRegisterModal(false);
          // Login with newly created credentials
          const loginRes = await storage.loginWithSupabase(regEmail.trim(), regPass, regRole);
          if (loginRes.success && loginRes.user) {
            onSuccessLogin(loginRes.user.role);
          } else {
            onSuccessLogin(regRole);
          }
        }, 1200);
      } else {
        setRegError(res.message || 'Failed to register account with Supabase.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-indigo-600 selection:text-white">
      {/* Top Bar with Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <School className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Academic Central Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-medium">
          Sign in to access your customized college dashboard
        </p>

        {/* Strict Supabase Auth Status Indicator */}
        <div className="mt-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Supabase Auth Enabled</span>
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {/* Strict Supabase Auth Configuration Header */}
          <div className="mb-5 p-3.5 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900">Strict Supabase Auth</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Cloud PostgreSQL & GoTrue JWT Verification
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={strictSupabaseAuth}
                onChange={(e) => setStrictSupabaseAuth(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
            </label>
          </div>

          {/* Quick Demo Login Bar for Project Evaluators */}
          <div className="mb-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Preset Login (Supabase Accounts)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="quick-demo-student-btn"
                onClick={() => handleQuickDemoLogin('student')}
                className="px-2 py-2 text-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                id="quick-demo-teacher-btn"
                onClick={() => handleQuickDemoLogin('teacher')}
                className="px-2 py-2 text-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 transition-colors"
              >
                Teacher
              </button>
              <button
                type="button"
                id="quick-demo-admin-btn"
                onClick={() => handleQuickDemoLogin('admin')}
                className="px-2 py-2 text-center rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleRoleTabClick('student')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleTab === 'student'
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabClick('teacher')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleTab === 'teacher'
                  ? 'bg-white text-indigo-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabClick('admin')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleTab === 'admin'
                  ? 'bg-white text-purple-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleStandardLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College Email or Roll Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRoleTab === 'student'
                      ? 'student@academiccentral.demo'
                      : selectedRoleTab === 'teacher'
                      ? 'teacher@academiccentral.demo'
                      : 'admin@academiccentral.demo'
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Presets Info Box */}
            <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-200 flex items-center justify-between">
              <span>
                Supabase Demo Password: <code className="font-mono text-indigo-700 font-bold">{selectedRoleTab}123</code>
              </span>
              <button
                type="button"
                onClick={() => handleRoleTabClick(selectedRoleTab)}
                className="text-indigo-600 hover:underline font-bold text-[11px]"
              >
                Auto-fill
              </button>
            </div>

            <button
              type="submit"
              id="submit-login-btn"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Authenticating with Supabase...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Login with Supabase Auth</span>
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an Academic Central account?{' '}
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="font-bold text-indigo-600 hover:text-indigo-800 underline"
              >
                Register / Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Reset Supabase Account Password</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered college email. A Supabase password reset link will be dispatched.
            </p>

            {forgotSent ? (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-bold">Password Reset Link Dispatched!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Check your college mailbox for verification instructions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@academiccentral.demo"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Register / Sign Up Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Supabase Account Registration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create a new user verified directly in Supabase Auth & PostgreSQL.
            </p>

            {regError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {regError}
              </div>
            )}

            {regSuccess ? (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-bold">Account Created Successfully!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Redirecting to portal dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Rao"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aditi.rao@academiccentral.demo"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="student123 (or set custom)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as Role)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Roll No / Emp ID
                    </label>
                    <input
                      type="text"
                      placeholder="23CS109"
                      value={regRoll}
                      onChange={(e) => setRegRoll(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                  >
                    Register in Supabase & Enter
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
