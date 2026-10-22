import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import useHeroThreeJS from '../../hooks/useHeroThreeJS';
import { useGSAPReveal, useCounterGSAP, useMarqueeTicker } from '../../hooks/useGSAP';
import { useTheme } from '../../stores/themeContext';
import {
  Gamepad2, Shield, Trophy, Radio, ChevronRight, ShieldCheck, Zap,
  Swords, Users, Star, MessageSquare, TrendingUp, Play, ArrowRight,
  Cpu, Target, Globe2
} from 'lucide-react';

/* ── Static dummy data ── */
const TICKER_ITEMS = [
  { label: 'LIVE', team1: 'Team Soul', team2: 'Godlike Esports', score: '12:9', game: 'BGMI' },
  { label: 'LIVE', team1: 'Global Esports', team2: 'Velocity Gaming', score: '2:1', game: 'VALORANT' },
  { label: 'FINAL', team1: 'Total Gaming', team2: 'AS Esports', score: '1:0', game: 'FREE FIRE' },
  { label: 'UPCOMING', team1: 'INDIA Warriors', team2: 'Desi Destroyers', score: 'vs', game: 'CLASH OF CLANS' },
  { label: 'LIVE', team1: 'SynerGY India', team2: 'Team IND CoD', score: '4:2', game: 'COD MOBILE' },
  { label: 'LIVE', team1: 'Phoenix Force CR', team2: 'Crown Raiders', score: '1:0', game: 'CLASH ROYALE' },
];

const FEATURE_SLIDES = [
  {
    title: 'Intelligent Scouting Engine',
    subtitle: 'SCOUTING HUB',
    body: 'Discover verified rosters in real time. Filter by ELO tier, game title, role vacancy, and scrim availability. Smart Radar flags the three closest-matching squads to your profile the moment you log in.',
    icon: Target,
    accent: 'secondary',
    tags: ['Smart Match', 'Live Filter', 'ELO-Verified'],
    stat: '14,200+',
    statLabel: 'Active Players Indexed',
  },
  {
    title: 'Automated Bracket Engine',
    subtitle: 'TOURNAMENT OPS',
    body: 'Single, double-elimination, and Swiss formats. Automatic bye seeding, anti-cheat proof uploads, and zero-latency live score feeds. Prize distribution handled on-chain via smart-contract templates.',
    icon: Trophy,
    accent: 'tertiary',
    tags: ['BO3 / BO5', 'Live Brackets', 'Auto Prize Split'],
    stat: '$1.2M+',
    statLabel: 'Prize Pool Distributed',
  },
  {
    title: 'Recruitment Pipeline',
    subtitle: 'TRYOUT PIPELINE',
    body: 'Post role openings as an org. Players submit video-linked pitches. Accept, shortlist, or decline — all in a state-machine enforced pipeline with real-time socket notifications to applicants.',
    icon: Shield,
    accent: 'primary',
    tags: ['State Machine', 'Roster Lock', 'IGN Sync'],
    stat: '840+',
    statLabel: 'Active Team Rosters',
  },
  {
    title: 'Live Direct Messaging',
    subtitle: 'SOCKET.IO CORE',
    body: 'Sub-150ms message delivery via Socket.io with Redis pub/sub at scale. Player-to-player DMs, match room coordination, and org-wide broadcast channels with delivered / read receipts.',
    icon: MessageSquare,
    accent: 'secondary',
    tags: ['<150ms', 'Redis Backed', 'Thread Rooms'],
    stat: '98.7%',
    statLabel: 'Uptime SLA',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Build Profile & Link Game IGN',
    body: 'Sync Riot, Steam, or Epic IDs. Our crawler extracts verified KDA, rank, tier history, and match VODs instantly.',
    icon: Cpu,
    api: 'Steam API · Riot API',
  },
  {
    num: '02',
    title: 'Apply to Rosters or Post Roles',
    body: 'Submit one-click tryout dossiers to verified orgs or publish team recruitments specifying agent pools and play schedules.',
    icon: Target,
    api: 'Avg. Response: < 4 hours',
  },
  {
    num: '03',
    title: 'Compete in Verified Tourneys',
    body: 'Check in to tournaments with integrated map vetoes, server allocation, and automated smart-contract payouts.',
    icon: Globe2,
    api: '$250K+ Active Pool',
  },
];

const VERIFIED_PROS = [
  { handle: 'Mortal', org: 'S8UL', role: 'IGL / Fragger', tier: 'BGMI Legend', game: 'BGMI' },
  { handle: 'ScoutOP', org: 'OR Esports', role: 'Sniper', tier: 'BGMI Legend', game: 'BGMI' },
  { handle: 'Mavi', org: 'Global Esports', role: 'Sentinel', tier: 'Radiant', game: 'VALORANT' },
  { handle: 'TotalGaming', org: 'Total Gaming', role: 'IGL', tier: 'Heroic', game: 'FREE FIRE' },
];

