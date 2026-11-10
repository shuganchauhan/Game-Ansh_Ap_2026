import React, { useState, useEffect } from 'react';
import { Radio, Crosshair, Wifi, Shield, Swords, Trophy, Play, CheckCircle2, ChevronRight, Zap, Volume2, VolumeX } from 'lucide-react';
import { cyberAudio } from '../../lib/cyberAudio';

const LIVE_EVENTS = [
  { killer: 'JONATHAN', victim: 'Mortal', weapon: 'M416 Headshot', game: 'BGMI', time: '1s ago' },
  { killer: 'SkRossi', victim: 'Hellff', weapon: 'Operator Pick', game: 'VALORANT', time: '3s ago' },
  { killer: 'Goblin', victim: 'Spower', weapon: 'Grenade Double', game: 'BGMI', time: '7s ago' },
  { killer: 'ScoutOP', victim: 'Vortex', weapon: 'DMR Precision', game: 'BGMI', time: '11s ago' },
  { killer: 'Antidote', victim: 'Marcos', weapon: 'Vandal Spray', game: 'VALORANT', time: '15s ago' },
];

const SERVER_NODES = [
  { name: 'MUMBAI-01', ping: '12ms', status: 'OPTIMAL', load: '94%' },
  { name: 'SINGAPORE-02', ping: '28ms', status: 'OPTIMAL', load: '82%' },
  { name: 'FRANKFURT-01', ping: '84ms', status: 'NORMAL', load: '76%' },
];

