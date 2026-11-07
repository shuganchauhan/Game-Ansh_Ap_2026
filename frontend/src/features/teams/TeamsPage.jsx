import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, Crown, Edit3, ExternalLink, FileText,
  Plus, Search, Shield, Sparkles, Swords, Target, Trash2, Trophy, Users, X, Zap,
  Clock, UserPlus, UserCheck, AlertCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import { teamService } from '../../services';

const COMMON_ROLES = [
  'Main Assaulter',
  'Entry Fragger',
  'Support / DMR',
  'Sniper / Marksman',
  'Anchor / Sentinel',
  'Shotcaller / Co-IGL',
  'Flex Sub',
];

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
    players = [],
    sendTeamInvitation,
    cancelTeamInvitation,
    fetchTeamInvitations,
    teamInvitationsMap = {},
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

    fetchTeamInvitations(selectedTeam.id).catch(() => {});

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

  // Invite athlete modal state (Unstop-style invitation flow)
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [athleteSearch, setAthleteSearch] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [inviteRole, setInviteRole] = useState('Main Assaulter');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

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
    ? (activeTeamObj.captainId && activeTeamObj.captainId === currentUser?.id) || activeRole === 'org'
    : false;

  const teamApplications = activeTeamObj
    ? applications.filter((a) => a.teamId === activeTeamObj.id)
    : [];

  const squadInvitations = activeTeamObj ? (teamInvitationsMap[activeTeamObj.id] || []) : [];

  const availableAthletesForSquad = useMemo(() => {
    if (!activeTeamObj) return [];
    const q = athleteSearch.trim().toLowerCase();
    const currentMemberIds = new Set((activeTeamObj.roster || []).map((m) => m.player_id || m.id));
    const invitedPlayerIds = new Set(squadInvitations.map((i) => i.player_id));

    return players.filter((p) => {
      if (currentMemberIds.has(p.id)) return false;
      if (invitedPlayerIds.has(p.id)) return false;
      if (p.id === currentUser?.id || (currentUser?.username && p.username === currentUser.username)) {
        return false;
      }
      if (q) {
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesUser = (p.username || '').toLowerCase().includes(q);
        const matchesIgn = (p.game_ign || p.gameAccounts?.[activeTeamObj.game] || '').toLowerCase().includes(q);
        return matchesName || matchesUser || matchesIgn;
      }
      return true;
    });
  }, [players, activeTeamObj, athleteSearch, squadInvitations, currentUser]);

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

  const handleSendInviteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAthlete || !activeTeamObj) return;

    setInviteSending(true);
    setTeamActionError('');
    try {
      await sendTeamInvitation(activeTeamObj.id, {
        playerId: selectedAthlete.id,
        role: inviteRole,
        message: inviteMessage.trim() || `Official squad invitation to join ${activeTeamObj.name}`,
      });
      setInviteSuccessMsg(`Invitation dispatched to ${selectedAthlete.name || selectedAthlete.username}!`);
      setTimeout(() => {
        setInviteModalOpen(false);
        setSelectedAthlete(null);
        setInviteMessage('');
        setInviteSuccessMsg('');
      }, 1400);
    } catch (err) {
      setTeamActionError(err?.message || 'Failed to dispatch squad invitation.');
    } finally {
      setInviteSending(false);
    }
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
                  onClick={() => setInviteModalOpen(true)}
                  disabled={activeTeamObj.roster.length >= activeTeamObj.slotsMax}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-on-surface font-display font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-4 h-4 text-primary" />
                  Invite Registered Athlete
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
        <section className="space-y-4">
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
                      {member.isCaptain && <Crown className="w-3.5 h-3.5 text-tertiary shrink-0" title="Captain" />}
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
                      Open for tryout or athlete invite
                    </span>
                  </div>
                </div>

                {isCaptainOrManager && (
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="text-xs font-mono text-primary font-bold hover:underline"
                  >
                    + Invite Athlete
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pending Invitations Sent to Registered Athletes */}
          {isCaptainOrManager && squadInvitations.length > 0 && (
            <div className="pt-4 border-t border-card-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Squad Join Requests ({squadInvitations.length})
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant">
                  Awaiting Athlete Acceptance
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {squadInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 font-display font-bold text-xs flex items-center justify-center shrink-0">
                        {inv.username?.slice(0, 2).toUpperCase() || 'PL'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display font-bold text-xs text-on-surface block truncate">
                          {inv.username || 'Invited Athlete'}
                        </span>
                        <span className="font-mono text-[10px] text-amber-300/90 block">
                          Role: {inv.role || 'Member'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelTeamInvitation(activeTeamObj.id, inv.id)}
                      className="text-[11px] font-mono text-on-surface-variant hover:text-error px-2 py-1 rounded-lg hover:bg-error/10 transition-colors"
                      title="Cancel invitation"
                    >
                      Cancel ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                      <FileText className="w-3.5 h-3.5 text-tertiary inline mr-1" /> Reqs: {role.requirements}
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
                      className="w-full py-2.5 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
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

        {/* ── Invite Registered Athlete Modal (Unstop-Style Request Flow) ── */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl glass-modal p-6 sm:p-7 space-y-4 shadow-2xl border border-card-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono uppercase tracking-wider font-bold mb-1">
                    <UserPlus className="w-3 h-3" /> Join Request Dispatch
                  </div>
                  <h3 className="font-display font-black text-xl text-on-surface">
                    Invite Registered Athlete to Squad
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInviteModalOpen(false);
                    setSelectedAthlete(null);
                    setInviteSuccessMsg('');
                  }}
                  className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="font-body text-xs text-on-surface-variant">
                Search verified platform athletes. A join request will be dispatched to their dashboard. Once accepted, they join your squad roster.
              </p>

              {inviteSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-body text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{inviteSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSendInviteSubmit} className="space-y-4">
                  {/* Athlete Search Bar */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase text-on-surface-variant font-bold">
                      1. Search Athlete *
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={athleteSearch}
                        onChange={(e) => setAthleteSearch(e.target.value)}
                        placeholder="Search by username, IGN, or name..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary font-body"
                      />
                    </div>
                  </div>

                  {/* Athlete Selection List */}
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-card-border/40">
                    {availableAthletesForSquad.length > 0 ? (
                      availableAthletesForSquad.slice(0, 5).map((ath) => {
                        const ign = ath.gameAccounts?.[activeTeamObj.game] || ath.game_ign || ath.username;
                        const isChosen = selectedAthlete?.id === ath.id;
                        return (
                          <div
                            key={ath.id}
                            onClick={() => setSelectedAthlete(ath)}
                            className={`pt-2 pb-1.5 px-2 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                              isChosen
                                ? 'bg-primary/20 border border-primary/40'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary font-display font-bold text-xs flex items-center justify-center shrink-0">
                                {ath.username?.slice(0, 2).toUpperCase() || 'PL'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-display font-bold text-xs text-on-surface truncate">
                                    {ath.name || ath.username}
                                  </span>
                                  <span className="font-mono text-[10px] text-on-surface-variant">
                                    @{ath.username}
                                  </span>
                                  {ath.isVerified && <Shield className="w-3 h-3 text-primary shrink-0" />}
                                </div>
                                <span className="font-mono text-[10px] text-on-surface-variant block truncate">
                                  IGN: <strong className="text-secondary">{ign}</strong>
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              isChosen ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              {isChosen ? 'Selected' : 'Select'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-xs font-mono text-on-surface-variant">
                        No athletes found matching &ldquo;{athleteSearch}&rdquo;.
                      </div>
                    )}
                  </div>

                  {selectedAthlete && (
                    <div className="space-y-3 pt-2 border-t border-card-border">
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-on-surface-variant">
                          Selected Candidate:
                        </span>
                        <span className="font-display font-bold text-primary">
                          {selectedAthlete.name} (@{selectedAthlete.username})
                        </span>
                      </div>

                      <div>
                        <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1 font-bold">
                          2. Assigned Role *
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-xs font-mono focus:outline-none focus:border-primary"
                        >
                          {COMMON_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1 font-bold">
                          3. Custom Message (Optional)
                        </label>
                        <input
                          type="text"
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          placeholder="e.g. We need an assaulter for the upcoming championship qualifiers"
                          className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-xs font-body focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInviteModalOpen(false);
                        setSelectedAthlete(null);
                      }}
                      className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedAthlete || inviteSending}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-white" />
                      <span>{inviteSending ? 'Dispatching...' : 'Send Squad Invitation'}</span>
                    </button>
                  </div>
                </form>
              )}
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
          className="px-6 py-3 rounded-2xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-[0_0_40px_var(--glow-primary)] active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
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
                        <Target className="w-3.5 h-3.5 text-secondary inline mr-1" /> {r.roleName} Open
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
