'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Users,
  Trophy,
  UserCheck,
  CheckCircle2,
  Table,
} from 'lucide-react';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('overall_leaderboard');
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const reportsList = [
    {
      id: 'overall_leaderboard',
      title: 'Overall Club Leaderboard',
      description: 'Official standings, gold/silver/bronze medal count, match records, and cumulative points.',
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      id: 'players',
      title: 'Club & Sport Player Roster',
      description: 'Complete verified list of participants, club assignments, contact details, and sports.',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'matches',
      title: 'Tournament Fixtures & Match Results',
      description: 'Scheduled encounters, venues, assigned officials, set/half scores, and match winners.',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'registrations',
      title: 'Google Forms Registration Audit',
      description: 'All inbound form submissions, source tags, duplicate detection flags, and approval timestamps.',
      icon: FileSpreadsheet,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'referees',
      title: 'Referee Assignments & Roster',
      description: 'Field officials, credentials, authorized sports, and assigned match counts.',
      icon: UserCheck,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'points_history',
      title: 'Points Distribution & Audit Trail',
      description: 'Traceable log of every point awarded with match references, timestamps, and justifications.',
      icon: Table,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const handlePreview = async (reportId: string) => {
    setSelectedReport(reportId);
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/export?type=${reportId}&format=json`);
      const data = await res.json();
      setPreviewData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = (reportId?: string) => {
    const id = reportId || selectedReport;
    window.open(`/api/reports/export?type=${id}&format=csv`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Tournament Reports & Exports</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Official Documentation Center
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generate, preview, and download official tournament records in CSV, Excel, or printable PDF view.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Print Report View
            </button>
            <button
              onClick={() => handleDownloadCsv()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportsList.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedReport === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handlePreview(r.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/40 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`p-2.5 rounded-xl ${r.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadCsv(r.id);
                      }}
                      title="Direct CSV Download"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-navy-950 mb-1">{r.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-blue-700' : 'text-slate-500'}>
                    {isSelected ? 'Active Preview' : 'Click to preview'}
                  </span>
                  <span className="text-blue-600 hover:underline">Download CSV →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Data Preview Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                Report Data Preview: {previewData?.filename || selectedReport}
              </span>
              <span className="text-[11px] text-slate-500">
                {previewData ? `${previewData.rows?.length || 0} records ready for download` : 'Click "Preview" above'}
              </span>
            </div>
            <button
              onClick={() => handleDownloadCsv()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download .CSV
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            {!previewData ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select any report above to view its live table preview and columns.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider sticky top-0">
                  <tr>
                    {previewData.headers?.map((h: string, idx: number) => (
                      <th key={idx} className="py-2.5 px-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.rows?.map((row: any[], rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {row.map((cell: any, cIdx: number) => (
                        <td key={cIdx} className="py-2.5 px-4 text-slate-700">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

