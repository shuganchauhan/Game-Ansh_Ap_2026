import React, { useState, useMemo } from 'react';
import {
  Shield, Plus, X, Users, CheckCircle2, Sparkles, Zap, Crosshair, Flame,
  Crown, Target, AlertTriangle, Search, UserCheck, Clock, UserPlus, Check
} from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

const GAME_ICONS = {
  valorant: Zap,
  bgmi: Crosshair,
  freefire: Flame,
  coc: Shield,
  cr: Crown,
  cod: Target,
};

const GAME_OPTIONS = [
  { id: 'valorant', name: 'VALORANT', defaultSlots: 5, color: '#37ebf3' },
  { id: 'bgmi', name: 'BGMI', defaultSlots: 5, color: '#C48200' },
  { id: 'freefire', name: 'Free Fire', defaultSlots: 4, color: '#e455ae' },
  { id: 'coc', name: 'Clash of Clans', defaultSlots: 15, color: '#1ac5b0' },
  { id: 'cr', name: 'Clash Royale', defaultSlots: 3, color: '#9381ff' },
  { id: 'cod', name: 'Call of Duty', defaultSlots: 5, color: '#cb1dcd' },
];

const COMMON_ROLES = [
  'Main Assaulter',
  'Entry Fragger',
  'Support / DMR',
  'Sniper / Marksman',
  'Anchor / Sentinel',
  'Shotcaller / Co-IGL',
  'Flex Sub',
];

