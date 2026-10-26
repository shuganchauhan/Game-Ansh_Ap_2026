import React, { useRef, useState, useEffect } from 'react';
import useHeroThreeJS from '../../hooks/useHeroThreeJS';
import { useGSAPReveal, useCounterGSAP, useMarqueeTicker } from '../../hooks/useGSAP';
import { useTheme } from '../../stores/themeContext';
import {
  Gamepad2, Shield, Trophy, Radio, ChevronRight, ShieldCheck, Zap,
  Swords, Users, Star, MessageSquare, TrendingUp, Play, ArrowRight,
  Cpu, Target, Globe2, CheckCircle2, ChevronDown, ChevronUp, Lock,
  Award, Sparkles, Flame, Eye, Calendar, Clock, Crosshair, HelpCircle,
  User
} from 'lucide-react';

/* ── Live Match Ticker Data ── */
const TICKER_ITEMS = [
  { label: 'LIVE', team1: 'Team Soul', team2: 'GodLike Esports', score: '12:9', game: 'BGMI' },
  { label: 'LIVE', team1: 'Global Esports', team2: 'Velocity Gaming', score: '2:1', game: 'VALORANT' },
  { label: 'FINAL', team1: 'Total Gaming', team2: 'AS Esports', score: '1:0', game: 'FREE FIRE' },
  { label: 'UPCOMING', team1: 'Revenant Esports', team2: 'Entity Gaming', score: 'vs', game: 'BGMI' },
  { label: 'LIVE', team1: 'True Rippers', team2: 'Medal Esports', score: '11:10', game: 'CS2' },
  { label: 'UPCOMING', team1: 'SynerGY Esports', team2: 'Team IND CoD', score: 'vs', game: 'COD MOBILE' },
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
      'State-machine application tracking (Submitted → Shortlisted → Signed)',
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

  const [statsVisible, setStatsVisible] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('tournaments');
  const [openFaq, setOpenFaq] = useState(0);

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
          1. HERO SECTION — Spacious, Confident & Dual-Themed
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Three.js Canvas Backdrop */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-45" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-b from-primary/10 via-secondary/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        {/* Hero Body */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container/80 dark:bg-white/5 border border-card-border backdrop-blur-md shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
              2026 Competitive Season Active
            </span>
            <span className="text-on-surface-variant/40">·</span>
            <span className="font-mono text-xs text-on-surface-variant font-medium">Next-Gen Esports Protocol</span>
          </div>

          {/* Majestic Headline */}
          <div className="space-y-4">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.08] uppercase text-on-surface">
              The Premier Arena for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
                Competitive Esports
              </span>
            </h1>
            <p className="font-body text-base sm:text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
              Book daily automated scrim lobbies, compete in verified prize-pool tournaments,
              manage your competitive roster, and connect directly with Tier-1 esports organizations.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenAuthWithRole?.('player', 'signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white dark:text-black font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
            >
              <Gamepad2 className="w-5 h-5 text-white dark:text-black" />
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-white dark:text-black group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelectTab?.('tournaments')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface font-display font-bold text-sm uppercase tracking-wider backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <Trophy className="w-5 h-5 text-primary" />
              <span>Explore Tournaments & Scrims</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-on-surface-variant pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>Verified Organizations</span>
            </div>
            <span className="text-card-border hidden sm:inline">·</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Sub-150ms Match Events</span>
            </div>
            <span className="text-card-border hidden sm:inline">·</span>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Escrow Protected Prizes</span>
            </div>
            <span className="text-card-border hidden sm:inline">·</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Anti-Cheat Fair Play</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. LIVE MATCH TICKER STRIP
      ══════════════════════════════════════════════════════════ */}
      <div className="border-y border-card-border py-3.5 bg-surface-container-lowest/80 backdrop-blur-md overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
          <div className="shrink-0 flex items-center gap-2 pr-4 border-r border-card-border">
            <span className="inline-block w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-error">
              Match Circuit
            </span>
          </div>

          <div ref={tickerRef} className="flex whitespace-nowrap overflow-x-hidden">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    item.label === 'LIVE'
                      ? 'bg-error/15 text-error border border-error/30'
                      : item.label === 'FINAL'
                      ? 'bg-surface-container-high text-on-surface-variant'
                      : 'bg-secondary/15 text-secondary border border-secondary/30'
                  }`}
                >
                  {item.label}
                </span>
                <span className="font-display text-xs font-semibold text-on-surface">{item.team1}</span>
                <span className="font-mono text-xs font-bold text-secondary">{item.score}</span>
                <span className="font-display text-xs font-semibold text-on-surface">{item.team2}</span>
                <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  {item.game}
                </span>
                <span className="text-card-border pl-4">/</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. REAL-TIME STATS COUNTER BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-card-border bg-surface-container-low" ref={stepsRef}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-2">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div ref={stat1} className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface">0</div>
            <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">Verified Athletes</div>
          </div>

          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto text-secondary mb-2">
              <Users className="w-5 h-5" />
            </div>
            <div ref={stat2} className="font-display font-extrabold text-3xl sm:text-4xl text-secondary">0</div>
            <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">Active Team Rosters</div>
          </div>

          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400 mb-2">
              <Flame className="w-5 h-5" />
            </div>
            <div ref={stat3} className="font-display font-extrabold text-3xl sm:text-4xl text-amber-500 dark:text-amber-400">0</div>
            <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">Daily Scrim Lobbies</div>
          </div>

          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto text-tertiary mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl text-tertiary">
              <span>$</span>
              <span ref={stat4}>0</span>
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">Prizes Distributed</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CORE PLATFORM PILLARS (EVERYTHING WE OFFER)
      ══════════════════════════════════════════════════════════ */}
      <section ref={featureRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        {/* Section Heading */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Complete Ecosystem Architecture
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-on-surface tracking-tight">
            Engineered For The Full Lifecycle of Esports
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Gamers'G provides end-to-end tooling for grassroots players, competitive clans,
            elite tournament organizers, and multi-game esports organizations.
          </p>
        </div>

        {/* 6 Structured Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PLATFORM_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                data-reveal
                className="rounded-3xl bg-surface-container-low border border-card-border p-6 sm:p-8 flex flex-col justify-between hover:border-secondary/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="space-y-5">
                  {/* Top Row: Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-surface-container border border-card-border flex items-center justify-center ${pillar.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-card-border">
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                      {pillar.tagline}
                    </span>
                    <h3 className="font-display font-bold text-xl text-on-surface mt-1 group-hover:text-secondary transition-colors">
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-2 border-t border-card-border">
                    {pillar.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-on-surface">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Metric & Action Link */}
                <div className="pt-6 mt-6 border-t border-card-border flex items-center justify-between">
                  <div>
                    <span className="font-display font-extrabold text-xl text-on-surface block">
                      {pillar.metric}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {pillar.metricLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (pillar.id === 'tournaments' || pillar.id === 'scrims') {
                        onSelectTab?.('tournaments');
                      } else if (pillar.id === 'teams') {
                        onSelectTab?.('teams');
                      } else {
                        onSelectTab?.('discovery');
                      }
                    }}
                    className="font-display text-xs font-bold text-secondary hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-all"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
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
                        ? 'bg-gradient-to-r from-primary to-secondary text-white dark:text-black font-bold shadow-md'
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
            {/* TAB 1: Tournaments */}
            {activeShowcaseTab === 'tournaments' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAMPLE_TOURNAMENTS.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-3xl bg-surface-container-low border border-card-border p-6 flex flex-col justify-between space-y-5 hover:border-secondary/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          {t.game}
                        </span>
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${t.statusColor}`}>
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">
                        {t.title}
                      </h4>

                      <div className="text-xs text-on-surface-variant space-y-1.5 font-mono">
                        <div className="flex items-center justify-between">
                          <span>Format:</span>
                          <span className="text-on-surface font-semibold">{t.format}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Prize Pool:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.prize}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Registered:</span>
                          <span className="text-on-surface">{t.teams}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Schedule:</span>
                          <span className="text-amber-600 dark:text-amber-300 font-medium">{t.startsIn}</span>
                        </div>
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
            )}

            {/* TAB 2: Scrims */}
            {activeShowcaseTab === 'scrims' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAMPLE_SCRIMS.map((s) => (
                  <div
                    key={s.id}
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
            )}

            {/* TAB 3: Teams */}
            {activeShowcaseTab === 'teams' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAMPLE_TEAMS.map((tm, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl bg-surface-container-low border border-card-border p-6 flex flex-col justify-between space-y-5 hover:border-secondary/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-surface-container text-on-surface-variant border border-card-border">
                          TAG: [{tm.tag}]
                        </span>
                        <span className="font-mono text-[10px] font-bold text-secondary">
                          {tm.game}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-xl text-on-surface group-hover:text-secondary transition-colors">
                          {tm.name}
                        </h4>
                        <span className="font-mono text-xs text-on-surface-variant">{tm.tier}</span>
                      </div>

                      <div className="text-xs text-on-surface-variant space-y-1.5 font-mono pt-2 border-t border-card-border">
                        <div className="flex items-center justify-between">
                          <span>Competitive Win Rate:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{tm.winRate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Active Roster Size:</span>
                          <span className="text-on-surface">{tm.members} Athletes</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Recruitment Status:</span>
                          <span className="text-amber-600 dark:text-amber-300 font-medium">{tm.status}</span>
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
            )}

            {/* TAB 4: Orgs */}
            {activeShowcaseTab === 'orgs' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAMPLE_ORGS.map((org, idx) => (
                  <div
                    key={idx}
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
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white dark:text-black font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <Gamepad2 className="w-5 h-5 text-white dark:text-black" />
              <span>Claim Your Gamer Tag</span>
              <ArrowRight className="w-4 h-4 text-white dark:text-black group-hover:translate-x-1 transition-transform" />
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white dark:text-black font-display font-extrabold text-xl shadow-md">
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
