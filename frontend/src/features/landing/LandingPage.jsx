import React, { useRef, useState, useEffect } from 'react';
import useHeroThreeJS from '../../hooks/useHeroThreeJS';
import { useGSAPReveal, useCounterGSAP, useMarqueeTicker } from '../../hooks/useGSAP';
import { useTheme } from '../../stores/themeContext';
import { useAuth } from '../../stores/authContext';
import useApi from '../../hooks/useApi';
import {
  Gamepad2, Shield, Trophy, Radio, ChevronRight, ShieldCheck, Zap,
  Swords, Users, Star, MessageSquare, TrendingUp, Play, ArrowRight,
  Cpu, Target, Globe2, CheckCircle2, ChevronDown, ChevronUp, Lock,
  Award, Sparkles, Flame, Eye, Calendar, Clock, Crosshair, HelpCircle,
  User, Loader2, Activity
} from 'lucide-react';

/* ── Live Match Ticker Data (static — no live match endpoint yet) ── */
const TICKER_ITEMS = [
  { label: 'LIVE', team1: 'Team Soul', team2: 'GodLike Esports', score: '12:9', game: 'BGMI' },
  { label: 'LIVE', team1: 'Global Esports', team2: 'Velocity Gaming', score: '2:1', game: 'VALORANT' },
  { label: 'FINAL', team1: 'Total Gaming', team2: 'AS Esports', score: '1:0', game: 'FREE FIRE' },
  { label: 'UPCOMING', team1: 'Revenant Esports', team2: 'Entity Gaming', score: 'vs', game: 'BGMI' },
  { label: 'LIVE', team1: 'True Rippers', team2: 'Medal Esports', score: '11:10', game: 'CS2' },
  { label: 'UPCOMING', team1: 'SynerGY Esports', team2: 'Team IND CoD', score: 'vs', game: 'COD MOBILE' },
];

/* ── Broad Marquee Showcase Data: Tournaments ── */
const MARQUEE_TOURNAMENTS = [
  {
    id: 't-1',
    title: 'VCT South Asia Pro Series',
    game: 'VALORANT',
    badge: 'VCT SANCTIONED',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    status: 'REGISTRATIONS OPEN',
    statusType: 'open',
    prizePool: '₹10,00,000',
    slots: '58/64 Squads',
    format: '5v5 Single Elimination',
    time: 'Starts Saturday · 16:00 IST',
    ctaText: 'Register Roster',
  },
  {
    id: 't-2',
    title: 'BMPS Pro Masters Championship',
    game: 'BGMI',
    badge: 'OFFICIAL MAJOR',
    badgeColor: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    status: 'GRAND FINALS LIVE',
    statusType: 'live',
    prizePool: '₹15,00,000',
    slots: '32/32 Teams Locked',
    format: 'Battle Royale 6 Matches',
    time: 'Map 4 in Progress',
    ctaText: 'Watch Live Stream',
  },
  {
    id: 't-3',
    title: 'CS2 South Asia Open Cup',
    game: 'CS2',
    badge: 'VALVE PROTOCOL',
    badgeColor: 'bg-secondary/10 text-secondary border-secondary/20',
    status: 'REGISTRATIONS OPEN',
    statusType: 'open',
    prizePool: '₹5,00,000',
    slots: '28/32 Teams',
    format: 'MR12 Double Elim',
    time: 'Friday · 18:00 IST',
    ctaText: 'Enter Bracket',
  },
  {
    id: 't-4',
    title: 'Free Fire Winter Clash 2026',
    game: 'FREE FIRE',
    badge: 'PRO GUILD CUP',
    badgeColor: 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20',
    status: 'CHECK-IN OPEN',
    statusType: 'open',
    prizePool: '₹2,50,000',
    slots: '44/48 Squads',
    format: 'Bermuda + Purgatory',
    time: 'Sunday · 15:00 IST',
    ctaText: 'Register Guild',
  },
  {
    id: 't-5',
    title: 'CoD Mobile National Invitational',
    game: 'COD MOBILE',
    badge: 'ACTIVISION TIER-1',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    status: 'SEEDS LOCKED',
    statusType: 'upcoming',
    prizePool: '₹3,00,000',
    slots: '16/16 Roster Pass',
    format: 'Hardpoint & S&D',
    time: 'Tonight · 20:00 IST',
    ctaText: 'View Bracket',
  },
];

/* ── Broad Marquee Showcase Data: Daily Scrims ── */
const MARQUEE_SCRIMS = [
  {
    id: 's-1',
    title: 'BMPS Tier-1 Erangel Practice #412',
    game: 'BGMI',
    badge: 'PRO SCRIM ROOM',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    status: 'PIN IN 04:32',
    statusType: 'scrim',
    slots: '18/20 Squads Locked',
    server: 'Asia-South1 · 12ms',
    format: 'Esports Standard Points',
    ctaText: 'Book Team Slot',
  },
  {
    id: 's-2',
    title: 'Ascent & Haven 5v5 High-ELO Customs',
    game: 'VALORANT',
    badge: 'IMMORTAL+ LOBBY',
    badgeColor: 'bg-secondary/10 text-secondary border-secondary/20',
    status: 'LOBBY READY',
    statusType: 'live',
    slots: '10/10 Athletes Checked In',
    server: 'Mumbai AWS · 14ms',
    format: 'Standard Competitive Rules',
    ctaText: 'View Lobby',
  },
  {
    id: 's-3',
    title: 'Miramar Evening Clan Scrims #08',
    game: 'BGMI',
    badge: 'VERIFIED TEAMS',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    status: 'PIN RELEASING 19:50',
    statusType: 'scrim',
    slots: '16/20 Squads',
    server: 'Asia-South1 · 12ms',
    format: '4 Squad Slots Open',
    ctaText: 'Reserve Slot',
  },
  {
    id: 's-4',
    title: 'Dust II / Mirage 5v5 Premier Scrim',
    game: 'CS2',
    badge: '128-TICK MATCH',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    status: 'SERVER OPEN',
    statusType: 'open',
    slots: '8/10 Ready',
    server: 'Direct Connect Console',
    format: 'Knife Round for Sides',
    ctaText: 'Join Match',
  },
  {
    id: 's-5',
    title: 'Bermuda Fast Cup 4v4 Clash Squad',
    game: 'FREE FIRE',
    badge: 'CUSTOM ROOM ID',
    badgeColor: 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20',
    status: 'DROPS IN 15 MIN',
    statusType: 'scrim',
    slots: '11/12 Squads',
    server: 'India Regional Mesh',
    format: 'Best of 7 Rounds',
    ctaText: 'Enter Room',
  },
];

