import React, { useState, useRef } from 'react';
import { Search, Users, Trophy, CheckCircle2, ChevronRight, Sparkles, ArrowLeft, Shield, Zap } from 'lucide-react';
import { useGSAPReveal } from '../../hooks/useGSAP';

/* ═══════════════════════════════════════════════════════
   DUMMY DATA
═══════════════════════════════════════════════════════ */
const GAMES = [
  {
    id: 'valorant',
    name: 'VALORANT',
    publisher: 'Riot Games',
    genre: 'Tactical FPS',
    activePlayers: '8,200+',
    activeTeams: 312,
    activeTournaments: 14,
    prizePools: '₹32L+',
    color: '#ff4655',
    gradient: 'from-[#ff4655]/30 via-[#ff4655]/5 to-transparent',
    border: 'border-[#ff4655]/30 hover:border-[#ff4655]/70',
    badge: 'bg-[#ff4655]/15 text-[#ff4655]',
    description: "Precision 5v5 character-based tactical shooter with abilities. India's fastest growing FPS esport.",
    logo: '⚡',
    tag: 'HOT',
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    publisher: 'Krafton',
    genre: 'Battle Royale',
    activePlayers: '12,400+',
    activeTeams: 540,
    activeTournaments: 22,
    prizePools: '₹58L+',
    color: '#f5a623',
    gradient: 'from-[#f5a623]/30 via-[#f5a623]/5 to-transparent',
    border: 'border-[#f5a623]/30 hover:border-[#f5a623]/70',
    badge: 'bg-[#f5a623]/15 text-[#f5a623]',
    description: 'Battlegrounds Mobile India — the most popular competitive mobile battle royale in India.',
    logo: '🔫',
    tag: '#1 IN INDIA',
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    publisher: 'Garena',
    genre: 'Battle Royale',
    activePlayers: '9,800+',
    activeTeams: 410,
    activeTournaments: 18,
    prizePools: '₹24L+',
    color: '#ff6b00',
    gradient: 'from-[#ff6b00]/30 via-[#ff6b00]/5 to-transparent',
    border: 'border-[#ff6b00]/30 hover:border-[#ff6b00]/70',
    badge: 'bg-[#ff6b00]/15 text-[#ff6b00]',
    description: 'Fast-paced survival shooter designed for mobile — massive player base across tier 2 & 3 Indian cities.',
    logo: '🔥',
    tag: 'RISING',
  },
  {
    id: 'coc',
    name: 'Clash of Clans',
    publisher: 'Supercell',
    genre: 'Strategy',
    activePlayers: '6,100+',
    activeTeams: 280,
    activeTournaments: 12,
    prizePools: '₹18L+',
    color: '#4db6ac',
    gradient: 'from-[#4db6ac]/30 via-[#4db6ac]/5 to-transparent',
    border: 'border-[#4db6ac]/30 hover:border-[#4db6ac]/70',
    badge: 'bg-[#4db6ac]/15 text-[#4db6ac]',
    description: 'Clan Wars, Trophy Pushing, and Legend League — the original mobile strategy esport.',
    logo: '🏰',
    tag: 'LEGENDS',
  },
  {
    id: 'cr',
    name: 'Clash Royale',
    publisher: 'Supercell',
    genre: 'Strategy / Card',
    activePlayers: '4,600+',
    activeTeams: 195,
    activeTournaments: 9,
    prizePools: '₹14L+',
    color: '#7e57c2',
    gradient: 'from-[#7e57c2]/30 via-[#7e57c2]/5 to-transparent',
    border: 'border-[#7e57c2]/30 hover:border-[#7e57c2]/70',
    badge: 'bg-[#7e57c2]/15 text-[#7e57c2]',
    description: 'Real-time deck-building card battles — Crown Championships and 1v1 ladder glory.',
    logo: '👑',
    tag: 'CROWN CUP',
  },
  {
    id: 'cod',
    name: 'Call of Duty',
    publisher: 'Activision',
    genre: 'FPS / BR',
    activePlayers: '5,300+',
    activeTeams: 224,
    activeTournaments: 11,
    prizePools: '₹22L+',
    color: '#4caf50',
    gradient: 'from-[#4caf50]/30 via-[#4caf50]/5 to-transparent',
    border: 'border-[#4caf50]/30 hover:border-[#4caf50]/70',
    badge: 'bg-[#4caf50]/15 text-[#4caf50]',
    description: 'COD Mobile + Warzone — 5v5 Multiplayer and Battle Royale on mobile & PC.',
    logo: '💀',
    tag: 'WARZONE',
  },
];

