import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, Crosshair,
  Crown, ExternalLink, Flame, Gamepad2, Layers, MessageSquare, Play, Radio,
  Search, Shield, ShieldCheck, Sparkles, Star, Swords, Target, Trophy, Users, Zap,
  TrendingUp, Wifi, Clock, Award, Activity, Rocket, Mouse
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import useApi from '../../hooks/useApi';
import heroArenaBg from '../../assets/hero-arena.jpg';
import CyberHeroCanvas from '../../components/ui/CyberHeroCanvas';
import LiveArenaCommandDeck from './LiveArenaCommandDeck';
import { cyberAudio } from '../../lib/cyberAudio';

/* ═══════════════════════════════════════════════════════
   OFFICIAL FEATURED GAMES DATA (With User-Provided Artwork)
═══════════════════════════════════════════════════════ */
const FEATURED_GAMES = [
  {
    id: 'valorant',
    name: 'VALORANT',
    genre: 'Tactical FPS',
    publisher: 'Riot Games',
    image: '/valorant.jpg',
    rating: '9.8',
    activeSquads: '142 Teams',
    activeScrims: '28 Live Lobbies',
    color: '#8B5CF6',
    accentColor: '#37ebf3',
    tag: 'TIER-1 FPS',
    description: 'Precision 5v5 character-based tactical shooter. Coordinated utility, high-stakes rounds, and VCT franchise pathway.',
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    genre: 'Battle Royale',
    publisher: 'Krafton',
    image: '/bgmi.jpg',
    rating: '9.7',
    activeSquads: '210 Teams',
    activeScrims: '42 Live Lobbies',
    color: '#22D3EE',
    accentColor: '#C48200',
    tag: 'PREMIER BR',
    description: 'Battlegrounds Mobile India. 100-player tactical drops, high-tempo rotations, and BMPS championship grand finals.',
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    genre: 'Fast Battle Royale',
    publisher: 'Garena',
    image: '/freefire.jpg',
    rating: '9.5',
    activeSquads: '98 Teams',
    activeScrims: '19 Live Lobbies',
    color: '#EC4899',
    accentColor: '#e455ae',
    tag: 'PRO LEAGUE',
    description: 'Fast-paced 50-player survival and 4v4 Clash Squad ranked circuits with intense close-quarters combat.',
  },
  {
    id: 'cod',
    name: 'Call of Duty',
    genre: 'Military FPS',
    publisher: 'Activision',
    image: '/cod.jpg',
    rating: '9.6',
    activeSquads: '84 Teams',
    activeScrims: '15 Live Lobbies',
    color: '#10B981',
    accentColor: '#cb1dcd',
    tag: 'WARZONE',
    description: 'Competitive Hardpoint, Search & Destroy, and battle royale skirmishes with pro controller and mobile leagues.',
  },
  {
    id: 'coc',
    name: 'Clash of Clans',
    genre: 'Strategy & Clan Wars',
    publisher: 'Supercell',
    image: '/coc.jpg',
    rating: '9.4',
    activeSquads: '115 Clans',
    activeScrims: 'Clan War Leagues',
    color: '#F59E0B',
    accentColor: '#1ac5b0',
    tag: 'CWL LEAGUE',
    description: 'Strategic base defense, synchronized Clan War attacks, and Town Hall 17 world championship qualifiers.',
  },
  {
    id: 'cr',
    name: 'Clash Royale',
    genre: 'Tactical Card Arena',
    publisher: 'Supercell',
    image: '/cr.jpg',
    rating: '9.3',
    activeSquads: '76 Rosters',
    activeScrims: '1v1 Duel Ladders',
    color: '#6366F1',
    accentColor: '#9381ff',
    tag: 'CROWN CUP',
    description: 'Real-time 1v1 deck-building duels. Tower defense macro strategy and Crown Championship tournament brackets.',
  },
];