/* ── Core Platform Pillars ── */
const PLATFORM_PILLARS = [
  {
    id: 'scrims',
    title: 'Automated Daily Scrims',
    tagline: '24/7 TIER-1 PRACTICE',
    description:
      'Compete in scheduled practice lobbies with automated slot management. Room ID and confidential password dispatched directly to verified team captains 10 minutes before drop.',
    icon: Flame,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-500 dark:text-amber-400',
    badge: 'Instant Room Credentials',
    features: [
      'Automated slot reservation for registered rosters',
      'Confidential Room ID/Password delivery to captains',
      'Real-time slot occupancy and drop timers',
      'Automated screenshot proof & dispute resolution',
    ],
    metric: '120+',
    metricLabel: 'Daily Match Rooms',
  },
  {
    id: 'tournaments',
    title: 'Verified Tournaments & Escrow',
    tagline: 'GUARANTEED PRIZE POOLS',
    description:
      'Participate in high-stakes official championships and community cups. Single elimination, double elimination, Swiss, and Battle Royale points tables with automated bracket generation.',
    icon: Trophy,
    color: 'from-primary/20 to-secondary/20 text-primary border-primary/30',
    iconColor: 'text-primary',
    badge: 'Escrow Protected',
    features: [
      'Multi-format brackets (Single/Double Elim, Swiss, BR Matrix)',
      'Smart-contract & escrowed prize pool guarantee',
      'Zero-latency live scoreboards and round progressions',
      'Official seedings and automated match scheduling',
    ],
    metric: '$250K+',
    metricLabel: 'Prize Pool Distributed',
  },
  {
    id: 'teams',
    title: 'Clan Hub & Squad Management',
    tagline: 'ROSTER LOCK PROTOCOL',
    description:
      'Build your esports franchise or grassroots squad in seconds. Create team tags, assign captain privileges, invite players, lock lineups for match day, and track collective win rates.',
    icon: Users,
    color: 'from-secondary/20 to-primary/20 text-secondary border-secondary/30',
    iconColor: 'text-secondary',
    badge: 'Lineup Lock Protocol',
    features: [
      'One-click squad creation with custom tags and logos',
      'Captain role delegation and player invitation codes',
      'Official roster lock mechanism prior to tournament check-in',
      'Team analytics, scrim match records, and win-rate curves',
    ],
    metric: '840+',
    metricLabel: 'Active Roster Squads',
  },
  {
    id: 'scouting',
    title: 'Org Scouting & Tryouts',
    tagline: 'TALENT RADAR',
    description:
      'Direct pipeline to certified Esports Organizations like S8UL, GodLike, and Global Esports. Filter free agents by rank, K/D, and play hours, or submit video tryout dossiers to open recruitment calls.',
    icon: Target,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'Pro Contract Pipeline',
    features: [
      'Direct application to verified Esports Organizations',
      'Talent Radar for scouts to discover high-ELO free agents',
      'Video-linked tryout dossiers with timestamped VODs',
      'State-machine application tracking (Submitted -> Shortlisted -> Signed)',
    ],
    metric: '35+',
    metricLabel: 'Verified Esports Orgs',
  },
  {
    id: 'passport',
    title: 'Universal Gamer Passport',
    tagline: 'VERIFIED CREDENTIALS',
    description:
      'Your digital esports identity. Sync your Riot Games, Steam, and BGMI IDs. Showcase your verified in-game statistics, tournament trophies, past teams, and anti-cheat verification status.',
    icon: ShieldCheck,
    color: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    badge: 'Anti-Cheat Verified',
    features: [
      'Multi-game UID sync (Steam, Riot ID, BGMI UID, Free Fire)',
      'Verified K/D, win rates, and competitive rank badges',
      'Tournament history showcase with verified medal records',
      'Anti-cheat trust score and sportsmanship integrity rating',
    ],
    metric: '14.2K+',
    metricLabel: 'Athlete Passports',
  },
  {
    id: 'organizers',
    title: 'Organizer & Host Suite',
    tagline: 'COMMUNITY COMMAND',
    description:
      'Comprehensive toolkit for community hosts and tournament organizers. Launch custom tournaments, provision private scrim rooms, manage bracket seedings, and stream live brackets to fans.',
    icon: Swords,
    color: 'from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badge: 'Host Control Suite',
    features: [
      'Automated bracket builder and seeding wizard',
      'Dedicated host lobby management with custom credentials',
      'Dispute resolution panel with platform admin escalation',
      'OBS overlay-ready live bracket feeds and score feeds',
    ],
    metric: '48+',
    metricLabel: 'Certified Hosts',
  },
];

/* ── Interactive Showcase Tab Data ── */
const SHOWCASE_TABS = [
  { id: 'tournaments', label: 'Live Tournaments', icon: Trophy },
  { id: 'scrims', label: 'Daily Scrim Lobbies', icon: Flame },
  { id: 'teams', label: 'Top Competitive Rosters', icon: Users },
  { id: 'orgs', label: 'Verified Esports Orgs', icon: Shield },
];

const SAMPLE_TOURNAMENTS = [
  {
    id: 1,
    title: 'BGMI Pro Invitational Winter 2026',
    game: 'BGMI',
    format: 'Battle Royale · 24 Squads',
    prize: '$12,000 / ₹10,00,000',
    status: 'REGISTRATION CLOSING',
    statusColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    teams: '21 / 24 Registered',
    entry: 'Free / ELO Verified',
    startsIn: 'Tomorrow, 6:00 PM IST',
  },
  {
    id: 2,
    title: 'Valorant South Asia Challengers Open',
    game: 'VALORANT',
    format: '5v5 Double Elimination',
    prize: '$8,500 / ₹7,00,000',
    status: 'LIVE BRACKET',
    statusColor: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    teams: '32 / 32 Teams (Quarterfinals)',
    entry: 'Ascendant+ Required',
    startsIn: 'In Progress (Round of 8)',
  },
  {
    id: 3,
    title: 'Free Fire MAX Masters Cup S4',
    game: 'FREE FIRE',
    format: 'Clash Squad & BR Matrix',
    prize: '$5,000 / ₹4,00,000',
    status: 'CHECK-IN OPEN',
    statusColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    teams: '44 / 48 Squads',
    entry: 'Free Entry',
    startsIn: 'Starts in 3h 45m',
  },
];

const SAMPLE_SCRIMS = [
  {
    id: 's1',
    title: 'Tier-1 BGMI Pro Scrim Lobby [Room #409]',
    game: 'BGMI',
    map: 'Erangel & Miramar (2 Matches)',
    tier: 'Tier 1 Roster Required',
    slots: '18 / 20 Filled',
    time: 'Tonight, 8:30 PM IST',
    status: 'Slots Open (2 Remaining)',
  },
  {
    id: 's2',
    title: 'Valorant Radiant / Immortal Custom Scrims',
    game: 'VALORANT',
    map: 'Ascent / Haven (BO3)',
    tier: 'Immortal 1+ Captains',
    slots: '10 / 10 Confirmed',
    time: 'Tonight, 9:00 PM IST',
    status: 'Lobby Full · Room Generated',
  },
  {
    id: 's3',
    title: 'Open Underdog Free Fire Scrim Session',
    game: 'FREE FIRE',
    map: 'Bermuda (Custom Room)',
    tier: 'Open to All Clans',
    slots: '11 / 12 Squads',
    time: 'Tonight, 10:00 PM IST',
    status: '1 Slot Remaining',
  },
];

