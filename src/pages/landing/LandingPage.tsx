import React from 'react';
import {
  School,
  FileCheck2,
  Award,
  BookText,
  CalendarDays,
  LayoutDashboard,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Lock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Role } from '../../types';

interface LandingPageProps {
  onOpenLogin: () => void;
  onDemoLogin: (role: Role) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onDemoLogin }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const featureCards = [
    {
      icon: FileCheck2,
      title: 'Assignments',
      desc: 'Centralized assignment problem statements, submission checklists, deadline alerts, and document previewers.',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      icon: Award,
      title: 'Internal Marks',
      desc: 'Comprehensive view of Mid-1, Mid-2, Class Tests, and Lab internals verified by authorized department faculty.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      icon: BookText,
      title: 'Lab Manuals',
      desc: 'Laboratory experiment guides, program problem sets, and code templates accessible without scouring messy chat groups.',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      icon: CalendarDays,
      title: 'Assessments',
      desc: 'Mid examination schedules, internal assessment dates, syllabi, and seating venue info in one live calendar.',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      icon: LayoutDashboard,
      title: 'Academic Dashboard',
      desc: 'Role-specific dashboards customized for students, teaching faculty, and college academic administrators.',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      icon: Layers,
      title: 'Centralized Records',
      desc: 'Eliminates scattered Google Drive links, paper rosters, and unofficial WhatsApp announcements with an immutable audit log.',
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Login',
      desc: 'Authenticate securely using college credentials or instant role demonstration accounts.',
    },
    {
      step: '02',
      title: 'Choose your role',
      desc: 'Enter as Student, Teaching Faculty, or College Admin with strict role-based access boundaries.',
    },
    {
      step: '03',
      title: 'Access academic info',
      desc: 'Inspect assignments, internal marks, lab manuals, and upcoming examination schedules instantly.',
    },
    {
      step: '04',
      title: 'Manage or view records',
      desc: 'Faculty enter and update marks; administrators manage courses; students submit assignments.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">Academic Central</span>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                College Academic Portal
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-indigo-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-indigo-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-indigo-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-indigo-600 transition-colors"
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              id="landing-login-nav-btn"
              onClick={onOpenLogin}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Next-Generation College Academic Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            One Platform for All Your <br className="hidden sm:inline" />
            <span className="text-indigo-600">Academic Needs</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Access assignments, marks, internal assessments, lab manuals and academic information in
            one centralized college portal.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-login-btn"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Login to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-explore-btn"
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition-all"
            >
              Explore Features
            </button>
          </div>

          {/* Quick Demo Launch Bar for Presentations */}
          <div className="mt-12 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-md max-w-2xl mx-auto text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interactive College Project Demo Accounts
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                1-Click Access
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                id="demo-student-launch-btn"
                onClick={() => onDemoLogin('student')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">Student View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">Rahul Sharma (23CS101)</p>
              </button>

              <button
                id="demo-teacher-launch-btn"
                onClick={() => onDemoLogin('teacher')}
                className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">Faculty View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">Dr. Priya Kumar (HOD CSE)</p>
              </button>

              <button
                id="demo-admin-launch-btn"
                onClick={() => onDemoLogin('admin')}
                className="p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950">Admin View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-purple-700 mt-1">College Academic Registrar</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Complete Academic Suite
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Everything Your College Needs Under One Roof
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Say goodbye to lost PDFs in class group chats and uncoordinated spreadsheet records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 transition-transform group-hover:scale-105 ${feat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Workflow Simplicity
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              How Academic Central Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Designed from the ground up to be intuitive for students, instructors, and college
              executives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.step}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden"
              >
                <div className="text-3xl font-black text-indigo-100 absolute top-3 right-4 select-none">
                  {s.step}
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-4">
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center mb-4">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            About Academic Central
          </h2>
          <p className="text-sm text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto">
            Academic Central was built to replace fragmented, chaotic college communication channels.
            Instead of searching through messaging groups for deadline announcements, wondering about
            unverified marks, or asking classmates for lab manuals, every student and faculty member
            gains a transparent, verified, and secure institutional portal.
          </p>
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Role-Based Access Control
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Real-Time Marks Synchronization
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Audit Trail
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <School className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-extrabold text-white">Academic Central</p>
                <p className="text-xs text-slate-500">College Academic Management Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
              <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">
                About
              </button>
              <button onClick={() => alert('Contact: academic-office@academiccentral.demo | Phone: +91 80 2345 6789')} className="hover:text-white transition-colors">
                Contact
              </button>
              <button onClick={() => alert('Academic Central enforces institutional privacy standards conforming to FERPA/Academic Records privacy regulations.')} className="hover:text-white transition-colors">
                Privacy
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; 2026 Academic Central. College Academic Management Portal. All rights reserved.</p>
            <p>Demonstration Ready Prototype &bull; Engineered for College Project Presentation</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