export default function TeamCreationModal({ isOpen, onClose, onTeamCreated }) {
  const { createTeam, currentUser, activeRole, activeOrgId, orgs, players = [] } = useGameStore();

  const [selectedGame, setSelectedGame] = useState('bgmi');
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [division, setDivision] = useState('Competitive Tier 2');
  const [slotsMax, setSlotsMax] = useState(5);

  const safeUser = currentUser || {};
  const captainName = safeUser.name || safeUser.username || (safeUser.email ? safeUser.email.split('@')[0] : 'Squad Captain');
  const captainIgn = safeUser.game_ign || safeUser.gameAccounts?.[selectedGame] || safeUser.username || captainName;

  // Selected existing athletes to invite (Unstop-style invitation flow)
  const [invitedAthletes, setInvitedAthletes] = useState([]);

  // Athlete search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGameOnly, setFilterGameOnly] = useState(false);
  const [filterLftOnly, setFilterLftOnly] = useState(false);

  // Initial open recruitment roles
  const [openRoles, setOpenRoles] = useState(import.meta.env.DEV ? [
    { roleName: 'Fifth Entry Fragger', description: 'Aggressive assaulter with 5+ KD in tier-2 scrims.', requirements: 'Daily scrim availability 7pm-11pm' }
  ] : []);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter available registered athletes
  const availableAthletes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const currentUserId = safeUser.id;
    const invitedIds = new Set(invitedAthletes.map((a) => a.id));

    return players.filter((player) => {
      // Cannot invite oneself
      if (player.id === currentUserId || (safeUser.username && player.username === safeUser.username)) {
        return false;
      }
      // Already selected
      if (invitedIds.has(player.id)) return false;

      // Filter by game match
      if (filterGameOnly && player.primaryGame && player.primaryGame !== selectedGame) {
        return false;
      }

      // Filter by LFT status
      if (filterLftOnly && player.lftStatus && !player.lftStatus.toLowerCase().includes('lft') && !player.lftStatus.toLowerCase().includes('looking')) {
        return false;
      }

      // Search query
      if (q) {
        const matchesName = (player.name || '').toLowerCase().includes(q);
        const matchesUser = (player.username || '').toLowerCase().includes(q);
        const matchesIgn = (player.game_ign || player.gameAccounts?.[selectedGame] || '').toLowerCase().includes(q);
        const matchesTagline = (player.tagline || '').toLowerCase().includes(q);
        return matchesName || matchesUser || matchesIgn || matchesTagline;
      }

      return true;
    });
  }, [players, searchQuery, safeUser, invitedAthletes, filterGameOnly, filterLftOnly, selectedGame]);

  if (!isOpen) return null;

  const handleGameSelect = (g) => {
    setSelectedGame(g.id);
    setSlotsMax(Math.min(10, Math.max(4, g.defaultSlots)));
  };

  const handleAddAthlete = (athlete) => {
    if (invitedAthletes.length + 1 >= slotsMax) {
      setFormError(`Maximum roster capacity (${slotsMax} players) reached.`);
      return;
    }
    setFormError('');
    const ign = athlete.gameAccounts?.[selectedGame] || athlete.game_ign || athlete.username;
    setInvitedAthletes((prev) => [
      ...prev,
      {
        id: athlete.id,
        name: athlete.name || athlete.username,
        username: athlete.username,
        ign,
        primaryGame: athlete.primaryGame || selectedGame,
        role: COMMON_ROLES[prev.length % COMMON_ROLES.length],
        avatar: athlete.avatar || '',
      },
    ]);
  };

  const handleRemoveAthlete = (athleteId) => {
    setInvitedAthletes((prev) => prev.filter((a) => a.id !== athleteId));
  };

  const handleUpdateAthleteRole = (athleteId, newRole) => {
    setInvitedAthletes((prev) =>
      prev.map((a) => (a.id === athleteId ? { ...a, role: newRole } : a))
    );
  };

  const handleAddOpenRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setOpenRoles([
      ...openRoles,
      {
        roleName: newRoleName.trim(),
        description: newRoleDesc.trim() || 'Open recruitment slot.',
        requirements: 'Competitive scrim availability',
      },
    ]);
    setNewRoleName('');
    setNewRoleDesc('');
  };

  const handleRemoveOpenRole = (idx) => {
    setOpenRoles(openRoles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setFormError('Please enter a Squad Name.');
      return;
    }

    const captainMember = {
      id: safeUser.id || `captain-${Date.now()}`,
      name: captainName,
      role: 'Captain / IGL',
      ign: captainIgn,
      isCaptain: true,
    };

    const activeOrg = activeRole === 'org' ? orgs.find((o) => o.id === activeOrgId) : null;

    setFormError('');
    setSubmitting(true);
    try {
      const created = await createTeam({
        name: teamName.trim(),
        tag: teamTag.trim() || teamName.slice(0, 4).toUpperCase(),
        game: selectedGame,
        orgId: activeOrg?.id || null,
        orgName: activeOrg?.name || 'Independent Squad',
        division,
        slotsMax: Math.min(10, Math.max(4, Number(slotsMax) || 5)),
        initialMembers: [captainMember],
        openRoles,
        invitedAthletes,
      });

      onTeamCreated?.(created);
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to create squad. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-3xl glass-modal p-6 sm:p-8 space-y-6 shadow-2xl border border-card-border relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-mono uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Competitive Squad Registration</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-on-surface">
            Form Your Esports Squad
          </h2>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant">
            Create an official roster, search and invite verified platform athletes, and initiate your tournament pathway.
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-error/15 border border-error/30 text-error font-body text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Game Selection */}
          <div className="space-y-2">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              1. Select Title / Competitive Game
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {GAME_OPTIONS.map((g) => {
                const Icon = GAME_ICONS[g.id] || Shield;
                const isSelected = selectedGame === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGameSelect(g)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/15 shadow-glow'
                        : 'border-card-border bg-surface-container hover:border-card-border-hover'
                    }`}
                  >
                    <Icon className="w-5 h-5" style={{ color: g.color }} />
                    <span className="font-display font-bold text-xs text-on-surface block truncate w-full">
                      {g.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1 font-bold">
                Team / Squad Name *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Apex Predators IN"
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1 font-bold">
                Team Tag
              </label>
              <input
                type="text"
                value={teamTag}
                onChange={(e) => setTeamTag(e.target.value)}
                placeholder="e.g. APEX"
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-mono uppercase focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1 font-bold">
                Division / Competitive Tier
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none focus:border-primary"
              >
                <option value="Tier 1 Pro">Tier 1 Pro (BMPS / VCT)</option>
                <option value="Competitive Tier 2">Competitive Tier 2</option>
                <option value="Open Qualifiers">Open Qualifiers</option>
                <option value="Campus & Semi-Pro">Campus &amp; Semi-Pro</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1 font-bold">
                Total Roster Slots (Max)
              </label>
              <input
                type="number"
                min={4}
                max={10}
                value={slotsMax}
                onChange={(e) => setSlotsMax(Math.min(10, Math.max(4, Number(e.target.value) || 4)))}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Step 3: Squad Roster & Athlete Invitation Section */}
          <div className="space-y-4 pt-3 border-t border-card-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-mono text-[11px] uppercase text-on-surface-variant font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  2. Squad Roster ({invitedAthletes.length + 1} / {slotsMax} Slots)
                </label>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Invite real registered platform athletes. Formal join requests are dispatched upon creation.
                </p>
              </div>
              <span className="font-mono text-xs text-secondary font-bold">
                {invitedAthletes.length + 1 >= 4 ? 'Status: Registered Ready' : `Add ${4 - (invitedAthletes.length + 1)} more to Register`}
              </span>
            </div>

            {/* Current Roster Preview (Captain + Invited Athletes) */}
            <div className="space-y-2">
              {/* Captain Row */}
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center font-display font-black text-xs text-primary">
                    <Crown className="w-4 h-4 text-tertiary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-on-surface">
                        {captainName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/20 text-primary uppercase">
                        Captain / IGL
                      </span>
                    </div>
                    <span className="font-mono text-xs text-on-surface-variant">
                      IGN: <span className="text-secondary">{captainIgn}</span> (Confirmed)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                  <Check className="w-3 h-3" /> Confirmed
                </span>
              </div>

              {/* Invited Athletes Rows */}
              {invitedAthletes.map((athlete) => (
                <div
                  key={athlete.id}
                  className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center font-display font-bold text-xs text-secondary">
                      {athlete.username?.slice(0, 2).toUpperCase() || 'PL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-on-surface">
                          {athlete.name}
                        </span>
                        <span className="font-mono text-xs text-on-surface-variant">
                          (@{athlete.username})
                        </span>
                      </div>
                      <span className="font-mono text-xs text-on-surface-variant">
                        IGN: <span className="text-secondary">{athlete.ign}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role Picker */}
                    <select
                      value={athlete.role}
                      onChange={(e) => handleUpdateAthleteRole(athlete.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container-high border border-card-border text-on-surface font-mono text-xs focus:outline-none"
                    >
                      {COMMON_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold uppercase flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> Invite Pending
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveAthlete(athlete.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                      title="Remove candidate"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Athlete Search & Selector Box */}
            {invitedAthletes.length + 1 < slotsMax && (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-card-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-xs text-on-surface uppercase tracking-wider">
                      Search &amp; Add Registered Platform Athletes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFilterGameOnly(!filterGameOnly)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase transition-colors ${
                        filterGameOnly
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-on-surface-variant border border-card-border'
                      }`}
                    >
                      Matches {selectedGame.toUpperCase()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterLftOnly(!filterLftOnly)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase transition-colors ${
                        filterLftOnly
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-surface-container text-on-surface-variant border border-card-border'
                      }`}
                    >
                      LFT Only
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search registered athletes by username, in-game IGN, or real name..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary font-body"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Search Results list */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-card-border/50">
                  {availableAthletes.length > 0 ? (
                    availableAthletes.slice(0, 6).map((athlete) => {
                      const ign = athlete.gameAccounts?.[selectedGame] || athlete.game_ign || athlete.username;
                      const stats = athlete.stats?.[selectedGame] || athlete.stats?.[athlete.primaryGame] || {};
                      return (
                        <div
                          key={athlete.id}
                          className="pt-2 pb-1 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-card-border flex items-center justify-center font-display font-bold text-xs text-primary shrink-0">
                              {athlete.username?.slice(0, 2).toUpperCase() || 'AT'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-display font-bold text-on-surface truncate">
                                  {athlete.name || athlete.username}
                                </span>
                                <span className="font-mono text-[10px] text-on-surface-variant">
                                  @{athlete.username}
                                </span>
                                {athlete.isVerified && (
                                  <Shield className="w-3 h-3 text-primary shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant truncate">
                                <span>IGN: <strong className="text-secondary">{ign}</strong></span>
                                {stats.kd && <span>• KD: {stats.kd}</span>}
                                {stats.rank && <span>• {stats.rank}</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddAthlete(athlete)}
                            className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-white border border-primary/30 font-display font-bold text-[11px] uppercase tracking-wider shrink-0 transition-all active:scale-95"
                          >
                            + Add to Squad
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-xs font-mono text-on-surface-variant">
                      No athletes found matching your search. Try changing the query or clearing filters.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Open Recruitment Roles */}
          <div className="space-y-3 pt-3 border-t border-card-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-mono text-[11px] uppercase text-on-surface-variant font-bold">
                  3. Open Recruitment Roles for Tryouts ({openRoles.length})
                </label>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Publish openings so competitive players can apply with their stats and VOD links.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {openRoles.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-card-border text-xs"
                >
                  <div>
                    <span className="font-display font-bold text-on-surface block">
                      <Target className="w-3.5 h-3.5 text-secondary inline mr-1.5" />{r.roleName}
                    </span>
                    <span className="font-body text-on-surface-variant text-[11px]">
                      {r.description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOpenRole(idx)}
                    className="text-on-surface-variant hover:text-error text-sm font-bold px-2"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Role (e.g. Main Sniper)"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface"
                />
                <input
                  type="text"
                  placeholder="Requirements / Description"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface"
                />
                <button
                  type="button"
                  onClick={handleAddOpenRole}
                  className="px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-xs font-mono text-primary font-bold"
                >
                  + Add Role Opening
                </button>
              </div>
            </div>
          </div>

          {/* Roster Registration & Invitation Status Alert */}
          {(() => {
            const totalCount = invitedAthletes.length + 1;
            const isReg = totalCount >= 4;
            return (
              <div
                className={`p-4 rounded-2xl border ${
                  isReg
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                    {isReg ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      {isReg ? 'OFFICIAL ROSTER (REGISTERED STATUS)' : 'DRAFT SQUAD (MIN 4 PLAYERS NEEDED)'}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold">
                    {totalCount} / 4-5 Members
                  </span>
                </div>
                <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-body">
                  {isReg
                    ? `Squad formed with ${totalCount} roster slots. Formal invitations will be dispatched to the ${invitedAthletes.length} selected athletes. Once accepted, your roster is locked and qualified for official scrims and tournament brackets!`
                    : `Squads require 4 or 5 members to qualify for tournament registrations. Search and invite ${4 - totalCount} more athlete(s) from the platform above.`}
                </p>
              </div>
            );
          })()}

          {/* Submit Action Deck */}
          <div className="flex items-center justify-between pt-3 border-t border-card-border">
            <span className="text-[11px] font-mono text-on-surface-variant">
              Unstop-Style Verified Join Flow • Zero Fake Placeholders
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>{submitting ? 'Dispatching Invitations...' : 'Create Squad & Send Invites'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
