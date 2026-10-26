import React, { useState, useEffect } from 'react';
import {
  Trophy, Swords, Calendar, Users, Shield, CheckCircle, Flame, ExternalLink,
  Clock, ArrowRight, Lock, ChevronRight, Plus
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { scrimService } from '../../services';

const GAME_TABS = [
  { id: 'all', label: 'All Titles' },
  { id: 'valorant', label: 'VALORANT' },
  { id: 'bgmi', label: 'BGMI' },
  { id: 'freefire', label: 'Free Fire' },
  { id: 'coc', label: 'Clash of Clans' },
  { id: 'cr', label: 'Clash Royale' },
  { id: 'cod', label: 'Call of Duty' },
];

export default function TournamentsPage({ onRegisterModal, onOpenScrimLobby, onSelectTab, onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();
  const [selectedRound, setSelectedRound] = useState('finals'); // 'quarter' | 'semi' | 'finals'
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [scrims, setScrims] = useState([]);
  const [loadingScrims, setLoadingScrims] = useState(true);

  useEffect(() => {
    const fetchScrims = async () => {
      try {
        const data = await scrimService.listScrims();
        setScrims(data || []);
      } catch (err) {
        console.error('Failed to load scrims:', err);
      } finally {
        setLoadingScrims(false);
      }
    };
    fetchScrims();
  }, []);

  const bracketData = {
    semis: [
      {
        id: 'm1',
        teamA: { name: 'Global Esports Red', score: 2, winner: true, seed: '#1' },
        teamB: { name: 'Reckoning Esports', score: 1, winner: false, seed: '#4' },
      },
      {
        id: 'm2',
        teamA: { name: 'Team Soul BGMI', score: 2, winner: true, seed: '#2' },
        teamB: { name: 'Godlike Esports', score: 0, winner: false, seed: '#3' },
      },
    ],
    finals: {
      teamA: { name: 'Global Esports Red', score: 1, winner: false, seed: '#1' },
      teamB: { name: 'Team Soul BGMI', score: 2, winner: true, seed: '#2' },
    },
  };

  const filteredScrims = scrims.filter(s => {
    if (selectedGameFilter === 'all') return true;
    return s.game?.toLowerCase() === selectedGameFilter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Tournament Hub Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-card-border overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/15 border border-error/30 text-error font-mono text-xs uppercase font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-error animate-ping" />
              <span>Grand Finals Circuit Live</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-on-surface">
              Gamers'G Championship Masters 2026
            </h1>
            <p className="font-body text-sm text-on-surface-variant max-w-xl">
              16 top verified teams competing for regional supremacy, circuit points, and the coveted championship trophy.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-on-surface-variant pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-secondary" />
                Oct 19 - Oct 25, 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                16 Registered Squads
              </span>
              <span className="flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-accent" />
                Best of 5 Format
              </span>
            </div>
          </div>

          {/* Prize Vault & Action */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-surface-container border border-card-border text-center md:text-right min-w-[200px]">
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Prize Pool Vault</span>
              <div className="font-display font-bold text-3xl text-secondary mt-1">₹15,00,000 INR</div>
              <span className="text-[11px] font-mono text-primary font-bold">1st Place: ₹8,00,000</span>
            </div>

            <button
              onClick={() => onRegisterModal && onRegisterModal()}
              className="w-full py-2.5 px-5 rounded-xl bg-primary text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Register Qualified Squad
            </button>
          </div>
        </div>
      </div>

      {/* ── Daily Scrims & Dedicated Match Lobbies ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-secondary font-bold uppercase tracking-wider">
              <Swords className="w-3.5 h-3.5" />
              Dedicated Match Rooms
            </div>
            <h2 className="font-display font-bold text-2xl text-on-surface">
              Daily Scrim Lobbies
            </h2>
            <p className="text-xs text-on-surface-variant">
              Every scrim features its own dedicated match room page with private room credentials and live slot check-in.
            </p>
          </div>

          {/* Game filter tabs */}
          <div className="inline-flex p-1 rounded-xl bg-surface-container border border-card-border overflow-x-auto max-w-full">
            {GAME_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedGameFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  selectedGameFilter === tab.id
                    ? 'bg-primary text-white dark:text-black shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loadingScrims ? (
          <div className="p-8 text-center rounded-2xl bg-surface-container text-xs font-mono text-on-surface-variant">
            Loading scheduled scrims...
          </div>
        ) : filteredScrims.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-container text-xs font-mono text-on-surface-variant">
            No scheduled scrim lobbies currently open for this title.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScrims.map((scrim) => (
              <div
                key={scrim.id}
                className="p-5 rounded-2xl bg-surface-container border border-card-border hover:border-primary/40 transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] uppercase font-bold">
                      {scrim.game}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] uppercase font-bold">
                      ● {scrim.status}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition line-clamp-1">
                    {scrim.name}
                  </h3>

                  <div className="space-y-1 text-xs text-on-surface-variant">
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
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high group-hover:bg-primary group-hover:text-white dark:group-hover:text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  Enter Scrim Match Room
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Bracket Viewer */}
      <div className="space-y-4 pt-4 border-t border-card-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-bold text-xl text-on-surface">Championship Bracket</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRound('semi')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                selectedRound === 'semi'
                  ? 'bg-primary text-white dark:text-black font-bold shadow-sm'
                  : 'bg-surface-container text-on-surface-variant border border-card-border'
              }`}
            >
              Semifinals
            </button>
            <button
              onClick={() => setSelectedRound('finals')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                selectedRound === 'finals'
                  ? 'bg-primary text-white dark:text-black font-bold shadow-sm'
                  : 'bg-surface-container text-on-surface-variant border border-card-border'
              }`}
            >
              Grand Finals
            </button>
          </div>
        </div>

        {/* Visual Bracket Flow */}
        <div className="p-6 rounded-3xl bg-surface-container border border-card-border overflow-x-auto">
          <div className="min-w-[600px] flex items-center justify-between gap-6">
            {/* Semifinals Column */}
            <div className="flex-1 space-y-4">
              <div className="text-center font-mono text-xs uppercase text-on-surface-variant tracking-wider font-semibold">
                Semifinal Matchups
              </div>
              {bracketData.semis.map((match) => (
                <div key={match.id} className="p-4 rounded-2xl bg-surface-container-high border border-card-border space-y-2">
                  <div className={`flex items-center justify-between text-xs ${match.teamA.winner ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                    <span>{match.teamA.seed} {match.teamA.name}</span>
                    <span className="font-mono font-bold">{match.teamA.score}</span>
                  </div>
                  <div className={`flex items-center justify-between text-xs ${match.teamB.winner ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                    <span>{match.teamB.seed} {match.teamB.name}</span>
                    <span className="font-mono font-bold">{match.teamB.score}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bracket Connector Line */}
            <div className="flex flex-col items-center justify-center text-on-surface-variant opacity-40 font-mono text-lg select-none">
              ➔
            </div>

            {/* Grand Finals Column */}
            <div className="flex-1 space-y-4">
              <div className="text-center font-mono text-xs uppercase text-secondary tracking-wider font-bold">
                🏆 Grand Finals (BO5)
              </div>
              <div className="p-5 rounded-2xl bg-surface-container-high border-2 border-secondary/40 shadow-glow-accent space-y-3 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-secondary text-black font-mono text-[10px] uppercase font-bold tracking-widest">
                  Live Match
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-xl ${bracketData.finals.teamA.winner ? 'bg-secondary/15 text-secondary font-bold' : 'text-on-surface'}`}>
                  <span className="font-display text-sm flex items-center gap-2">
                    <span className="font-mono text-xs text-on-surface-variant">{bracketData.finals.teamA.seed}</span>
                    {bracketData.finals.teamA.name}
                  </span>
                  <span className="font-mono text-base font-bold">{bracketData.finals.teamA.score}</span>
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-xl ${bracketData.finals.teamB.winner ? 'bg-secondary/15 text-secondary font-bold' : 'text-on-surface'}`}>
                  <span className="font-display text-sm flex items-center gap-2">
                    <span className="font-mono text-xs text-on-surface-variant">{bracketData.finals.teamB.seed}</span>
                    {bracketData.finals.teamB.name}
                  </span>
                  <span className="font-mono text-base font-bold">{bracketData.finals.teamB.score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