/* ═══════════════════════════════════════════════════════
   DISCOVERY CATEGORIES
═══════════════════════════════════════════════════════ */
const DISCOVERY_CATEGORIES = [
  { name: 'Action', count: '48 Titles', icon: Flame, color: 'from-[#8B5CF6]/30 to-[#8B5CF6]/5' },
  { name: 'Adventure', count: '32 Titles', icon: Sparkles, color: 'from-[#22D3EE]/30 to-[#22D3EE]/5' },
  { name: 'FPS', count: '24 Titles', icon: Crosshair, color: 'from-[#EC4899]/30 to-[#EC4899]/5' },
  { name: 'RPG', count: '40 Titles', icon: Swords, color: 'from-[#10B981]/30 to-[#10B981]/5' },
  { name: 'Racing', count: '16 Titles', icon: Zap, color: 'from-[#F59E0B]/30 to-[#F59E0B]/5' },
  { name: 'Strategy', count: '36 Titles', icon: Shield, color: 'from-[#6366F1]/30 to-[#6366F1]/5' },
  { name: 'Sports', count: '20 Titles', icon: Trophy, color: 'from-[#3B82F6]/30 to-[#3B82F6]/5' },
  { name: 'Simulation', count: '18 Titles', icon: Layers, color: 'from-[#14B8A6]/30 to-[#14B8A6]/5' },
];

/* ═══════════════════════════════════════════════════════
   TOP ESPORTS SQUADS LEADERBOARD
═══════════════════════════════════════════════════════ */
const TOP_SQUADS_LEADERBOARD = [
  { rank: '01', name: 'Team SouL', tag: 'SOUL', game: 'BGMI', winrate: '82%', points: '2,840 pts', division: 'BMPS Pro Major', verified: true, logoText: 'SL' },
  { rank: '02', name: 'Global Esports', tag: 'GE', game: 'VALORANT', winrate: '78%', points: '2,690 pts', division: 'VCT Pacific Challenger', verified: true, logoText: 'GE' },
  { rank: '03', name: 'GodLike Esports', tag: 'GODL', game: 'BGMI', winrate: '76%', points: '2,540 pts', division: 'BGIS Grand Finals', verified: true, logoText: 'GL' },
  { rank: '04', name: 'Total Gaming', tag: 'TG', game: 'Free Fire', winrate: '73%', points: '2,410 pts', division: 'FFIC Pro League', verified: true, logoText: 'TG' },
  { rank: '05', name: 'Warriors Gaming', tag: 'WAR', game: 'Clash of Clans', winrate: '71%', points: '2,280 pts', division: 'CWL Masters Tier 1', verified: false, logoText: 'WG' },
];

/* ═══════════════════════════════════════════════════════
   MARQUEE LIVE DATA STRIPS
═══════════════════════════════════════════════════════ */
const MARQUEE_LIVE_MATCHES = [
  { game: 'VALORANT', team1: 'Team Mahi', team2: 'AFK Gaming', score: '12 — 8', status: 'LIVE', map: 'Ascent' },
  { game: 'BGMI', team1: 'Team SouL', team2: 'GodLike', score: 'MATCH 3 · RD 4', status: 'LIVE', map: 'Miramar' },
  { game: 'Free Fire', team1: 'Total Gaming', team2: 'WSB', score: '24 — 19', status: 'LIVE', map: 'Purgatory' },
  { game: 'CoD Mobile', team1: 'GAS Esports', team2: 'Team Raze', score: '5 — 3', status: 'LIVE', map: 'Hardpoint' },
  { game: 'Clash Royale', team1: 'SkRossi', team2: 'YoDa', score: '2 — 1', status: 'LIVE', map: 'Grand Challenge' },
  { game: 'VALORANT', team1: 'Global Esports', team2: 'Revenant XR', score: '10 — 6', status: 'LIVE', map: 'Haven' },
  { game: 'BGMI', team1: 'OR Esports', team2: 'Enigma Gaming', score: 'MATCH 5 · RD 2', status: 'LIVE', map: 'Erangel' },
  { game: 'Free Fire MAX', team1: 'Elite Esports', team2: 'Defenders', score: '30 — 27', status: 'LIVE', map: 'Bermuda' },
];

