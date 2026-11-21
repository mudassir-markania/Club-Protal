'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { History, Search, Shield, Eye, Clock, UserCheck, RefreshCw, X } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  usePreventScroll(!!selectedLog);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.userName && l.userName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Security & Operational Audit Logs</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Traceable Audit Trail
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Immutable ledger of all match score approvals, user actions, registration imports, and settings modifications.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by action, entity (Match, Result, Club), or user..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredLogs.length} logged actions recorded
          </span>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4 text-right">State Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                      No audit entries found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-500 font-sans">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="font-bold text-slate-900 block">{log.userName}</span>
                        <span className="text-[10px] text-blue-600 font-semibold">{log.role}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-navy-950">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-700">
                        {log.entity}
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                        {log.recordId || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-semibold text-[11px]"
                        >
                          View Diff
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: View Diff */}
      {selectedLog && (
        <div
          className="fixed inset-0 !m-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-none touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLog(null);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200 touch-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-navy-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm">Audit Diff: {selectedLog.action}</h3>
                <span className="text-xs text-blue-300">
                  {selectedLog.userName} ({selectedLog.role}) • {new Date(selectedLog.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono flex-1 overscroll-contain">
              {selectedLog.previousValue && (
                <div>
                  <span className="font-bold font-sans text-slate-500 uppercase block mb-1">
                    Previous State (Before Mutation):
                  </span>
                  <pre className="p-3 bg-red-50/50 border border-red-200 text-red-900 rounded-lg overflow-x-auto text-[11px]">
                    {JSON.stringify(JSON.parse(selectedLog.previousValue), null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <span className="font-bold font-sans text-slate-500 uppercase block mb-1">
                  Updated State (After Mutation):
                </span>
                <pre className="p-3 bg-emerald-50/50 border border-emerald-200 text-emerald-900 rounded-lg overflow-x-auto text-[11px]">
                  {selectedLog.updatedValue
                    ? JSON.stringify(JSON.parse(selectedLog.updatedValue), null, 2)
                    : 'No updated snapshot recorded.'}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right font-sans shrink-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

