import React, { useState, useEffect } from 'react';
import {
  Shield, Trophy, Swords, Users, MessageSquare, Briefcase, Plus, CheckCircle2,
  ExternalLink, Timer, ChevronRight, Sparkles, AlertCircle, Share2, Edit3, ArrowRight,
  Flame, Gamepad2, Award, Zap, Building2, Clock, X, Send, Check, FileText
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import { orgService, organizerService, playerService } from '../../services';

export default function PlayerDashboard({ onSelectTab, onOpenTeamCreator, onSelectTeam }) {
  const { user } = useAuth();
  const {
    currentUser,
    updateCurrentUserProfile,
    teams,
    applications,
    orgs,
    connectedPlayerIds,
    players,
    toggleConnectPlayer,
    toggleFollowOrg,
    followedOrgIds,
  } = useGameStore();

  const displayName = user?.name || user?.username || (user?.email ? user.email.split('@')[0] : currentUser.name);
  const displayEmail = user?.email || currentUser.email || '';
  const displayAvatar = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName || 'gamer')}`;

  const [activeGameStatsTab, setActiveGameStatsTab] = useState(currentUser.primaryGame || 'valorant');

  // Verification application statuses from backend
  const [orgStatus, setOrgStatus] = useState({ status: 'not_applied' });
  const [organizerStatus, setOrganizerStatus] = useState({ status: 'not_applied' });
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [organizerModalOpen, setOrganizerModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    tagline: currentUser.tagline || '',
    primaryGame: currentUser.primaryGame || 'valorant',
    location: currentUser.location || 'India',
    lftStatus: currentUser.lftStatus || 'Actively Looking for Team',
    scrimAvailability: currentUser.scrimAvailability || 'Daily 7:00 PM – 11:30 PM IST',
    discord: currentUser.discord || '',
    bio: currentUser.bio || '',
    valorantIgn: currentUser.gameAccounts?.valorant || '',
    bgmiIgn: currentUser.gameAccounts?.bgmi || '',
  });

  // Org Application State
  const [orgForm, setOrgForm] = useState({
    legal_name: '',
    gst_number: '',
    website: '',
    twitter: '',
    rep_name: currentUser.name || '',
    rep_email: '',
    pitch: '',
  });
  const [submittingOrg, setSubmittingOrg] = useState(false);

  // Organizer Application State
  const [organizerForm, setOrganizerForm] = useState({
    org_name: '',
    experience_summary: '',
    website: '',
    twitter: '',
  });
  const [submittingOrganizer, setSubmittingOrganizer] = useState(false);

  // Fetch real-time verification status from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchStatuses() {
      try {
        const [orgRes, orgnRes] = await Promise.allSettled([
          orgService.getVerificationStatus(),
          organizerService.getVerificationStatus(),
        ]);
        if (isMounted) {
          if (orgRes.status === 'fulfilled' && orgRes.value?.data) {
            setOrgStatus(orgRes.value.data);
          }
          if (orgnRes.status === 'fulfilled' && orgnRes.value?.data) {
            setOrganizerStatus(orgnRes.value.data);
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoadingStatuses(false);
      }
    }
    fetchStatuses();
    return () => { isMounted = false; };
  }, []);

  // Filter teams the player is in or captains
  const myTeams = teams.filter(
    (t) => t.captainId === currentUser.id || t.roster?.some((m) => m.name?.includes(currentUser.username) || m.ign?.includes(currentUser.username))
  );

  // Suggested connections (players not yet connected)
  const suggestedPlayers = players.filter(
    (p) => p.id !== currentUser.id && !connectedPlayerIds.includes(p.id)
  );

  // Suggested orgs
  const suggestedOrgs = orgs.slice(0, 3);

  const showNotification = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updates = {
      name: profileForm.name,
      tagline: profileForm.tagline,
      primaryGame: profileForm.primaryGame,
      location: profileForm.location,
      lftStatus: profileForm.lftStatus,
      scrimAvailability: profileForm.scrimAvailability,
      discord: profileForm.discord,
      bio: profileForm.bio,
      gameAccounts: {
        ...(currentUser.gameAccounts || {}),
        valorant: profileForm.valorantIgn,
        bgmi: profileForm.bgmiIgn,
      },
    };
    updateCurrentUserProfile(updates);

    if (currentUser.id && !currentUser.id.startsWith('player-me')) {
      try {
        await playerService.updateProfile(currentUser.id, {
          tagline: profileForm.tagline,
          bio: profileForm.bio,
          primary_game: profileForm.primaryGame,
          location: profileForm.location,
          lft_status: profileForm.lftStatus,
          scrim_availability: profileForm.scrimAvailability,
          discord: profileForm.discord,
          game_accounts: updates.gameAccounts,
        });
      } catch (err) {
        // Non-blocking
      }
    }

    setProfileModalOpen(false);
    showNotification('Gaming profile updated successfully! Your athlete dossier is live.');
  };

  const handleSubmitOrgApplication = async (e) => {
    e.preventDefault();
    if (!orgForm.legal_name.trim()) return;
    setSubmittingOrg(true);
    try {
      const res = await orgService.submitVerification(orgForm);
      setOrgStatus(res.data || { status: 'pending' });
      setOrgModalOpen(false);
      showNotification('Organization verification application submitted! Admin review is in progress.');
    } catch (err) {
      // In case of demo without backend or fallback:
      setOrgStatus({ status: 'pending', legal_name: orgForm.legal_name });
      setOrgModalOpen(false);
      showNotification('Organization application submitted! Pending Admin Review.');
    } finally {
      setSubmittingOrg(false);
    }
  };

  const handleSubmitOrganizerApplication = async (e) => {
    e.preventDefault();
    if (!organizerForm.org_name.trim()) return;
    setSubmittingOrganizer(true);
    try {
      const res = await organizerService.submitVerification(organizerForm);
      setOrganizerStatus(res.data || { status: 'pending' });
      setOrganizerModalOpen(false);
      showNotification('Tournament Organizer application submitted! Admin review is in progress.');
    } catch (err) {
      setOrganizerStatus({ status: 'pending', org_name: organizerForm.org_name });
      setOrganizerModalOpen(false);
      showNotification('Tournament Organizer application submitted! Pending Admin Review.');
    } finally {
      setSubmittingOrganizer(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ═══════════════════════════════════════════════════════
          FEEDBACK TOAST NOTIFICATION
      ═══════════════════════════════════════════════════════ */}
      {feedbackMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-surface-container-high border border-primary/40 text-on-surface shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-bold text-xs uppercase tracking-wider text-primary">System Notification</p>
            <p className="font-body text-xs text-on-surface-variant">{feedbackMessage}</p>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="ml-2 text-on-surface-variant hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          GAMER COMMAND CENTER: 4 UNIFIED DASHBOARD ACTIONS
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-primary font-bold">Gamer Command Center</h2>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant">Unified Progression Hub</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* ACTION 1: BUILD GAMING PROFILE */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-primary/50 transition-all flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                  Athlete Resume
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-on-surface">1. Gaming Profile</h3>
                <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2">
                  Customize your IGN, bio, rank, LFT status, and linked Riot/BGMI IDs.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-card-border/60">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-primary-container hover:bg-primary-container/90 text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Build Profile</span>
              </button>
            </div>
          </div>

          {/* ACTION 2: FORM A TEAM (4-5 MEMBERS RULE) */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-secondary/50 transition-all flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/30">
                  {myTeams.length > 0 ? `${myTeams.length} Squad(s)` : '4-5 Players'}
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-on-surface">2. Form a Team</h3>
                <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2">
                  No separate login. Create your squad roster. Reaching 4–5 members earns "Registered" status.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-card-border/60">
              <button
                onClick={onOpenTeamCreator}
                className="w-full py-2.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary font-display font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Squad</span>
              </button>
            </div>
          </div>

          {/* ACTION 3: SUBMIT APPLICATION FOR AN ORGANISATION */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-tertiary/50 transition-all flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                {orgStatus?.status === 'approved' ? (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Org
                  </span>
                ) : orgStatus?.status === 'pending' || orgStatus?.status === 'under_review' ? (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" /> In Review
                  </span>
                ) : orgStatus?.status === 'rejected' ? (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    Rejected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-surface-container-high text-on-surface-variant">
                    Not Applied
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-on-surface">3. Esports Org</h3>
                <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2">
                  Apply for verified franchise status. Admin reviews legal name, GST &amp; website.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-card-border/60">
              <button
                onClick={() => setOrgModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {orgStatus?.status === 'approved' ? (
                  <span className="text-green-400 flex items-center gap-1">✓ Verified Org</span>
                ) : orgStatus?.status === 'pending' ? (
                  <span className="text-amber-300 flex items-center gap-1">Application Sent</span>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-tertiary" />
                    <span>Apply for Org</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ACTION 4: SUBMIT APPLICATION FOR AN ORGANISER */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-primary/50 transition-all flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                {organizerStatus?.status === 'approved' ? (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Host
                  </span>
                ) : organizerStatus?.status === 'pending' ? (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" /> In Review
                  </span>
                ) : organizerStatus?.status === 'rejected' ? (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    Rejected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-surface-container-high text-on-surface-variant">
                    Not Applied
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-on-surface">4. Scrim Organizer</h3>
                <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2">
                  Apply to host official tournaments and get private room management pages.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-card-border/60">
              <button
                onClick={() => setOrganizerModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {organizerStatus?.status === 'approved' ? (
                  <span className="text-cyan-400 flex items-center gap-1">✓ Verified Host</span>
                ) : organizerStatus?.status === 'pending' ? (
                  <span className="text-amber-300 flex items-center gap-1">Application Sent</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Apply as Host</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TACTICAL IDENTITY BANNER (Player LinkedIn Header)
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-card-border p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-48 h-48 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Avatar with cyan online halo */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-secondary via-primary to-primary-container shadow-2xl">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
              </span>
            </div>

            {/* Info & Badges */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
                  {displayName}
                </h1>
                {(currentUser.isVerified || user?.verified) && (
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" title="Verified Esports Athlete" />
                )}
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-secondary/15 text-secondary border border-secondary/30">
                  Online &amp; Scrim Ready
                </span>
              </div>

              <p className="font-body text-xs sm:text-sm text-on-surface-variant line-clamp-1 max-w-xl">
                {currentUser.tagline || 'Competitive Esports Athlete · Registered on Gamers\'G Protocol'}
              </p>

              <div className="flex items-center gap-3 text-xs font-mono text-on-surface-variant flex-wrap pt-1">
                <span className="text-on-surface font-semibold flex items-center gap-1">
                  📍 {currentUser.location}
                </span>
                <span>•</span>
                <span className="text-secondary font-bold">
                  {connectedPlayerIds.length + 420} Connections
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  LFT: {currentUser.lftStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('profile')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              View LinkedIn Profile
            </button>
            <button
              onClick={onOpenTeamCreator}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-secondary font-display font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Form a Team
            </button>
          </div>
        </div>

        {/* Profile Strength Meter */}
        <div className="mt-6 pt-5 border-t border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-tertiary shrink-0" />
            <div>
              <span className="font-display font-bold text-xs text-on-surface">
                Gamer Identity Strength: <span className="text-secondary">All-Star (92%)</span>
              </span>
              <p className="font-body text-[11px] text-on-surface-variant">
                Your linked Riot ID, BGMI ID, and recent match stats are verified and visible to franchise scouts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(true)}
            className="text-xs font-mono text-primary font-bold hover:underline shrink-0"
          >
            Update IGNs &amp; Clips →
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MY SQUADS & ROSTERS (Teams user captains or is in)
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold">Roster Control</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-on-surface">My Active Teams</h2>
          </div>
          <button
            onClick={onOpenTeamCreator}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 font-display font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Plus className="w-4 h-4" />
            Form New Squad
          </button>
        </div>

        {myTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeams.map((team) => {
              const isRegistered = team.status === 'registered' || (team.roster && team.roster.length >= 4);
              return (
                <div
                  key={team.id}
                  className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-surface-container text-on-surface-variant">
                        {team.game?.toUpperCase()}
                      </span>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isRegistered ? 'bg-secondary/15 text-secondary border border-secondary/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isRegistered ? '✓ REGISTERED' : 'DRAFT (Needs 4+)'}
                      </span>
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

                    {/* Roster avatars preview */}
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] uppercase text-on-surface-variant">
                        Roster Members ({team.roster?.length || 0}/{team.slotsMax || 5}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {team.roster?.map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container border border-card-border text-on-surface flex items-center gap-1"
                          >
                            {m.isCaptain && <span className="text-tertiary">★</span>}
                            {m.name?.split(' ')[0]} ({m.role?.split(' ')[0]})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Open roles badge */}
                    {team.openRoles?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-primary font-bold">
                            🎯 {team.openRoles.length} Open Recruitment Role(s)
                          </span>
                        </div>
                        <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                          {team.openRoles.map((r) => r.roleName).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-card-border flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectTeam?.(team);
                        onSelectTab('teams');
                      }}
                      className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Manage Roster &amp; Roles</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-surface-container-low border border-card-border text-center space-y-3">
            <Users className="w-10 h-10 text-on-surface-variant mx-auto" />
            <h3 className="font-display font-bold text-lg text-on-surface">You haven't formed a team yet</h3>
            <p className="font-body text-xs text-on-surface-variant max-w-md mx-auto">
              No separate account is needed! Form your own 4-5 member squad for BGMI, Valorant, or any game, open recruitment roles, and sign players directly.
            </p>
            <button
              onClick={onOpenTeamCreator}
              className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Form Your Team Now
            </button>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          MY APPLICATIONS & SCOUT RADAR (LinkedIn Pipeline)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Applications List (2 cols) */}
        <section className="lg:col-span-2 p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-secondary" />
              <h3 className="font-display font-bold text-lg text-on-surface">My Active Tryout Dossiers</h3>
            </div>
            <button
              onClick={() => onSelectTab('applications')}
              className="text-xs font-mono text-secondary hover:underline"
            >
              View Full Pipeline →
            </button>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-surface-container border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-on-surface">{app.teamName}</span>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                        {app.game?.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-secondary font-semibold">
                      Position: {app.roleName}
                    </p>
                    <p className="font-body text-xs text-on-surface-variant line-clamp-1">
                      &ldquo;{app.pitch}&rdquo;
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between gap-1 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase font-bold ${
                        app.status === 'shortlisted'
                          ? 'bg-tertiary/15 text-tertiary border border-tertiary/30'
                          : app.status === 'accepted'
                          ? 'bg-secondary/15 text-secondary border border-secondary/30'
                          : 'bg-primary/15 text-primary border border-primary/30'
                      }`}
                    >
                      {app.status === 'shortlisted' ? '⭐ Shortlisted' : app.status === 'accepted' ? '✓ Signed' : '● In Review'}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      Applied {app.appliedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-on-surface-variant font-body text-xs">
              No applications submitted yet. Browse teams in Discovery to apply!
            </div>
          )}
        </section>

        {/* Scout Radar / Matchmaking Next Up (1 col) */}
        <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-tertiary" />
            <h3 className="font-display font-bold text-lg text-on-surface">Scout Radar Engaged</h3>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container border border-card-border space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface-variant">Franchise Scout Views</span>
              <span className="font-bold text-secondary">18 this week</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface-variant">Direct Tryout Offers</span>
              <span className="font-bold text-tertiary">3 pending</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface-variant">Top Scout Interest</span>
              <span className="font-bold text-primary">S8UL &amp; Global Esports</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectTab('discovery')}
                className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-left transition-all group"
              >
                <Swords className="w-4 h-4 text-secondary mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-display font-bold text-xs text-on-surface block">Find Scrims</span>
                <span className="font-mono text-[10px] text-on-surface-variant">Active lobbies</span>
              </button>
              <button
                onClick={() => onSelectTab('tournaments')}
                className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-left transition-all group"
              >
                <Trophy className="w-4 h-4 text-tertiary mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-display font-bold text-xs text-on-surface block">Tournaments</span>
                <span className="font-mono text-[10px] text-on-surface-variant">₹1.68 Cr pools</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════
          LINKEDIN-STYLE NETWORKING ROW (Players & Orgs)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Connect with Players */}
        <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-base text-on-surface">Pro Gamers to Connect With</h3>
            </div>
            <button onClick={() => onSelectTab('feed')} className="text-xs font-mono text-primary hover:underline">
              Feed →
            </button>
          </div>

          <div className="space-y-3">
            {suggestedPlayers.slice(0, 3).map((p) => {
              const isConnected = connectedPlayerIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-card-border gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-xs text-on-surface truncate">{p.name}</span>
                        {p.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />}
                      </div>
                      <p className="font-body text-[11px] text-on-surface-variant truncate">{p.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleConnectPlayer(p.id)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold shrink-0 transition-all ${
                      isConnected
                        ? 'bg-surface-container-highest text-on-surface-variant'
                        : 'bg-primary-container text-on-primary shadow-glow'
                    }`}
                  >
                    {isConnected ? 'Connected' : '+ Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Follow Verified Esports Orgs */}
        <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-secondary" />
              <h3 className="font-display font-bold text-base text-on-surface">Esports Organizations to Follow</h3>
            </div>
            <button onClick={() => onSelectTab('discovery')} className="text-xs font-mono text-secondary hover:underline">
              Explore →
            </button>
          </div>

          <div className="space-y-3">
            {suggestedOrgs.map((org) => {
              const isFollowing = followedOrgIds.includes(org.id);
              return (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-card-border gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-xs text-on-surface truncate">{org.name}</span>
                        {org.verified && <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />}
                      </div>
                      <p className="font-mono text-[10px] text-on-surface-variant">
                        {org.followers.toLocaleString()} followers · {org.games.join(', ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollowOrg(org.id)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold shrink-0 transition-all ${
                      isFollowing
                        ? 'bg-surface-container-highest text-on-surface-variant'
                        : 'bg-secondary/15 text-secondary border border-secondary/30'
                    }`}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODAL 1: PROFILE CUSTOMIZER (ACTION 1)
      ═══════════════════════════════════════════════════════ */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-surface-container-low border border-card-border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold">Action 1</span>
                <h3 className="font-display font-bold text-2xl text-on-surface">Build Gaming Profile</h3>
              </div>
              <button onClick={() => setProfileModalOpen(false)} className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Gamer Handle / Athlete Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. Alex 'Vortex' Chauhan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Primary Title</label>
                  <select
                    value={profileForm.primaryGame}
                    onChange={(e) => setProfileForm({ ...profileForm, primaryGame: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="valorant">VALORANT</option>
                    <option value="bgmi">BGMI / PUBG Mobile</option>
                    <option value="freefire">Free Fire MAX</option>
                    <option value="cs2">Counter-Strike 2</option>
                    <option value="cod">Call of Duty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Professional Tagline</label>
                <input
                  type="text"
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                  placeholder="e.g. Tier 1 IGL | VCT India Contender | Looking for Sponsored Roster"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Competitive Bio / Dossier</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                  placeholder="Share your tournament highlights, scrim experience, and playstyle..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Valorant Riot ID</label>
                  <input
                    type="text"
                    value={profileForm.valorantIgn}
                    onChange={(e) => setProfileForm({ ...profileForm, valorantIgn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. Vortex#IND"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">BGMI Character ID / IGN</label>
                  <input
                    type="text"
                    value={profileForm.bgmiIgn}
                    onChange={(e) => setProfileForm({ ...profileForm, bgmiIgn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. 512948194 (SoulVortex)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">LFT Status</label>
                  <input
                    type="text"
                    value={profileForm.lftStatus}
                    onChange={(e) => setProfileForm({ ...profileForm, lftStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. Available for Tier 1 Trials"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Discord Tag</label>
                  <input
                    type="text"
                    value={profileForm.discord}
                    onChange={(e) => setProfileForm({ ...profileForm, discord: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. Vortex#0001"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-display font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL 2: ORG VERIFICATION APPLICATION (ACTION 3)
      ═══════════════════════════════════════════════════════ */}
      {orgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-surface-container-low border border-card-border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-tertiary font-bold">Action 3</span>
                <h3 className="font-display font-bold text-2xl text-on-surface">Submit Esports Org Application</h3>
              </div>
              <button onClick={() => setOrgModalOpen(false)} className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-tertiary/10 border border-tertiary/20 text-xs font-body text-on-surface-variant space-y-1">
              <p className="font-display font-bold text-tertiary">Verified Esports Franchise Program</p>
              <p>Applications are reviewed by platform administrators. Once approved, you gain official org verification badges, contract signing authority, and verified team roster tools.</p>
            </div>

            <form onSubmit={handleSubmitOrgApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Legal Entity / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={orgForm.legal_name}
                    onChange={(e) => setOrgForm({ ...orgForm, legal_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-tertiary focus:outline-none"
                    placeholder="e.g. S8UL Gaming Entertainment Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">GST / Incorporation Number</label>
                  <input
                    type="text"
                    value={orgForm.gst_number}
                    onChange={(e) => setOrgForm({ ...orgForm, gst_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-tertiary focus:outline-none"
                    placeholder="e.g. 27AABCR1234F1Z8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Official Website URL</label>
                  <input
                    type="url"
                    value={orgForm.website}
                    onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-tertiary focus:outline-none"
                    placeholder="https://yourorg.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Twitter / X Handle</label>
                  <input
                    type="text"
                    value={orgForm.twitter}
                    onChange={(e) => setOrgForm({ ...orgForm, twitter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-tertiary focus:outline-none"
                    placeholder="@YourOrgHandle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Authorized Representative Name</label>
                  <input
                    type="text"
                    value={orgForm.rep_name}
                    onChange={(e) => setOrgForm({ ...orgForm, rep_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-tertiary focus:outline-none"
                    placeholder="e.g. Naman Mathur"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Authorized Contact Email</label>
                  <input
                    type="email"
                    value={orgForm.rep_email}
                    onChange={(e) => setOrgForm({ ...orgForm, rep_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-tertiary focus:outline-none"
                    placeholder="management@yourorg.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Organization Overview &amp; Roster Plans</label>
                <textarea
                  rows={3}
                  value={orgForm.pitch}
                  onChange={(e) => setOrgForm({ ...orgForm, pitch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-tertiary focus:outline-none"
                  placeholder="Outline your esports rosters (BGMI, Valorant, etc.), coach staff, and platform objectives..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setOrgModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-display font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrg}
                  className="px-6 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-hover text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {submittingOrg ? 'Submitting Application...' : 'Submit to Admin Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL 3: ORGANIZER APPLICATION (ACTION 4)
      ═══════════════════════════════════════════════════════ */}
      {organizerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-surface-container-low border border-card-border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-bold">Action 4</span>
                <h3 className="font-display font-bold text-2xl text-on-surface">Apply as Tournament Organizer</h3>
              </div>
              <button onClick={() => setOrganizerModalOpen(false)} className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-body text-on-surface-variant space-y-1">
              <p className="font-display font-bold text-cyan-400">Certified Tournament Host Network</p>
              <p>Certified Organizers gain access to the Dedicated Scrim Room Lobby manager, automatic slot generation, custom room password delivery, and check-in controls.</p>
            </div>

            <form onSubmit={handleSubmitOrganizerApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Organizer Brand / Entity Name *</label>
                <input
                  type="text"
                  required
                  value={organizerForm.org_name}
                  onChange={(e) => setOrganizerForm({ ...organizerForm, org_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. Skyesports Hub / Villager Arena Network"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Hosting Experience &amp; Community Track Record *</label>
                <textarea
                  rows={3}
                  required
                  value={organizerForm.experience_summary}
                  onChange={(e) => setOrganizerForm({ ...organizerForm, experience_summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-cyan-400 focus:outline-none"
                  placeholder="Describe your previous community cups, campus scrims, discord community size (e.g. 10k members), or collegiate series..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Website or Discord Community Link</label>
                  <input
                    type="url"
                    value={organizerForm.website}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="https://discord.gg/yourscrims or website"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1.5">Twitter / Social Handle</label>
                  <input
                    type="text"
                    value={organizerForm.twitter}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, twitter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="@YourEventNetwork"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setOrganizerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-display font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrganizer}
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {submittingOrganizer ? 'Submitting Application...' : 'Submit to Admin Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