export default function LiveArenaCommandDeck({ onSelectTab, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('radar');
  const [matchmakingState, setMatchmakingState] = useState('idle'); // idle | searching | found
  const [queueTimer, setQueueTimer] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [audioActive, setAudioActive] = useState(false);

  // Live action ticker rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Matchmaking simulation
  useEffect(() => {
    let timer;
    if (matchmakingState === 'searching') {
      timer = setInterval(() => {
        setQueueTimer((t) => {
          if (t >= 3) {
            setMatchmakingState('found');
            cyberAudio.playMatchFound();
            return 3;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [matchmakingState]);

  const handleStartQueue = () => {
    cyberAudio.playClick();
    setQueueTimer(0);
    setMatchmakingState('searching');
  };

  const handleCancelQueue = () => {
    cyberAudio.playClick();
    setMatchmakingState('idle');
    setQueueTimer(0);
  };

  const toggleSound = () => {
    const isNowOn = cyberAudio.toggle();
    setAudioActive(isNowOn);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#151B2B] via-[#101522] to-[#090B12] border border-white/[0.12] p-6 sm:p-8 overflow-hidden shadow-2xl space-y-6">
      {/* Background Matrix Circuit Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8B5CF6]/15 via-[#22D3EE]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Deck: Title, Live Radio Status & Sound Toggle */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1B2335] border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE] shadow-lg shadow-[#22D3EE]/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg sm:text-xl text-[#F8FAFC]">
                FLUX ARENA COMMAND DECK
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
            </div>
            <p className="font-mono text-xs text-[#94A3B8]">
              Real-Time Match Telemetry · Anti-Cheat Verified · Sub-15ms Nodes
            </p>
          </div>
        </div>

        {/* Audio Atmosphere Switch & Server Node Selector */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 transition-all ${
              audioActive
                ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#C084FC] shadow-sm shadow-[#8B5CF6]/30'
                : 'bg-white/[0.04] border-white/[0.08] text-[#94A3B8] hover:text-white'
            }`}
          >
            {audioActive ? <Volume2 className="w-3.5 h-3.5 text-[#22D3EE]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioActive ? 'CYBER SFX: ON' : 'SFX: MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Main Command Grid: 3 Interactive Columns */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Mini Tactical Radar & Match Score (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0E1322] border border-white/[0.08] p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              TACTICAL RADAR · ASCENT
            </span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[10px] font-bold animate-pulse">
              ROUND 18 / 24
            </span>
          </div>

          {/* Animated Mini Radar Screen */}
          <div className="relative aspect-[16/10] w-full rounded-xl bg-[#090C16] border border-white/[0.08] overflow-hidden flex items-center justify-center">
            {/* Concentric radar rings */}
            <div className="absolute w-44 h-44 rounded-full border border-white/[0.08]" />
            <div className="absolute w-28 h-28 rounded-full border border-white/[0.06]" />
            <div className="absolute w-12 h-12 rounded-full border border-white/[0.06]" />

            {/* Radar sweep beam */}
            <div
              className="absolute inset-0 origin-center pointer-events-none animate-radar-sweep"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.2) 60deg, transparent 70deg)',
              }}
            />

            {/* Tactical blips representing players */}
            <div className="absolute top-[35%] left-[28%] w-3 h-3 rounded-full bg-[#22D3EE] shadow-md shadow-[#22D3EE] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <div className="absolute top-[42%] left-[34%] w-2.5 h-2.5 rounded-full bg-[#22D3EE] shadow-sm shadow-[#22D3EE]" />
            <div className="absolute top-[68%] right-[32%] w-3 h-3 rounded-full bg-red-400 shadow-md shadow-red-500" />
            <div className="absolute top-[55%] right-[25%] w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="absolute bottom-[20%] left-[50%] w-2 h-2 rounded-full bg-amber-400 animate-ping" />

            {/* Center crosshair mark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-white/[0.05]" />
              <div className="h-full w-px bg-white/[0.05] absolute" />
            </div>

            {/* Map label overlay */}
            <div className="absolute bottom-2.5 left-3 font-mono text-[10px] text-[#94A3B8] backdrop-blur-sm bg-black/40 px-2 py-0.5 rounded">
              SITE A · BOMB PLANTED (32s)
            </div>
          </div>

          {/* Current Scoreboard Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE]" />
              <span className="font-display font-black text-sm text-[#F8FAFC]">Team SouL</span>
            </div>
            <div className="font-display font-black text-lg text-[#F8FAFC] tracking-wider">
              11 <span className="text-[#94A3B8] font-normal mx-1">—</span> 07
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm text-[#F8FAFC]">Global Esports</span>
              <span className="w-2 h-2 rounded-full bg-red-400" />
            </div>
          </div>
        </div>

        {/* Center Column: Live Action Killfeed & Server Health (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0E1322] border border-white/[0.08] p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-[#22D3EE] uppercase tracking-wider block">
              LIVE ACTION FEED
            </span>
            <p className="font-mono text-[10px] text-[#94A3B8]">
              Automated high-stakes match events
            </p>
          </div>

          {/* Animated killfeed entries */}
          <div className="space-y-2">
            {LIVE_EVENTS.map((event, idx) => {
              const isActive = idx === eventIndex;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between text-xs ${
                    isActive
                      ? 'bg-[#151B2B] border-[#8B5CF6]/50 shadow-md shadow-[#8B5CF6]/20 scale-[1.02]'
                      : 'bg-white/[0.02] border-white/[0.05] opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-display font-bold text-[#F8FAFC] truncate">
                      {event.killer}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[9px] font-bold shrink-0">
                      {event.weapon}
                    </span>
                    <span className="text-[#94A3B8] truncate">{event.victim}</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#94A3B8] shrink-0">
                    {event.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Server Node Latencies */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <span className="font-mono text-[10px] uppercase text-[#94A3B8] font-bold block">
              GLOBAL SERVER NODES
            </span>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              {SERVER_NODES.map((node) => (
                <div key={node.name} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-center">
                  <span className="text-[#94A3B8] block text-[8px] truncate">{node.name}</span>
                  <span className="font-bold text-emerald-400 block mt-0.5">{node.ping}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Fast Scrim Matchmaking Simulator (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-b from-[#182033] to-[#0E1322] border border-[#8B5CF6]/30 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              FAST SCRIM QUEUE
            </span>
            <p className="font-mono text-[10px] text-[#94A3B8]">
              Automated 5v5 scrim matchmaking for verified rosters.
            </p>
          </div>

          {/* Interactive Matchmaking Box */}
          <div className="p-4 rounded-xl bg-[#090C16] border border-white/[0.08] text-center space-y-3">
            {matchmakingState === 'idle' && (
              <>
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] mx-auto">
                  <Swords className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-display font-bold text-sm text-[#F8FAFC] block">
                    Ranked Scrim Ready
                  </span>
                  <span className="font-mono text-[10px] text-[#94A3B8] block">
                    120+ Squads Currently Queuing
                  </span>
                </div>
                <button
                  onClick={handleStartQueue}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Queue Scrim Lobby</span>
                </button>
              </>
            )}

            {matchmakingState === 'searching' && (
              <>
                <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#22D3EE] border-t-transparent animate-spin" />
                  <Crosshair className="w-5 h-5 text-[#22D3EE] animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-display font-bold text-sm text-[#22D3EE] block">
                    Searching Match ({queueTimer}s)
                  </span>
                  <span className="font-mono text-[10px] text-[#94A3B8] block">
                    Filtering Ping &lt; 25ms · Tier-1 MMR
                  </span>
                </div>
                <button
                  onClick={handleCancelQueue}
                  className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-[#94A3B8] font-mono text-[10px] font-bold uppercase transition-all"
                >
                  Cancel Queue
                </button>
              </>
            )}

            {matchmakingState === 'found' && (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-display font-black text-sm text-emerald-400 block">
                    MATCH CONFIRMED!
                  </span>
                  <span className="font-mono text-[10px] text-[#F8FAFC] block">
                    Ascent 5v5 vs GodLike
                  </span>
                  <span className="font-mono text-[9px] text-[#94A3B8] block">
                    Server: Mumbai-01 · 14ms
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onSelectTab?.('tournaments')}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-display font-bold text-xs uppercase transition-all"
                  >
                    Enter Lobby
                  </button>
                  <button
                    onClick={handleStartQueue}
                    className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-[#94A3B8] font-mono text-[10px]"
                  >
                    Re-roll
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] pt-1 border-t border-white/[0.06]">
            <span>Fair Play Engine</span>
            <span className="text-emerald-400 font-bold">100% SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