const MARQUEE_STATS = [
  { icon: Activity, label: 'Players Online', value: '14,280', color: '#22D3EE' },
  { icon: Wifi, label: 'Live Scrims', value: '127 Active', color: '#10B981' },
  { icon: Trophy, label: "Today's Matches", value: '48 Scheduled', color: '#F59E0B' },
  { icon: Users, label: 'Active Squads', value: '1,342 Rosters', color: '#8B5CF6' },
  { icon: TrendingUp, label: 'Avg Match Rating', value: '8.4 / 10', color: '#EC4899' },
  { icon: Award, label: 'Prize Pool This Week', value: '₹3.2L+', color: '#22D3EE' },
  { icon: Clock, label: 'Next Major Event', value: 'Nov 15 · BGMI Open', color: '#8B5CF6' },
  { icon: Flame, label: 'Hottest Title', value: 'VALORANT VCT', color: '#F87171' },
  { icon: Star, label: 'Top Rated Player', value: 'Mortal · 9.9', color: '#F59E0B' },
];

const MARQUEE_TEAMS = [
  { name: 'Team SouL', tag: 'BGMI PRO', wins: '82%' },
  { name: 'Global Esports', tag: 'VALORANT VCT', wins: '78%' },
  { name: 'GodLike', tag: 'BGMI BGIS', wins: '76%' },
  { name: 'Total Gaming', tag: 'Free Fire FFIC', wins: '73%' },
  { name: 'OR Esports', tag: 'BGMI Elite', wins: '71%' },
  { name: 'Enigma Gaming', tag: 'CoD Mobile', wins: '70%' },
  { name: 'Team Mahi', tag: 'VALORANT', wins: '69%' },
  { name: 'AFK Gaming', tag: 'Multi-Title', wins: '68%' },
  { name: 'Revenant XR', tag: 'VALORANT', wins: '67%' },
  { name: 'Marcos Gaming', tag: 'BGMI', wins: '65%' },
];