/* ── Ticker Item component ── */
function TickerItem({ item }) {
  const isLive = item.label === 'LIVE';
  return (
    <div className="flex items-center gap-3 px-6 shrink-0">
      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
        isLive ? 'bg-error/20 text-error' : item.label === 'FINAL' ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'
      }`}>
        {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-error animate-pulse mr-1 align-middle" />}
        {item.label}
      </span>
      <span className="font-display text-xs font-semibold text-on-surface">{item.team1}</span>
      <span className="font-mono text-sm font-bold text-primary">{item.score}</span>
      <span className="font-display text-xs font-semibold text-on-surface">{item.team2}</span>
      <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
        {item.game}
      </span>
      <span className="text-card-border pl-4">·</span>
    </div>
  );
}

/* ── Accent map ── */
const accentClassMap = {
  primary: {
    chip: 'bg-primary/15 text-primary border-primary/30',
    icon: 'bg-primary/15 text-primary',
    glow: 'shadow-glow',
    tag: 'bg-primary/10 text-primary',
  },
  secondary: {
    chip: 'bg-secondary/15 text-secondary border-secondary/30',
    icon: 'bg-secondary/15 text-secondary',
    glow: 'shadow-glow-accent',
    tag: 'bg-secondary/10 text-secondary',
  },
  tertiary: {
    chip: 'bg-tertiary/15 text-tertiary border-tertiary/30',
    icon: 'bg-tertiary/15 text-tertiary',
    glow: '',
    tag: 'bg-tertiary/10 text-tertiary',
  },
};

export default function LandingPage({ onSelectTab, onOpenAuthWithRole }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Refs
  const canvasRef = useRef(null);
  const tickerRef = useRef(null);
  const featureRef = useRef(null);
  const stepsRef = useRef(null);
  const prosRef = useRef(null);
  const stat1 = useRef(null);
  const stat2 = useRef(null);
  const stat3 = useRef(null);

  const [statsVisible, setStatsVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Compete. Recruit. Dominate.';

  // Three.js background
  useHeroThreeJS(canvasRef, isDark);

  // GSAP scroll reveals
  useGSAPReveal(featureRef, 0);
  useGSAPReveal(stepsRef, 0);
  useGSAPReveal(prosRef, 0);

  // Infinite marquee ticker
  useMarqueeTicker(tickerRef, 45);

  // Animated counters
  useCounterGSAP(stat1, 14200, statsVisible, '+');
  useCounterGSAP(stat2, 840, statsVisible, '+');
  useCounterGSAP(stat3, 250, statsVisible, 'K+');

  // Typing effect for headline
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    if (stat1.current) observer.observe(stat1.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full overflow-x-hidden bg-surface">

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION — Three.js Canvas + Typing Headline
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden scanlines">
        {/* Three.js canvas fills entire hero */}
        <canvas ref={canvasRef} id="threejs-canvas" className="absolute inset-0 w-full h-full" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/10 to-surface pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/40 via-transparent to-surface/40 pointer-events-none z-10" />

        {/* Radial glow spots */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-5" />
        <div className="absolute top-2/3 left-1/4 w-80 h-80 rounded-full bg-secondary/8 blur-[100px] pointer-events-none z-5" />

        {/* Hero content */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-5xl mx-auto gap-7 py-24">

          {/* Verified protocol badge */}
          <div className="fade-up fade-up-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container/60 border border-card-border backdrop-blur-md shadow-glow-accent">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-secondary font-bold">
              Next-Gen Esports Protocol
            </span>
            <ShieldCheck className="w-4 h-4 text-secondary" />
          </div>

          {/* Mega headline with typing effect */}
          <div className="fade-up fade-up-2 space-y-2">
            <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl uppercase tracking-tighter leading-none">
              <span className="gradient-text">
                {typedText}
              </span>
              <span className="cursor-blink text-primary ml-0.5">|</span>
            </h1>
            <p className="font-body text-base sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mt-4">
              The premier esports ecosystem connecting competitive players, elite organizations,
              and tournament organizers in a unified real-time arena.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="fade-up fade-up-3 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              onClick={() => onOpenAuthWithRole('player')}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary-container text-on-primary font-display font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-glow hover:shadow-[0_0_40px_var(--glow-primary)] active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gamepad2 className="w-5 h-5" />
              <span>Enter the Arena</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onOpenAuthWithRole('org')}
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface-container/60 backdrop-blur-md border border-card-border text-secondary font-display font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 hover:border-secondary/60 hover:shadow-glow-accent active:scale-95 transition-all duration-300"
            >
              <Shield className="w-5 h-5" />
              <span>Register Your Org</span>
            </button>
          </div>

          {/* Platform trust micro-row */}
          <div className="fade-up fade-up-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-on-surface-variant">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-secondary" />Verified Organizations</span>
            <span className="text-card-border">·</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" />Sub-150ms Match Events</span>
            <span className="text-card-border">·</span>
            <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-tertiary" />$1.2M+ Distributed</span>
          </div>

          {/* Live pulse card */}
          <div className="fade-up fade-up-5 w-full max-w-lg p-4 rounded-2xl bg-surface-container/50 backdrop-blur-md border border-card-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="live-pulse w-2.5 h-2.5 rounded-full bg-error flex-shrink-0" />
                <span className="font-mono text-xs uppercase tracking-widest text-error font-bold">Live Circuit Active</span>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant">Tier-1 Championship</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-surface-container-highest border border-card-border flex items-center justify-center font-display font-bold text-secondary text-sm">Ω</div>
                <div>
                  <span className="font-display font-bold text-sm text-on-surface block">Omega Vortex</span>
                  <span className="font-mono text-[10px] text-secondary">Radiant · VCT</span>
                </div>
              </div>
              <div className="text-center">
                <span className="font-display font-bold text-2xl text-primary">2:1</span>
                <span className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wide">Map 3 • OT</span>
              </div>
              <div className="flex items-center gap-2.5 text-right">
                <div>
                  <span className="font-display font-bold text-sm text-on-surface block">Apex Nova</span>
                  <span className="font-mono text-[10px] text-tertiary">Contender</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-surface-container-highest border border-card-border flex items-center justify-center font-display font-bold text-primary text-sm">Δ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
          <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Scroll to explore</span>
          <div className="w-px h-10 bg-gradient-to-b from-primary to-transparent animate-pulse" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LIVE MATCH TICKER MARQUEE
      ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-card-border py-3 bg-surface-container-lowest/50 backdrop-blur-sm z-10">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface-container-lowest to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface-container-lowest to-transparent z-10 pointer-events-none" />
        <div ref={tickerRef} className="flex whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <TickerItem key={i} item={item} />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          ANIMATED STATS COUNTER STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 bg-surface" ref={stepsRef}>
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 sm:gap-12">
          {[
            { ref: stat1, prefix: '', label: 'Verified Players', icon: Gamepad2, color: 'text-secondary' },
            { ref: stat2, prefix: '', label: 'Active Rosters', icon: Shield, color: 'text-primary' },
            { ref: stat3, prefix: '$', label: 'Prizes Distributed', icon: Trophy, color: 'text-tertiary' },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} data-reveal className="flex flex-col items-center text-center gap-2">
                <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm font-bold text-on-surface-variant">{s.prefix}</span>
                  <span ref={s.ref} className={`font-display font-bold text-3xl sm:text-4xl ${s.color}`}>0</span>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">{s.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE SWIPER SLIDER
      ══════════════════════════════════════════════════════════ */}
      <section ref={featureRef} className="py-20 px-4 sm:px-6 bg-surface-container-lowest/60">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Section header */}
          <div data-reveal className="text-center space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-secondary font-bold">Platform Core</span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-on-surface">
              Engineered for <span className="gradient-text">Esports</span>
            </h2>
            <p className="font-body text-sm text-on-surface-variant max-w-xl mx-auto">
              Zero-lag. Complete roster control. Production-grade bracket automation built for elite competition.
            </p>
          </div>

          {/* Swiper */}
          <div data-reveal>
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true, dynamicBullets: true }}
              loop
              spaceBetween={0}
              slidesPerView={1}
              className="pb-12"
            >
              {FEATURE_SLIDES.map((slide, i) => {
                const Icon = slide.icon;
                const ac = accentClassMap[slide.accent];
                return (
                  <SwiperSlide key={i}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-10 rounded-3xl bg-surface-container-low border border-card-border game-card-hover transition-all">
                      {/* Left: content */}
                      <div className="flex flex-col justify-center gap-5">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest font-bold border ${ac.chip}`}>
                            {slide.subtitle}
                          </span>
                          <h3 className="font-display font-bold text-2xl sm:text-3xl text-on-surface mt-3">
                            {slide.title}
                          </h3>
                          <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed max-w-md">
                            {slide.body}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {slide.tags.map((t, ti) => (
                            <span key={ti} className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold ${ac.tag}`}>
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => onSelectTab('discovery')}
                          className="w-fit flex items-center gap-2 text-sm font-display font-semibold text-on-surface underline-glow"
                        >
                          Explore Now <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right: stat card */}
                      <div className="flex items-center justify-center">
                        <div className="relative w-full max-w-xs p-8 rounded-3xl bg-surface-container border border-card-border flex flex-col items-center text-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${ac.icon} ${ac.glow}`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <div>
                            <div className={`font-display font-bold text-4xl ${
                              slide.accent === 'primary' ? 'text-primary' :
                              slide.accent === 'secondary' ? 'text-secondary' : 'text-tertiary'
                            }`}>{slide.stat}</div>
                            <div className="font-mono text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
                              {slide.statLabel}
                            </div>
                          </div>
                          {/* Float orbit decoration */}
                          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-primary/30 float-anim" />
                          <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-secondary/40 float-anim" style={{animationDelay:'1.5s'}} />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS — 3-Step Protocol Path
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-surface">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary font-bold">Protocol Path</span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-on-surface">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="font-body text-sm text-on-surface-variant max-w-lg mx-auto">
              Ascend from casual ranked queues to the premier competitive stage in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[33.3%] right-[33.3%] h-px bg-gradient-to-r from-primary/50 via-secondary/50 to-tertiary/50 pointer-events-none" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const colors = ['text-primary', 'text-secondary', 'text-tertiary'];
              const bgs = ['bg-primary/10', 'bg-secondary/10', 'bg-tertiary/10'];
              return (
                <div key={i} data-reveal className="relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-surface-container-low border border-card-border game-card-hover transition-all">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl ${bgs[i]} flex items-center justify-center ${colors[i]} shadow-sm`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-surface-container border border-card-border flex items-center justify-center font-mono text-[11px] font-bold text-on-surface-variant">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-on-surface">{step.title}</h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">{step.body}</p>
                  <span className="font-mono text-[10px] uppercase text-on-surface-variant/60 bg-surface-container px-2 py-1 rounded-lg">
                    {step.api}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VERIFIED PROS ACTIVE — Social Proof Strip
      ══════════════════════════════════════════════════════════ */}
      <section ref={prosRef} className="py-16 px-4 sm:px-6 bg-surface-container-lowest/50 border-y border-card-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-secondary font-bold">Verified Pros Active</span>
              <h3 className="font-display font-bold text-xl text-on-surface mt-1">Global Leaderboard</h3>
            </div>
            <button
              onClick={() => onSelectTab('discovery')}
              className="flex items-center gap-1.5 font-display text-sm font-semibold text-primary underline-glow"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VERIFIED_PROS.map((pro, i) => (
              <div key={i} data-reveal className="p-4 rounded-2xl bg-surface-container-low border border-card-border game-card-hover transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-card-border flex items-center justify-center font-display font-bold text-secondary text-base group-hover:shadow-glow-accent transition-all">
                    {pro.handle[0]}
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-on-surface block">{pro.handle}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">{pro.org}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{pro.game}</span>
                  <span className="font-mono text-tertiary font-bold">{pro.tier}</span>
                </div>
                <span className="mt-2 block font-mono text-[10px] text-on-surface-variant">{pro.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA — Enter the Arena
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-secondary font-bold">
            {VERIFIED_PROS.length * 3500}+ Players Taking the Stage
          </span>
          <h2 className="font-display font-bold text-4xl sm:text-6xl uppercase tracking-tighter">
            Ready to Enter{' '}
            <span className="gradient-text glow-text">the Arena?</span>
          </h2>
          <p className="font-body text-sm text-on-surface-variant max-w-lg mx-auto">
            Join over 14,000 players taking their competitive gaming from amateur scrims to sponsored stages.
          </p>
          <button
            onClick={() => onOpenAuthWithRole('player')}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-primary-container text-on-primary font-display font-bold text-base uppercase tracking-widest shadow-glow hover:shadow-[0_0_60px_var(--glow-primary)] active:scale-95 transition-all duration-300"
          >
            <Gamepad2 className="w-6 h-6" />
            Claim Your Gamer Tag
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-on-surface-variant pt-2">
            <span>Rules</span>
            <span className="text-card-border">·</span>
            <span>Privacy</span>
            <span className="text-card-border">·</span>
            <span>API Docs</span>
            <span className="text-card-border">·</span>
            <span>Support</span>
          </div>
          <p className="font-mono text-[10px] text-on-surface-variant/40">
            © 2026 GAMERS'G ARENA INC.
          </p>
        </div>
      </section>
    </div>
  );
}
