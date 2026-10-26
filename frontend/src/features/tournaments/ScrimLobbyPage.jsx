import React, { useState, useEffect } from 'react';
import {
  Swords, Shield, Clock, Users, Copy, Check, Lock, Unlock, Play,
  CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Send, Settings, Trophy
} from 'lucide-react';
import { io } from 'socket.io-client';
import { scrimService } from '../../services';
import { useGameStore } from '../../stores/gameStore';
import { useAuth } from '../../stores/authContext';

export default function ScrimLobbyPage({ scrimId, onBack, onSelectTab }) {
  const { token } = useAuth();
  const { currentUser, activeRole, teams } = useGameStore();

  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lobbyError, setLobbyError] = useState('');
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [realtimePulse, setRealtimePulse] = useState(false);

  // Organizer controls
  const [editRoomId, setEditRoomId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState('open');
  const [showSettings, setShowSettings] = useState(false);

  // Registration modal
  const [selectedTeamToReg, setSelectedTeamToReg] = useState('');

  const fetchLobby = async () => {
    if (!scrimId) return;
    try {
      const data = await scrimService.getScrimLobby(scrimId);
      setLobby(data);
      setLobbyError('');
      setEditRoomId(data.room_id || '');
      setEditPassword(data.room_password || '');
      setEditStatus(data.status || 'open');
    } catch (err) {
      setLobbyError(err.message || 'You may need to register a team before viewing this lobby.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLobby();

    // Real-Time Socket Connection to Scrim Match Room
    const socket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'], auth: { token } });
    socket.emit('join_scrim_lobby', scrimId);

    socket.on('scrim:credentials_updated', (updated) => {
      setLobby((prev) => (prev ? { ...prev, ...updated } : prev));
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 3000);
    });

    socket.on('scrim:team_checked_in', (data) => {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          registrations: prev.registrations?.map((r) =>
            r.team_id === data.team_id ? { ...r, check_in_status: data.check_in_status } : r
          ),
        };
      });
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 3000);
    });

    socket.on('scrim:team_registered', () => {
      fetchLobby();
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 3000);
    });

    return () => {
      socket.emit('leave_scrim_lobby', scrimId);
      socket.disconnect();
    };
  }, [scrimId, token]);

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'room') {
      setCopiedRoom(true);
      setTimeout(() => setCopiedRoom(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await scrimService.updateCredentials(scrimId, {
        room_id: editRoomId,
        room_password: editPassword,
        status: editStatus,
      });
      setFeedback('Lobby credentials updated successfully!');
      setShowSettings(false);
      fetchLobby();
    } catch (err) {
      setFeedback(err.message || 'Failed to update credentials');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleCheckIn = async (teamId) => {
    setActionLoading(true);
    try {
      await scrimService.updateCheckin(scrimId, teamId, 'checked_in');
      setFeedback('Team checked in successfully!');
      fetchLobby();
    } catch (err) {
      setFeedback(err.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeamToReg) return;
    setActionLoading(true);
    try {
      await scrimService.registerTeam(scrimId, selectedTeamToReg);
      setFeedback('Squad registered for scrim lobby!');
      setSelectedTeamToReg('');
      fetchLobby();
    } catch (err) {
      setFeedback(err.message || 'Failed to register squad');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
        <p className="text-on-surface-variant font-mono">Loading Dedicated Scrim Lobby...</p>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-2xl font-bold">Unable to Open Scrim Lobby</h2>
        {lobbyError && <p role="alert" className="text-sm text-on-surface-variant">{lobbyError}</p>}
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-bright font-semibold text-sm"
        >
          Return to Tournaments & Scrims
        </button>
      </div>
    );
  }

  const isOrganizer = activeRole === 'organizer' || activeRole === 'admin';
  const registeredCount = lobby.registrations?.length || 0;
  const isFull = registeredCount >= (lobby.slots_max || 16);

  // Available qualified teams the user can register
  const myTeams = teams.filter((team) =>
    (team.status === 'registered' || team.status === 'active') &&
    (team.orgId === currentUser.id || team.captainId === currentUser.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface-variant hover:text-on-surface text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scrims & Tournaments
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLobby}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface-variant"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isOrganizer && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright border border-card-border text-on-surface text-sm font-semibold transition"
            >
              <Settings className="w-4 h-4" />
              Lobby Controls
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-primary/20 border border-primary/40 text-primary-light text-sm font-semibold flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Main Lobby Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-surface-container-highest via-surface-container-high to-surface border border-card-border shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-xs font-bold uppercase tracking-wider">
                {lobby.game?.toUpperCase()} COMPETITIVE SCRIM
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  lobby.status === 'live'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : lobby.status === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                ● {lobby.status}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all flex items-center gap-1.5 ${
                realtimePulse
                  ? 'bg-primary text-white dark:text-black border-primary scale-105'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                REAL-TIME MATCH ROOM
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface">
              {lobby.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-on-surface-variant">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-secondary" />
                Hosted by: <strong className="text-on-surface">{lobby.organizer_name}</strong>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {new Date(lobby.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Slots: <strong className="text-on-surface">{registeredCount} / {lobby.slots_max} Squads</strong>
              </span>
            </div>
          </div>

          {/* Quick Match Credentials Card */}
          <div className="p-6 rounded-2xl bg-black/60 border border-card-border backdrop-blur-md space-y-4 min-w-[280px]">
            <div className="flex items-center justify-between border-b border-card-border pb-2">
              <span className="font-mono text-xs uppercase text-on-surface-variant font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Match Room Details
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">LIVE CREDENTIALS</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-on-surface-variant font-mono">Custom Room ID:</span>
                <div className="flex items-center justify-between mt-0.5 p-2 rounded-xl bg-surface-container-high border border-card-border font-mono text-sm font-bold text-on-surface">
                  <span>{lobby.room_id || 'PENDING GENERATION'}</span>
                  <button
                    onClick={() => copyToClipboard(lobby.room_id, 'room')}
                    className="p-1 hover:text-primary transition"
                    title="Copy Room ID"
                  >
                    {copiedRoom ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-on-surface-variant font-mono">Room Password:</span>
                <div className="flex items-center justify-between mt-0.5 p-2 rounded-xl bg-surface-container-high border border-card-border font-mono text-sm font-bold text-on-surface">
                  <span>{lobby.room_password || 'PENDING'}</span>
                  <button
                    onClick={() => copyToClipboard(lobby.room_password, 'pass')}
                    className="p-1 hover:text-primary transition"
                    title="Copy Password"
                  >
                    {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizer Controls Drawer / Modal */}
      {showSettings && isOrganizer && (
        <div className="p-6 rounded-3xl bg-surface-container-high border border-primary/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-on-surface flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Organizer Live Match Control Panel
            </h3>
            <span className="text-xs font-mono text-on-surface-variant">Update room ID, password or start match</span>
          </div>

          <form onSubmit={handleUpdateCredentials} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Match Room ID
              </label>
              <input
                type="text"
                value={editRoomId}
                onChange={(e) => setEditRoomId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border font-mono text-sm"
                placeholder="e.g. CUSTOM-VAL-9021"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Room Password
              </label>
              <input
                type="text"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border font-mono text-sm"
                placeholder="e.g. GG_PASS_2026"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Match Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border font-mono text-sm"
              >
                <option value="open">Open (Accepting Registrations)</option>
                <option value="locked">Locked (Slots Frozen)</option>
                <option value="live">Live (Match In Progress)</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2 rounded-xl bg-primary text-white dark:text-black font-bold text-sm shadow-lg shadow-primary/20"
              >
                Save Lobby Credentials
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Squad Registration Bar */}
      {!isFull && (
        <div className="p-6 rounded-3xl bg-surface-container border border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-on-surface">
              Register Your Qualified Squad ({lobby.slots_max - registeredCount} Slots Remaining)
            </h3>
            <p className="text-xs text-on-surface-variant">
              Only registered teams (4 or 5 roster members verified) are eligible to enter competitive scrim lobbies.
            </p>
          </div>

          <form onSubmit={handleRegisterTeam} className="flex items-center gap-3">
            <select
              value={selectedTeamToReg}
              onChange={(e) => setSelectedTeamToReg(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-card-border font-mono text-xs"
            >
              <option value="">Select your registered squad...</option>
              {myTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} [{t.tag || 'SQD'}] — {t.game.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!selectedTeamToReg || actionLoading}
              className="px-5 py-2.5 rounded-xl bg-secondary text-white dark:text-black font-bold text-xs shadow-lg shadow-secondary/20 transition disabled:opacity-50"
            >
              Register Squad
            </button>
          </form>
        </div>
      )}

      {/* Registered Squads Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-on-surface flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Lobby Roster Slots ({registeredCount} / {lobby.slots_max})
          </h2>
          <span className="text-xs text-on-surface-variant font-mono">
            Check in 15 minutes prior to match start
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lobby.registrations?.map((reg, idx) => {
            const isCheckedIn = reg.check_in_status === 'checked_in' || reg.check_in_status === 'ready';
            return (
              <div
                key={reg.id}
                className="p-5 rounded-2xl bg-surface-container border border-card-border space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-on-surface-variant font-bold">
                    SLOT #{idx + 1}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isCheckedIn
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isCheckedIn ? 'Checked In' : 'Pending Check-in'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-base text-on-surface">
                    {reg.team_name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="font-mono text-primary font-bold">[{reg.team_tag || 'SQD'}]</span>
                    <span>•</span>
                    <span>{reg.org_name || 'Independent'}</span>
                    <span>•</span>
                    <span>{reg.members_count || 4} Members</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-card-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    Registered: {new Date(reg.created_at).toLocaleDateString()}
                  </span>

                  {!isCheckedIn && (
                    <button
                      onClick={() => handleCheckIn(reg.team_id)}
                      disabled={actionLoading}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-mono text-xs font-bold transition"
                    >
                      Check In Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty slot placeholders */}
          {Array.from({ length: Math.max(0, (lobby.slots_max || 16) - registeredCount) }).slice(0, 6).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-5 rounded-2xl border border-dashed border-card-border/50 text-center flex flex-col items-center justify-center min-h-[130px] opacity-60"
            >
              <span className="font-mono text-xs text-on-surface-variant mb-1">
                SLOT #{registeredCount + i + 1}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Available for Qualified Squad
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