const TEAMS_BY_GAME = {
  valorant: [
    { id: 't1', name: 'Global Esports Red', org: 'Global Esports', verified: true, status: 'active', roster: 5, winrate: '74%', openRoles: ['Initiator'], division: 'VCT India — Tier 1' },
    { id: 't2', name: 'Velocity Gaming', org: 'Velocity', verified: true, status: 'active', roster: 4, winrate: '70%', openRoles: ['Controller', 'Flex'], division: 'VCT India — Tier 1' },
    { id: 't3', name: 'Enigma Gaming', org: 'Enigma', verified: true, status: 'active', roster: 5, winrate: '66%', openRoles: [], division: 'VCT India — Tier 1' },
    { id: 't4', name: 'Revenant XSpark', org: 'Revenant', verified: true, status: 'active', roster: 5, winrate: '62%', openRoles: ['Duelist'], division: 'VCT India — Tier 2' },
    { id: 't5', name: 'Team Brutality', org: 'Brutality eSports', verified: false, status: 'draft', roster: 3, winrate: '55%', openRoles: ['IGL', 'Sentinel'], division: 'Open Qualifier' },
    { id: 't6', name: 'Neon Protocol IN', org: 'Neon Esports', verified: false, status: 'draft', roster: 2, winrate: '48%', openRoles: ['Duelist', 'Controller', 'Initiator'], division: 'Tier 3' },
  ],
  bgmi: [
    { id: 't7', name: 'Team Soul', org: 'S8UL', verified: true, status: 'active', roster: 4, winrate: '82%', openRoles: [], division: 'BMPS Season 4 — Grand Final' },
    { id: 't8', name: 'Godlike Esports', org: 'Godlike', verified: true, status: 'active', roster: 4, winrate: '78%', openRoles: [], division: 'BMPS Season 4 — Grand Final' },
    { id: 't9', name: 'OR Esports', org: 'OR', verified: true, status: 'active', roster: 4, winrate: '73%', openRoles: ['Fragger'], division: 'BMPS Season 4' },
    { id: 't10', name: 'Team XO', org: 'XO Esports', verified: true, status: 'active', roster: 4, winrate: '68%', openRoles: ['IGL'], division: 'BMPS Season 4' },
    { id: 't11', name: 'Marcos Gaming', org: 'Marcos', verified: false, status: 'active', roster: 4, winrate: '61%', openRoles: ['Support'], division: 'BMIS Qualifier' },
    { id: 't12', name: 'Blind Esports', org: 'Blind', verified: false, status: 'draft', roster: 3, winrate: '50%', openRoles: ['Sniper', 'Fragger'], division: 'Open Circuit' },
  ],
  freefire: [
    { id: 't13', name: 'Total Gaming Esports', org: 'Total Gaming', verified: true, status: 'active', roster: 4, winrate: '76%', openRoles: [], division: 'Free Fire India Pro — Division 1' },
    { id: 't14', name: 'AS Esports', org: 'AS Esports', verified: true, status: 'active', roster: 4, winrate: '71%', openRoles: ['Rusher'], division: 'Free Fire India Pro — Division 1' },
    { id: 't15', name: 'BTR India', org: 'BTR', verified: true, status: 'active', roster: 4, winrate: '68%', openRoles: ['Sniper'], division: 'Free Fire India Pro — Division 1' },
    { id: 't16', name: 'Neyoo Esports', org: 'Neyoo Club', verified: false, status: 'draft', roster: 3, winrate: '53%', openRoles: ['IGL', 'Support'], division: 'Tier 2 Circuit' },
  ],
  coc: [
    { id: 't17', name: 'INDIA Warriors', org: 'Warriors Clan', verified: true, status: 'active', roster: 15, winrate: '80%', openRoles: [], division: 'Legend League — Top 200 India' },
    { id: 't18', name: 'Desi Destroyers', org: 'DD Clan', verified: true, status: 'active', roster: 14, winrate: '74%', openRoles: ['TH17 Max'], division: 'Legend League' },
    { id: 't19', name: 'Royal Clan IN', org: 'Royal Esports', verified: false, status: 'active', roster: 12, winrate: '65%', openRoles: ['TH15+', 'War Hero'], division: 'Platinum War League' },
    { id: 't20', name: 'Storm Clan India', org: 'Storm', verified: false, status: 'draft', roster: 8, winrate: '52%', openRoles: ['TH14+', 'TH15+', 'TH16+'], division: 'Open Clan Wars' },
  ],
  cr: [
    { id: 't21', name: 'Phoenix Force CR', org: 'Phoenix eSports', verified: true, status: 'active', roster: 1, winrate: '79%', openRoles: [], division: 'Ultimate Championship — India Top 50' },
    { id: 't22', name: 'Crown Raiders', org: 'CR Squad', verified: true, status: 'active', roster: 1, winrate: '72%', openRoles: [], division: 'Ultimate Championship' },
    { id: 't23', name: 'Clash Kings IN', org: 'Kings Club', verified: false, status: 'active', roster: 1, winrate: '64%', openRoles: ['1v1 Dueler'], division: 'Crown Championship Qualifier' },
    { id: 't24', name: 'Ladder Legends', org: 'LL Esports', verified: false, status: 'draft', roster: 1, winrate: '56%', openRoles: ['Deck Builder Specialist'], division: 'Open Ladder' },
  ],
  cod: [
    { id: 't25', name: 'SynerGY India', org: 'SynerGY', verified: true, status: 'active', roster: 5, winrate: '75%', openRoles: ['Sniper'], division: 'COD Mobile World — India Region' },
    { id: 't26', name: 'Team IND CoD', org: 'IND Esports', verified: true, status: 'active', roster: 5, winrate: '69%', openRoles: ['SMG Rusher'], division: 'COD Mobile World — India Region' },
    { id: 't27', name: 'Warzone Wolves', org: 'WZ Wolves', verified: false, status: 'active', roster: 4, winrate: '63%', openRoles: ['AR / IGL'], division: 'Regional Qualifier' },
    { id: 't28', name: 'Phantom Squad IN', org: 'Phantom Club', verified: false, status: 'draft', roster: 3, winrate: '51%', openRoles: ['Sniper', 'Support', 'AR'], division: 'Open Bracket' },
  ],
};