const SAMPLE_TEAMS = [
  {
    name: 'Omega Vortex',
    tag: 'OVX',
    game: 'VALORANT',
    tier: 'Radiant Tier',
    winRate: '78.4%',
    members: 5,
    status: 'Recruiting Controller / Smokes',
  },
  {
    name: 'Reign of Havoc',
    tag: 'ROH',
    game: 'BGMI',
    tier: 'Tier 1 Pro',
    winRate: '82.1%',
    members: 4,
    status: 'Roster Locked · Season Active',
  },
  {
    name: 'Apex Titans',
    tag: 'APX',
    game: 'FREE FIRE',
    tier: 'Grandmaster',
    winRate: '71.0%',
    members: 5,
    status: 'Open Tryouts for Assaulter',
  },
];

const SAMPLE_ORGS = [
  {
    name: 'Team S8UL Esports',
    tag: 'S8UL',
    titles: ['BGMI', 'Pokemon UNITE', 'CoD Mobile'],
    badge: 'Verified Premier Org',
    openRoles: '2 Active Contract Openings',
    hq: 'Mumbai, India',
  },
  {
    name: 'GodLike Esports',
    tag: 'GODL',
    titles: ['BGMI', 'CoD Mobile', 'FIFA'],
    badge: 'Verified Premier Org',
    openRoles: 'Scouting Fragger & Sub',
    hq: 'New Delhi, India',
  },
  {
    name: 'Global Esports',
    tag: 'GE',
    titles: ['VALORANT (VCT)', 'CS2'],
    badge: 'Verified VCT Partner',
    openRoles: 'Open Roster Applications',
    hq: 'Bangalore, India',
  },
];

/* ── Supported Titles ── */
const SUPPORTED_GAMES = [
  {
    name: 'BGMI / PUBG Mobile',
    category: 'Battle Royale',
    modes: 'Squads (Erangel, Miramar, Sanhok)',
    players: '4,800+ Active Players',
    badgeColor: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10',
  },
  {
    name: 'VALORANT',
    category: 'Tactical FPS',
    modes: '5v5 Spike Defuse · Tournament Vetoes',
    players: '3,900+ Active Players',
    badgeColor: 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10',
  },
  {
    name: 'Free Fire MAX',
    category: 'Battle Royale',
    modes: 'Clash Squad 4v4 & 12-Team BR',
    players: '2,600+ Active Players',
    badgeColor: 'border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/10',
  },
  {
    name: 'Counter-Strike 2',
    category: 'Competitive FPS',
    modes: '5v5 MR12 Competitive Standard',
    players: '1,500+ Active Players',
    badgeColor: 'border-cyan-500/40 text-secondary bg-secondary/10',
  },
  {
    name: 'Call of Duty: Mobile',
    category: 'Multiplayer & BR',
    modes: 'Hardpoint, Search & Destroy, BR',
    players: '950+ Active Players',
    badgeColor: 'border-indigo-500/40 text-primary bg-primary/10',
  },
  {
    name: 'Clash Royale',
    category: 'Strategy & Mobile Arena',
    modes: '1v1 Duel & King of the Hill',
    players: '650+ Active Players',
    badgeColor: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  },
];

/* ── 4-Step Journey ── */
const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Instant, friction-free registration with just your email and password. No credit card, no complex barriers.',
    icon: User,
  },
  {
    step: '02',
    title: 'Build Your Gamer Passport',
    description: 'Link your game UIDs, IGNs, and primary competitive roles. Your verified stats become your public esports resume.',
    icon: ShieldCheck,
  },
  {
    step: '03',
    title: 'Form or Join a Squad',
    description: 'Assemble your clan with custom tags and logos, or apply to open tryouts posted by verified Esports Organizations.',
    icon: Users,
  },
  {
    step: '04',
    title: 'Compete & Claim Rewards',
    description: 'Check in to automated daily scrims, qualify for high-tier tournaments, and receive verified escrow prize payouts.',
    icon: Trophy,
  },
];

/* ── FAQ Items ── */
const FAQ_ITEMS = [
  {
    q: 'Is Gamers\'G free for competitive players and squads?',
    a: 'Yes! Creating an account, building your Gamer Passport, forming a team, and participating in open community tournaments and practice scrims is 100% free. Certain sponsored invitationals and high-stakes leagues may have specific ELO thresholds or tournament entry requirements.',
  },
  {
    q: 'How does the automated daily scrim room system work?',
    a: 'Tournament Organizers and certified hosts schedule scrim lobbies on the platform. When team captains register their roster and check in, the system automatically dispatches the custom Room ID and confidential Password directly to the captain\'s dashboard 10 minutes prior to match launch.',
  },
  {
    q: 'How do Esports Organizations recruit players on the platform?',
    a: 'Verified Orgs (such as S8UL, GodLike, and Global Esports) post official recruitment calls specifying agent roles, play hours, and minimum rank. Players submit video-linked tryout dossiers. Org managers can review, shortlist, and approve contracts through a dedicated dashboard pipeline.',
  },
  {
    q: 'How are tournament prize pools guaranteed and paid out?',
    a: 'All official tournament prize pools are held in escrow before the tournament kicks off. Once the final match finishes and screenshots/VODs are verified by match referees, prize funds are released directly to the winning teams and players without unnecessary delays.',
  },
  {
    q: 'What anti-cheat and fair-play mechanisms are enforced?',
    a: 'Gamers\'G enforces strict anti-cheat policies, including in-game UID verification, match screenshot submission, video proof requirements on disputed rounds, and hardware-level identity binding. Players found cheating face permanent hardware and platform bans across all titles.',
  },
  {
    q: 'Can community tournament organizers host their own events?',
    a: 'Absolutely. Anyone can apply for a Tournament Organizer role from their dashboard. Once authorized, hosts can generate automated brackets (Single/Double Elimination, Swiss, Battle Royale matrix), provision private scrim lobbies, and stream live match results.',
  },
];


/* ── Showcase card skeletons ── */
function ShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-3xl bg-surface-container-low border border-card-border p-6 space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 rounded-lg bg-surface-container" />
            <div className="h-5 w-24 rounded-lg bg-surface-container" />
          </div>
          <div className="h-6 w-3/4 rounded-lg bg-surface-container" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-surface-container" />
            <div className="h-4 w-5/6 rounded bg-surface-container" />
            <div className="h-4 w-4/6 rounded bg-surface-container" />
          </div>
          <div className="h-10 w-full rounded-xl bg-surface-container mt-4" />
        </div>
      ))}
    </div>
  );
}

/* ── Empty showcase state ── */
function ShowcaseEmpty({ label, onSelectTab, tabTarget }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container border border-card-border flex items-center justify-center text-on-surface-variant">
        <Trophy className="w-7 h-7" />
      </div>
      <p className="font-display font-bold text-lg text-on-surface">No {label} Yet</p>
      <p className="font-body text-xs text-on-surface-variant max-w-xs">
        Be among the first to create a {label.toLowerCase()} on the platform.
      </p>
      <button
        onClick={() => onSelectTab?.(tabTarget)}
        className="mt-2 px-6 py-3 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
      >
        Explore {label}
      </button>
    </div>
  );
}

