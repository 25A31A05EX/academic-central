import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Save,
  CheckCircle2,
  Building,
  Calendar,
  Bell,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminSettings: React.FC = () => {
  const [collegeName, setCollegeName] = useState('Academic Central College of Engineering');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [currentTerm, setCurrentTerm] = useState('Even Semester (Spring 2026)');
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [enableAuditLogging, setEnableAuditLogging] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleResetDemoData = () => {
    storage.resetToDemoData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Portal Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            College naming parameters, academic calendar cycles, and demonstration state management
          </p>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="font-bold">
            Prototype Demo Data Reset to Factory Initial Values! Refreshing state...
          </p>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">College Identity</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Institution Name
            </label>
            <input
              type="text"
              required
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Year
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Active Term
              </label>
              <input
                type="text"
                required
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Notification & Policy Controls
            </h4>

            <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={enableEmailAlerts}
                onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Disseminate email notification alerts when new internal marks are recorded</span>
            </label>

            <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAuditLogging}
                onChange={(e) => setEnableAuditLogging(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Record all marks entry and assignment creation in institutional audit log</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isSaved ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
                </span>
              ) : (
                'Settings update in client browser memory'
              )}
            </span>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Demonstration Management Zone (For College Project Presentation) */}
      <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-rose-900">
                Demonstration Prototype Reset
              </h3>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed max-w-xl">
              Restore sample data to pristine factory condition. Useful during college viva or
              project demonstration after testing student submissions or marks modifications.
            </p>
          </div>

          <button
            id="btn-reset-demo-data"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset All Prototype Data?"
        message="This will re-initialize all students, subjects, faculty, assignments, and continuous internal marks back to the original college presentation state."
        confirmText="Yes, Reset Prototype"
        onConfirm={handleResetDemoData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