export default function LandingPage({ onSelectTab, onOpenAuthWithRole, onOpenTeamCreator }) {
  const { isAuthenticated, user } = useAuth();
  const { players = [], posts = [], toggleLikePost } = useGameStore();

  const [activeSpotlightGame, setActiveSpotlightGame] = useState(FEATURED_GAMES[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const liveMatchCount = 127;

  // Auto-advance spotlight every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(prev => {
          const next = (prev + 1) % FEATURED_GAMES.length;
          setActiveSpotlightGame(FEATURED_GAMES[next]);
          return next;
        });
        setIsTransitioning(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleSelectGame = (game, index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSpotlightGame(game);
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  // Handle CTA navigations
  const handleExploreGames = () => {
    onSelectTab?.('discovery');
  };

  const handleJoinCommunity = () => {
    if (!isAuthenticated) onOpenAuthWithRole?.('player', 'signup');
    else onSelectTab?.('feed');
  };

  return (
    <div className="flux-landing flux-page-bg selection:bg-[#8B5CF6]/30 overflow-x-hidden text-[color:var(--color-on-surface)]">
      {/* ═══════════════════════════════════════════════════════
          1. CINEMATIC HERO SECTION (FLUX Centerpiece)
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[780px] lg:min-h-[880px] flex flex-col justify-between isolate overflow-hidden border-b border-white/[0.08]">
        {/* Background Composite Artwork — Framed with Characters on Left & Right */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${heroArenaBg})`,
            backgroundPosition: 'center 30%',
            opacity: 1,
          }}
          aria-hidden="true"
        />

        {/* Soft Radial Center Shadow: Leaves left & right characters 100% vibrant while ensuring text contrast */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 65% 70% at 50% 48%, rgba(9, 11, 18, 0.70) 0%, rgba(9, 11, 18, 0.35) 55%, transparent 88%),
              linear-gradient(to top, #090B12 0%, rgba(9, 11, 18, 0.75) 10%, transparent 25%),
              linear-gradient(to bottom, #090B12 0%, rgba(9, 11, 18, 0.45) 8%, transparent 18%)
            `,
          }}
        />

        {/* Subtle Cyber Grid */}
        <div
          className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Hero Main Content Container — Sits Centered Between Left & Right Characters */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 pb-10 w-full flex-1 flex flex-col justify-center items-center">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-7 flex flex-col items-center">
            {/* Ecosystem Live Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#151B2B]/90 border border-white/[0.14] backdrop-blur-md shadow-xl shadow-black/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] font-bold text-[#F8FAFC]">
                INDIA'S PREMIER GAMING ECOSYSTEM
              </span>
              <span className="font-mono text-[10.5px] text-emerald-400 font-bold tracking-wider">
                [LIVE]
              </span>
            </div>

            {/* Slanted Bold Display Headline */}
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[0.98] tracking-tight uppercase italic drop-shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
              <span className="text-white block">PLAY. CONNECT.</span>
              <span className="bg-gradient-to-r from-[#A78BFA] via-[#60A5FA] to-[#38BDF8] bg-clip-text text-transparent block mt-1">
                COMPETE.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-slate-200/90 leading-relaxed font-body drop-shadow-lg">
              Discover tournaments, build your gaming profile, join teams and be a part of India's biggest gaming community.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-row flex-wrap items-center justify-center gap-3.5 pt-1">
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onSelectTab?.('tournaments');
                }}
                onMouseEnter={() => cyberAudio.playHover()}
                className="group relative px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white font-display font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-purple-600/35 hover:shadow-purple-600/55 active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden"
              >
                <Rocket className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                <span>Explore Tournaments</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  handleJoinCommunity();
                }}
                onMouseEnter={() => cyberAudio.playHover()}
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-[#151B2B]/90 hover:bg-[#1E2738] text-white border border-white/[0.14] hover:border-purple-400/40 font-display font-bold text-xs sm:text-sm tracking-wide backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Users className="w-4 h-4 text-[#A78BFA]" />
                <span>Join Community</span>
              </button>
            </div>

            {/* 4 Glassmorphic Metrics / Highlights Cards — Centered Grid */}
            <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full mx-auto">
              {[
                {
                  val: '500+',
                  label: 'Tournaments Hosted',
                  icon: Trophy,
                  bg: 'bg-amber-500/15',
                  border: 'border-amber-500/30',
                  iconColor: 'text-amber-400',
                },
                {
                  val: '1M+',
                  label: 'Gamers Joined',
                  icon: Users,
                  bg: 'bg-cyan-500/15',
                  border: 'border-cyan-500/30',
                  iconColor: 'text-cyan-400',
                },
                {
                  val: '50K+',
                  label: 'Active Teams',
                  icon: Shield,
                  bg: 'bg-purple-500/15',
                  border: 'border-purple-500/30',
                  iconColor: 'text-purple-400',
                },
                {
                  val: '25+',
                  label: 'Supported Games',
                  icon: Gamepad2,
                  bg: 'bg-pink-500/15',
                  border: 'border-pink-500/30',
                  iconColor: 'text-pink-400',
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="p-3 sm:p-3.5 rounded-2xl bg-[#151B2B]/85 border border-white/[0.1] backdrop-blur-md flex items-center gap-2.5 sm:gap-3 text-left shadow-xl shadow-black/40 hover:border-white/[0.2] transition-all"
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-black text-lg sm:text-xl text-white leading-tight">
                        {stat.val}
                      </div>
                      <div className="font-body text-[10px] sm:text-[11px] text-[#94A3B8] font-medium truncate">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Partner Strip & Scroll to Explore */}
        <div className="relative z-10 w-full border-t border-white/[0.08] bg-[#090B12]/80 backdrop-blur-md py-4">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Trusted By Gamers Across India */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-center md:justify-start">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#64748B] font-bold">
                TRUSTED BY GAMERS ACROSS INDIA
              </span>
              <div className="flex items-center gap-6 sm:gap-8 text-sm font-display font-black tracking-widest text-[#94A3B8]/80">
                <span className="hover:text-white transition-colors cursor-default">BGMI</span>
                <span className="hover:text-white transition-colors cursor-default">VALORANT</span>
                <span className="hover:text-white transition-colors cursor-default">FREE FIRE</span>
                <span className="hover:text-white transition-colors cursor-default">CALL OF DUTY</span>
                <span className="hover:text-white transition-colors cursor-default">EA SPORTS</span>
              </div>
            </div>

            {/* Scroll to Explore indicator */}
            <div className="hidden lg:flex items-center gap-2 text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
              <Mouse className="w-3.5 h-3.5 text-[#A78BFA] animate-bounce" />
              <span>Scroll to Explore</span>
            </div>
          </div>
        </div>

        {/* Ambient bottom gradient border */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/60 to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE STRIP 1 — LIVE MATCHES TICKER
          Professional real-time match status bar
      ═══════════════════════════════════════════════════════ */}
      <div className="relative flux-marquee-bg border-y border-white/[0.06] overflow-hidden py-0">
        {/* Left fade mask */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#090B12] to-transparent pointer-events-none" />
        {/* Right fade mask */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#090B12] to-transparent pointer-events-none" />

        {/* LIVE badge pinned left */}
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-4 bg-[#090B12] border-r border-white/[0.06]">
          <div className="flex items-center gap-1.5 pr-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-red-400 whitespace-nowrap">
              LIVE
            </span>
          </div>
        </div>

        <div className="pl-20 overflow-hidden">
          <div className="animate-marquee-smooth flex items-center">
            {[...MARQUEE_LIVE_MATCHES, ...MARQUEE_LIVE_MATCHES].map((match, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-3 border-r border-white/[0.06] shrink-0 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onClick={() => onSelectTab?.('tournaments')}
              >
                <span className="font-mono text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider whitespace-nowrap">
                  {match.game}
                </span>
                <span className="font-display font-bold text-xs text-[#F8FAFC] whitespace-nowrap">
                  {match.team1}
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8] whitespace-nowrap">vs</span>
                <span className="font-display font-bold text-xs text-[#F8FAFC] whitespace-nowrap">
                  {match.team2}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1B2335] font-mono text-[10px] font-bold text-[#22D3EE] whitespace-nowrap border border-white/[0.06]">
                  {match.score}
                </span>
                <span className="font-mono text-[9px] text-[#94A3B8] whitespace-nowrap">
                  · {match.map}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE STRIP 2 — PLATFORM STATS TICKER
          Clean stats strip in reverse direction
      ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b border-white/[0.06] bg-[#06080E] py-0">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#06080E] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#06080E] to-transparent pointer-events-none" />

        <div className="overflow-hidden">
          <div className="animate-marquee-smooth-reverse flex items-center">
            {[...MARQUEE_STATS, ...MARQUEE_STATS].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 px-7 py-2.5 border-r border-white/[0.05] shrink-0">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: stat.color }} />
                  <span className="font-mono text-[10px] text-[#94A3B8] whitespace-nowrap">
                    {stat.label}:
                  </span>
                  <span className="font-mono text-[11px] font-bold whitespace-nowrap" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          2. FEATURED GAMES (Auto-Sliding Cinematic Showcase)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#22D3EE]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship Gaming Arenas</span>
            </div>
            <h2 className="mt-2 font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#F8FAFC]">
              Featured Games
            </h2>
            <p className="mt-2 font-body text-sm text-[#94A3B8] max-w-xl">
              Official competitive circuits, live scrim lobbies, and team tryouts across the world&rsquo;s leading titles.
            </p>
          </div>

          <button
            onClick={() => onSelectTab?.('discovery')}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151B2B] hover:bg-[#1B2335] border border-white/[0.08] text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] transition-colors"
          >
            <span>All Game Hubs</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#22D3EE]" />
          </button>
        </div>

        {/* Auto-Sliding Spotlight Banner */}
        <div
          className="relative rounded-3xl overflow-hidden border border-white/[0.12] bg-[#151B2B] shadow-2xl min-h-[380px] lg:min-h-[440px] flex items-end p-6 sm:p-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background image with fade transition */}
          <img
            key={activeSpotlightGame.id}
            src={activeSpotlightGame.image}
            alt={activeSpotlightGame.name}
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.75] transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090B12] via-[#090B12]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090B12] via-[#090B12]/80 to-transparent max-w-2xl" />

          {/* Progress bar */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-white/[0.06]">
            {!isPaused && (
              <div
                key={`progress-${activeIndex}`}
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] rounded-full"
                style={{ animation: 'progressBar 4s linear forwards' }}
              />
            )}
          </div>

          {/* Slide counter top-right */}
          <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
            {isPaused && (
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#94A3B8] bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                PAUSED
              </span>
            )}
            <span className="font-mono text-[10px] font-bold text-white/40">
              {activeIndex + 1} / {FEATURED_GAMES.length}
            </span>
          </div>

          {/* Spotlight content */}
          <div className={`relative z-10 max-w-2xl space-y-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/30 text-[#8B5CF6] border border-[#8B5CF6]/50 font-mono text-xs font-bold uppercase">
                {activeSpotlightGame.tag}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white font-mono text-xs backdrop-blur-sm">
                {activeSpotlightGame.genre}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {activeSpotlightGame.rating} Rating
              </span>
            </div>

            <h3 className="font-display font-black text-3xl sm:text-5xl text-[#F8FAFC]">
              {activeSpotlightGame.name}
            </h3>

            <p className="font-body text-xs sm:text-sm text-[#94A3B8] leading-relaxed line-clamp-3">
              {activeSpotlightGame.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => onSelectTab?.('discovery')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:opacity-95 text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Enter Arena</span>
              </button>

              <button
                onClick={() => onSelectTab?.('tournaments')}
                className="px-6 py-3 rounded-xl bg-[#1B2335] hover:bg-[#232D42] text-[#F8FAFC] border border-white/[0.1] font-display font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-[#22D3EE]" />
                <span>Browse Tournaments</span>
              </button>
            </div>
          </div>
        </div>

        {/* Game Thumbnail Strip — click to jump, highlights active */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {FEATURED_GAMES.map((game, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={game.id}
                onClick={() => handleSelectGame(game, index)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                  isActive
                    ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/50 shadow-xl shadow-[#8B5CF6]/20 -translate-y-1'
                    : 'border-white/[0.08] hover:border-white/[0.25] hover:-translate-y-1'
                } bg-[#151B2B]`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 ${isActive ? 'scale-105' : ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090B12] via-[#090B12]/40 to-transparent" />

                  {/* Active indicator glow overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#8B5CF6]/10 pointer-events-none" />
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {game.rating}
                  </div>

                  {/* Bottom label */}
                  <div className="absolute bottom-3 inset-x-3 space-y-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#22D3EE] font-bold block truncate">
                      {game.genre}
                    </span>
                    <h4 className="font-display font-black text-sm text-[#F8FAFC] truncate">
                      {game.name}
                    </h4>
                  </div>
                </div>

                {/* Active slide progress bar at bottom of card */}
                {isActive && !isPaused && (
                  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/[0.06]">
                    <div
                      key={`card-progress-${activeIndex}`}
                      className="h-full bg-[#8B5CF6] rounded-full"
                      style={{ animation: 'progressBar 4s linear forwards' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dot nav indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {FEATURED_GAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelectGame(FEATURED_GAMES[i], i)}
              className={`transition-all duration-300 rounded-full ${
                i === activeIndex
                  ? 'w-6 h-1.5 bg-[#8B5CF6]'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to ${FEATURED_GAMES[i].name}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2b. LIVE ARENA COMMAND DECK (Tactical Radar, Killfeed & Fast Matchmaking)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-6 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <LiveArenaCommandDeck
          onSelectTab={onSelectTab}
          onOpenAuth={onOpenAuthWithRole}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. TRENDING & GAME DISCOVERY CATEGORIES
      ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#101522] border-y border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-[#8B5CF6]">
                Genre Discovery
              </span>
              <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#F8FAFC]">
                Explore by Category
              </h2>
            </div>
            <p className="font-body text-xs text-[#94A3B8]">
              Browse through top competitive and casual genres on the FLUX platform.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {DISCOVERY_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectTab?.('discovery')}
                  className="group relative p-4 rounded-2xl bg-[#151B2B] hover:bg-[#1B2335] border border-white/[0.08] hover:border-[#8B5CF6]/50 text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#1B2335] border border-white/[0.08] flex items-center justify-center text-[#22D3EE] group-hover:text-[#8B5CF6] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-display font-bold text-sm text-[#F8FAFC] block group-hover:text-white transition-colors">
                        {cat.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#94A3B8] block">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. LEADERBOARD & ESPORTS COMPETITIVE SECTION
      ═══════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════
          3b. MARQUEE STRIP 3 — TOP TEAMS RANKINGS SCROLL
      ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-t border-white/[0.06] bg-[#101522] py-0">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#101522] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#101522] to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-4 bg-[#101522] border-r border-white/[0.06]">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#F59E0B] whitespace-nowrap flex items-center gap-1.5">
            <Trophy className="w-3 h-3" />
            TOP SQUADS
          </span>
        </div>
        <div className="pl-24 overflow-hidden">
          <div className="animate-marquee-smooth flex items-center" style={{ animationDuration: '30s' }}>
            {[...MARQUEE_TEAMS, ...MARQUEE_TEAMS].map((team, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-5 py-2.5 border-r border-white/[0.05] shrink-0 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onClick={() => onSelectTab?.('teams')}
              >
                <span className="font-mono text-[10px] font-black text-[#94A3B8]">
                  #{((i % MARQUEE_TEAMS.length) + 1) < 10 ? `0${(i % MARQUEE_TEAMS.length) + 1}` : (i % MARQUEE_TEAMS.length) + 1}
                </span>
                <span className="w-6 h-6 rounded-lg bg-[#1B2335] border border-white/[0.08] text-[#8B5CF6] font-display font-black text-[9px] flex items-center justify-center shrink-0">
                  {team.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-display font-bold text-xs text-[#F8FAFC] whitespace-nowrap">{team.name}</span>
                <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 font-mono text-[9px] font-bold text-[#8B5CF6] whitespace-nowrap">{team.tag}</span>
                <span className="font-mono text-[10px] font-bold text-emerald-400 whitespace-nowrap">{team.wins} WR</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          4. LEADERBOARD & ESPORTS COMPETITIVE SECTION
      ═══════════════════════════════════════════════════════ */}
      <section id="leaderboard-section" className="py-20 lg:py-28 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
              <Trophy className="w-3.5 h-3.5" />
              <span>Championship Standings</span>
            </div>
            <h2 className="mt-2 font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#F8FAFC]">
              Competitive Leaderboards
            </h2>
            <p className="mt-2 font-body text-sm text-[#94A3B8] max-w-xl">
              Live tournament points, win percentages, and official tier rankings for verified squads.
            </p>
          </div>

          <button
            onClick={() => onSelectTab?.('teams')}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151B2B] hover:bg-[#1B2335] border border-white/[0.08] text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] transition-colors"
          >
            <span>View All Squads</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
          </button>
        </div>

        {/* Esports Rankings Table */}
        <div className="rounded-3xl bg-[#151B2B] border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#101522]/80 text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Squad / Roster</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Division</th>
                  <th className="py-4 px-6">Win Rate</th>
                  <th className="py-4 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-body text-xs">
                {TOP_SQUADS_LEADERBOARD.map((squad) => (
                  <tr
                    key={squad.rank}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => onSelectTab?.('teams')}
                  >
                    <td className="py-4 px-6 font-mono font-black text-sm text-[#F8FAFC]">
                      {squad.rank === '01' ? (
                        <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                          <Crown className="w-4 h-4" /> 01
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">#{squad.rank}</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1B2335] border border-white/[0.08] text-[#8B5CF6] font-display font-black text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {squad.logoText}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-sm text-[#F8FAFC]">
                              {squad.name}
                            </span>
                            {squad.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-[#94A3B8]">[{squad.tag}]</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1B2335] border border-white/[0.06] font-mono text-[11px] font-bold text-[#F8FAFC]">
                        {squad.game}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-[#94A3B8]">
                      {squad.division}
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                      {squad.winrate}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-[#F8FAFC]">
                      {squad.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. GAMING COMMUNITY & DISCUSSIONS WIRE
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#101522] border-t border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#8B5CF6]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Player Community</span>
              </div>
              <h2 className="mt-2 font-display font-black text-3xl sm:text-4xl text-[#F8FAFC]">
                Connect &amp; Discuss
              </h2>
              <p className="mt-1 font-body text-xs sm:text-sm text-[#94A3B8]">
                Real-time recruitment dossiers, match highlights, and team strategies from the community.
              </p>
            </div>

            <button
              onClick={() => onSelectTab?.('feed')}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151B2B] hover:bg-[#1B2335] border border-white/[0.08] text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] transition-colors"
            >
              <span>View Social Feed</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8B5CF6]" />
            </button>
          </div>

          {/* Athletes Highlights & Community Posts Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Verified Athletes Column */}
            <div className="p-6 rounded-3xl bg-[#151B2B] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="font-display font-bold text-sm text-[#F8FAFC]">
                  Featured Athletes
                </span>
                <span className="font-mono text-[10px] text-[#22D3EE] font-bold">
                  Verified Dossiers
                </span>
              </div>

              <div className="space-y-3">
                {players.slice(0, 4).map((athlete) => (
                  <div
                    key={athlete.id}
                    className="p-3 rounded-2xl bg-[#1B2335] border border-white/[0.06] flex items-center justify-between gap-3 hover:border-[#8B5CF6]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#22D3EE]/30 text-[#F8FAFC] font-display font-bold text-xs flex items-center justify-center shrink-0">
                        {athlete.username?.slice(0, 2).toUpperCase() || 'AT'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-xs text-[#F8FAFC] truncate">
                            {athlete.name || athlete.username}
                          </span>
                          {athlete.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-[#94A3B8] block truncate">
                          @{athlete.username} · {athlete.primaryGame?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTab?.('discovery')}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-[#8B5CF6] hover:text-white text-[#94A3B8] font-mono text-[10px] font-bold transition-all shrink-0"
                    >
                      Dossier
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Feed Preview Column */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#151B2B] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="font-display font-bold text-sm text-[#F8FAFC]">
                  Community Wire
                </span>
                <span className="font-mono text-[10px] text-[#8B5CF6] font-bold">
                  Live Discussions
                </span>
              </div>

              <div className="space-y-3">
                {posts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-[#1B2335] border border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-[#F8FAFC]">
                          {post.authorName || 'Competitive Gamer'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[#94A3B8] font-mono text-[10px]">
                          {post.game?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#94A3B8]">{post.createdAt}</span>
                    </div>

                    <p className="font-body text-xs text-[#F8FAFC] leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 pt-1 text-xs text-[#94A3B8] font-mono">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          post.likedByMe ? 'text-[#8B5CF6]' : 'hover:text-[#F8FAFC]'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{post.likes || 0} Likes</span>
                      </button>
                      <button
                        onClick={() => onSelectTab?.('feed')}
                        className="flex items-center gap-1.5 hover:text-[#F8FAFC] transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.comments?.length || 0} Comments</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. FINAL CALL TO ACTION (Enter Next Level)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 lg:p-20 overflow-hidden border border-white/[0.12] bg-gradient-to-br from-[#151B2B] via-[#101522] to-[#090B12] text-center space-y-6 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#8B5CF6]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 right-10 w-80 h-80 rounded-full bg-[#22D3EE]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.25em] font-bold text-[#22D3EE]">
              Start Your Esports Journey
            </span>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#F8FAFC] leading-tight">
              Ready to Compete? <br />
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#C084FC] to-[#22D3EE] bg-clip-text text-transparent">
                Enter the Next Level.
              </span>
            </h2>
            <p className="font-body text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Join thousands of competitive gamers, form your official squad, and dominate the tournaments.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => {
                if (!isAuthenticated) onOpenAuthWithRole?.('player', 'signup');
                else onSelectTab?.('profile');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:opacity-95 text-white font-display font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#8B5CF6]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isAuthenticated ? 'View Gamer Passport' : 'Create Player Account'}</span>
            </button>

            <button
              onClick={onOpenTeamCreator}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#1B2335] hover:bg-[#232D42] text-[#F8FAFC] border border-white/[0.12] font-display font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#22D3EE]" />
              <span>Form a Team</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. PLATFORM FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.08] bg-[#06080E] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center font-display font-black text-sm text-white">
                F
              </div>
              <span className="font-display font-black text-lg text-[#F8FAFC]">
                FLU<span className="text-[#22D3EE]">X</span>
              </span>
              <span className="h-3 w-px bg-white/20" />
              <span className="font-mono text-xs text-[#94A3B8]">
                Next-Gen Competitive Esports Ecosystem
              </span>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs text-[#94A3B8]">
              <button onClick={() => onSelectTab?.('discovery')} className="hover:text-[#F8FAFC] transition-colors">Games</button>
              <button onClick={() => onSelectTab?.('tournaments')} className="hover:text-[#F8FAFC] transition-colors">Tournaments</button>
              <button onClick={() => onSelectTab?.('teams')} className="hover:text-[#F8FAFC] transition-colors">Squads</button>
              <button onClick={() => onSelectTab?.('feed')} className="hover:text-[#F8FAFC] transition-colors">Community</button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#94A3B8]/80">
            <span>&copy; 2026 FLUX Esports Network. All rights reserved.</span>
            <span>All trademarks and game artwork belong to their respective publishers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