export default function LandingPage({ onSelectTab, onOpenAuthWithRole }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canvasRef = useRef(null);
  const tickerRef = useRef(null);
  const featureRef = useRef(null);
  const stepsRef = useRef(null);

  const stat1 = useRef(null);
  const stat2 = useRef(null);
  const stat3 = useRef(null);
  const stat4 = useRef(null);

  const { user } = useAuth();
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('tournaments');
  const [openFaq, setOpenFaq] = useState(0);

  // Live Backend Data Hooks (Zero Hardcoded Lock-In)
  const { data: tournamentsData, loading: tournamentsLoading } = useApi('/discovery/tournaments', { fallback: [] });
  const { data: teamsData, loading: teamsLoading } = useApi('/discovery/teams', { fallback: [] });
  const { data: scrimsData, loading: scrimsLoading } = useApi('/tournaments/scrims', { fallback: [] });

  // Normalize API collections
  const rawTournaments = Array.isArray(tournamentsData) ? tournamentsData : (tournamentsData?.tournaments ?? tournamentsData?.data ?? []);
  const rawTeams = Array.isArray(teamsData) ? teamsData : (teamsData?.teams ?? teamsData?.data ?? []);
  const rawScrims = Array.isArray(scrimsData) ? scrimsData : (scrimsData?.scrims ?? scrimsData?.data ?? []);

  // Dynamic Marquee Lists (Populated from Live Backend with High-Impact Fallbacks)
  const dynamicMarqueeTournaments = rawTournaments.length > 0
    ? rawTournaments.map((t, idx) => ({
        id: t.id || `dyn-t-${idx}`,
        title: t.title || t.name || 'Competitive Tournament Series',
        game: (t.game || 'VALORANT').toUpperCase(),
        badge: t.verified ? 'VCT SANCTIONED' : 'OFFICIAL OPEN',
        badgeColor: 'bg-primary/10 text-primary border-primary/20',
        status: t.status === 'live' || t.status === 'ongoing' ? 'GRAND FINALS LIVE' : 'REGISTRATIONS OPEN',
        statusType: t.status === 'live' || t.status === 'ongoing' ? 'live' : 'open',
        prizePool: t.prize_pool ? (String(t.prize_pool).startsWith('₹') || String(t.prize_pool).startsWith('$') ? t.prize_pool : `₹${Number(t.prize_pool).toLocaleString('en-IN')}`) : '₹10,00,000',
        slots: t.max_teams ? `${t.current_teams || Math.floor(t.max_teams * 0.75)}/${t.max_teams} Squads` : 'Slots Open',
        format: t.format || '5v5 Single Elimination',
        time: t.start_time ? new Date(t.start_time).toLocaleDateString() : 'Starting Soon',
        ctaText: 'Register Roster',
        tab: 'tournaments',
      }))
    : MARQUEE_TOURNAMENTS;

  const dynamicMarqueeScrims = rawScrims.length > 0
    ? rawScrims.map((s, idx) => ({
        id: s.id || `dyn-s-${idx}`,
        title: s.title || `${(s.game || 'PRO').toUpperCase()} Daily Practice Lobby`,
        game: (s.game || 'BGMI').toUpperCase(),
        badge: s.room_id ? 'ROOM ACTIVE' : 'PRO SCRIM ROOM',
        badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        status: s.status === 'ready' ? 'LOBBY READY' : 'SLOTS OPEN',
        statusType: 'scrim',
        slots: `${s.registered_teams_count || 16}/${s.max_teams || 20} Squads Locked`,
        server: s.server_region || 'Asia-South1 · 12ms',
        format: s.format || 'Standard Esports Rulebook',
        ctaText: 'Book Team Slot',
        tab: 'tournaments',
      }))
    : MARQUEE_SCRIMS;

  // Dynamic Live Showcase Collections
  const liveTournaments = rawTournaments.length > 0 ? rawTournaments.slice(0, 3) : SAMPLE_TOURNAMENTS;
  const liveTeams = rawTeams.length > 0 ? rawTeams.slice(0, 3) : SAMPLE_TEAMS;
  const liveScrims = rawScrims.length > 0
    ? rawScrims.slice(0, 3).map((s) => ({
        id: s.id,
        title: s.title || `${(s.game || 'PRO').toUpperCase()} Practice Scrim Session`,
        game: (s.game || 'BGMI').toUpperCase(),
        map: s.map_name || s.format || 'Standard Competitive Rules',
        tier: s.tier || 'Verified Captains Required',
        slots: `${s.registered_teams_count || 12} / ${s.max_teams || 20} Slots`,
        time: s.scheduled_time ? new Date(s.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Tonight, 8:30 PM IST',
      }))
    : SAMPLE_SCRIMS;

  const liveOrgs = rawTeams.some((t) => t.org_id || t.org_name)
    ? rawTeams.filter((t) => t.org_name).slice(0, 3).map((t) => ({
        name: t.org_name || t.name,
        tag: t.tag || (t.org_name || t.name).slice(0, 4).toUpperCase(),
        titles: [t.game ? t.game.toUpperCase() : 'VALORANT'],
        badge: t.verified ? 'Verified Premier Org' : 'Active Esports Club',
        openRoles: t.is_recruiting ? 'Open Roster Applications' : 'Roster Active',
        hq: t.location || 'India',
      }))
    : SAMPLE_ORGS;

  // Personalized dynamic passport details
  const passportName = user?.name || user?.username || 'Verified Pro Athlete';
  const passportInitials = (passportName.replace(/[^a-zA-Z]/g, '').slice(0, 2) || 'GG').toUpperCase();
  const passportTagline = user?.tagline || `${(user?.primary_game || 'Valorant').toUpperCase()} Athlete · Verified Profile`;
  const passportLft = user?.lft_status || 'Available for Tier-1 Roster Tryouts';

  // Initialize Canvas
  useHeroThreeJS(canvasRef, isDark);

  // GSAP Animations
  useGSAPReveal(featureRef, 0);
  useGSAPReveal(stepsRef, 0);
  useMarqueeTicker(tickerRef, 40);

  // Stat Counters
  useCounterGSAP(stat1, 14200, statsVisible, '+');
  useCounterGSAP(stat2, 840, statsVisible, '+');
  useCounterGSAP(stat3, 120, statsVisible, '+');
  useCounterGSAP(stat4, 250, statsVisible, 'K+');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.25 }
    );
    if (stat1.current) observer.observe(stat1.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-surface text-on-surface transition-colors duration-200 overflow-x-hidden selection:bg-primary/30">
      {/* ══════════════════════════════════════════════════════════
          1. HERO SECTION — Cinematic Esports Arena Command Center
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Three.js Canvas Backdrop */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-60" />

        {/* Ambient Volumetric Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full bg-gradient-to-b from-primary/20 via-secondary/15 to-transparent blur-[160px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#EC4899]/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />

        {/* Center Container */}
        <div className="relative z-10 max-w-6xl mx-auto w-full text-center space-y-8">
          
          {/* Telemetry Status Capsule */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-high/70 dark:bg-white/5 border border-card-border backdrop-blur-xl shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-on-surface font-bold">
              2026 Competitive Season Active
            </span>
            <span className="text-on-surface-variant/40">|</span>
            <span className="font-mono text-xs text-secondary font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Asia-South1 Mesh (12ms)
            </span>
            <span className="text-on-surface-variant/40 hidden sm:inline">|</span>
            <span className="font-mono text-xs text-on-surface-variant hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 99.8% FairPlay HWID
            </span>
          </div>

          {/* Master Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.04] uppercase text-on-surface">
              The Premier Arena for <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#06B6D4] to-[#EC4899]">
                Competitive Esports
              </span>
            </h1>
            <p className="font-body text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Automate daily scrim lobbies, compete in escrow-guaranteed championships,
              build verified player dossiers, and get scouted by Tier-1 esports organizations.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenAuthWithRole?.('player', 'signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-[#7C3AED] to-secondary text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              <span>Enter Pro Circuit</span>
              <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => onSelectTab?.('tournaments')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface-container/80 hover:bg-surface-container-high border border-card-border text-on-surface font-display font-bold text-xs uppercase tracking-wider backdrop-blur-xl active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <Trophy className="w-4 h-4 text-secondary" />
              <span>Explore Tournaments & Scrims</span>
            </button>
          </div>

          {/* Sanctioned Games Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {[
              { name: 'VALORANT', tag: 'PC VCT' },
              { name: 'BGMI', tag: 'MOBILE' },
              { name: 'CS2', tag: 'VALVE' },
              { name: 'FREE FIRE', tag: 'PRO' },
              { name: 'COD MOBILE', tag: 'PRO' },
              { name: 'CLASH ROYALE', tag: 'SUPERCELL' },
            ].map((game) => (
              <div
                key={game.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container/60 border border-card-border text-xs font-display font-semibold text-on-surface hover:border-primary/40 transition-colors shadow-sm"
              >
                <Crosshair className="w-3 h-3 text-secondary" />
                <span>{game.name}</span>
                <span className="font-mono text-[9px] text-on-surface-variant/70 font-normal">[{game.tag}]</span>
              </div>
            ))}
          </div>

          {/* ── Broad Marquee Showcase Strip for Scrims & Tournaments ── */}
          <div className="pt-6 w-full max-w-7xl mx-auto space-y-4">
            
            {/* Telemetry Header */}
            <div className="flex items-center justify-between px-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                <span className="font-bold uppercase tracking-wider text-on-surface">
                  Live Match Circuit & Daily Scrims
                </span>
                <span className="text-on-surface-variant/50 hidden sm:inline">|</span>
                <span className="text-on-surface-variant/80 hidden sm:inline">
                  Hover to pause · Direct registration
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-tertiary font-bold hidden sm:inline-flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> ₹35,50,000 Active Escrow
                </span>
                <span className="text-secondary font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> 12ms Match Dispatch
                </span>
              </div>
            </div>

            {/* Marquee Track 1: Active & Upcoming Tournaments */}
            <div className="overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
              <div className="animate-marquee-smooth flex items-center gap-4 py-2">
                {[...dynamicMarqueeTournaments, ...dynamicMarqueeTournaments].map((t, idx) => (
                  <div
                    key={`${t.id}-${idx}`}
                    onClick={() => onSelectTab?.(t.tab || 'tournaments')}
                    className="w-[320px] sm:w-[360px] h-[155px] shrink-0 p-4 rounded-2xl bg-surface-container-low/85 hover:bg-surface-container-high border border-card-border hover:border-primary/50 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-primary/20 text-left select-none"
                  >
                    {/* Top Row: Game + Status Pill */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${t.badgeColor}`}>
                        {t.game} · {t.badge}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1 border ${
                        t.statusType === 'live'
                          ? 'bg-error/15 text-error border-error/30 animate-pulse'
                          : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      }`}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                        {t.status}
                      </span>
                    </div>

                    {/* Middle Row: Title & Prize Pool */}
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors truncate">
                        {t.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-tertiary font-extrabold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {t.prizePool} Escrow Vault
                        </span>
                        <span className="text-on-surface-variant font-medium">
                          {t.slots}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Format & Action */}
                    <div className="pt-2 border-t border-card-border flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-on-surface-variant truncate max-w-[200px]">
                        {t.time}
                      </span>
                      <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{t.ctaText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marquee Track 2 (Reverse): Daily Automated Scrim Lobbies */}
            <div className="overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
              <div className="animate-marquee-smooth-reverse flex items-center gap-4 py-2">
                {[...dynamicMarqueeScrims, ...dynamicMarqueeScrims].map((s, idx) => (
                  <div
                    key={`${s.id}-${idx}`}
                    onClick={() => onSelectTab?.(s.tab || 'tournaments')}
                    className="w-[320px] sm:w-[360px] h-[155px] shrink-0 p-4 rounded-2xl bg-surface-container-low/85 hover:bg-surface-container-high border border-card-border hover:border-secondary/50 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-secondary/20 text-left select-none"
                  >
                    {/* Top Row: Game + Status Pill */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${s.badgeColor}`}>
                        {s.game} · {s.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1 bg-secondary/15 text-secondary border border-secondary/30">
                        <Flame className="w-2.5 h-2.5" />
                        {s.status}
                      </span>
                    </div>

                    {/* Middle Row: Title & Server Telemetry */}
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-sm sm:text-base text-on-surface group-hover:text-secondary transition-colors truncate">
                        {s.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-secondary font-bold flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {s.server}
                        </span>
                        <span className="text-on-surface-variant font-medium">
                          {s.slots}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Format & Action */}
                    <div className="pt-2 border-t border-card-border flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-on-surface-variant truncate max-w-[200px]">
                        {s.format}
                      </span>
                      <span className="text-secondary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{s.ctaText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. LIVE MATCH TICKER STRIP — Broadcast Feeds
      ══════════════════════════════════════════════════════════ */}
      <div className="border-y border-card-border py-3 bg-surface-container-lowest/80 backdrop-blur-xl overflow-hidden relative z-20 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
          <div className="shrink-0 flex items-center gap-2 pr-4 border-r border-card-border">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
            </span>
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-error">
              BROADCAST CIRCUIT
            </span>
          </div>

          <div ref={tickerRef} className="flex whitespace-nowrap overflow-x-hidden">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    item.label === 'LIVE'
                      ? 'bg-error/15 text-error border border-error/30 animate-pulse'
                      : item.label === 'FINAL'
                      ? 'bg-surface-container-high text-on-surface-variant'
                      : 'bg-secondary/15 text-secondary border border-secondary/30'
                  }`}
                >
                  {item.label}
                </span>
                <span className="font-display text-xs font-bold text-on-surface">{item.team1}</span>
                <span className="font-mono text-xs font-extrabold text-secondary px-2 py-0.5 rounded bg-surface-container">{item.score}</span>
                <span className="font-display text-xs font-bold text-on-surface">{item.team2}</span>
                <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded border border-card-border">
                  {item.game}
                </span>
                <span className="text-card-border pl-4">/</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. REAL-TIME TELEMETRY BENTO BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-card-border bg-surface-container-lowest/50 backdrop-blur-xl relative" ref={stepsRef}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-card-border hover:border-primary/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Athletes</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-4 h-4" />
              </div>
            </div>
            <div ref={stat1} className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface">0</div>
            <p className="font-mono text-[11px] text-on-surface-variant">Verified Pro Players</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-card-border hover:border-secondary/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Rosters</span>
              <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div ref={stat2} className="font-display font-extrabold text-3xl sm:text-4xl text-secondary">0</div>
            <p className="font-mono text-[11px] text-on-surface-variant">Active Team Clans</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-card-border hover:border-amber-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Matches</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div ref={stat3} className="font-display font-extrabold text-3xl sm:text-4xl text-amber-500 dark:text-amber-400">0</div>
            <p className="font-mono text-[11px] text-on-surface-variant">Daily Scrim Rooms</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-card-border hover:border-emerald-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Prize Vault</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center font-display font-extrabold text-3xl sm:text-4xl text-emerald-500 dark:text-emerald-400">
              <span>₹</span>
              <span ref={stat4}>0</span>
            </div>
            <p className="font-mono text-[11px] text-on-surface-variant">Escrow Protected Payouts</p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CORE PLATFORM BENTO GRID — Next-Gen Esports Architecture
      ══════════════════════════════════════════════════════════ */}
      <section ref={featureRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Section Heading */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Infrastructure
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-on-surface tracking-tight uppercase">
            Engineered For The Pro Circuit
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Gamers'G provides tournament-grade tooling for competitive athletes, clans,
            elite tournament organizers, and multi-game esports organizations.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* BENTO 1: Automated Daily Scrims Engine (Large 7 Cols) */}
          <div
            data-reveal
            className="lg:col-span-7 rounded-3xl bg-surface-container-low border border-card-border p-6 sm:p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 relative overflow-hidden group shadow-xl"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/15 blur-3xl pointer-events-none group-hover:bg-primary/25 transition-all" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Sub-15ms Match Engine
                </span>
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                  24/7 AUTOMATED PRACTICE
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
                  Automated Daily Scrims Engine
                </h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed max-w-xl">
                  Compete in daily high-ELO practice lobbies with zero manual overhead. Room ID and confidential password are automatically dispatched directly to verified team captains prior to match drop.
                </p>
              </div>

              {/* Interactive Mini Scrim Lobby Preview Widget */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-card-border space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs border-b border-card-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-on-surface">BMPS Pro Practice #412 · Erangel</span>
                  </div>
                  <span className="text-secondary font-bold text-[11px] bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                    PIN Dispatches: 04:32
                  </span>
                </div>

                {/* Team Slots Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {[
                    { slot: 'Slot 01', team: 'Team Soul', status: 'Locked' },
                    { slot: 'Slot 02', team: 'GodLike', status: 'Locked' },
                    { slot: 'Slot 03', team: 'Velocity', status: 'Locked' },
                    { slot: 'Slot 04', team: 'Global Esports', status: 'Locked' },
                  ].map((s) => (
                    <div key={s.slot} className="p-2 rounded-lg bg-surface-container border border-card-border flex flex-col">
                      <span className="text-[9px] text-on-surface-variant font-semibold">{s.slot}</span>
                      <span className="font-display font-bold text-on-surface truncate">{s.team}</span>
                      <span className="text-[9px] text-emerald-500 font-bold mt-0.5">● {s.status}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                  <span>Slot Matrix: <strong>18/20 Teams Checked In</strong></span>
                  <span className="text-primary font-bold">12ms Asia-South1 Server</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Instant slot reservation for rosters</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Confidential Room PIN delivery</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Automated screenshot proof verification</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Live dispute escalation with admins</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-card-border flex items-center justify-between">
              <div>
                <span className="font-display font-extrabold text-2xl text-on-surface block">120+</span>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Daily Match Rooms</span>
              </div>
              <button
                onClick={() => onSelectTab?.('tournaments')}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider hover:opacity-95 flex items-center gap-1.5 transition-all shadow-md shadow-primary/20"
              >
                <span>Enter Scrim Lobbies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* BENTO 2: Smart Escrow Prize Vault (5 Cols) */}
          <div
            data-reveal
            className="lg:col-span-5 rounded-3xl bg-surface-container-low border border-card-border p-6 sm:p-8 flex flex-col justify-between hover:border-tertiary/50 transition-all duration-300 relative overflow-hidden group shadow-xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/20">
                  Escrow Audited
                </span>
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-tertiary font-bold">
                  GUARANTEED PAYOUTS
                </span>
                <h3 className="font-display font-extrabold text-2xl text-on-surface mt-1">
                  Verified Prize Escrow Vault
                </h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Never chase organizers for tournament winnings. All prize pools are legally deposited into escrow vaults prior to tournament kick-off, with instant payout distribution to winner bank accounts and UPI.
                </p>
              </div>

              {/* Escrow Visualization Card */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-card-border space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-card-border">
                  <span className="text-on-surface-variant">Active Escrow Vault</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Secured
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Protected Pool</span>
                  <span className="text-tertiary font-extrabold text-base">₹15,00,000 INR</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Payout Execution:</span>
                  <span className="text-on-surface font-semibold">Automated Post-Grand Finals</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
                  <span>Legally protected prize contracts</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
                  <span>Instant automated bank & UPI distribution</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-card-border flex items-center justify-between">
              <div>
                <span className="font-display font-extrabold text-2xl text-on-surface block">₹2.5 Cr+</span>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Total Escrow Dispatched</span>
              </div>
              <button
                onClick={() => onSelectTab?.('tournaments')}
                className="font-display text-xs font-bold text-tertiary hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-all"
              >
                <span>Tournaments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* BENTO 3: Verified Athlete Passports (5 Cols) */}
          <div
            data-reveal
            className="lg:col-span-5 rounded-3xl bg-surface-container-low border border-card-border p-6 sm:p-8 flex flex-col justify-between hover:border-secondary/50 transition-all duration-300 relative overflow-hidden group shadow-xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                  Anti-Cheat HWID Seal
                </span>
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
                  LINKEDIN FOR GAMERS
                </span>
                <h3 className="font-display font-extrabold text-2xl text-on-surface mt-1">
                  Universal Athlete Passport
                </h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Your immutable esports resume. Synchronize your Steam, Riot Games, and BGMI game UIDs. Showcase verified tournament finishes, career win rates, and your hardware-verified FairPlay integrity trust score.
                </p>
              </div>

              {/* Passport Preview Snippet */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-card-border space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-black text-white text-[11px]">
                      {passportInitials}
                    </div>
                    <div>
                      <p className="font-display font-bold text-on-surface leading-none text-xs">{passportName}</p>
                      <p className="text-[10px] text-secondary truncate max-w-[190px]">{passportTagline}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                    99.9% HWID Trust
                  </span>
                </div>
                <div className="pt-2 border-t border-card-border flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Looking For Team (LFT):</span>
                  <span className="text-secondary font-semibold">{passportLft}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-card-border flex items-center justify-between">
              <div>
                <span className="font-display font-extrabold text-2xl text-on-surface block">14.2K+</span>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Passports Issued</span>
              </div>
              <button
                onClick={() => onSelectTab?.('discovery')}
                className="font-display text-xs font-bold text-secondary hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-all"
              >
                <span>Browse Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* BENTO 4: Clan Roster Lock & Org Recruitment (7 Cols) */}
          <div
            data-reveal
            className="lg:col-span-7 rounded-3xl bg-surface-container-low border border-card-border p-6 sm:p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 relative overflow-hidden group shadow-xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Roster Management
                </span>
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                  TEAMS & ORGANIZATIONS
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
                  Clan Rosters & Org Scouting Pipeline
                </h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed max-w-xl">
                  Build multi-title teams, lock official rosters before competition, and scout high-ELO free agents with verified tryout applications and contract management.
                </p>
              </div>

              {/* Tryout Pipeline Visualization */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-card-border space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-on-surface-variant pb-2 border-b border-card-border text-[11px]">
                  <span>Recruitment State Machine</span>
                  <span className="text-primary font-bold">Open Role: Main Duelist</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-semibold text-[10px]">1. Application</span>
                  <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary font-bold text-[10px] border border-primary/30">2. Scrim Tryout</span>
                  <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-500 font-bold text-[10px] border border-emerald-500/30">3. Roster Signed</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-card-border flex items-center justify-between">
              <div>
                <span className="font-display font-extrabold text-2xl text-on-surface block">840+</span>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Active Rosters</span>
              </div>
              <button
                onClick={() => onSelectTab?.('teams')}
                className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <span>Explore Teams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. INTERACTIVE LIVE ARENA PREVIEW (TABBED EXPLORER)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-container-lowest/80 border-y border-card-border">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
                Live Platform Feed
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface">
                Inside the Active Arena
              </h2>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-xl">
                Browse verified competitions, daily scrim slot availability, elite team rosters, and active esports organizations.
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-surface-container border border-card-border">
              {SHOWCASE_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeShowcaseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShowcaseTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-display text-xs font-semibold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="animate-in fade-in duration-300">
            {/* TAB 1: Tournaments — Real API data */}
            {activeShowcaseTab === 'tournaments' && (
              tournamentsLoading ? <ShowcaseSkeleton /> :
              liveTournaments.length === 0 ? (
                <ShowcaseEmpty label="Tournaments" onSelectTab={onSelectTab} tabTarget="tournaments" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {liveTournaments.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-3xl bg-surface-container-low border border-card-border p-6 flex flex-col justify-between space-y-5 hover:border-secondary/40 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            {t.game || 'OPEN'}
                          </span>
                          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                            t.status === 'live' || t.status === 'ongoing'
                              ? 'bg-red-500/15 text-red-500 border-red-500/30'
                              : t.status === 'registration_open' || t.status === 'open'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
                          }`}>
                            {(t.status || 'UPCOMING').replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">
                          {t.name || t.title || 'Untitled Tournament'}
                        </h4>

                        <div className="text-xs text-on-surface-variant space-y-1.5 font-mono">
                          {(t.format || t.tournament_format) && (
                            <div className="flex items-center justify-between">
                              <span>Format:</span>
                              <span className="text-on-surface font-semibold">{t.format || t.tournament_format}</span>
                            </div>
                          )}
                          {(t.prize_pool || t.prizePool) && (
                            <div className="flex items-center justify-between">
                              <span>Prize Pool:</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {typeof (t.prize_pool || t.prizePool) === 'number'
                                  ? `$${(t.prize_pool || t.prizePool).toLocaleString()}`
                                  : (t.prize_pool || t.prizePool)}
                              </span>
                            </div>
                          )}
                          {(t.max_teams || t.maxTeams || t.team_count !== undefined) && (
                            <div className="flex items-center justify-between">
                              <span>Slots:</span>
                              <span className="text-on-surface">
                                {t.team_count ?? t.registered_count ?? '?'} / {t.max_teams || t.maxTeams || '?'} Teams
                              </span>
                            </div>
                          )}
                          {t.start_date && (
                            <div className="flex items-center justify-between">
                              <span>Starts:</span>
                              <span className="text-amber-600 dark:text-amber-300 font-medium">
                                {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectTab?.('tournaments')}
                        className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>View Tournament Details</span>
                        <ChevronRight className="w-4 h-4 text-secondary" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 2: Scrims */}
            {activeShowcaseTab === 'scrims' && (
              scrimsLoading ? <ShowcaseSkeleton /> :
              liveScrims.length === 0 ? (
                <ShowcaseEmpty label="Scrim Lobbies" onSelectTab={onSelectTab} tabTarget="tournaments" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {liveScrims.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="rounded-3xl bg-surface-container-low border border-card-border p-6 flex flex-col justify-between space-y-5 hover:border-amber-400/40 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                            {s.game}
                          </span>
                          <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                            {s.time}
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-lg text-on-surface group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors">
                          {s.title}
                        </h4>

                        <div className="text-xs text-on-surface-variant space-y-1.5 font-mono">
                          <div className="flex items-center justify-between">
                            <span>Map / Ruleset:</span>
                            <span className="text-on-surface font-semibold">{s.map}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Requirement:</span>
                            <span className="text-on-surface">{s.tier}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Lobby Capacity:</span>
                            <span className="text-secondary font-bold">{s.slots}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectTab?.('tournaments')}
                        className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Reserve Team Slot</span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 3: Teams — Real API data */}
            {activeShowcaseTab === 'teams' && (
              teamsLoading ? <ShowcaseSkeleton /> :
              liveTeams.length === 0 ? (
                <ShowcaseEmpty label="Teams" onSelectTab={onSelectTab} tabTarget="teams" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {liveTeams.map((tm, idx) => (
                    <div
                      key={tm.id || idx}
                      className="rounded-3xl bg-surface-container-low border border-card-border p-6 flex flex-col justify-between space-y-5 hover:border-secondary/40 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-surface-container text-on-surface-variant border border-card-border">
                            TAG: [{tm.tag || (tm.name || '?').slice(0, 4).toUpperCase()}]
                          </span>
                          <span className="font-mono text-[10px] font-bold text-secondary">
                            {tm.game || 'MULTI-GAME'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-xl text-on-surface group-hover:text-secondary transition-colors">
                            {tm.name}
                          </h4>
                          <span className="font-mono text-xs text-on-surface-variant">
                            {tm.tier || (tm.is_recruiting ? 'Recruiting' : 'Active Roster')}
                          </span>
                        </div>

                        <div className="text-xs text-on-surface-variant space-y-1.5 font-mono pt-2 border-t border-card-border">
                          {(tm.member_count !== undefined || tm.members !== undefined) && (
                            <div className="flex items-center justify-between">
                              <span>Roster Size:</span>
                              <span className="text-on-surface">{tm.member_count ?? tm.members ?? '?'} Athletes</span>
                            </div>
                          )}
                          {tm.description && (
                            <div className="text-on-surface-variant leading-relaxed line-clamp-2 pt-1">
                              {tm.description}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <span>Status:</span>
                            <span className={tm.is_recruiting ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-300 font-medium'}>
                              {tm.is_recruiting ? 'Open Tryouts' : 'Roster Locked'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectTab?.('teams')}
                        className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>View Team Dossier</span>
                        <ArrowRight className="w-4 h-4 text-secondary" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 4: Orgs */}
            {activeShowcaseTab === 'orgs' && (
              teamsLoading ? <ShowcaseSkeleton /> :
              liveOrgs.length === 0 ? (
                <ShowcaseEmpty label="Esports Organizations" onSelectTab={onSelectTab} tabTarget="discovery" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {liveOrgs.map((org, idx) => (
                    <div
                      key={org.id || idx}
                      className="rounded-3xl bg-surface-container-low border border-card-border p-6 flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                            {org.tag}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-secondary">
                            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                            {org.badge}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-xl text-on-surface group-hover:text-primary transition-colors">
                            {org.name}
                          </h4>
                          <span className="font-mono text-xs text-on-surface-variant">{org.hq}</span>
                        </div>

                        <div className="text-xs text-on-surface-variant space-y-2 pt-2 border-t border-card-border">
                          <div>
                            <span className="block text-[10px] font-mono uppercase text-on-surface-variant/70 mb-1">Rosters In:</span>
                            <div className="flex flex-wrap gap-1">
                              {org.titles.map((t, ti) => (
                                <span key={ti} className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-mono text-on-surface">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between font-mono pt-1 text-[11px]">
                            <span>Tryout Pipeline:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{org.openRoles}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectTab?.('discovery')}
                        className="w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Submit Player Application</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. SUPPORTED COMPETITIVE TITLES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            Supported Arenas
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-on-surface tracking-tight">
            Battle Across Leading Esports Titles
          </h2>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant">
            Automated custom rooms, bracket formats, and verified stat-tracking calibrated for each competitive title.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED_GAMES.map((game, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-surface-container-low border border-card-border p-6 space-y-4 hover:border-secondary/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${game.badgeColor}`}>
                  {game.category}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  {game.players}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-on-surface group-hover:text-secondary transition-colors">
                  {game.name}
                </h3>
                <p className="font-mono text-xs text-on-surface-variant mt-1">
                  {game.modes}
                </p>
              </div>

              <div className="pt-3 border-t border-card-border flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  API Sync Active
                </span>
                <button
                  onClick={() => onSelectTab?.('tournaments')}
                  className="text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors"
                >
                  <span>Matches</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. THE 4-STEP ONBOARDING JOURNEY
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-container-lowest/80 border-y border-card-border">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              The Path to Pro
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-on-surface tracking-tight">
              From Casual Queue to Sponsored Stage
            </h2>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant">
              Four streamlined steps to establish your competitive presence and ascend the rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {JOURNEY_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-surface-container-low border border-card-border p-6 space-y-4 relative flex flex-col justify-between hover:border-secondary/40 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-display font-bold">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-2xl font-extrabold text-on-surface-variant/40 group-hover:text-secondary transition-colors">
                        {step.step}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">
                        {step.title}
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-card-border">
                    <span className="font-mono text-[10px] uppercase text-on-surface-variant/70 tracking-wider">
                      Step {idx + 1} of 4
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. FREQUENTLY ASKED QUESTIONS (FAQ)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            Got Questions?
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-on-surface tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-xl mx-auto">
            Everything you need to know about scrims, tournaments, prize pools, and organization recruiting.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-surface-container-low border border-card-border overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-surface-container transition-colors"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-on-surface">
                    {item.q}
                  </span>
                  <span className="p-1 rounded-lg bg-surface-container text-on-surface-variant shrink-0 border border-card-border">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-body border-t border-card-border animate-in fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. FINAL CALL TO ACTION BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-surface-container-low border-t border-card-border">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 14,000+ Esports Athletes Today</span>
          </div>

          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-on-surface tracking-tight uppercase leading-tight">
            Ready to Claim Your Place on the Leaderboard?
          </h2>

          <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Register your official gamer tag, assemble your squad, and join scheduled scrims with automated room credentials.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuthWithRole?.('player', 'signup')}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <Gamepad2 className="w-5 h-5 text-white" />
              <span>Claim Your Gamer Tag</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelectTab?.('discovery')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface font-display font-bold text-sm uppercase tracking-wider transition-all"
            >
              <span>Browse Active Rosters</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. PROFESSIONAL PLATFORM FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-card-border bg-surface-container-lowest pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-on-surface-variant text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-card-border">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-extrabold text-xl shadow-md">
                G
              </div>
              <span className="font-display font-bold text-xl text-on-surface tracking-wider">
                GAMERS<span className="text-secondary">'G</span>
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant max-w-sm leading-relaxed">
              The premier competitive esports ecosystem. Bridging the gap between grassroots players,
              elite rosters, certified organizers, and professional esports franchises.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (API v1.0.4)</span>
            </div>
          </div>

          {/* Nav Column 1 */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface font-bold">
              Competition
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab?.('tournaments')} className="hover:text-on-surface transition-colors">
                  Live Tournaments
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab?.('tournaments')} className="hover:text-on-surface transition-colors">
                  Daily Scrim Lobbies
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab?.('tournaments')} className="hover:text-on-surface transition-colors">
                  Bracket Progression
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab?.('tournaments')} className="hover:text-on-surface transition-colors">
                  Prize Escrow Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Column 2 */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface font-bold">
              Rosters & Orgs
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab?.('teams')} className="hover:text-on-surface transition-colors">
                  Create a Squad
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab?.('discovery')} className="hover:text-on-surface transition-colors">
                  Talent Radar (Free Agents)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab?.('discovery')} className="hover:text-on-surface transition-colors">
                  Verified Esports Orgs
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab?.('discovery')} className="hover:text-on-surface transition-colors">
                  Tryout Pipeline
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Column 3 */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface font-bold">
              Security & Admin
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onOpenAuthWithRole?.('admin', 'login')} className="hover:text-on-surface transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span>Admin Portal</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab?.('discovery')} className="hover:text-on-surface transition-colors">
                  Anti-Cheat Code
                </button>
              </li>
              <li>
                <span className="text-on-surface-variant/50 cursor-not-allowed">Terms of Service</span>
              </li>
              <li>
                <span className="text-on-surface-variant/50 cursor-not-allowed">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-on-surface-variant/70">
          <div>
            © 2026 Gamers'G Arena Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>256-Bit SSL Encryption</span>
            <span>·</span>
            <span>Riot Games & Krafton Compliant</span>
            <span>·</span>
            <span>Sub-150ms WebSocket Mesh</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
