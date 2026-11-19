'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Search } from 'lucide-react';
import BgmiTeamsManager from '@/components/admin/BgmiTeamsManager';
import DoublesTeamsManager from '@/components/admin/DoublesTeamsManager';

type Tab = 'BGMI' | 'DOUBLES' | 'MIXED_DOUBLES';

const TABS: { id: Tab; label: string }[] = [
  { id: 'BGMI', label: 'BGMI Teams' },
  { id: 'DOUBLES', label: 'Doubles Teams' },
  { id: 'MIXED_DOUBLES', label: 'Mixed Doubles Teams' },
];

export default function TeamsPage() {
  const [tab, setTab] = useState<Tab>('BGMI');
  const [clubs, setClubs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/clubs')
      .then((r) => r.json())
      .then((d) => setClubs(Array.isArray(d) ? d : []))
      .catch(() => setClubs([]));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">Teams</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register BGMI squads and doubles pairs. Each team belongs to one club and uses only that club&apos;s players
            registered for the sport.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  tab === t.id ? 'bg-navy-950 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team, club or player..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {tab === 'BGMI' && <BgmiTeamsManager clubs={clubs} search={search} />}
        {tab === 'DOUBLES' && <DoublesTeamsManager key="d" clubs={clubs} category="DOUBLES" search={search} />}
        {tab === 'MIXED_DOUBLES' && <DoublesTeamsManager key="m" clubs={clubs} category="MIXED_DOUBLES" search={search} />}
      </div>
    </AdminLayout>
  );
}
