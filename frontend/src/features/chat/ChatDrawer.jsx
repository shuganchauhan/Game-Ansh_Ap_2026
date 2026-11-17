import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, User, AlertCircle, Shield, Crown, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import { connectSocket, disconnectSocket, getSocket } from '../../lib/socket';
import { messageService, socialService, teamService } from '../../services';

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatDrawer({
  isOpen,
  onClose,
  initialTab = 'direct', // 'direct' | 'team'
  initialTeamId = null,
  onNavigateToTeams,
}) {
  const { user, token } = useAuth();
  const { teams = [] } = useGameStore();

  const [activeTab, setActiveTab] = useState(initialTab); // 'direct' | 'team'

  // Direct DM state
  const [contacts, setContacts] = useState([]);
  const [contactId, setContactId] = useState('');
  const [directMessages, setDirectMessages] = useState([]);
  const [directInput, setDirectInput] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingDirectMessages, setLoadingDirectMessages] = useState(false);

  // Team Squad Comms state
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || '');
  const [teamMessages, setTeamMessages] = useState([]);
  const [teamInput, setTeamInput] = useState('');
  const [loadingTeamMessages, setLoadingTeamMessages] = useState(false);

  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialTeamId) setSelectedTeamId(initialTeamId);
  }, [initialTab, initialTeamId]);

  // Compute user's teams (captain, member, or org owner)
  const mySquads = useMemo(() => {
    if (!user) return [];
    return teams.filter((t) => {
      if (user.role === 'admin') return true;
      if (user.role === 'org' && t.org_id === user.id) return true;
      if (t.captain_id === user.id) return true;
      if (t.members && t.members.some((m) => m.player_id === user.id || m.ign === user.game_ign)) return true;
      return false;
    });
  }, [teams, user]);

  // Default selected team if none active
  useEffect(() => {
    if (mySquads.length > 0 && !selectedTeamId) {
      setSelectedTeamId(mySquads[0].id);
    }
  }, [mySquads, selectedTeamId]);

  const activeTeam = useMemo(
    () => mySquads.find((t) => t.id === selectedTeamId) || null,
    [mySquads, selectedTeamId],
  );

  const contact = useMemo(
    () => contacts.find((item) => item.id === contactId) || null,
    [contacts, contactId],
  );

  const threadId = useMemo(
    () => (contact && user?.id ? [user.id, contact.id].sort().join(':') : ''),
    [contact, user?.id],
  );

  // Load contacts for Direct DM
  useEffect(() => {
    if (!isOpen || !user?.id || activeTab !== 'direct') return undefined;
    if (user.role !== 'player') {
      setError('Direct 1-on-1 athlete messaging is available to player accounts.');
      return undefined;
    }

    let active = true;
    setLoadingContacts(true);
    setError('');
    socialService
      .getRecommendedPlayers()
      .then((players) => {
        if (!active) return;
        setContacts(players);
        setContactId((current) => current || players[0]?.id || '');
      })
      .catch((err) => active && setError(err.message || 'Could not load athletes.'))
      .finally(() => active && setLoadingContacts(false));
    return () => {
      active = false;
    };
  }, [isOpen, user?.id, user?.role, activeTab]);

  // Load Direct DM conversation
  useEffect(() => {
    if (!isOpen || !threadId || activeTab !== 'direct') {
      setDirectMessages([]);
      return undefined;
    }
    let active = true;
    setLoadingDirectMessages(true);
    setError('');
    messageService
      .getThread(threadId)
      .then((page) => active && setDirectMessages(page.data || []))
      .catch((err) => active && setError(err.message || 'Could not load this conversation.'))
      .finally(() => active && setLoadingDirectMessages(false));
    return () => {
      active = false;
    };
  }, [isOpen, threadId, activeTab]);

  // Direct DM Socket listener
  useEffect(() => {
    if (!isOpen || !user?.id || !token || !threadId || activeTab !== 'direct') return undefined;
    const socket = connectSocket(user.id, token);
    const handleMessage = (message) => {
      if (message.sender_id === user.id || message.sender_id === contactId) {
        setDirectMessages((current) =>
          current.some((item) => item.id === message.id) ? current : [...current, message],
        );
      }
    };
    socket?.on('new_message', handleMessage);
    return () => socket?.off('new_message', handleMessage);
  }, [isOpen, user?.id, token, threadId, contactId, activeTab]);

  // Load Squad Team Messages
  useEffect(() => {
    if (!isOpen || !selectedTeamId || activeTab !== 'team') {
      setTeamMessages([]);
      return undefined;
    }
    let active = true;
    setLoadingTeamMessages(true);
    setError('');
    teamService
      .getTeamMessages(selectedTeamId)
      .then((res) => {
        if (!active) return;
        setTeamMessages(res.messages || []);
      })
      .catch((err) => active && setError(err.message || 'Could not load squad comms.'))
      .finally(() => active && setLoadingTeamMessages(false));
    return () => {
      active = false;
    };
  }, [isOpen, selectedTeamId, activeTab]);

  // Squad Team Socket Room (join_team_chat / new_team_message)
  useEffect(() => {
    if (!isOpen || !user?.id || !token || !selectedTeamId || activeTab !== 'team') return undefined;
    const socket = connectSocket(user.id, token);

    // Join team socket room
    socket?.emit('join_team_chat', selectedTeamId);

    const handleTeamMessage = (message) => {
      if (message.team_id === selectedTeamId) {
        setTeamMessages((current) =>
          current.some((item) => item.id === message.id) ? current : [...current, message],
        );
      }
    };

    socket?.on('new_team_message', handleTeamMessage);

    return () => {
      socket?.emit('leave_team_chat', selectedTeamId);
      socket?.off('new_team_message', handleTeamMessage);
    };
  }, [isOpen, user?.id, token, selectedTeamId, activeTab]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [directMessages, teamMessages, activeTab, isOpen]);

  useEffect(() => () => disconnectSocket(), []);

  // Send Direct Message
  const handleSendDirect = async (event) => {
    event.preventDefault();
    const content = directInput.trim();
    if (!content || !threadId) return;
    setError('');
    try {
      const message = await messageService.sendMessage(threadId, content);
      setDirectMessages((current) => [...current, message]);
      setDirectInput('');
    } catch (err) {
      setError(err.message || 'Message could not be sent.');
    }
  };

  // Send Squad Team Message
  const handleSendTeam = async (event) => {
    event.preventDefault();
    const content = teamInput.trim();
    if (!content || !selectedTeamId) return;
    setError('');
    try {
      const message = await teamService.sendTeamMessage(selectedTeamId, content);
      setTeamMessages((current) =>
        current.some((m) => m.id === message.id) ? current : [...current, message],
      );
      setTeamInput('');
    } catch (err) {
      setError(err.message || 'Squad transmission failed.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-3 sm:inset-x-auto bottom-[76px] sm:bottom-6 sm:right-6 sm:w-[410px] z-50 rounded-3xl glass-modal border border-card-border shadow-2xl flex flex-col h-[520px] max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-6 backdrop-blur-2xl bg-[#090B12]/95">
      {/* Top Header & Channel Switcher */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-card-border bg-surface-container-high/60">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="font-display font-black text-xs uppercase tracking-widest text-[#F8FAFC]">
              Tactical Comms Hub
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-1 rounded-lg hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Channel Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#090B12] border border-white/[0.06] text-xs font-display font-bold">
          <button
            onClick={() => {
              setActiveTab('team');
              setError('');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'team'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-300" />
            <span>Squad Comms</span>
            {mySquads.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-400/20 text-cyan-300">
                {mySquads.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('direct');
              setError('');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'direct'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-purple-300" />
            <span>Direct DM</span>
          </button>
        </div>
      </div>

      {/* Channel Target Selector Header */}
      {activeTab === 'team' ? (
        <div className="px-4 py-2 border-b border-card-border bg-[#101522]/80 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            {mySquads.length > 0 ? (
              <>
                <label htmlFor="squad-select" className="sr-only">Choose squad</label>
                <select
                  id="squad-select"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-transparent text-xs font-display font-bold text-[#F8FAFC] focus:outline-none cursor-pointer"
                >
                  {mySquads.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#101522] text-white">
                      {t.name} · {(t.game || 'FPS').toUpperCase()}
                    </option>
                  ))}
                </select>
                <span className="font-mono text-[9px] text-[#22D3EE] uppercase tracking-wider block">
                  Encrypted Team Frequency
                </span>
              </>
            ) : (
              <span className="text-xs font-mono text-[#94A3B8]">No active squads registered</span>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 border-b border-card-border bg-[#101522]/80 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="chat-contact" className="sr-only">Choose athlete</label>
            <select
              id="chat-contact"
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
              disabled={loadingContacts || contacts.length === 0}
              className="w-full bg-transparent text-xs font-display font-bold text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              {loadingContacts && <option value="" className="bg-[#101522]">Scanning athletes…</option>}
              {!loadingContacts && contacts.length === 0 && (
                <option value="" className="bg-[#101522]">No athletes available</option>
              )}
              {contacts.map((player) => (
                <option key={player.id} value={player.id} className="bg-[#101522] text-white">
                  {player.username}
                </option>
              ))}
            </select>
            <span className="font-mono text-[9px] text-[#94A3B8] uppercase tracking-wider block">
              1-on-1 Athlete Comms
            </span>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="px-4 py-2 flex gap-2 items-start text-xs text-rose-400 bg-rose-950/40 border-b border-rose-800/30">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Message Feed Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#090B12]/60" aria-live="polite">
        {activeTab === 'team' ? (
          /* SQUAD COMMS FEED */
          mySquads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#94A3B8]">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#F8FAFC]">No Squad Joined</h4>
                <p className="font-body text-xs text-[#94A3B8] mt-1 max-w-[240px]">
                  Join or form a team roster in the Teams hub to unlock private tactical squad comms.
                </p>
              </div>
              {onNavigateToTeams && (
                <button
                  onClick={() => {
                    onNavigateToTeams();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-purple-900/40"
                >
                  Explore Squads
                </button>
              )}
            </div>
          ) : loadingTeamMessages ? (
            <p className="text-xs text-[#94A3B8] font-mono text-center py-8">Synchronizing squad frequency…</p>
          ) : teamMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 text-[#94A3B8] space-y-2">
              <MessageSquare className="w-8 h-8 text-cyan-400/50" />
              <p className="text-xs font-display font-semibold text-[#F8FAFC]">
                Squad channel initialized for {activeTeam?.name || 'this team'}.
              </p>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                Drop strat calls, drop spots, or check-in notices for your squad.
              </p>
            </div>
          ) : (
            teamMessages.map((message) => {
              const isMe = message.sender_id === user?.id;
              const isCaptain = message.sender_role === 'player' && activeTeam?.captain_id === message.sender_id;
              const isOrg = message.sender_role === 'org';

              return (
                <div key={message.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="font-display font-bold text-[11px] text-[#F8FAFC]">
                        {message.sender_name}
                      </span>
                      {isCaptain && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> CAPTAIN
                        </span>
                      )}
                      {isOrg && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ORG
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs font-body leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white rounded-br-none shadow-md shadow-purple-900/30 border border-purple-400/30'
                        : 'bg-[#151B2B] text-[#F8FAFC] rounded-bl-none border border-white/[0.08]'
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="font-mono text-[9px] text-[#94A3B8] mt-1 px-1">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              );
            })
          )
        ) : (
          /* DIRECT 1-ON-1 DM FEED */
          loadingDirectMessages ? (
            <p className="text-xs text-[#94A3B8] font-mono text-center py-8">Loading direct channel…</p>
          ) : directMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 text-[#94A3B8] space-y-2">
              <User className="w-8 h-8 text-purple-400/50" />
              <p className="text-xs font-display font-semibold text-[#F8FAFC]">
                Start direct conversation with {contact?.username || 'this athlete'}.
              </p>
            </div>
          ) : (
            directMessages.map((message) => {
              const isMe = message.sender_id === user?.id;
              return (
                <div key={message.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs font-body leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white rounded-br-none shadow-md shadow-purple-900/30 border border-purple-400/30'
                        : 'bg-[#151B2B] text-[#F8FAFC] rounded-bl-none border border-white/[0.08]'
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="font-mono text-[9px] text-[#94A3B8] mt-1 px-1">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              );
            })
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Transmission Form */}
      {activeTab === 'team' ? (
        <form
          onSubmit={handleSendTeam}
          className="p-3 border-t border-card-border flex items-center gap-2 bg-[#101522]/90"
        >
          <input
            type="text"
            maxLength={2000}
            disabled={!selectedTeamId || loadingTeamMessages || mySquads.length === 0}
            placeholder={
              mySquads.length === 0
                ? 'Join a squad to send comms'
                : activeTeam
                ? `Squad comms: ${activeTeam.name}…`
                : 'Transmit squad message…'
            }
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090B12] border border-white/[0.08] text-[#F8FAFC] placeholder:text-[#94A3B8] text-xs focus:outline-none focus:border-cyan-400 font-body transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!teamInput.trim() || !selectedTeamId || mySquads.length === 0}
            aria-label="Send squad message"
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-md shadow-cyan-900/40 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSendDirect}
          className="p-3 border-t border-card-border flex items-center gap-2 bg-[#101522]/90"
        >
          <input
            type="text"
            maxLength={2000}
            disabled={!threadId || loadingDirectMessages}
            placeholder={contact ? `Message @${contact.username}…` : 'Choose an athlete'}
            value={directInput}
            onChange={(event) => setDirectInput(event.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090B12] border border-white/[0.08] text-[#F8FAFC] placeholder:text-[#94A3B8] text-xs focus:outline-none focus:border-purple-400 font-body transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!directInput.trim() || !threadId}
            aria-label="Send direct message"
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white hover:brightness-110 shadow-md shadow-purple-900/40 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
