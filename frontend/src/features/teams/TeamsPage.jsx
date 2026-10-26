import React, { useEffect, useState } from 'react';
import {
  Shield, Users, Plus, CheckCircle2, Trophy, Swords, Zap, Search,
  ChevronRight, Sparkles, X, ArrowLeft, ExternalLink, Check, Trash2, Edit3
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import { teamService } from '../../services';

export default function TeamsPage({ onOpenTeamCreator, onSelectTab, onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();
  const {
    teams,
    currentUser,
    activeRole,
    submitApplication,
    addTeamMember,
    removeTeamMember,
    openRecruitmentRole,
    closeRecruitmentRole,
    applications,
    updateApplicationStatus,
    setTeamDetails,
  } = useGameStore();

  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamActionError, setTeamActionError] = useState('');

  useEffect(() => {
    if (!selectedTeam?.id) return undefined;
    let active = true;
    setTeamLoading(true);
    teamService.getTeam(selectedTeam.id).then((team) => {
      if (!active) return;
      const details = {
        ...selectedTeam,
        ...team,
        slotsMax: team.slots_max || selectedTeam.slotsMax,
        captainId: team.captain_id,
        roster: (team.members || []).map((member) => ({ ...member, isCaptain: member.is_captain })),
        openRoles: (team.open_roles || []).map((role) => ({ ...role, roleName: role.role })),
      };
      setTeamDetails(team.id, details);
      setSelectedTeam((current) => current?.id !== team.id ? current : details);
    }).catch((error) => console.error('Could not load team:', error.message)).finally(() => active && setTeamLoading(false));
    return () => { active = false; };
  }, [selectedTeam?.id]);

  // Apply modal state
  const [applyModalRole, setApplyModalRole] = useState(null);
  const [pitch, setPitch] = useState('');
  const [vodLink, setVodLink] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // Open new role modal state (for captains/orgs)
  const [openRoleModalOpen, setOpenRoleModalOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleReqs, setRoleReqs] = useState('');

  // Add member modal state
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberIgn, setNewMemberIgn] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Flex Fragger');

  // Filtered teams
  const filteredTeams = teams.filter((t) => {
    const matchesGame = selectedGameFilter === 'all' || t.game === selectedGameFilter;
    const matchesSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.orgName?.toLowerCase().includes(search.toLowerCase());
    return matchesGame && matchesSearch;
  });

  const activeTeamObj = selectedTeam
    ? teams.find((team) => team.id === selectedTeam.id) || selectedTeam
    : null;

  const isCaptainOrManager = activeTeamObj
    ? activeTeamObj.captainId === currentUser.id || activeRole === 'org'
    : false;

  const teamApplications = activeTeamObj
    ? applications.filter((a) => a.teamId === activeTeamObj.id)
    : [];

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setApplyModalRole(null);
      onOpenAuth?.('player', 'login');
      return;
    }
    if (user?.role !== 'player') { setTeamActionError('Only player accounts can apply to a tryout.'); return; }
    if (!applyModalRole || !activeTeamObj) return;

    setTeamActionError('');
    try {
      await submitApplication({ postingId: applyModalRole.id, teamId: activeTeamObj.id, roleName: applyModalRole.roleName, pitch, vodLink });
    } catch (error) { setTeamActionError(error.message || 'Could not submit your application.'); return; }

    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setApplyModalRole(null);
      setPitch('');
      setVodLink('');
    }, 1500);
  };

  const handleCreateOpenRole = (e) => {
    e.preventDefault();
    if (!roleTitle.trim() || !activeTeamObj) return;

    openRecruitmentRole(activeTeamObj.id, {
      roleName: roleTitle.trim(),
      description: roleDesc.trim(),
      requirements: roleReqs.trim(),
    });

    setOpenRoleModalOpen(false);
    setRoleTitle('');
    setRoleDesc('');
    setRoleReqs('');
  };

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeTeamObj) return;

    addTeamMember(activeTeamObj.id, {
      name: newMemberName.trim(),
      ign: newMemberIgn.trim() || newMemberName.trim(),
      role: newMemberRole.trim(),
      isCaptain: false,
    });

    setAddMemberModalOpen(false);
    setNewMemberName('');
    setNewMemberIgn('');
  };

  /* ═══════════════════════════════════════════════════════
     VIEW 1: DETAILED TEAM & ROSTER MANAGEMENT VIEW
  ═══════════════════════════════════════════════════════ */
  if (activeTeamObj) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {teamActionError && <p role="alert" className="p-3 rounded-xl bg-error/10 text-error text-sm">{teamActionError}</p>}
        {teamLoading && <p className="text-xs text-on-surface-variant">Loading current roster…</p>}
        {/* Back navigation */}
        <button
          onClick={() => setSelectedTeam(null)}
          className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to All Squads
        </button>

        {/* Team Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-card-border flex items-center justify-center font-display font-bold text-2xl text-primary shadow-glow">
                {activeTeamObj.tag ? activeTeamObj.tag.slice(0, 3) : 'Ω'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
                    {activeTeamObj.name}
                  </h1>
                  {activeTeamObj.verified && (
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" title="Verified Roster" />
                  )}
                </div>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Affiliated with <b className="text-on-surface">{activeTeamObj.orgName}</b> · {activeTeamObj.division}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs uppercase font-bold bg-primary/15 text-primary">
                    {activeTeamObj.game.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-xs uppercase font-bold bg-secondary/15 text-secondary border border-secondary/30">
                    {activeTeamObj.roster.length}/{activeTeamObj.slotsMax} Active Roster
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Winrate: <b className="text-secondary">{activeTeamObj.winrate}</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Captain / Org Controls */}
            {isCaptainOrManager && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setAddMemberModalOpen(true)}
                  disabled={activeTeamObj.roster.length >= activeTeamObj.slotsMax}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-on-surface font-display font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
                <button
                  onClick={() => setOpenRoleModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Open Recruitment Role
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 5-Slot Interactive Roster Board */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-on-surface">
              Starting Roster ({activeTeamObj.roster.length}/{activeTeamObj.slotsMax} Slots)
            </h2>
            <span className="font-mono text-xs text-on-surface-variant">
              Match Ready // Official Lineup
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTeamObj.roster.map((member, idx) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-surface-container-low border border-card-border flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-display font-bold text-sm text-secondary shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-on-surface truncate">
                        {member.name}
                      </span>
                      {member.isCaptain && <span className="text-tertiary text-xs" title="Captain">★</span>}
                    </div>
                    <p className="font-mono text-xs text-secondary font-semibold">{member.role}</p>
                    <span className="font-mono text-[10px] text-on-surface-variant">IGN: {member.ign}</span>
                  </div>
                </div>

                {isCaptainOrManager && !member.isCaptain && (
                  <button
                    onClick={() => removeTeamMember(activeTeamObj.id, member.id)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove from roster"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, activeTeamObj.slotsMax - activeTeamObj.roster.length) }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-dashed border-card-border bg-surface-container/40 flex items-center justify-between text-on-surface-variant"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container border border-dashed border-card-border flex items-center justify-center font-mono text-xs">
                    {activeTeamObj.roster.length + idx + 1}
                  </div>
                  <div>
                    <span className="font-display font-semibold text-xs text-on-surface-variant block">
                      Empty Roster Slot
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant/60">
                      Open for tryout signing
                    </span>
                  </div>
                </div>

                {isCaptainOrManager && (
                  <button
                    onClick={() => setAddMemberModalOpen(true)}
                    className="text-xs font-mono text-primary font-bold hover:underline"
                  >
                    + Fill
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Open Recruitment Roles (Active Tryouts) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-on-surface">
                Open Recruitment Roles ({activeTeamObj.openRoles?.length || 0})
              </h2>
              <p className="font-body text-xs text-on-surface-variant">
                Competitive players can apply to these open positions with their track records and VODs.
              </p>
            </div>
            {isCaptainOrManager && (
              <button
                onClick={() => setOpenRoleModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30 font-mono text-xs font-bold"
              >
                + New Open Role
              </button>
            )}
          </div>

          {activeTeamObj.openRoles?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTeamObj.openRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-5 rounded-2xl bg-surface-container-low border border-card-border flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-primary/15 text-primary">
                        Tryout Opening
                      </span>
                      {isCaptainOrManager && (
                        <button
                          onClick={() => closeRecruitmentRole(activeTeamObj.id, role.id)}
                          className="text-xs font-mono text-on-surface-variant hover:text-error"
                        >
                          Close Role ×
                        </button>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base text-on-surface">{role.roleName}</h3>
                    <p className="font-body text-xs text-on-surface-variant">{role.description}</p>
                    <div className="p-2 rounded-xl bg-surface-container text-[11px] font-mono text-tertiary">
                      📋 Reqs: {role.requirements}
                    </div>
                  </div>

                  {!isCaptainOrManager && (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          onOpenAuth?.('player', 'login');
                          return;
                        }
                        setApplyModalRole(role);
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Apply for Tryout
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-container-low border border-card-border text-center text-xs font-mono text-on-surface-variant">
              No open recruitment roles active. Roster is currently locked.
            </div>
          )}
        </section>

        {/* Incoming Applications (Visible to Captain / Org) */}
        {isCaptainOrManager && (
          <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-on-surface">
                Candidate Applications for this Squad ({teamApplications.length})
              </h2>
              <span className="font-mono text-xs text-secondary font-bold">
                Direct Signing Enabled
              </span>
            </div>

            {teamApplications.length > 0 ? (
              <div className="space-y-3">
                {teamApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-surface-container border border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-on-surface">
                          {app.applicantName}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-primary/15 text-primary">
                          {app.applicantRank}
                        </span>
                        <span className="font-mono text-xs text-secondary font-bold">
                          for {app.roleName}
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant">
                        &ldquo;{app.pitch}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {app.status === 'accepted' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 font-mono text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Signed to Roster
                        </span>
                      ) : (
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'accepted')}
                          className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-display font-bold text-xs uppercase tracking-wider shadow-glow-accent active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Sign to Roster
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-mono text-on-surface-variant">
                No tryout dossiers submitted yet for this team.
              </div>
            )}
          </section>
        )}

        {/* ── Apply Modal ── */}
        {applyModalRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl glass-modal p-6 sm:p-7 space-y-4 shadow-2xl border border-card-border">
              {!applySuccess ? (
                <>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-secondary font-bold">
                      Competitive Tryout Application
                    </span>
                    <h3 className="font-display font-bold text-xl text-on-surface mt-0.5">
                      Apply for {applyModalRole.roleName}
                    </h3>
                    <p className="font-mono text-xs text-on-surface-variant">
                      Team: {activeTeamObj.name} ({activeTeamObj.game.toUpperCase()})
                    </p>
                  </div>

                  <form onSubmit={handleApplySubmit} className="space-y-3">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                        Player Pitch &amp; Role Experience *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={pitch}
                        onChange={(e) => setPitch(e.target.value)}
                        placeholder="Detail your competitive rank, agent pool, scrim history, and shotcalling..."
                        className="w-full p-3 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                        VOD / Highlights Link (YouTube / Twitch / Tracker)
                      </label>
                      <input
                        type="url"
                        value={vodLink}
                        onChange={(e) => setVodLink(e.target.value)}
                        placeholder="https://youtu.be/my-scrim-vod"
                        className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setApplyModalRole(null)}
                        className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all"
                      >
                        Submit Dossier
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto text-secondary">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-secondary">Application Sent!</h4>
                  <p className="font-body text-xs text-on-surface-variant">
                    The team captain will review your credentials and VOD package.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Open Role Modal (for Captain/Org) ── */}
        {openRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl glass-modal p-6 sm:p-7 space-y-4 shadow-2xl border border-card-border">
              <h3 className="font-display font-bold text-xl text-on-surface">
                Open New Recruitment Role
              </h3>

              <form onSubmit={handleCreateOpenRole} className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Main Sniper (AWP / Operator)"
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    placeholder="e.g. Seeking high-precision sniper for BMPS/VCT qualifiers."
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Requirements
                  </label>
                  <input
                    type="text"
                    value={roleReqs}
                    onChange={(e) => setRoleReqs(e.target.value)}
                    placeholder="e.g. Conqueror / Immortal 3+, 6pm-11pm scrims"
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenRoleModalOpen(false)}
                    className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all"
                  >
                    Publish Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Add Member Modal ── */}
        {addMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl glass-modal p-6 sm:p-7 space-y-4 shadow-2xl border border-card-border">
              <h3 className="font-display font-bold text-xl text-on-surface">
                Add Player to Roster
              </h3>

              <form onSubmit={handleAddMemberSubmit} className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Player Name"
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    In-Game IGN *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberIgn}
                    onChange={(e) => setNewMemberIgn(e.target.value)}
                    placeholder="e.g. SoulNeyo or Player#IND"
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="e.g. Assaulter / Controller"
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
                    className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-display font-bold text-xs uppercase tracking-wider shadow-glow-accent active:scale-95 transition-all"
                  >
                    Add to Roster
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     VIEW 2: SQUAD DIRECTORY (Browse All Teams)
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-card-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-secondary font-bold">
              Esports Roster Network
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-on-surface">
            Teams &amp; <span className="gradient-text">Rosters</span>
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-xl">
            Explore verified franchise rosters, independent 5-stacks, and open recruitment roles across all 6 competitive titles.
          </p>
        </div>

        <button
          onClick={onOpenTeamCreator}
          className="px-6 py-3 rounded-2xl bg-primary text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-[0_0_40px_var(--glow-primary)] active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-white dark:text-black" />
          Form a Squad
        </button>
      </div>

      {/* Controls: Game Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-surface-container border border-card-border overflow-x-auto max-w-full">
          {['all', 'valorant', 'bgmi', 'freefire', 'coc', 'cr', 'cod'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGameFilter(g)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all whitespace-nowrap ${
                selectedGameFilter === g
                  ? 'bg-primary-container text-on-primary shadow-glow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search teams or orgs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface placeholder:text-on-surface-variant focus:outline-none text-sm font-body"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-surface-container text-on-surface-variant">
                    {team.game.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {team.status === 'registered' || (team.roster && team.roster.length >= 4) ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        REGISTERED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        DRAFT ({team.roster?.length || 0}/4)
                      </span>
                    )}
                    <span className="font-mono text-xs text-secondary font-bold">
                      {team.roster?.length || 0}/{team.slotsMax} Active
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-1.5">
                    {team.name}
                    {team.verified && <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />}
                  </h3>
                  <p className="font-mono text-xs text-on-surface-variant">
                    {team.orgName} · {team.division}
                  </p>
                </div>

                {/* Roster member count / preview */}
                <div className="p-3 rounded-xl bg-surface-container text-center grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-display font-bold text-base text-on-surface">
                      {team.roster.length}/{team.slotsMax}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant block uppercase">
                      Starting Roster
                    </span>
                  </div>
                  <div>
                    <span className="font-display font-bold text-base text-secondary">
                      {team.winrate}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant block uppercase">
                      Match Winrate
                    </span>
                  </div>
                </div>

                {/* Open roles badge */}
                {team.openRoles?.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {team.openRoles.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-mono font-semibold"
                      >
                        🎯 {r.roleName} Open
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    Full Roster (No Openings)
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-card-border">
                <button
                  onClick={() => { setTeamLoading(true); setSelectedTeam(team); }}
                  className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Roster &amp; Tryouts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3">
          <Users className="w-12 h-12 text-on-surface-variant mx-auto" />
          <p className="font-display font-bold text-lg text-on-surface">No teams found matching criteria</p>
          <button
            onClick={onOpenTeamCreator}
            className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow"
          >
            Form a Team in this Category
          </button>
        </div>
      )}

    </div>
  );
}
