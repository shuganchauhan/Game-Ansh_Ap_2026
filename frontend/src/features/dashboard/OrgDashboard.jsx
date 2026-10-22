import React, { useState } from 'react';
import {
  Shield, CheckCircle2, AlertTriangle, FileText, Plus, Users, Trophy, ExternalLink,
  ChevronRight, Send, Sparkles, Building, Globe, Twitter, Mail, Check, X, Clock, HelpCircle
} from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export default function OrgDashboard({ onSelectTab, onOpenTeamCreator, onSelectTeam }) {
  const {
    orgs,
    activeOrgId,
    teams,
    applications,
    updateApplicationStatus,
    submitOrgVerification,
    approveOrgVerification,
    createPost,
  } = useGameStore();

  const currentOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  // Org verification form state
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [formLegalName, setFormLegalName] = useState(currentOrg.legalName || currentOrg.name);
  const [formGst, setFormGst] = useState('27AABCU9603R1ZM');
  const [formWebsite, setFormWebsite] = useState(currentOrg.website || '');
  const [formTwitter, setFormTwitter] = useState(currentOrg.twitter || '');
  const [formRepName, setFormRepName] = useState('Animesh "Thug" Agarwal');
  const [formRepEmail, setFormRepEmail] = useState('operations@s8ulesports.com');
  const [formDocsSubmitted, setFormDocsSubmitted] = useState(false);

  // Broadcast announcement state
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementGame, setAnnouncementGame] = useState('bgmi');
  const [announcementCategory, setAnnouncementCategory] = useState('Org Announcement');
  const [announcementPosted, setAnnouncementPosted] = useState(false);

  // Filter org's teams across all games
  const orgTeams = teams.filter((t) => t.orgId === currentOrg.id);

  // Filter applications received by this org's teams
  const orgApplications = applications.filter((app) =>
    orgTeams.some((t) => t.id === app.teamId)
  );

  // Game filter for teams
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const filteredTeams = selectedGameFilter === 'all'
    ? orgTeams
    : orgTeams.filter((t) => t.game === selectedGameFilter);

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    submitOrgVerification(currentOrg.id, {
      legalName: formLegalName,
      gstNumber: formGst,
      website: formWebsite,
      twitter: formTwitter,
    });
    setFormDocsSubmitted(true);
    setTimeout(() => {
      setVerificationModalOpen(false);
      setFormDocsSubmitted(false);
    }, 1500);
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    createPost({
      content: announcementText,
      category: announcementCategory,
      game: announcementGame,
    });
    setAnnouncementText('');
    setAnnouncementPosted(true);
    setTimeout(() => setAnnouncementPosted(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ═══════════════════════════════════════════════════════
          ORGANIZATION IDENTITY BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-card-border p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-48 h-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Org Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 bg-surface-container-high border border-card-border shrink-0 shadow-lg">
              <img
                src={currentOrg.logo}
                alt={currentOrg.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Info */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
                  {currentOrg.name}
                </h1>
                {currentOrg.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-secondary/15 text-secondary border border-secondary/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Organization
                  </span>
                ) : currentOrg.verificationStatus === 'under_review' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-tertiary/15 text-tertiary border border-tertiary/30">
                    <Clock className="w-3.5 h-3.5" />
                    Verification In Review
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-error/15 text-error border border-error/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Unverified Org
                  </span>
                )}
              </div>

              <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-xl">
                {currentOrg.about}
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant flex-wrap pt-1">
                <span>📍 {currentOrg.location}</span>
                <span>•</span>
                <span className="text-secondary font-bold">
                  {currentOrg.followers.toLocaleString()} Followers
                </span>
                <span>•</span>
                <span className="text-on-surface font-semibold">
                  {orgTeams.length} Active Rosters
                </span>
                <span>•</span>
                <span className="text-tertiary font-bold">Est. {currentOrg.founded}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={onOpenTeamCreator}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team for Game
            </button>
            {currentOrg.verificationStatus !== 'verified' && (
              <button
                onClick={() => setVerificationModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary font-display font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Apply for Verification
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ORGANIZATION VERIFICATION STATUS MODULE
      ═══════════════════════════════════════════════════════ */}
      <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              <h2 className="font-display font-bold text-xl text-on-surface">
                Official Organization Verification Protocol
              </h2>
            </div>
            <p className="font-body text-xs text-on-surface-variant max-w-2xl">
              To protect players and ensure legit tryouts, all esports organizations must be verified by submitting business credentials (GST/Reg No., legal representation, official handles).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentOrg.verificationStatus === 'verified' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Verified Partner Status Active
              </div>
            ) : currentOrg.verificationStatus === 'under_review' ? (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-xl bg-tertiary/15 text-tertiary border border-tertiary/30 font-mono text-xs font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Under Review (12-24h)
                </div>
                <button
                  onClick={() => approveOrgVerification(currentOrg.id)}
                  className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-[11px] font-mono text-secondary font-bold"
                  title="Demo helper to instantly approve verification for testing"
                >
                  ⚡ Instant Approve (Demo)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setVerificationModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Submit Verification Application
              </button>
            )}
          </div>
        </div>

        {/* Verification Benefits Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-container border border-card-border flex items-start gap-2.5">
            <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <span className="font-display font-bold text-xs text-on-surface block">Verified Golden Badge</span>
              <span className="font-body text-[11px] text-on-surface-variant">Displayed on all teams and feed announcements.</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-card-border flex items-start gap-2.5">
            <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <span className="font-display font-bold text-xs text-on-surface block">Official Tryout Pipeline</span>
              <span className="font-body text-[11px] text-on-surface-variant">Post recruitment roles with signed digital contract dossiers.</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-card-border flex items-start gap-2.5">
            <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <span className="font-display font-bold text-xs text-on-surface block">Multi-Game Roster Management</span>
              <span className="font-body text-[11px] text-on-surface-variant">Run unlimited rosters across all 6 competitive titles.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MULTI-TEAM MANAGER (Teams across all 6 Games)
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold">Multi-Game Division</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-on-surface">Our Teams &amp; Rosters</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container border border-card-border overflow-x-auto">
              {['all', 'valorant', 'bgmi', 'freefire', 'coc', 'cr', 'cod'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGameFilter(g)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                    selectedGameFilter === g
                      ? 'bg-primary-container text-on-primary shadow-glow'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenTeamCreator}
              className="px-4 py-2 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Team
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <span className="font-mono text-xs text-secondary font-bold">
                      {team.roster.length}/{team.slotsMax} Starting Roster
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-1.5">
                      {team.name}
                      {currentOrg.verificationStatus === 'verified' && (
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                      )}
                    </h3>
                    <p className="font-mono text-xs text-on-surface-variant">
                      {team.division} · Winrate: {team.winrate}
                    </p>
                  </div>

                  {/* Roster members list */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase text-on-surface-variant">Current Starting Roster:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {team.roster.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container border border-card-border text-on-surface flex items-center gap-1"
                        >
                          {m.isCaptain && <span className="text-tertiary">★</span>}
                          {m.name} ({m.role.split(' ')[0]})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Open roles badge */}
                  {team.openRoles?.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-primary">
                        <span>🎯 {team.openRoles.length} Open Tryout Role(s)</span>
                      </div>
                      <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                        {team.openRoles.map((r) => r.roleName).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <div className="font-mono text-[11px] text-on-surface-variant">
                      Full Roster (No Open Tryouts)
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-card-border">
                  <button
                    onClick={() => {
                      onSelectTeam?.(team);
                      onSelectTab('teams');
                    }}
                    className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Roster &amp; Tryout Roles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-surface-container-low border border-card-border text-center space-y-3">
            <Users className="w-10 h-10 text-on-surface-variant mx-auto" />
            <h3 className="font-display font-bold text-lg text-on-surface">No teams in this game category</h3>
            <p className="font-body text-xs text-on-surface-variant max-w-md mx-auto">
              Your organization can field rosters across all 6 titles. Create a team and immediately configure open roles for scouting!
            </p>
            <button
              onClick={onOpenTeamCreator}
              className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team for {selectedGameFilter.toUpperCase()}
            </button>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          CANDIDATE TRYOUTS PIPELINE (Applications received)
      ═══════════════════════════════════════════════════════ */}
      <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-bold text-xl text-on-surface">
              Incoming Tryout Dossiers ({orgApplications.length})
            </h2>
          </div>
          <span className="font-mono text-xs text-on-surface-variant">
            Scouting Pipeline // Real-Time
          </span>
        </div>

        {orgApplications.length > 0 ? (
          <div className="space-y-3">
            {orgApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface-container border border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-base text-on-surface">
                      {app.applicantName}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-primary/15 text-primary">
                      {app.applicantRank}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      → Applied for: <b className="text-secondary">{app.roleName}</b> on {app.teamName}
                    </span>
                  </div>

                  <p className="font-body text-xs text-on-surface-variant max-w-2xl">
                    &ldquo;{app.pitch}&rdquo;
                  </p>

                  {app.vodLink && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-primary pt-0.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <a href={app.vodLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Review Match VOD &amp; Scrim Analytics
                      </a>
                    </div>
                  )}
                </div>

                {/* Decision Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {app.status === 'accepted' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 font-mono text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Signed to Roster
                    </span>
                  ) : app.status === 'rejected' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant font-mono text-xs font-bold">
                      Declined
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                        className={`px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                          app.status === 'shortlisted'
                            ? 'bg-tertiary/20 text-tertiary border-tertiary/40'
                            : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-card-border'
                        }`}
                      >
                        {app.status === 'shortlisted' ? '⭐ Shortlisted' : 'Shortlist'}
                      </button>

                      <button
                        onClick={() => updateApplicationStatus(app.id, 'accepted')}
                        className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-display font-bold text-xs uppercase tracking-wider shadow-glow-accent active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Sign to Roster
                      </button>

                      <button
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        className="p-2 rounded-xl bg-surface-container-high hover:bg-error/20 text-on-surface-variant hover:text-error transition-all"
                        title="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-on-surface-variant font-body text-xs">
            No active tryout applications received yet. Open recruitment roles on your teams to receive candidate dossiers!
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          OFFICIAL ORG BROADCASTER (LinkedIn Post to Feed)
      ═══════════════════════════════════════════════════════ */}
      <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-xl text-on-surface">
            Broadcast Official Announcement to Community Feed
          </h2>
        </div>

        <form onSubmit={handlePostAnnouncement} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                Announcement Category
              </label>
              <select
                value={announcementCategory}
                onChange={(e) => setAnnouncementCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface font-body text-xs focus:outline-none"
              >
                <option value="Org Announcement">Org Announcement</option>
                <option value="Recruitment">Recruitment / Tryouts Opening</option>
                <option value="Match Result">Match Result / Scrim VOD</option>
                <option value="Sponsorship">Sponsorship / Partner Update</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                Game Division Tag
              </label>
              <select
                value={announcementGame}
                onChange={(e) => setAnnouncementGame(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface font-body text-xs focus:outline-none"
              >
                <option value="bgmi">BGMI Division</option>
                <option value="valorant">Valorant Division</option>
                <option value="freefire">Free Fire Division</option>
                <option value="coc">Clash of Clans Division</option>
                <option value="cr">Clash Royale Division</option>
                <option value="cod">Call of Duty Division</option>
              </select>
            </div>
          </div>

          <textarea
            rows={3}
            required
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Share verified tournament wins, tryout schedules, or roster signings with the entire Gamers'G community..."
            className="w-full p-3.5 rounded-xl bg-surface-container border border-card-border text-on-surface placeholder:text-on-surface-variant focus:outline-none text-sm font-body"
          />

          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-on-surface-variant">
              {announcementPosted ? '✓ Broadcast published to Feed!' : 'Will appear with Verified Org Badge'}
            </span>
            <button
              type="submit"
              disabled={!announcementText.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary-container/90 text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Announcement
            </button>
          </div>
        </form>
      </section>

      {/* ═══════════════════════════════════════════════════════
          VERIFICATION APPLICATION MODAL
      ═══════════════════════════════════════════════════════ */}
      {verificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl glass-modal p-6 sm:p-8 space-y-6 shadow-2xl border border-card-border max-h-[90vh] overflow-y-auto">
            {!formDocsSubmitted ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-secondary/15 text-secondary border border-secondary/30">
                      Tier 1 Verification Gateway
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-on-surface">
                    Organization Verification Application
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant mt-1">
                    Provide legal and competitive verification to unlock the golden badge, roster contracts, and official tryout listings.
                  </p>
                </div>

                <form onSubmit={handleSubmitVerification} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                      Organization Legal Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formLegalName}
                      onChange={(e) => setFormLegalName(e.target.value)}
                      placeholder="e.g. S8UL Gaming Entertainment Pvt Ltd"
                      className="w-full p-3 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                        GST / CIN / Registration No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={formGst}
                        onChange={(e) => setFormGst(e.target.value)}
                        placeholder="e.g. 27AABCU9603R1ZM"
                        className="w-full p-3 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                        Official Website *
                      </label>
                      <input
                        type="url"
                        required
                        value={formWebsite}
                        onChange={(e) => setFormWebsite(e.target.value)}
                        placeholder="https://s8ulesports.com"
                        className="w-full p-3 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                        Official Twitter / X Handle *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTwitter}
                        onChange={(e) => setFormTwitter(e.target.value)}
                        placeholder="@S8ULesports"
                        className="w-full p-3 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                        Executive / CEO Contact *
                      </label>
                      <input
                        type="text"
                        required
                        value={formRepName}
                        onChange={(e) => setFormRepName(e.target.value)}
                        placeholder="Authorized Representative Name"
                        className="w-full p-3 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                      Proof of Roster Contracts / Registration Certificate (Simulation)
                    </label>
                    <div className="p-4 rounded-xl border border-dashed border-card-border bg-surface-container text-center space-y-1">
                      <FileText className="w-6 h-6 text-secondary mx-auto" />
                      <span className="font-display font-semibold text-xs text-on-surface block">
                        contracts_package_2026.pdf (Uploaded &amp; Encrypted)
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        Verified via Gamers'G Anti-Fraud Protocol
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setVerificationModalOpen(false)}
                      className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all"
                    >
                      Submit Verification Dossier
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="font-display font-bold text-2xl text-secondary">
                  Dossier Submitted Successfully!
                </h4>
                <p className="font-body text-sm text-on-surface-variant max-w-sm mx-auto">
                  Our Trust &amp; Safety team is reviewing your corporate credentials. Estimated turnaround: 12-24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
