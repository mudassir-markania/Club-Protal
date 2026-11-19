'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Medal,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  Settings,
  Users,
  Calendar,
  X,
  CheckCircle2,
  FileText,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Trophy,
  Award,
  Flame,
  Info,
  Check,
  Target,
  Sparkles,
} from 'lucide-react';
import { SportIcon, MedalBadge } from '@/components/ui/icons';
import {
  SportScoringRuleDef,
  DEFAULT_OFFICIAL_RULES,
  OFFICIAL_CATEGORY_LABELS,
  normalizeSportKey,
} from '@/lib/sports-rules-definitions';

export default function SportsPage() {
  const [sports, setSports] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'rules' | 'general'>('rules');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingRules, setSavingRules] = useState(false);

  // Dynamic Rule Points & Categories State
  const [rulePoints, setRulePoints] = useState<Record<string, number>>({});
  const [ruleCategories, setRuleCategories] = useState<Record<string, string>>({});

  // General Sport Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'OutDoor',
    icon: '',
    sportType: 'TEAM', // INDIVIDUAL, TEAM, DOUBLES
    genderCategory: 'OPEN',
    maxParticipants: 11,
    tournamentFormat: 'KNOCKOUT', // KNOCKOUT, LEAGUE, ROUND_ROBIN, GROUP_STAGE
    numRounds: 3,
    assignedRefereeIds: [] as string[],
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Lock background scrolling and allow Escape key to close modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sportsRes, refRes] = await Promise.all([
        fetch('/api/sports'),
        fetch('/api/referees'),
      ]);
      const sportsData = await sportsRes.json();
      const refData = await refRes.json();

      setSports(Array.isArray(sportsData) ? sportsData : []);
      setReferees(Array.isArray(refData) ? refData : []);
    } catch (err) {
      console.error('Failed to load sports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const initRulesForSport = (sportName: string, existingRules?: any[]) => {
    const sportKey = normalizeSportKey(sportName);
    const initialPts: Record<string, number> = {};
    const initialCats: Record<string, string> = {};

    // 1. Start with official PDF defaults
    if (sportKey) {
      const defaults = DEFAULT_OFFICIAL_RULES.filter((r) => r.sport === sportKey);
      defaults.forEach((r) => {
        initialPts[r.ruleCode] = r.points;
        if (r.category) initialCats[r.ruleCode] = r.category;
      });
    }

    // 2. Overlay existing DB rules if present
    if (existingRules && Array.isArray(existingRules)) {
      existingRules.forEach((r: any) => {
        initialPts[r.ruleCode] = Number(r.points);
        if (r.category) initialCats[r.ruleCode] = r.category;
      });
    }

    setRulePoints(initialPts);
    setRuleCategories(initialCats);
  };

  const handleOpenCreate = () => {
    setSelectedSport(null);
    setFormData({
      name: '',
      category: 'OutDoor',
      icon: 'football',
      sportType: 'TEAM',
      genderCategory: 'OPEN',
      maxParticipants: 11,
      tournamentFormat: 'KNOCKOUT',
      numRounds: 3,
      assignedRefereeIds: [],
      status: 'ACTIVE',
    });
    initRulesForSport('');
    setModalTab('general');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (sport: any, openRulesTab = true) => {
    setSelectedSport(sport);
    const assignedRefIds = sport.referees?.map((r: any) => r.refereeId || r.referee?.id) || [];

    setFormData({
      name: sport.name,
      category: sport.category,
      icon: sport.icon || 'football',
      sportType: sport.sportType,
      genderCategory: sport.genderCategory,
      maxParticipants: sport.maxParticipants,
      tournamentFormat: sport.tournamentFormat,
      numRounds: sport.numRounds || 3,
      assignedRefereeIds: assignedRefIds,
      status: sport.status,
    });

    // Initialize from sport object
    initRulesForSport(sport.name, sport.scoringRules);
    setModalTab(openRulesTab ? 'rules' : 'general');
    setError(null);
    setIsModalOpen(true);

    // Fetch fresh rules from dedicated endpoint
    try {
      const res = await fetch(`/api/sports/${sport.id}/rules`);
      if (res.ok) {
        const data = await res.json();
        if (data.rules && Array.isArray(data.rules)) {
          setRulePoints((prev) => {
            const next = { ...prev };
            data.rules.forEach((r: any) => {
              next[r.ruleCode] = Number(r.points);
            });
            return next;
          });
          setRuleCategories((prev) => {
            const next = { ...prev };
            data.rules.forEach((r: any) => {
              if (r.category) next[r.ruleCode] = r.category;
            });
            return next;
          });
        }
      }
    } catch (e) {
      console.warn('Could not refresh rules from endpoint:', e);
    }
  };

  const handleResetToOfficialPDF = async () => {
    const sportKey = normalizeSportKey(formData.name);
    if (!sportKey) return;

    if (
      !confirm(
        `Reset all scoring rules for ${formData.name} to the exact official values from sports_points_distribution.pdf?`
      )
    ) {
      return;
    }

    const defaults = DEFAULT_OFFICIAL_RULES.filter((r) => r.sport === sportKey);
    const nextPoints: Record<string, number> = {};
    const nextCats: Record<string, string> = {};
    defaults.forEach((r) => {
      nextPoints[r.ruleCode] = r.points;
      if (r.category) nextCats[r.ruleCode] = r.category;
    });

    setRulePoints(nextPoints);
    setRuleCategories(nextCats);

    if (selectedSport) {
      try {
        const res = await fetch(`/api/sports/${selectedSport.id}/rules`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetToDefaults: true }),
        });
        if (res.ok) {
          setSuccess(`Reset ${selectedSport.name} to official PDF default scoring rules!`);
          fetchData();
        }
      } catch (e) {
        console.error('Failed to reset on server:', e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingRules(true);

    try {
      // 1. Update/Create sport general metadata
      const payload = {
        name: formData.name,
        category: formData.category,
        icon: formData.icon,
        sportType: formData.sportType,
        genderCategory: formData.genderCategory,
        maxParticipants: formData.maxParticipants,
        tournamentFormat: formData.tournamentFormat,
        numRounds: formData.numRounds,
        status: formData.status,
        assignedRefereeIds: formData.assignedRefereeIds,
      };

      const url = selectedSport ? `/api/sports/${selectedSport.id}` : '/api/sports';
      const method = selectedSport ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const sportData = await res.json();
      if (!res.ok) {
        throw new Error(sportData.error || 'Failed to save sport');
      }

      const sportId = selectedSport ? selectedSport.id : sportData.id;

      // 2. Persist sport-specific rules
      const sportKey = normalizeSportKey(formData.name);
      if (sportKey && sportId) {
        const relevantRules = DEFAULT_OFFICIAL_RULES.filter((r) => r.sport === sportKey);
        const rulesPayload = relevantRules.map((r) => ({
          ruleCode: r.ruleCode,
          points: Number(rulePoints[r.ruleCode] ?? r.points),
          category: ruleCategories[r.ruleCode] || r.category,
        }));

        const rulesRes = await fetch(`/api/sports/${sportId}/rules`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules: rulesPayload }),
        });

        const rulesData = await rulesRes.json();
        if (!rulesRes.ok) {
          throw new Error(rulesData.error || 'Failed to save sport scoring rules');
        }
      }

      setSuccess(
        selectedSport
          ? `Updated ${formData.name} & official scoring rules successfully!`
          : `Created ${formData.name} successfully!`
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingRules(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/sports/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete sport');
        return;
      }
      setSuccess('Sport deleted successfully');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleRefereeAssignment = (refId: string) => {
    if (formData.assignedRefereeIds.includes(refId)) {
      setFormData({
        ...formData,
        assignedRefereeIds: formData.assignedRefereeIds.filter((id) => id !== refId),
      });
    } else {
      setFormData({
        ...formData,
        assignedRefereeIds: [...formData.assignedRefereeIds, refId],
      });
    }
  };

  const updateRulePoint = (ruleCode: string, value: number) => {
    setRulePoints((prev) => ({
      ...prev,
      [ruleCode]: isNaN(value) ? 0 : Math.max(0, value),
    }));
  };

  const updateRuleCategoryLabel = (categoryKey: string, newLabel: string) => {
    setRuleCategories((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((code) => {
        if (next[code] === categoryKey) {
          next[code] = newLabel;
        }
      });
      return next;
    });
  };

  const filteredSports = sports.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.sportType.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSportKey = normalizeSportKey(formData.name);

  // Helper to extract rule map for card preview
  const getSportRuleMap = (sport: any) => {
    const key = sport.sportKey || normalizeSportKey(sport.name);
    const map = new Map<string, number>();

    // Seed defaults
    if (key) {
      DEFAULT_OFFICIAL_RULES.filter((r) => r.sport === key).forEach((r) => {
        map.set(r.ruleCode, r.points);
      });
    }

    // Overlay loaded rules
    if (sport.scoringRules && Array.isArray(sport.scoringRules)) {
      sport.scoringRules.forEach((r: any) => {
        map.set(r.ruleCode, Number(r.points));
      });
    }

    return map;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-950">Sports & Scoring Configuration</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Official PDF Rules
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Source of truth: <code className="font-mono text-blue-700 font-bold">sports_points_distribution.pdf</code>.
              Sport scoring rules calculate match outcomes automatically and award points to unique houses upon admin approval.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Register New Sport
          </button>
        </div>

        {/* Notifications */}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </span>
            <button onClick={() => setSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sport name, category, or tournament type..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredSports.length} of {sports.length} disciplines
          </span>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSports.map((sport) => {
            const sportKey = sport.sportKey || normalizeSportKey(sport.name);
            const rMap = getSportRuleMap(sport);

            return (
              <div
                key={sport.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-navy-800 flex items-center justify-center">
                        <SportIcon name={sport.name} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-navy-950 flex items-center gap-1.5">
                          {sport.name}
                          {sportKey && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <ShieldCheck className="w-2.5 h-2.5" /> PDF
                            </span>
                          )}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {sport.category} • {sport.genderCategory}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sport.sportType === 'TEAM'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : sport.sportType === 'DOUBLES'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {sport.sportType}
                    </span>
                  </div>

                  {/* Sport Details Grid */}
                  <div className="grid grid-cols-2 gap-2 my-2.5 p-2.5 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Format</span>
                      <span className="font-bold text-slate-800 text-[11px]">{sport.tournamentFormat}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Participants</span>
                      <span className="font-bold text-slate-800 text-[11px]">{sport.maxParticipants} per side</span>
                    </div>
                  </div>

                  {/* Official Scoring Summary Box */}
                  <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 rounded-xl space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-navy-900">
                        <Trophy className="w-3 h-3 text-amber-500" /> Official Scoring Rules
                      </span>
                      <span className="text-[9px] text-blue-700 font-mono">PDF Ruleset</span>
                    </div>

                    {/* Dynamic sport-specific rule chips */}
                    {sportKey === 'FOOTBALL' && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Match Win:</span>
                          <span className="font-bold text-blue-700">{rMap.get('FT_MATCH_WIN') ?? 10} pts</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Final 1st / 2nd:</span>
                          <span className="font-bold text-amber-700">
                            {rMap.get('FT_FINAL_WINNER') ?? 50} / {rMap.get('FT_FINAL_LOSER') ?? 25} pts
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 text-[11px]">Top Scorer:</span>
                          <span className="font-bold text-emerald-700">{rMap.get('FT_TOP_SCORER') ?? 15} pts</span>
                        </div>
                      </div>
                    )}

                    {sportKey === 'BGMI' && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Match Win (WWCD):</span>
                          <span className="font-bold text-blue-700">{rMap.get('BGMI_MATCH_WIN') ?? 8} pts</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Overall 1st / 2nd:</span>
                          <span className="font-bold text-amber-700">
                            {rMap.get('BGMI_OVERALL_WINNER') ?? 20} / {rMap.get('BGMI_RUNNER_UP') ?? 12} pts
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 text-[11px]">MVP / 3rd (7 teams):</span>
                          <span className="font-bold text-emerald-700">
                            {rMap.get('BGMI_MVP') ?? 5} / {rMap.get('BGMI_THIRD_PLACE') ?? 8} pts
                          </span>
                        </div>
                      </div>
                    )}

                    {sportKey === 'CRICKET' && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Match Win:</span>
                          <span className="font-bold text-blue-700">{rMap.get('CRICK_MATCH_WIN') ?? 10} pts</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Final 1st / 2nd / 3rd:</span>
                          <span className="font-bold text-amber-700">
                            {rMap.get('CRICK_FINAL_WINNER') ?? 50} / {rMap.get('CRICK_FINAL_LOSER') ?? 25} / {rMap.get('CRICK_THIRD_PLACE') ?? 20} pts
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 text-[11px]">Awards (Bat/Bowl/Field):</span>
                          <span className="font-bold text-emerald-700">Men 10 / Women 5 pts</span>
                        </div>
                      </div>
                    )}

                    {(sportKey === 'BADMINTON' || sportKey === 'CARROM') && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Singles / Doubles:</span>
                          <span className="font-bold text-blue-700">10 • 7 • 5 pts</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">Mixed / MD / WD:</span>
                          <span className="font-bold text-amber-700">20 • 14 • 10 pts</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 text-[11px]">Placement Tiers:</span>
                          <span className="font-bold text-slate-700">1st (Gold), 2nd, 3rd</span>
                        </div>
                      </div>
                    )}

                    {sportKey === 'CHESS' && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                          <span className="text-slate-600 text-[11px]">1st Place:</span>
                          <span className="font-bold text-amber-700">{rMap.get('CHESS_1ST') ?? 10} pts</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 text-[11px]">2nd Place:</span>
                          <span className="font-bold text-slate-700">{rMap.get('CHESS_2ND') ?? 5} pts</span>
                        </div>
                      </div>
                    )}

                    {!sportKey && (
                      <div className="text-xs text-slate-500 italic py-1">
                        Custom sport rules configured via standard settings.
                      </div>
                    )}
                  </div>

                  {/* Assigned Referees */}
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Assigned Officials ({sport.referees?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sport.referees?.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No referees assigned</span>
                      ) : (
                        sport.referees?.map((r: any) => (
                          <span
                            key={r.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {r.referee?.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
                      <Users className="w-3 h-3 text-slate-400" />
                      {sport._count?.players || 0}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {sport._count?.matches || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(sport, true)}
                      title="Configure Official Scoring Rules"
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition"
                    >
                      <Sliders className="w-3 h-3" />
                      Configure Rules
                    </button>
                    <button
                      onClick={() => handleOpenEdit(sport, false)}
                      title="Edit General Details"
                      className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-md transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sport.id, sport.name)}
                      title="Delete Sport"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add / Configure Sport Scoring */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[100] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between bg-navy-900 text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      {selectedSport ? `Configure Sport: ${selectedSport.name}` : 'Register New Sport Discipline'}
                      {selectedSportKey && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          PDF Rules
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      APL Season 9 • House Championship Scoring Configuration
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTab('rules')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                    modalTab === 'rules'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg border-t border-x border-slate-200 -mb-px'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Official Scoring Rules
                  {selectedSportKey && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-100 text-blue-800">
                      {selectedSportKey}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('general')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                    modalTab === 'general'
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg border-t border-x border-slate-200 -mb-px'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Sport Details & Officials
                </button>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium shrink-0">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                  {/* TAB 1: SPORT DETAILS & OFFICIALS */}
                  {modalTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Sport Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            initRulesForSport(e.target.value);
                          }}
                          placeholder="e.g. Football, Cricket, BGMI, Badminton, Carrom, Chess"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        >
                          <option value="OutDoor">OutDoor</option>
                          <option value="Indoor">Indoor</option>
                          <option value="Racquet">Racquet</option>
                          <option value="Esports">Esports</option>
                          <option value="Athletics">Athletics</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Sport Type *
                        </label>
                        <select
                          value={formData.sportType}
                          onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        >
                          <option value="TEAM">TEAM</option>
                          <option value="INDIVIDUAL">INDIVIDUAL</option>
                          <option value="DOUBLES">DOUBLES</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Gender Category
                        </label>
                        <select
                          value={formData.genderCategory}
                          onChange={(e) => setFormData({ ...formData, genderCategory: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                          <option value="MIXED">MIXED</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Icon Name / Code
                        </label>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          placeholder="football, cricket, etc."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Tournament Format *
                        </label>
                        <select
                          value={formData.tournamentFormat}
                          onChange={(e) => setFormData({ ...formData, tournamentFormat: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        >
                          <option value="KNOCKOUT">KNOCKOUT</option>
                          <option value="LEAGUE">LEAGUE</option>
                          <option value="ROUND_ROBIN">ROUND ROBIN</option>
                          <option value="GROUP_STAGE">GROUP STAGE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Max Participants (Per Side)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={formData.maxParticipants}
                          onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Authorized Referees */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Authorized Match Officials / Referees
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                        {referees.map((r) => {
                          const isAssigned = formData.assignedRefereeIds.includes(r.id);
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => toggleRefereeAssignment(r.id)}
                              className={`p-2 rounded-md border text-left flex items-center justify-between text-xs transition ${
                                isAssigned
                                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <span className="block leading-tight">{r.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{r.refereeCode}</span>
                              </div>
                              {isAssigned && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DYNAMIC SPORT-SPECIFIC SCORING RULES */}
                {modalTab === 'rules' && (
                  <div className="space-y-4">
                    {/* Source of truth Banner with Reset Button */}
                    <div className="p-3.5 bg-gradient-to-r from-blue-50 via-slate-50 to-amber-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-navy-950 text-xs">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Official Scoring Configuration — {selectedSportKey || 'General'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Source of truth: <span className="font-semibold text-blue-800">sports_points_distribution.pdf</span>.
                          Generic 3/1/0 or 30/20/10 values have been removed. Configure sport-specific tournament points below.
                        </p>
                      </div>

                      {selectedSportKey && (
                        <button
                          type="button"
                          onClick={handleResetToOfficialPDF}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs transition"
                          title="Restore exact official PDF default points"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          Reset to PDF Defaults
                        </button>
                      )}
                    </div>

                    {/* SPORT 1: FOOTBALL */}
                    {selectedSportKey === 'FOOTBALL' && (
                      <div className="space-y-3">
                        <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-blue-600" /> Football Scoring Points (PDF Rule Table)
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">Per Match Win</label>
                            <span className="text-[10px] text-slate-500 block">Standard league / group match victory</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['FT_MATCH_WIN'] ?? 10}
                                onChange={(e) => updateRulePoint('FT_MATCH_WIN', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-blue-800"
                              />
                              <span className="text-[11px] font-semibold text-slate-500">points</span>
                            </div>
                          </div>

                          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <MedalBadge type="gold" className="w-3 h-3" /> Final Winner
                            </label>
                            <span className="text-[10px] text-amber-800 block">Championship final stage tournament winner</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['FT_FINAL_WINNER'] ?? 50}
                                onChange={(e) => updateRulePoint('FT_FINAL_WINNER', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-amber-300 rounded bg-white text-xs font-bold text-amber-900"
                              />
                              <span className="text-[11px] font-semibold text-amber-800">points</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <MedalBadge type="silver" className="w-3 h-3" /> Final Loser
                            </label>
                            <span className="text-[10px] text-slate-500 block">Championship final runner-up placement</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['FT_FINAL_LOSER'] ?? 25}
                                onChange={(e) => updateRulePoint('FT_FINAL_LOSER', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-slate-800"
                              />
                              <span className="text-[11px] font-semibold text-slate-500">points</span>
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-emerald-600" /> Top Scorer (Golden Boot)
                            </label>
                            <span className="text-[10px] text-emerald-800 block">Tournament individual award, awarded to player's house</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['FT_TOP_SCORER'] ?? 15}
                                onChange={(e) => updateRulePoint('FT_TOP_SCORER', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-emerald-300 rounded bg-white text-xs font-bold text-emerald-900"
                              />
                              <span className="text-[11px] font-semibold text-emerald-800">points</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPORT 2: BGMI */}
                    {selectedSportKey === 'BGMI' && (
                      <div className="space-y-3">
                        <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-blue-600" /> BGMI Esports Scoring Points (PDF Rule Table)
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">Per Match Win (WWCD)</label>
                            <span className="text-[10px] text-slate-500 block">Awarded to the match-winning squad</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['BGMI_MATCH_WIN'] ?? 8}
                                onChange={(e) => updateRulePoint('BGMI_MATCH_WIN', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-blue-800"
                              />
                              <span className="text-[11px] font-semibold text-slate-500">points</span>
                            </div>
                          </div>

                          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <MedalBadge type="gold" className="w-3 h-3" /> Overall Winner
                            </label>
                            <span className="text-[10px] text-amber-800 block">Overall tournament esports champion squad</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['BGMI_OVERALL_WINNER'] ?? 20}
                                onChange={(e) => updateRulePoint('BGMI_OVERALL_WINNER', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-amber-300 rounded bg-white text-xs font-bold text-amber-900"
                              />
                              <span className="text-[11px] font-semibold text-amber-800">points</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <MedalBadge type="silver" className="w-3 h-3" /> Runner-Up
                            </label>
                            <span className="text-[10px] text-slate-500 block">Overall tournament 2nd place squad</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['BGMI_RUNNER_UP'] ?? 12}
                                onChange={(e) => updateRulePoint('BGMI_RUNNER_UP', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-slate-800"
                              />
                              <span className="text-[11px] font-semibold text-slate-500">points</span>
                            </div>
                          </div>

                          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-purple-900 flex items-center gap-1">
                              <Award className="w-3 h-3 text-purple-600" /> Tournament MVP
                            </label>
                            <span className="text-[10px] text-purple-800 block">Individual MVP, awarded directly to player's house</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['BGMI_MVP'] ?? 5}
                                onChange={(e) => updateRulePoint('BGMI_MVP', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-purple-300 rounded bg-white text-xs font-bold text-purple-900"
                              />
                              <span className="text-[11px] font-semibold text-purple-800">points</span>
                            </div>
                          </div>

                          {/* Third place conditional */}
                          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1 col-span-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                                <MedalBadge type="bronze" className="w-3 h-3" /> Third Place (Conditional)
                              </label>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200/70 text-blue-900">
                                Condition: ONLY if 7 teams participate
                              </span>
                            </div>
                            <span className="text-[10px] text-blue-800 block">
                              Awarded to 3rd place squad strictly when tournament lobby has 7 participating squads.
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['BGMI_THIRD_PLACE'] ?? 8}
                                onChange={(e) => updateRulePoint('BGMI_THIRD_PLACE', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-blue-300 rounded bg-white text-xs font-bold text-blue-900"
                              />
                              <span className="text-[11px] font-semibold text-blue-800">points</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPORT 3: CRICKET */}
                    {selectedSportKey === 'CRICKET' && (
                      <div className="space-y-4">
                        <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-blue-600" /> Cricket Scoring Configuration (PDF Rule Table)
                        </div>

                        {/* Match & Final Placements */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-[11px] font-bold text-slate-800 block uppercase tracking-wider">
                            Match & Championship Placements
                          </span>
                          <div className="grid grid-cols-4 gap-2.5">
                            <div>
                              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Per Match Win</label>
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['CRICK_MATCH_WIN'] ?? 10}
                                onChange={(e) => updateRulePoint('CRICK_MATCH_WIN', parseInt(e.target.value))}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold text-blue-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-amber-800 font-semibold mb-0.5">Final Winner</label>
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['CRICK_FINAL_WINNER'] ?? 50}
                                onChange={(e) => updateRulePoint('CRICK_FINAL_WINNER', parseInt(e.target.value))}
                                className="w-full px-2 py-1 border border-amber-300 rounded text-xs font-bold text-amber-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Final Loser</label>
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['CRICK_FINAL_LOSER'] ?? 25}
                                onChange={(e) => updateRulePoint('CRICK_FINAL_LOSER', parseInt(e.target.value))}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-amber-900 font-semibold mb-0.5">Third Place</label>
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['CRICK_THIRD_PLACE'] ?? 20}
                                onChange={(e) => updateRulePoint('CRICK_THIRD_PLACE', parseInt(e.target.value))}
                                className="w-full px-2 py-1 border border-amber-300 rounded text-xs font-bold text-amber-900"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Gender-Specific Cricket Awards */}
                        <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                          <span className="text-[11px] font-bold text-blue-900 block uppercase tracking-wider">
                            Gender-Specific Individual Performance Awards
                          </span>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-2 bg-white rounded-lg border border-blue-200 space-y-1">
                              <span className="text-[10px] font-bold text-slate-700 block">Best Batsman</span>
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="text-slate-500">Men:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={rulePoints['CRICK_BEST_BATSMAN_MEN'] ?? 10}
                                  onChange={(e) => updateRulePoint('CRICK_BEST_BATSMAN_MEN', parseInt(e.target.value))}
                                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded font-bold text-right"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="text-slate-500">Women:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={rulePoints['CRICK_BEST_BATSMAN_WOMEN'] ?? 5}
                                  onChange={(e) => updateRulePoint('CRICK_BEST_BATSMAN_WOMEN', parseInt(e.target.value))}
                                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded font-bold text-right"
                                />
                              </div>
                            </div>

                            <div className="p-2 bg-white rounded-lg border border-blue-200 space-y-1">
                              <span className="text-[10px] font-bold text-slate-700 block">Best Bowler</span>
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="text-slate-500">Men:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={rulePoints['CRICK_BEST_BOWLER_MEN'] ?? 10}
                                  onChange={(e) => updateRulePoint('CRICK_BEST_BOWLER_MEN', parseInt(e.target.value))}
                                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded font-bold text-right"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="text-slate-500">Women:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={rulePoints['CRICK_BEST_BOWLER_WOMEN'] ?? 5}
                                  onChange={(e) => updateRulePoint('CRICK_BEST_BOWLER_WOMEN', parseInt(e.target.value))}
                                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded font-bold text-right"
                                />
                              </div>
                            </div>

                            <div className="p-2 bg-white rounded-lg border border-blue-200 space-y-1">
                              <span className="text-[10px] font-bold text-slate-700 block">Best Fielder</span>
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="text-slate-500">Men:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={rulePoints['CRICK_BEST_FIELDER_MEN'] ?? 10}
                                  onChange={(e) => updateRulePoint('CRICK_BEST_FIELDER_MEN', parseInt(e.target.value))}
                                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded font-bold text-right"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="text-slate-500">Women:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={rulePoints['CRICK_BEST_FIELDER_WOMEN'] ?? 5}
                                  onChange={(e) => updateRulePoint('CRICK_BEST_FIELDER_WOMEN', parseInt(e.target.value))}
                                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded font-bold text-right"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Boundaries & Tournament MVPs */}
                        <div className="grid grid-cols-4 gap-2.5">
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <label className="block text-[10px] font-bold text-slate-700">Most Fours (4s)</label>
                            <input
                              type="number"
                              min={0}
                              value={rulePoints['CRICK_MOST_FOURS'] ?? 5}
                              onChange={(e) => updateRulePoint('CRICK_MOST_FOURS', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-bold text-xs"
                            />
                          </div>

                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <label className="block text-[10px] font-bold text-slate-700">Most Sixes (6s)</label>
                            <input
                              type="number"
                              min={0}
                              value={rulePoints['CRICK_MOST_SIXES'] ?? 5}
                              onChange={(e) => updateRulePoint('CRICK_MOST_SIXES', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-bold text-xs"
                            />
                          </div>

                          <div className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                            <label className="block text-[10px] font-bold text-purple-900">Man of Tourney (Men)</label>
                            <input
                              type="number"
                              min={0}
                              value={rulePoints['CRICK_MOTM_MEN'] ?? 15}
                              onChange={(e) => updateRulePoint('CRICK_MOTM_MEN', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-purple-300 rounded font-bold text-xs text-purple-900"
                            />
                          </div>

                          <div className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                            <label className="block text-[10px] font-bold text-purple-900">Player of Tourney (Women)</label>
                            <input
                              type="number"
                              min={0}
                              value={rulePoints['CRICK_MOTM_WOMEN'] ?? 10}
                              onChange={(e) => updateRulePoint('CRICK_MOTM_WOMEN', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-purple-300 rounded font-bold text-xs text-purple-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPORT 4 & 5: BADMINTON & CARROM (CATEGORY-BASED PLACEMENT TABLE) */}
                    {(selectedSportKey === 'BADMINTON' || selectedSportKey === 'CARROM') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-blue-600" />
                            {selectedSportKey} Category-Based Placement Matrix (PDF Rules)
                          </div>
                          <span className="text-[10px] text-slate-500 italic">
                            Applied independently to {selectedSportKey}
                          </span>
                        </div>

                        {/* Table Matrix */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                                <th className="p-2.5">Category Event (Official PDF Label)</th>
                                <th className="p-2.5 text-amber-800 text-center w-28">
                                  <span className="inline-flex items-center gap-1">
                                    <MedalBadge type="gold" className="w-3 h-3" /> 1st Place
                                  </span>
                                </th>
                                <th className="p-2.5 text-slate-700 text-center w-28">
                                  <span className="inline-flex items-center gap-1">
                                    <MedalBadge type="silver" className="w-3 h-3" /> 2nd Place
                                  </span>
                                </th>
                                <th className="p-2.5 text-amber-900 text-center w-28">
                                  <span className="inline-flex items-center gap-1">
                                    <MedalBadge type="bronze" className="w-3 h-3" /> 3rd Place
                                  </span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {/* Row 1: Men's singles / doubles */}
                              {(() => {
                                const pfx = selectedSportKey === 'BADMINTON' ? 'BADM' : 'CARROM';
                                return (
                                  <tr className="hover:bg-slate-50/60">
                                    <td className="p-2.5 font-medium text-slate-800">
                                      <span>Men's singles / doubles</span>
                                      <span className="text-[10px] text-slate-400 block">Men's bracket events</span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MS_MD_1ST`] ?? 10}
                                        onChange={(e) => updateRulePoint(`${pfx}_MS_MD_1ST`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MS_MD_2ND`] ?? 7}
                                        onChange={(e) => updateRulePoint(`${pfx}_MS_MD_2ND`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MS_MD_3RD`] ?? 5}
                                        onChange={(e) => updateRulePoint(`${pfx}_MS_MD_3RD`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                  </tr>
                                );
                              })()}

                              {/* Row 2: Women's singles / doubles */}
                              {(() => {
                                const pfx = selectedSportKey === 'BADMINTON' ? 'BADM' : 'CARROM';
                                return (
                                  <tr className="hover:bg-slate-50/60">
                                    <td className="p-2.5 font-medium text-slate-800">
                                      <span>Women's singles / doubles</span>
                                      <span className="text-[10px] text-slate-400 block">Women's bracket events</span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_WS_WD_1ST`] ?? 10}
                                        onChange={(e) => updateRulePoint(`${pfx}_WS_WD_1ST`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_WS_WD_2ND`] ?? 7}
                                        onChange={(e) => updateRulePoint(`${pfx}_WS_WD_2ND`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_WS_WD_3RD`] ?? 5}
                                        onChange={(e) => updateRulePoint(`${pfx}_WS_WD_3RD`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                  </tr>
                                );
                              })()}

                              {/* Row 3: Mixed */}
                              {(() => {
                                const pfx = selectedSportKey === 'BADMINTON' ? 'BADM' : 'CARROM';
                                return (
                                  <tr className="hover:bg-slate-50/60 bg-blue-50/20">
                                    <td className="p-2.5 font-medium text-slate-800">
                                      <span>Mixed</span>
                                      <span className="text-[10px] text-blue-600 block">Cross-gender mixed doubles</span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MIXED_1ST`] ?? 20}
                                        onChange={(e) => updateRulePoint(`${pfx}_MIXED_1ST`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-blue-300 rounded font-bold text-center text-blue-900 bg-white"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MIXED_2ND`] ?? 14}
                                        onChange={(e) => updateRulePoint(`${pfx}_MIXED_2ND`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-blue-300 rounded font-bold text-center text-blue-900 bg-white"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MIXED_3RD`] ?? 10}
                                        onChange={(e) => updateRulePoint(`${pfx}_MIXED_3RD`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-blue-300 rounded font-bold text-center text-blue-900 bg-white"
                                      />
                                    </td>
                                  </tr>
                                );
                              })()}

                              {/* Row 4: MD (Preserved Label) */}
                              {(() => {
                                const pfx = selectedSportKey === 'BADMINTON' ? 'BADM' : 'CARROM';
                                return (
                                  <tr className="hover:bg-slate-50/60">
                                    <td className="p-2.5 font-medium text-slate-800">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-navy-900">MD</span>
                                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                                          Preserved PDF Label
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 block">MD bracket category from source PDF</span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MD_1ST`] ?? 20}
                                        onChange={(e) => updateRulePoint(`${pfx}_MD_1ST`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MD_2ND`] ?? 14}
                                        onChange={(e) => updateRulePoint(`${pfx}_MD_2ND`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_MD_3RD`] ?? 10}
                                        onChange={(e) => updateRulePoint(`${pfx}_MD_3RD`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                  </tr>
                                );
                              })()}

                              {/* Row 5: WD (Preserved Label) */}
                              {(() => {
                                const pfx = selectedSportKey === 'BADMINTON' ? 'BADM' : 'CARROM';
                                return (
                                  <tr className="hover:bg-slate-50/60">
                                    <td className="p-2.5 font-medium text-slate-800">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-navy-900">WD</span>
                                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                                          Preserved PDF Label
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 block">WD bracket category from source PDF</span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_WD_1ST`] ?? 20}
                                        onChange={(e) => updateRulePoint(`${pfx}_WD_1ST`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_WD_2ND`] ?? 14}
                                        onChange={(e) => updateRulePoint(`${pfx}_WD_2ND`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={rulePoints[`${pfx}_WD_3RD`] ?? 10}
                                        onChange={(e) => updateRulePoint(`${pfx}_WD_3RD`, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                                      />
                                    </td>
                                  </tr>
                                );
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SPORT 6: CHESS */}
                    {selectedSportKey === 'CHESS' && (
                      <div className="space-y-3">
                        <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-blue-600" /> Chess Tournament Scoring (PDF Rule Table)
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <MedalBadge type="gold" className="w-3.5 h-3.5" /> 1st Place (Champion)
                            </label>
                            <span className="text-[10px] text-amber-800 block">Chess tournament 1st place champion</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['CHESS_1ST'] ?? 10}
                                onChange={(e) => updateRulePoint('CHESS_1ST', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-amber-300 rounded bg-white text-xs font-bold text-amber-900"
                              />
                              <span className="text-[11px] font-semibold text-amber-800">points</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <MedalBadge type="silver" className="w-3.5 h-3.5" /> 2nd Place (Runner-up)
                            </label>
                            <span className="text-[10px] text-slate-500 block">Chess tournament 2nd place runner-up</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min={0}
                                value={rulePoints['CHESS_2ND'] ?? 5}
                                onChange={(e) => updateRulePoint('CHESS_2ND', parseInt(e.target.value))}
                                className="w-24 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-slate-800"
                              />
                              <span className="text-[11px] font-semibold text-slate-500">points</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!selectedSportKey && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
                        Enter one of the official tournament sports (Football, BGMI, Cricket, Badminton, Carrom, Chess)
                        to automatically load its dedicated rules matrix from the PDF.
                      </div>
                    )}
                  </div>
                )}

                </div>

                {/* Modal Footer (Pinned at bottom) */}
                <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {modalTab === 'general' ? 'Tab: Sport Details' : `Official Scoring Rules: ${selectedSportKey || 'Custom'}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingRules}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {savingRules ? (
                        <span>Saving Rules...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Official Configuration</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
