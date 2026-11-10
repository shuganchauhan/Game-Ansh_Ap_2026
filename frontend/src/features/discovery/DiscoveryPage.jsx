import React, { useState, useRef } from 'react';
import {
  ArrowLeft, CheckCircle2, ChevronRight, Crosshair, Crown, Flame, Search, Shield, Sparkles, Target, Trophy, Users, Zap
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import { useGSAPReveal } from '../../hooks/useGSAP';
import useApi from '../../hooks/useApi';

/* ═══════════════════════════════════════════════════════
   Supported game directory
═══════════════════════════════════════════════════════ */
const GAME_ICONS = {
  valorant: Zap,
  bgmi: Crosshair,
  freefire: Flame,
  coc: Shield,
  cr: Crown,
  cod: Target,
};

const GAMES = [
  {
    id: 'valorant',
    name: 'VALORANT',
    publisher: 'Riot Games',
    genre: 'Tactical FPS',
    image: '/valorant.jpg',
    color: '#8B5CF6',
    gradient: 'from-[#8B5CF6]/25 via-[#8B5CF6]/5 to-transparent',
    border: 'border-[#8B5CF6]/30 hover:border-[#8B5CF6]/80',
    badge: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
    description: "Precision 5v5 character-based tactical shooter with abilities. India's fastest growing FPS esport.",
    tag: 'TIER-1 FPS',
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    publisher: 'Krafton',
    genre: 'Battle Royale',
    image: '/bgmi.jpg',
    color: '#22D3EE',
    gradient: 'from-[#22D3EE]/25 via-[#22D3EE]/5 to-transparent',
    border: 'border-[#22D3EE]/30 hover:border-[#22D3EE]/80',
    badge: 'bg-[#22D3EE]/15 text-[#22D3EE]',
    description: 'Battlegrounds Mobile India — the premier competitive mobile battle royale in India.',
    tag: 'PREMIER BR',
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    publisher: 'Garena',
    genre: 'Battle Royale',
    image: '/freefire.jpg',
    color: '#EC4899',
    gradient: 'from-[#EC4899]/25 via-[#EC4899]/5 to-transparent',
    border: 'border-[#EC4899]/30 hover:border-[#EC4899]/80',
    badge: 'bg-[#EC4899]/15 text-[#EC4899]',
    description: 'High-octane 50-player battle royale with clash squad competitive circuits.',
    tag: 'PRO LEAGUE',
  },
  {
    id: 'coc',
    name: 'Clash of Clans',
    publisher: 'Supercell',
    genre: 'Strategy / Clan War',
    image: '/coc.jpg',
    color: '#F59E0B',
    gradient: 'from-[#F59E0B]/25 via-[#F59E0B]/5 to-transparent',
    border: 'border-[#F59E0B]/30 hover:border-[#F59E0B]/80',
    badge: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    description: 'Clan Wars, Trophy Pushing, and Legend League — strategic clan battle operations.',
    tag: 'CWL LEAGUE',
  },
  {
    id: 'cr',
    name: 'Clash Royale',
    publisher: 'Supercell',
    genre: 'Strategy / Card',
    image: '/cr.jpg',
    color: '#6366F1',
    gradient: 'from-[#6366F1]/25 via-[#6366F1]/5 to-transparent',
    border: 'border-[#6366F1]/30 hover:border-[#6366F1]/80',
    badge: 'bg-[#6366F1]/15 text-[#6366F1]',
    description: 'Real-time deck-building card duels — Crown Championship 1v1 ladder circuit.',
    tag: 'CROWN CUP',
  },
  {
    id: 'cod',
    name: 'Call of Duty',
    publisher: 'Activision',
    genre: 'FPS / BR',
    image: '/cod.jpg',
    color: '#10B981',
    gradient: 'from-[#10B981]/25 via-[#10B981]/5 to-transparent',
    border: 'border-[#10B981]/30 hover:border-[#10B981]/80',
    badge: 'bg-[#10B981]/15 text-[#10B981]',
    description: 'COD Mobile + Warzone — 5v5 Hardpoint, S&D and Battle Royale operations.',
    tag: 'WARZONE',
  },
];

/* Legacy local showcase entries removed: discovery must reflect backend data only. */
/* ═══════════════════════════════════════════════════════
   GAME SELECTION CARD (Cinematic Cover & Metadata)
═══════════════════════════════════════════════════════ */
function GameCard({ game, onSelect }) {
  return (
    <button
      onClick={() => onSelect(game)}
      className="group relative w-full text-left rounded-3xl bg-[#151B2B] border border-white/[0.08] hover:border-[#8B5CF6]/50 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden shadow-xl"
    >
      {/* Cover Image Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151B2B] via-[#151B2B]/40 to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider">
          {game.tag}
        </span>
      </div>

      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-black text-xl text-[#F8FAFC] group-hover:text-white transition-colors">
            {game.name}
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#8B5CF6]/20 text-[#8B5CF6]">
            {game.genre}
          </span>
        </div>

        <p className="font-body text-xs text-[#94A3B8] line-clamp-2">
          {game.description}
        </p>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <span>{game.publisher}</span>
          <span className="text-[#22D3EE] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Browse Arena <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   TEAM CARD
═══════════════════════════════════════════════════════ */
function TeamCard({ team, gameColor, onApply }) {
  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-primary/40 transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
              team.status === 'active'
                ? 'bg-secondary/15 text-secondary border border-secondary/30'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {team.status || 'Team'}
          </span>
          {team.verified && <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" title="Verified" />}
        </div>

        {/* Name + org */}
        <div>
          <h3 className="font-display font-bold text-lg text-on-surface">{team.name}</h3>
          <p className="font-mono text-xs text-on-surface-variant">{[team.org, team.division].filter(Boolean).join(' · ')}</p>
        </div>

        {team.roster != null && <div className="inline-flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant"><Users className="h-4 w-4 text-secondary" />{team.roster} roster members</div>}

        {/* Open roles */}
        {team.openRoles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {team.openRoles.map((r, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-mono font-semibold">
                <Sparkles className="w-3 h-3" />
                {r} Open
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* CTA */}
      <div className="pt-4 mt-2 border-t border-card-border">
        {team.openRoles.length > 0 ? (
          <button
            onClick={() => onApply(team)}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ backgroundColor: gameColor || 'var(--color-primary-container)' }}
          >
            <Zap className="w-3.5 h-3.5" />
            View &amp; Apply
          </button>
        ) : (
          <button className="w-full py-2.5 rounded-xl bg-surface-container border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center justify-center gap-2 active:scale-95 transition-all">
            View Team
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOURNAMENT CARD
═══════════════════════════════════════════════════════ */
function TournamentCard({ tourney, gameColor, onRegister }) {
  const hasCapacity = Number.isFinite(Number(tourney.registered)) && Number.isFinite(Number(tourney.maxTeams)) && Number(tourney.maxTeams) > 0;
  const fillPct = hasCapacity ? Math.min(100, Math.round((Number(tourney.registered) / Number(tourney.maxTeams)) * 100)) : null;
  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-card-border hover:border-secondary/40 transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between">
      <div className="space-y-3">
        {/* Status badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
            tourney.status === 'ongoing'
              ? 'bg-error/15 text-error border border-error/30'
              : 'bg-surface-container text-on-surface-variant'
          }`}>
            {tourney.status === 'ongoing' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-error mr-1 align-middle animate-pulse" />
            )}
            {tourney.status}
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
            {tourney.format}
          </span>
        </div>

        <h3 className="font-display font-bold text-base text-on-surface line-clamp-2">{tourney.name}</h3>

        {/* Prize */}
        {tourney.prize && <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-tertiary" />
          <span className="font-display font-bold text-lg text-tertiary">{tourney.prize}</span>
        </div>}

        {/* Registration progress */}
        {hasCapacity && <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
            <span>Teams Registered</span>
            <span className="font-bold text-on-surface">{tourney.registered}/{tourney.maxTeams}</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${fillPct}%`,
                backgroundColor: fillPct >= 90 ? 'var(--color-error)' : gameColor || 'var(--color-secondary)',
              }}
            />
          </div>
          <span className="font-mono text-[10px] text-on-surface-variant">{fillPct}% capacity filled</span>
        </div>}

        {tourney.startDate && <div className="font-mono text-xs text-on-surface-variant">
          {new Date(tourney.startDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>}
      </div>

      {/* CTA */}
      <div className="pt-4 mt-2 border-t border-card-border">
        <button
          disabled={fillPct === 100}
          onClick={onRegister}
          className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: fillPct === 100 ? 'var(--color-surface-container-high)' : (gameColor || 'var(--color-secondary-container)') }}
        >
          {fillPct === 100 ? 'Registration Closed' : 'Register Team'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DISCOVERY PAGE
═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   DISCOVERY SKELETON
═══════════════════════════════════════════════════════ */
function DiscoverySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-surface-container-low border border-card-border space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 rounded-full bg-surface-container" />
            <div className="h-4 w-4 rounded-full bg-surface-container" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-3/4 rounded-lg bg-surface-container" />
            <div className="h-4 w-1/2 rounded bg-surface-container" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 rounded-xl bg-surface-container" />
            <div className="h-12 rounded-xl bg-surface-container" />
          </div>
          <div className="h-10 w-full rounded-xl bg-surface-container pt-2" />
        </div>
      ))}
    </div>
  );
}

export default function DiscoveryPage({ onSelectTab, onOpenAuth }) {
  const { isAuthenticated } = useAuth();
  const { submitApplication } = useGameStore();
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeSection, setActiveSection] = useState('teams');
  const [search, setSearch] = useState('');
  const [applyTarget, setApplyTarget] = useState(null);
  const [pitch, setPitch] = useState('');
  const [applySubmitted, setApplySubmitted] = useState(false);
  const gamesRef = useRef(null);
  const contentRef = useRef(null);

  useGSAPReveal(gamesRef, 0);
  useGSAPReveal(contentRef, 0.05);

  // Live backend data hooks
  const { data: apiTeamsData, loading: loadingTeams } = useApi(
    selectedGame ? '/discovery/teams' : null,
    { params: { game: selectedGame?.name }, enabled: Boolean(selectedGame) }
  );

  const { data: apiTourneysData, loading: loadingTourneys } = useApi(
    selectedGame ? '/discovery/tournaments' : null,
    { params: { game: selectedGame?.name }, enabled: Boolean(selectedGame) }
  );

  const backendTeams = Array.isArray(apiTeamsData) ? apiTeamsData : (apiTeamsData?.data || []);
  const backendTourneys = Array.isArray(apiTourneysData) ? apiTourneysData : (apiTourneysData?.data || []);

  const rawTeams = backendTeams.map((bt) => ({
    id: bt.id,
    name: bt.name,
    org: bt.org_name || (bt.org_id ? 'Esports Org' : 'Independent Squad'),
    verified: Boolean(bt.verified),
    status: bt.status,
    division: bt.division,
    roster: bt.members_count,
    openRoles: (bt.open_postings || []).map((p) => p.role).filter(Boolean),
    openPostings: bt.open_postings || [],
  }));

  const rawTournaments = backendTourneys.map((tr) => ({
    id: tr.id,
    name: tr.name,
    status: tr.status,
    prize: tr.prize_pool ? `₹${Number(tr.prize_pool).toLocaleString('en-IN')}` : null,
    maxTeams: tr.max_teams,
    registered: tr.registered_teams,
    startDate: tr.start_date,
    format: tr.format,
  }));

  const teams = rawTeams;
  const tournaments = rawTournaments;

  const filteredTeams = teams.filter(t =>
    search === '' ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.org.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTournaments = tournaments.filter(t =>
    search === '' || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setSearch('');
    setActiveSection('teams');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleBack = () => {
    setSelectedGame(null);
    setSearch('');
    setApplyTarget(null);
  };

  const handleSubmitApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setApplyTarget(null);
      onOpenAuth?.('player', 'login');
      return;
    }
    setApplySubmitted(true);

    if (applyTarget?.openPostings?.[0]?.id && submitApplication) {
      try {
        await submitApplication({
          postingId: applyTarget.openPostings[0].id,
          teamId: applyTarget.id,
          roleName: applyTarget.openPostings[0].role || 'Roster',
          pitch,
        });
      } catch (err) {
        console.warn('Backend recruitment application warning:', err.message);
      }
    }

    setTimeout(() => {
      setApplyTarget(null);
      setPitch('');
      setApplySubmitted(false);
    }, 1800);
  };

  /* ── GAME SELECTION VIEW ────────────────────────────── */
  if (!selectedGame) {
    return (
      <div className="flux-page-shell mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-secondary font-bold">GAME DIRECTORY</span>
            <span className="font-mono text-xs text-on-surface-variant"></span>
          </div>
          <h1 className="font-display font-bold text-4xl text-on-surface">
            Choose Your <span className="gradient-text">Game</span>
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Choose a game to browse teams and tournaments published on Flux.
          </p>
        </div>

        {/* Game Grid */}
        <div ref={gamesRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map((g) => (
            <div key={g.id} data-reveal>
              <GameCard game={g} onSelect={handleSelectGame} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── GAME DETAIL VIEW ────────────────────────────────── */
  return (
    <div className="flux-page-shell mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 space-y-6">

      {/* Game hero banner */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#151B2B] p-6 sm:p-8 shadow-2xl"
      >
        {selectedGame.image && (
          <img
            src={selectedGame.image}
            alt={selectedGame.name}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.3] opacity-65"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090B12] via-[#090B12]/85 to-transparent" />
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] pointer-events-none opacity-25"
          style={{ background: selectedGame.color }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#F8FAFC] font-mono text-xs uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Games
            </button>

            <div className="flex items-center gap-4">
              {(() => {
                const IconComp = GAME_ICONS[selectedGame.id] || Zap;
                return (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/[0.1] shadow-lg"
                    style={{ backgroundColor: `${selectedGame.color}25`, color: selectedGame.color }}
                  >
                    <IconComp className="w-8 h-8" />
                  </div>
                );
              })()}
              <div>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F8FAFC]">{selectedGame.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold ${selectedGame.badge}`}>
                    {selectedGame.genre}
                  </span>
                  <span className="font-mono text-xs text-[#94A3B8]">{selectedGame.publisher}</span>
                  {selectedGame.tag && (
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/[0.08] text-[#F8FAFC] border border-white/[0.1]">
                      {selectedGame.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tab switcher + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-surface-container-high border border-card-border">
          <button
            onClick={() => setActiveSection('teams')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display text-sm font-bold uppercase tracking-wide transition-all ${
              activeSection === 'teams' ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}
            style={activeSection === 'teams' ? { backgroundColor: selectedGame.color } : {}}
          >
            <Shield className="w-4 h-4" />
            Teams
          </button>
          <button
            onClick={() => setActiveSection('tournaments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display text-sm font-bold uppercase tracking-wide transition-all ${
              activeSection === 'tournaments' ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}
            style={activeSection === 'tournaments' ? { backgroundColor: selectedGame.color } : {}}
          >
            <Trophy className="w-4 h-4" />
            Tournaments
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder={`Search ${activeSection}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-card-border text-on-surface placeholder:text-on-surface-variant focus:outline-none text-sm font-body transition-all"
            onFocus={(e) => { e.target.style.borderColor = selectedGame.color; }}
            onBlur={(e) => { e.target.style.borderColor = ''; }}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div ref={contentRef}>
        {activeSection === 'teams' ? (
          loadingTeams ? (
            <DiscoverySkeleton />
          ) : filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <div key={team.id} data-reveal>
                  <TeamCard
                    team={team}
                    gameColor={selectedGame.color}
                    onApply={(t) => {
                      if (!isAuthenticated) {
                        onOpenAuth?.('player', 'login');
                        return;
                      }
                      setApplyTarget(t);
                      setApplySubmitted(false);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flux-empty-panel rounded-3xl border border-card-border py-20 text-center space-y-2">
              <Users className="w-10 h-10 text-on-surface-variant mx-auto" />
              <p className="font-display font-semibold text-on-surface-variant">{search ? `No teams match “${search}”` : 'No teams have been published for this game yet.'}</p>
            </div>
          )
        ) : (
          loadingTourneys ? (
            <DiscoverySkeleton />
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTournaments.map((tr) => (
                <div key={tr.id} data-reveal>
                  <TournamentCard
                    tourney={tr}
                    gameColor={selectedGame.color}
                    onRegister={() => {
                      if (!isAuthenticated) {
                        onOpenAuth?.('org', 'login');
                      } else {
                        onSelectTab?.('tournaments');
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flux-empty-panel rounded-3xl border border-card-border py-20 text-center space-y-2">
              <Trophy className="w-10 h-10 text-on-surface-variant mx-auto" />
              <p className="font-display font-semibold text-on-surface-variant">No tournaments found.</p>
              <p className="font-body text-sm text-on-surface-variant">Published tournaments for this game will appear here.</p>
            </div>
          )
        )}
      </div>

      {/* ── Apply Modal ── */}
      {applyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-modal p-7 space-y-5 shadow-2xl border border-card-border">
            {!applySubmitted ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold"
                      style={{ backgroundColor: `${selectedGame.color}20`, color: selectedGame.color }}
                    >
                      {selectedGame.name}
                    </span>
                    <span className="font-mono text-xs uppercase text-secondary font-bold">Recruitment Application</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-on-surface">{applyTarget.name}</h3>
                  <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                    {applyTarget.org} · Open: {applyTarget.openRoles.join(', ')}
                  </p>
                </div>

                <form onSubmit={handleSubmitApply} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1.5">
                      Your Pitch &amp; Highlights
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Mention your in-game ID, peak rank, scrim history, VOD links..."
                      className="w-full p-3.5 rounded-xl bg-surface-container-low border border-card-border text-on-surface placeholder:text-on-surface-variant focus:outline-none text-sm font-body"
                      onFocus={(e) => { e.target.style.borderColor = selectedGame.color; }}
                      onBlur={(e) => { e.target.style.borderColor = ''; }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setApplyTarget(null)}
                      className="px-4 py-2.5 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-display font-bold text-sm uppercase tracking-wider active:scale-95 transition-all"
                      style={{ backgroundColor: selectedGame.color }}
                    >
                      <Zap className="w-4 h-4" />
                      Send Application
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="font-display font-bold text-xl text-secondary">Application Sent!</h4>
                <p className="font-body text-sm text-on-surface-variant">
                  The org will review your pitch within 4 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
