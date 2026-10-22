import React, { useState, useEffect } from 'react';
import {
  Trophy, Shield, Swords, Plus, CheckCircle2, Clock, AlertTriangle,
  ExternalLink, Users, Lock, Sparkles, RefreshCw, ChevronRight, X
} from 'lucide-react';
import { organizerService, scrimService } from '../../services';
import { useGameStore } from '../../stores/gameStore';

const GAME_OPTIONS = [
  { id: 'valorant', name: 'VALORANT', defaultSlots: 16 },
  { id: 'bgmi', name: 'BGMI', defaultSlots: 20 },
  { id: 'freefire', name: 'Free Fire', defaultSlots: 12 },
  { id: 'coc', name: 'Clash of Clans', defaultSlots: 10 },
  { id: 'cr', name: 'Clash Royale', defaultSlots: 16 },
  { id: 'cod', name: 'Call of Duty', defaultSlots: 16 },
];

export default function OrganizerDashboard({ onSelectTab, onOpenScrimLobby }) {
  const { currentUser } = useGameStore();

  const [scrims, setScrims] = useState([]);
  const [verifStatus, setVerifStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Modals
  const [verifModalOpen, setVerifModalOpen] = useState(false);
  const [createScrimModalOpen, setCreateScrimModalOpen] = useState(false);

  // Verification form state
  const [orgName, setOrgName] = useState(currentUser?.name || '');
  const [expSummary, setExpSummary] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');

  // Create Scrim form state
  const [scrimName, setScrimName] = useState('');
  const [scrimGame, setScrimGame] = useState('valorant');
  const [scrimSlots, setScrimSlots] = useState(16);
  const [scrimTime, setScrimTime] = useState('');
  const [customRoomId, setCustomRoomId] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  const loadOrganizerData = async () => {
    setLoading(true);
    try {
      const [sRes, vRes] = await Promise.allSettled([
        scrimService.listScrims(),
        organizerService.getVerificationStatus(),
      ]);
      if (sRes.status === 'fulfilled' && sRes.value) {
        setScrims(sRes.value);
      }
      if (vRes.status === 'fulfilled' && vRes.value) {
        setVerifStatus(vRes.value);
      }
    } catch (err) {
      console.error('Failed to load organizer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await organizerService.submitVerification({
        org_name: orgName,
        experience_summary: expSummary,
        website,
        twitter,
      });
      setFeedback('Verification dossier submitted! Admin portal will review your application.');
      setVerifModalOpen(false);
      loadOrganizerData();
    } catch (err) {
      setFeedback(err.message || 'Failed to submit verification');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleCreateScrim = async (e) => {
    e.preventDefault();
    if (!scrimName.trim()) return;
    setActionLoading(true);
    try {
      const newLobby = await scrimService.createScrim({
        name: scrimName.trim(),
        game: scrimGame,
        slots_max: Number(scrimSlots),
        scheduled_at: scrimTime ? new Date(scrimTime) : new Date(Date.now() + 3600000 * 2),
        room_id: customRoomId.trim(),
        room_password: customPassword.trim(),
      });
      setFeedback('Scrim lobby created successfully!');
      setCreateScrimModalOpen(false);
      setScrimName('');
      loadOrganizerData();
      if (newLobby?.id && onOpenScrimLobby) {
        onOpenScrimLobby(newLobby.id);
      }
    } catch (err) {
      setFeedback(err.message || 'Failed to create scrim');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const isVerified = verifStatus?.status === 'approved' || currentUser?.verified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-surface-container-highest via-surface-container-high to-surface border border-secondary/20 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-mono text-xs uppercase tracking-wider font-bold">
                Tournament Organizer Operations
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFIED ORGANIZER
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  VERIFICATION PENDING ADMIN REVIEW
                </span>
              )}
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface">
              Host Scrims & Match Lobbies
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-sm sm:text-base">
              Create scheduled competitive scrims across all 6 esports titles.
              Each scrim automatically provisions a dedicated match room lobby with live slot rosters and confidential room credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isVerified && (
              <button
                onClick={() => setVerifModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold shadow-lg shadow-amber-500/20 transition"
              >
                Submit Verification Dossier
              </button>
            )}
            <button
              onClick={() => setCreateScrimModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-black text-sm font-bold shadow-lg shadow-primary/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Scrim Lobby
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-primary/20 border border-primary/40 text-primary-light text-sm font-semibold">
            {feedback}
          </div>
        )}
      </div>

      {/* Scrims Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-on-surface flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Your Active Scrim Lobbies ({scrims.length})
            </h2>
            <p className="text-xs text-on-surface-variant">
              Click any scrim to enter its dedicated match room management page
            </p>
          </div>

          <button
            onClick={loadOrganizerData}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface-variant"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {scrims.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface-container border border-card-border space-y-3">
            <Swords className="w-10 h-10 text-on-surface-variant mx-auto opacity-50" />
            <h3 className="font-bold text-lg text-on-surface">No Scrim Lobbies Created Yet</h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Ready to host? Create your first scheduled match lobby with custom room ID and password.
            </p>
            <button
              onClick={() => setCreateScrimModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-primary text-black font-bold text-sm"
            >
              Create Scrim Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scrims.map((scrim) => {
              return (
                <div
                  key={scrim.id}
                  className="p-6 rounded-3xl bg-surface-container border border-card-border hover:border-primary/40 transition group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-bold uppercase">
                        {scrim.game}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[10px] uppercase">
                        ● {scrim.status}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-primary transition">
                      {scrim.name}
                    </h3>

                    <div className="space-y-1.5 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        <span>{new Date(scrim.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-accent" />
                        <span>{scrim.registered_teams_count || 0} / {scrim.slots_max} Registered Squads</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenScrimLobby?.(scrim.id)}
                    className="w-full py-2.5 rounded-xl bg-surface-container-high group-hover:bg-primary group-hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    Enter Dedicated Lobby
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create Scrim Lobby */}
      {createScrimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl glass-modal p-6 sm:p-8 space-y-6 shadow-2xl border border-card-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase text-secondary font-bold">
                  Dedicated Match Room
                </span>
                <h3 className="font-display font-bold text-2xl text-on-surface mt-0.5">
                  Create Scrim Lobby
                </h3>
              </div>
              <button
                onClick={() => setCreateScrimModalOpen(false)}
                className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScrim} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Scrim Tournament Name *
                </label>
                <input
                  type="text"
                  required
                  value={scrimName}
                  onChange={(e) => setScrimName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm"
                  placeholder="e.g. Daily Tier-1 Valorant Scrims #12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                    Esports Title *
                  </label>
                  <select
                    value={scrimGame}
                    onChange={(e) => {
                      setScrimGame(e.target.value);
                      const opt = GAME_OPTIONS.find(g => g.id === e.target.value);
                      if (opt) setScrimSlots(opt.defaultSlots);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm"
                  >
                    {GAME_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                    Max Team Slots
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="32"
                    value={scrimSlots}
                    onChange={(e) => setScrimSlots(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                    Custom Room ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={customRoomId}
                    onChange={(e) => setCustomRoomId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm font-mono"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                    Room Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm font-mono"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateScrimModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-primary text-black font-bold text-sm shadow-lg shadow-primary/20"
                >
                  Create & Launch Lobby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Organizer Verification Application */}
      {verifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl glass-modal p-6 sm:p-8 space-y-6 shadow-2xl border border-card-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase text-amber-400 font-bold">
                  Official Verification
                </span>
                <h3 className="font-display font-bold text-2xl text-on-surface mt-0.5">
                  Submit Organizer Application
                </h3>
              </div>
              <button
                onClick={() => setVerifModalOpen(false)}
                className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Organization / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm"
                  placeholder="e.g. Skyesports Hub / Villager Esports"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Tournament Hosting Experience *
                </label>
                <textarea
                  rows="3"
                  required
                  value={expSummary}
                  onChange={(e) => setExpSummary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm"
                  placeholder="Briefly describe past tournaments, leagues, or daily scrims managed..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                    Official Twitter / X Handle
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-sm font-mono"
                    placeholder="@YourOrgHandle"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setVerifModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
