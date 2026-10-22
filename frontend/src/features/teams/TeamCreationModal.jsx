import React, { useState } from 'react';
import { Shield, Plus, X, Users, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

const GAME_OPTIONS = [
  { id: 'valorant', name: 'VALORANT', defaultSlots: 5, color: '#ff4655', icon: '⚡' },
  { id: 'bgmi', name: 'BGMI', defaultSlots: 5, color: '#f5a623', icon: '🔫' },
  { id: 'freefire', name: 'Free Fire', defaultSlots: 4, color: '#ff6b00', icon: '🔥' },
  { id: 'coc', name: 'Clash of Clans', defaultSlots: 15, color: '#4db6ac', icon: '🏰' },
  { id: 'cr', name: 'Clash Royale', defaultSlots: 3, color: '#7e57c2', icon: '👑' },
  { id: 'cod', name: 'Call of Duty', defaultSlots: 5, color: '#4caf50', icon: '💀' },
];

export default function TeamCreationModal({ isOpen, onClose, onTeamCreated }) {
  const { createTeam, currentUser, activeRole, activeOrgId, orgs } = useGameStore();

  const [selectedGame, setSelectedGame] = useState('bgmi');
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [division, setDivision] = useState('Competitive Tier 2');
  const [slotsMax, setSlotsMax] = useState(5);

  // Initial members to add (up to 4-5)
  const [memberInputs, setMemberInputs] = useState([
    { name: 'Rohan Sharma', ign: 'Rohan#IND', role: 'Main Assaulter' },
    { name: 'Karan Patel', ign: 'KaranSniper', role: 'Support / DMR' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberIgn, setNewMemberIgn] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Initial open recruitment roles
  const [openRoles, setOpenRoles] = useState([
    { roleName: 'Fifth Entry Fragger', description: 'Aggressive assaulter with 5+ KD in tier-2 scrims.', requirements: 'Daily scrim availability 7pm-11pm' }
  ]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  if (!isOpen) return null;

  const handleGameSelect = (g) => {
    setSelectedGame(g.id);
    setSlotsMax(g.defaultSlots);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberIgn.trim()) return;
    setMemberInputs([
      ...memberInputs,
      {
        name: newMemberName.trim(),
        ign: newMemberIgn.trim(),
        role: newMemberRole.trim() || 'Flex Member',
      },
    ]);
    setNewMemberName('');
    setNewMemberIgn('');
    setNewMemberRole('');
  };

  const handleRemoveMember = (idx) => {
    setMemberInputs(memberInputs.filter((_, i) => i !== idx));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const initialMembers = [
      {
        id: `captain-${Date.now()}`,
        name: currentUser.name,
        role: 'Captain / IGL',
        ign: currentUser.gameAccounts?.[selectedGame] || currentUser.username,
        isCaptain: true,
      },
      ...memberInputs.map((m, idx) => ({
        id: `member-${Date.now()}-${idx}`,
        name: m.name,
        role: m.role,
        ign: m.ign,
        isCaptain: false,
      })),
    ];

    const activeOrg = activeRole === 'org' ? orgs.find(o => o.id === activeOrgId) : null;

    const created = createTeam({
      name: teamName.trim(),
      tag: teamTag.trim() || teamName.slice(0, 4).toUpperCase(),
      game: selectedGame,
      orgId: activeOrg?.id || null,
      orgName: activeOrg?.name || 'Independent Squad',
      division,
      slotsMax,
      initialMembers,
      openRoles,
    });

    onTeamCreated?.(created);
    onClose();
  };

  const selectedGameObj = GAME_OPTIONS.find((g) => g.id === selectedGame) || GAME_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl glass-modal p-6 sm:p-8 space-y-6 shadow-2xl border border-card-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-secondary font-bold">
              No Separate Login Required
            </span>
            <h3 className="font-display font-bold text-2xl text-on-surface mt-0.5">
              Form a Competitive Squad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Choose Title */}
          <div>
            <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-2">
              1. Select Esports Title *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GAME_OPTIONS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => handleGameSelect(g)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    selectedGame === g.id
                      ? 'border-primary bg-primary/15 shadow-glow'
                      : 'border-card-border bg-surface-container hover:bg-surface-container-high'
                  }`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <div>
                    <span className="font-display font-bold text-xs text-on-surface block">{g.name}</span>
                    <span className="font-mono text-[9px] text-on-surface-variant">{g.defaultSlots} Player Slots</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                Team / Squad Name *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Apex Predators IN"
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                Team Tag
              </label>
              <input
                type="text"
                value={teamTag}
                onChange={(e) => setTeamTag(e.target.value)}
                placeholder="e.g. [APEX]"
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                Division / Tournament Tier
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
              >
                <option value="Tier 1 Pro">Tier 1 Pro (BMPS / VCT)</option>
                <option value="Tier 2 Contender">Tier 2 Contender</option>
                <option value="Open Qualifiers">Open Qualifiers</option>
                <option value="Campus & Semi-Pro">Campus &amp; Semi-Pro</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                Roster Roster Slots
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={slotsMax}
                onChange={(e) => setSlotsMax(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
              />
            </div>
          </div>

          {/* Step 3: Add Roster Members */}
          <div className="space-y-2 pt-2 border-t border-card-border">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase text-on-surface-variant font-bold">
                2. Roster Members ({memberInputs.length + 1} / {slotsMax} Slots)
              </label>
              <span className="font-mono text-[10px] text-secondary">
                You are automatically added as Captain/IGL
              </span>
            </div>

            {/* Current Members preview */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl bg-primary/20 border border-primary/40 font-mono text-xs text-primary font-bold flex items-center gap-1.5">
                ★ {currentUser.name} (Captain)
              </span>
              {memberInputs.map((m, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-surface-container border border-card-border font-mono text-xs text-on-surface flex items-center gap-1.5"
                >
                  {m.name} ({m.ign}) — {m.role}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="text-on-surface-variant hover:text-error ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Member Row */}
            {memberInputs.length + 1 < slotsMax && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Player Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-body"
                />
                <input
                  type="text"
                  placeholder="In-Game IGN"
                  value={newMemberIgn}
                  onChange={(e) => setNewMemberIgn(e.target.value)}
                  className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-mono"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Fragger)"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-body"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-xs font-mono text-secondary font-bold"
                >
                  + Add Member
                </button>
              </div>
            )}
          </div>

          {/* Step 4: Open Recruitment Roles */}
          <div className="space-y-2 pt-2 border-t border-card-border">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase text-on-surface-variant font-bold">
                3. Open Recruitment Roles for Tryouts ({openRoles.length})
              </label>
              <span className="font-mono text-[10px] text-tertiary">
                Players can apply to these open slots
              </span>
            </div>

            <div className="space-y-2">
              {openRoles.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-card-border text-xs"
                >
                  <div>
                    <span className="font-display font-bold text-on-surface block">
                      🎯 {r.roleName}
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
                  + Open Recruitment Role
                </button>
              </div>
            </div>
          </div>

          {/* 4-5 Member Registration Status Badge */}
          {(() => {
            const totalCount = memberInputs.length + 1;
            const isReg = totalCount >= 4;
            return (
              <div className={`p-4 rounded-2xl border ${
                isReg
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                    {isReg ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    <span>Status: {isReg ? 'REGISTERED (OFFICIAL ROSTER)' : 'DRAFT SQUAD'}</span>
                  </div>
                  <span className="font-mono text-xs font-bold">
                    {totalCount} / 4-5 Members
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">
                  {isReg
                    ? 'Congratulations! With 4 or 5 members, your team is officially REGISTERED and qualified for competitive scrims and tournament registrations.'
                    : 'A squad remains in Draft status until 4 or 5 members are added. Add at least ' + (4 - totalCount) + ' more member(s) or open recruitment roles.'}
                </p>
              </div>
            );
          })()}

          {/* Submit */}
          <div className="flex items-center justify-between pt-3 border-t border-card-border">
            <span className="text-[11px] font-mono text-on-surface-variant">
              Unified Identity • No Separate Login
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-primary text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Confirm & Form Squad
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