const TOURNAMENTS_BY_GAME = {
  valorant: [
    { id: 'tr1', name: "Gamers'G VCT India Open #5", status: 'ongoing', prize: '₹5,00,000', maxTeams: 16, registered: 16, startDate: '2026-10-19', format: 'Double Elimination' },
    { id: 'tr2', name: 'India Valorant Invitational 2026', status: 'upcoming', prize: '₹2,00,000', maxTeams: 32, registered: 24, startDate: '2026-11-05', format: 'Swiss + Playoffs' },
    { id: 'tr3', name: 'VCT India Qualifier — Stage 3', status: 'upcoming', prize: '₹10,00,000', maxTeams: 8, registered: 6, startDate: '2026-11-20', format: 'Best of 5' },
  ],
  bgmi: [
    { id: 'tr4', name: "Gamers'G BGMI Pro Series S2", status: 'ongoing', prize: '₹15,00,000', maxTeams: 24, registered: 24, startDate: '2026-10-18', format: 'BMPS Format — Survival Scoring' },
    { id: 'tr5', name: 'BGMI Masters Open — Winter', status: 'upcoming', prize: '₹5,00,000', maxTeams: 32, registered: 18, startDate: '2026-11-12', format: 'Battle Royale — Top 16 Finals' },
    { id: 'tr6', name: 'Krafton India Invitational', status: 'upcoming', prize: '₹25,00,000', maxTeams: 16, registered: 9, startDate: '2026-12-05', format: 'LAN — Survival + Chicken Dinner Scoring' },
  ],
  freefire: [
    { id: 'tr7', name: "Gamers'G Free Fire Clash Cup #3", status: 'upcoming', prize: '₹3,00,000', maxTeams: 20, registered: 14, startDate: '2026-11-08', format: 'BR Survival Scoring' },
    { id: 'tr8', name: 'FFIC Summer Qualifier 2026', status: 'upcoming', prize: '₹8,00,000', maxTeams: 12, registered: 8, startDate: '2026-11-22', format: 'Free Fire India Championship Format' },
    { id: 'tr9', name: 'Garena Free Fire India Pro League', status: 'ongoing', prize: '₹6,00,000', maxTeams: 16, registered: 16, startDate: '2026-10-15', format: 'League Stage + Playoffs' },
  ],
  coc: [
    { id: 'tr10', name: "Gamers'G Clash of Clans War Cup", status: 'upcoming', prize: '₹2,50,000', maxTeams: 32, registered: 21, startDate: '2026-11-10', format: 'Clan War League Format' },
    { id: 'tr11', name: 'India CWL Open 2026', status: 'upcoming', prize: '₹1,50,000', maxTeams: 16, registered: 11, startDate: '2026-11-28', format: 'Round Robin + Knockout' },
    { id: 'tr12', name: 'Legend League Invitational', status: 'upcoming', prize: '₹5,00,000', maxTeams: 8, registered: 4, startDate: '2026-12-10', format: 'Seeded Bracket — TH17 Only' },
  ],
  cr: [
    { id: 'tr13', name: "Gamers'G Crown Championship India", status: 'upcoming', prize: '₹2,00,000', maxTeams: 64, registered: 48, startDate: '2026-11-15', format: '1v1 Single Elimination' },
    { id: 'tr14', name: 'Clash Royale Ultimate League — India', status: 'ongoing', prize: '₹1,00,000', maxTeams: 32, registered: 32, startDate: '2026-10-20', format: '1v1 Round Robin + Finals' },
    { id: 'tr15', name: 'Supercell Crown Cup — South Asia', status: 'upcoming', prize: '₹8,00,000', maxTeams: 16, registered: 7, startDate: '2026-12-01', format: 'Seeded 1v1 Bracket — Top 16 Ladder' },
  ],
  cod: [
    { id: 'tr16', name: "Gamers'G COD Mobile Open #4", status: 'ongoing', prize: '₹3,50,000', maxTeams: 16, registered: 16, startDate: '2026-10-17', format: '5v5 Hardpoint + S&D' },
    { id: 'tr17', name: 'COD Mobile India Championship 2026', status: 'upcoming', prize: '₹7,00,000', maxTeams: 24, registered: 15, startDate: '2026-11-18', format: 'Group Stage + BO5 Finals' },
    { id: 'tr18', name: 'Activision India Warzone Invitational', status: 'upcoming', prize: '₹12,00,000', maxTeams: 20, registered: 8, startDate: '2026-12-08', format: 'BR Quads — Top 5 Scoring' },
  ],
};

