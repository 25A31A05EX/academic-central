import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';

export const AdminAuditLogs: React.FC = () => {
  const { auditLogs } = useAcademicData();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = auditLogs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.performedBy || (log as any).performed_by || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || log.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Audit & Security Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking ledger recording grade modifications, assignment uploads, and
            administrative actions
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tamper-Resistant Logging Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit trail by action keyword, instructor, student, or detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white"
          >
            <option value="all">All Roles</option>
            <option value="student">Student Actions</option>
            <option value="teacher">Faculty Actions</option>
            <option value="admin">Administrator Actions</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Performed By</th>
                <th className="py-3.5 px-3 text-center">User Role</th>
                <th className="py-3.5 px-6">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => {
                const dateObj = new Date(log.timestamp);
                const roleColors = {
                  student: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  teacher: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                  admin: 'bg-purple-50 text-purple-800 border-purple-200',
                };

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <div>
                        <span>{dateObj.toLocaleDateString()}</span>
                        <span className="ml-1 text-slate-400">
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {log.performedBy}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                          roleColors[log.role]
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-slate-600 max-w-md">{log.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
