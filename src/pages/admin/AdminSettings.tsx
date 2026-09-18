import React, { useState, useEffect } from 'react';
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
  Database,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Server,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { apiClient } from '../../services/api';
import { isSupabaseClientConfigured } from '../../lib/supabase';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminSettings: React.FC = () => {
  const [collegeName, setCollegeName] = useState('Academic Central College of Engineering');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [currentTerm, setCurrentTerm] = useState('Even Semester (Spring 2026)');
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [enableAuditLogging, setEnableAuditLogging] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Supabase State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConfigured: boolean;
    url: string | null;
    isServiceRole: boolean;
    hasDatabaseUrl: boolean;
    platform: string;
    message: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [syncingData, setSyncingData] = useState(false);
  const [initializingTables, setInitializingTables] = useState(false);
  const [initResult, setInitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    syncedTables?: Record<string, number>;
    errors?: string[];
    message: string;
  } | null>(null);

  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    fetchSupabaseStatus();
  }, []);

  const fetchSupabaseStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await apiClient.getSupabaseStatus();
      if (res && res.data) {
        setSupabaseStatus(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch Supabase status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await apiClient.testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleInitTables = async () => {
    setInitializingTables(true);
    setInitResult(null);
    try {
      const res = await apiClient.initSupabaseTables();
      setInitResult(res);
      fetchSupabaseStatus();
    } catch (err: any) {
      setInitResult({
        success: false,
        message: err.message || 'Failed to initialize tables',
      });
    } finally {
      setInitializingTables(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSyncingData(true);
    setSyncResult(null);
    try {
      const res = await apiClient.syncSupabaseData();
      setSyncResult(res);
      fetchSupabaseStatus();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Data synchronization failed',
      });
    } finally {
      setSyncingData(false);
    }
  };

  const handleOpenSchemaModal = async () => {
    setShowSchemaModal(true);
    try {
      const res = await apiClient.getSupabaseSchema();
      if (res && res.schema) {
        setSchemaSql(res.schema);
      }
    } catch (err) {
      console.warn('Failed to load SQL schema:', err);
    }
  };

  const handleCopySchema = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

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

  const isClientConfigured = isSupabaseClientConfigured();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Portal Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            College naming parameters, Supabase cloud database synchronization, and demonstration controls
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

      {/* Supabase & Cloud Database Integration Section */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight">Supabase & Cloud Persistence</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      supabaseStatus?.isConfigured
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {supabaseStatus?.isConfigured ? 'Supabase Detected' : 'Local SQLite Primary'}
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
                  Unified PostgreSQL database bridge configured for Render, Vercel, and local runtime. Automatically binds to your Supabase project keys and synchronizes institutional records.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchSupabaseStatus}
                disabled={loadingStatus}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleOpenSchemaModal}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>SQL Schema</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Server Supabase</span>
                <Server className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {supabaseStatus?.isConfigured ? 'Configured' : 'Not Connected'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {supabaseStatus?.url || 'Using SQLite Fallback'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Client Supabase</span>
                <Cloud className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {isClientConfigured ? 'Vite Configured' : 'Local Fallback'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isClientConfigured ? 'VITE_SUPABASE_URL set' : 'VITE variables inactive'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Deployment Target</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {supabaseStatus?.platform || 'Node Container'}
              </p>
              <p className="text-[11px] text-slate-500">
                Vercel / Render Compatible
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Key Authority</span>
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {supabaseStatus?.isServiceRole ? 'Service Role (Admin)' : 'Anon Public Key'}
              </p>
              <p className="text-[11px] text-slate-500">
                {supabaseStatus?.isServiceRole ? 'Full Row-Level Bypass' : 'Standard RLS Client'}
              </p>
            </div>
          </div>

          {/* Action Row: Test Connection, Init Tables, & Sync */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Pinging Supabase...' : 'Test Supabase Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleInitTables}
              disabled={initializingTables}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
            >
              <Code2 className={`w-4 h-4 ${initializingTables ? 'animate-spin' : ''}`} />
              <span>{initializingTables ? 'Creating Tables in Supabase...' : 'Initialize Supabase Tables'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncSupabase}
              disabled={syncingData}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
            >
              <Cloud className={`w-4 h-4 ${syncingData ? 'animate-spin' : ''}`} />
              <span>{syncingData ? 'Synchronizing Records...' : 'Sync Local Database to Supabase'}</span>
            </button>
          </div>

          {/* Table Init Result Feedback */}
          {initResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in ${
                initResult.success
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              {initResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold">{initResult.success ? 'Tables Initialized' : 'Initialization Error'}</span>
                <p className="text-slate-700 leading-relaxed">{initResult.message}</p>
              </div>
            </div>
          )}

          {/* Connection Test Result Feedback */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {testResult.success ? 'Supabase Connection Verified' : 'Connection Check Failed'}
                  </span>
                  {testResult.latencyMs !== undefined && (
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-mono text-[10px] font-black rounded-md">
                      {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Sync Result Feedback */}
          {syncResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in ${
                syncResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5 flex-1">
                <span className="font-bold">{syncResult.message}</span>
                {syncResult.syncedTables && Object.keys(syncResult.syncedTables).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
                    {Object.entries(syncResult.syncedTables).map(([table, count]) => (
                      <div key={table} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span className="font-bold text-slate-900">{table}</span>: {count}
                      </div>
                    ))}
                  </div>
                )}
                {syncResult.errors && (
                  <ul className="list-disc pl-4 text-amber-900 space-y-0.5 text-[11px]">
                    {syncResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Vercel & Render Environment Variables Reference Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Vercel & Render Environment Variables Configuration
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When deploying this repository to Vercel or Render, add the following variables in your project settings:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">SUPABASE_URL</span>
                <p className="text-[11px] text-slate-500 mt-0.5">https://your-project.supabase.co</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">SUPABASE_ANON_KEY</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Your Supabase project anon / public key</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">SUPABASE_SERVICE_ROLE_KEY</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Optional for backend admin bypassing RLS</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">VITE_SUPABASE_URL</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Exposes project URL to client React bundle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">College Identity & Academic Calendar</h3>
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
              <span>Record all marks entry, semester transcripts, and assignment creation in audit log</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isSaved ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
                </span>
              ) : (
                'Settings updated in institutional profile'
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
              project demonstration after testing student submissions, marks modifications, or semester results.
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

      {/* Supabase SQL Schema Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supabase PostgreSQL Schema (DDL)</h3>
                  <p className="text-[11px] text-slate-500">
                    Paste into Supabase Dashboard ➔ SQL Editor to create all 15 institutional tables
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSchemaModal(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950 font-mono text-xs text-slate-200 select-all leading-relaxed whitespace-pre">
              {schemaSql || 'Loading schema script...'}
            </div>
          </div>
        </div>
      )}

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