/* ═══════════════════════════════════════════════════════
   GAME SELECTION CARD
═══════════════════════════════════════════════════════ */
function GameCard({ game, onSelect }) {
  return (
    <button
      onClick={() => onSelect(game)}
      className={`relative group w-full text-left p-5 rounded-2xl bg-surface-container-low border ${game.border} transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
    >
      {/* Background gradient glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Game logo */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-card-border"
            style={{ backgroundColor: `${game.color}18` }}
          >
            {game.logo}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-lg text-on-surface">{game.name}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${game.badge}`}>
                {game.genre}
              </span>
              {game.tag && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-surface-container-high text-on-surface-variant border border-card-border">
                  {game.tag}
                </span>
              )}
            </div>
            <p className="font-body text-xs text-on-surface-variant line-clamp-1 max-w-[260px]">
              {game.description}
            </p>
            <span className="font-mono text-[10px] text-on-surface-variant">{game.publisher}</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-on-surface group-hover:translate-x-1 transition-all shrink-0 mt-1" />
      </div>

      {/* Stats row */}
      <div className="relative z-10 mt-4 pt-3 border-t border-card-border grid grid-cols-4 gap-2">
        {[
          { v: game.activePlayers, l: 'Players' },
          { v: game.activeTeams, l: 'Teams' },
          { v: game.activeTournaments, l: 'Tourneys' },
          { v: game.prizePools, l: 'Prize Pool' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div
              className="font-display font-bold text-sm text-on-surface"
              style={{ color: i === 3 ? game.color : undefined }}
            >
              {s.v}
            </div>
            <div className="font-mono text-[9px] uppercase text-on-surface-variant tracking-wide">{s.l}</div>
          </div>
        ))}
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
            {team.status === 'active' ? '● Active' : '○ Draft'}
          </span>
          {team.verified && <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" title="Verified" />}
        </div>

        {/* Name + org */}
        <div>
          <h3 className="font-display font-bold text-lg text-on-surface">{team.name}</h3>
          <p className="font-mono text-xs text-on-surface-variant">{team.org} · {team.division}</p>
        </div>

        {/* Roster + Winrate */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-surface-container text-center">
            <div className="font-display font-bold text-base text-on-surface">{team.roster}</div>
            <div className="font-mono text-[10px] text-on-surface-variant uppercase">Roster</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container text-center">
            <div className="font-display font-bold text-base text-secondary">{team.winrate}</div>
            <div className="font-mono text-[10px] text-on-surface-variant uppercase">Win Rate</div>
          </div>
        </div>

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
        ) : (
          <span className="text-[11px] font-mono text-on-surface-variant">Full Roster — No Openings</span>
        )}
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
            View Team →
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOURNAMENT CARD
═══════════════════════════════════════════════════════ */
function TournamentCard({ tourney, gameColor }) {
  const fillPct = Math.round((tourney.registered / tourney.maxTeams) * 100);
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
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-tertiary" />
          <span className="font-display font-bold text-lg text-tertiary">{tourney.prize}</span>
        </div>

        {/* Registration progress */}
        <div className="space-y-1">
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
        </div>

        <div className="font-mono text-xs text-on-surface-variant">
          📅 {new Date(tourney.startDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4 mt-2 border-t border-card-border">
        <button
          disabled={fillPct >= 100}
          className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: fillPct >= 100 ? 'var(--color-surface-container-high)' : (gameColor || 'var(--color-secondary-container)') }}
        >
          {fillPct >= 100 ? 'Registration Closed' : 'Register Team →'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DISCOVERY PAGE
═══════════════════════════════════════════════════════ */
export default function DiscoveryPage({ onSelectTab }) {
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

  const teams = selectedGame ? (TEAMS_BY_GAME[selectedGame.id] || []) : [];
  const tournaments = selectedGame ? (TOURNAMENTS_BY_GAME[selectedGame.id] || []) : [];

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

  const handleSubmitApply = (e) => {
    e.preventDefault();
    setApplySubmitted(true);
    setTimeout(() => {
      setApplyTarget(null);
      setPitch('');
      setApplySubmitted(false);
    }, 1800);
  };

  /* ── GAME SELECTION VIEW ────────────────────────────── */
  if (!selectedGame) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-secondary font-bold">PRO ROSTER GATEWAY</span>
            <span className="font-mono text-xs text-on-surface-variant">· Season 2026 // Live</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-on-surface">
            Choose Your <span className="gradient-text">Game</span>
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Select a title to explore verified team rosters, open recruitment roles, and live tournament brackets.
          </p>
        </div>

        {/* Live telemetry bar */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-card-border overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">Scout Radar Engaged</span>
          </div>
          <div className="h-4 w-px bg-card-border shrink-0" />
          {[
            { label: 'Total Players', value: '38,100+', color: 'text-secondary' },
            { label: 'Active Teams', value: '1,961+', color: 'text-primary' },
            { label: 'Live Tourneys', value: '86', color: 'text-error' },
            { label: 'Prize Pool', value: '₹1.68 Cr+', color: 'text-tertiary' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center shrink-0 px-2">
              <span className={`font-display font-bold text-base ${s.color}`}>{s.value}</span>
              <span className="font-mono text-[9px] text-on-surface-variant uppercase">{s.label}</span>
            </div>
          ))}
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Game hero banner */}
      <div
        className="relative overflow-hidden rounded-3xl border border-card-border p-6 sm:p-8"
        style={{ background: `linear-gradient(135deg, ${selectedGame.color}18 0%, var(--color-surface-container-low) 100%)` }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20"
          style={{ background: selectedGame.color }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-mono text-xs uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Games
            </button>

            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border border-card-border"
                style={{ backgroundColor: `${selectedGame.color}20` }}
              >
                {selectedGame.logo}
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-on-surface">{selectedGame.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold ${selectedGame.badge}`}>
                    {selectedGame.genre}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">{selectedGame.publisher}</span>
                  {selectedGame.tag && (
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-card-border">
                      {selectedGame.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 shrink-0">
            {[
              { v: selectedGame.activePlayers, l: 'Players' },
              { v: selectedGame.activeTeams, l: 'Teams' },
              { v: selectedGame.activeTournaments, l: 'Tourneys' },
              { v: selectedGame.prizePools, l: 'Prize Pool' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-container/60 backdrop-blur-sm border border-card-border text-center min-w-[60px]">
                <div
                  className="font-display font-bold text-base text-on-surface"
                  style={{ color: i === 3 ? selectedGame.color : undefined }}
                >
                  {s.v}
                </div>
                <div className="font-mono text-[9px] text-on-surface-variant uppercase">{s.l}</div>
              </div>
            ))}
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
            Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveSection('tournaments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display text-sm font-bold uppercase tracking-wide transition-all ${
              activeSection === 'tournaments' ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}
            style={activeSection === 'tournaments' ? { backgroundColor: selectedGame.color } : {}}
          >
            <Trophy className="w-4 h-4" />
            Tournaments ({tournaments.length})
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
          filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <div key={team.id} data-reveal>
                  <TeamCard
                    team={team}
                    gameColor={selectedGame.color}
                    onApply={(t) => { setApplyTarget(t); setApplySubmitted(false); }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <Users className="w-10 h-10 text-on-surface-variant mx-auto" />
              <p className="font-display font-semibold text-on-surface-variant">No teams found for &ldquo;{search}&rdquo;</p>
            </div>
          )
        ) : (
          filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTournaments.map((tr) => (
                <div key={tr.id} data-reveal>
                  <TournamentCard tourney={tr} gameColor={selectedGame.color} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <Trophy className="w-10 h-10 text-on-surface-variant mx-auto" />
              <p className="font-display font-semibold text-on-surface-variant">No tournaments found.</p>
              <p className="font-body text-sm text-on-surface-variant">New brackets drop weekly — check back soon.</p>
            </div>
          )
        )}
      </div>

      {/* Pagination hint */}
      {((activeSection === 'teams' && filteredTeams.length >= 4) ||
        (activeSection === 'tournaments' && filteredTournaments.length >= 3)) && (
        <div className="text-center py-4 font-mono text-xs text-on-surface-variant">
          <span className="font-bold" style={{ color: selectedGame.color }}>
            {activeSection === 'teams' ? filteredTeams.length : filteredTournaments.length} {activeSection}
          </span>
          {' '}· Index synced · Low Latency Active
        </div>
      )}

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
