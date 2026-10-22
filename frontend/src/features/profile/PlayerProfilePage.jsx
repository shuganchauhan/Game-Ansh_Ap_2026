import React, { useState } from 'react';
import {
  Shield, CheckCircle2, Trophy, Swords, Share2, Edit3, MessageSquare, Play,
  ExternalLink, Award, Sparkles, Check, Globe, Zap, ArrowLeft, Plus, Star
} from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export default function PlayerProfilePage({ onSelectTab, onBack }) {
  const {
    currentUser,
    updateCurrentUserProfile,
    connectedPlayerIds,
    toggleConnectPlayer,
  } = useGameStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'career' | 'vods' | 'endorsements'
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit form state
  const [formName, setFormName] = useState(currentUser.name);
  const [formTagline, setFormTagline] = useState(currentUser.tagline);
  const [formBio, setFormBio] = useState(currentUser.bio);
  const [formLocation, setFormLocation] = useState(currentUser.location);
  const [formLft, setFormLft] = useState(currentUser.lftStatus);
  const [formScrimHours, setFormScrimHours] = useState(currentUser.scrimAvailability);
  const [formDiscord, setFormDiscord] = useState(currentUser.discord);
  const [formValId, setFormValId] = useState(currentUser.gameAccounts?.valorant || '');
  const [formBgmiId, setFormBgmiId] = useState(currentUser.gameAccounts?.bgmi || '');
  const [formFfId, setFormFfId] = useState(currentUser.gameAccounts?.freefire || '');
  const [formCocId, setFormCocId] = useState(currentUser.gameAccounts?.coc || '');
  const [formCrId, setFormCrId] = useState(currentUser.gameAccounts?.cr || '');
  const [formCodId, setFormCodId] = useState(currentUser.gameAccounts?.cod || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: formName,
      tagline: formTagline,
      bio: formBio,
      location: formLocation,
      lftStatus: formLft,
      scrimAvailability: formScrimHours,
      discord: formDiscord,
      gameAccounts: {
        valorant: formValId,
        bgmi: formBgmiId,
        freefire: formFfId,
        coc: formCocId,
        cr: formCrId,
        cod: formCodId,
      },
    });
    setEditModalOpen(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => onSelectTab('dashboard'))}
          className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold bg-secondary/15 text-secondary border border-secondary/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            Verified Esports Athlete
          </span>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-on-surface transition-all"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copiedLink && (
        <div className="p-3 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary font-mono text-xs text-center animate-in fade-in">
          ✓ Profile link copied to clipboard!
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          LINKEDIN HEADER CARD
      ═══════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden bg-surface-container-low border border-card-border shadow-xl">
        {/* Banner image with overlay */}
        <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-gradient-to-r from-primary/20 via-surface-container-high to-secondary/20">
          <img
            src={currentUser.banner}
            alt="Profile Banner"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent" />
        </div>

        {/* Profile info overlay */}
        <div className="px-6 sm:px-8 pb-6 relative -mt-16 sm:-mt-20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-secondary to-primary-container shadow-2xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg">
                <span className="w-3.5 h-3.5 rounded-full bg-secondary shadow-[0_0_8px_#41eec2]" />
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={() => toggleConnectPlayer('player-2')}
                className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                Offer Tryout / Scrim
              </button>
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
                {currentUser.name}
              </h1>
              {currentUser.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" title="Verified Pro Athlete" />
              )}
              <span className="px-2.5 py-0.5 rounded font-mono text-xs bg-surface-container-highest text-on-surface-variant font-semibold">
                @{currentUser.username}
              </span>
            </div>

            <p className="font-body text-sm sm:text-base text-on-surface font-medium max-w-3xl leading-relaxed">
              {currentUser.tagline}
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant flex-wrap pt-1">
              <span>📍 {currentUser.location}</span>
              <span>•</span>
              <span className="text-secondary font-bold">
                {currentUser.connectionsCount || 428} Pro Connections
              </span>
              <span>•</span>
              <span className="text-tertiary font-bold">
                Discord: {currentUser.discord}
              </span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-bold">
                {currentUser.lftStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TELEMETRY CARDS (Key Pro Metrics)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-card-border space-y-1">
          <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider">
            Competitive Tier
          </span>
          <div className="font-display font-bold text-xl text-tertiary">
            {currentUser.stats?.valorant?.rank || 'IMMORTAL 3'}
          </div>
          <span className="font-mono text-[10px] text-secondary">
            {currentUser.stats?.valorant?.rr || '284 RR'} · Top 0.8%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-card-border space-y-1">
          <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider">
            Tournament KD
          </span>
          <div className="font-display font-bold text-xl text-secondary">
            {currentUser.stats?.valorant?.kd || '1.38'}
          </div>
          <span className="font-mono text-[10px] text-on-surface-variant">
            Verified Scrim Sample (48 Maps)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-card-border space-y-1">
          <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider">
            Headshot Precision
          </span>
          <div className="font-display font-bold text-xl text-primary">
            {currentUser.stats?.valorant?.hs || '34.2%'}
          </div>
          <span className="font-mono text-[10px] text-on-surface-variant">
            Rifle &amp; Vandal Accuracy
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-card-border space-y-1">
          <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider">
            Clutch Winrate
          </span>
          <div className="font-display font-bold text-xl text-on-surface">
            {currentUser.stats?.valorant?.winrate || '68.4%'}
          </div>
          <span className="font-mono text-[10px] text-secondary">
            1v2+ Clutches (31 Converted)
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          NAV TABS (LinkedIn Resume Navigation)
      ═══════════════════════════════════════════════════════ */}
      <div className="flex border-b border-card-border gap-6">
        {[
          { id: 'overview', label: 'Overview & Linked Accounts' },
          { id: 'career', label: 'Career & Tournament Record' },
          { id: 'endorsements', label: 'Scout Reviews & Endorsements' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-display text-sm font-bold uppercase tracking-wider transition-all relative ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-glow" />
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: OVERVIEW & VERIFIED IN-GAME ACCOUNTS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* About section */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-2">
            <h3 className="font-display font-bold text-lg text-on-surface">About Athlete</h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {currentUser.bio}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-on-surface-variant">
              <span>🕒 Scrim Windows: <b className="text-on-surface">{currentUser.scrimAvailability}</b></span>
            </div>
          </div>

          {/* Verified In-Game Accounts across all 6 Games */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-on-surface">
                Verified In-Game Credentials (6 Titles)
              </h3>
              <span className="font-mono text-xs text-secondary font-bold">
                API Crawled &amp; Anti-Cheat Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Valorant */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-[#ff4655]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#ff4655]">⚡ VALORANT</span>
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div className="font-mono text-xs text-on-surface font-semibold">
                  IGN: {currentUser.gameAccounts?.valorant || 'Vortex#IND'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-1 border-t border-card-border">
                  <span>Immortal 3 (284 RR)</span>
                  <span className="text-[#ff4655] font-bold">1.38 KD</span>
                </div>
              </div>

              {/* BGMI */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-[#f5a623]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#f5a623]">🔫 BGMI</span>
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div className="font-mono text-xs text-on-surface font-semibold">
                  ID: {currentUser.gameAccounts?.bgmi || '512948194'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-1 border-t border-card-border">
                  <span>Conqueror (6400 pts)</span>
                  <span className="text-[#f5a623] font-bold">5.20 KD</span>
                </div>
              </div>

              {/* Free Fire */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-[#ff6b00]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#ff6b00]">🔥 FREE FIRE</span>
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div className="font-mono text-xs text-on-surface font-semibold">
                  UID: {currentUser.gameAccounts?.freefire || '891240182'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-1 border-t border-card-border">
                  <span>Grandmaster (84★)</span>
                  <span className="text-[#ff6b00] font-bold">62% HS</span>
                </div>
              </div>

              {/* Clash of Clans */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-[#4db6ac]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#4db6ac]">🏰 CLASH OF CLANS</span>
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div className="font-mono text-xs text-on-surface font-semibold">
                  Tag: {currentUser.gameAccounts?.coc || '#2QP9LV0'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-1 border-t border-card-border">
                  <span>Town Hall 17 Max</span>
                  <span className="text-[#4db6ac] font-bold">1,840 War★</span>
                </div>
              </div>

              {/* Clash Royale */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-[#7e57c2]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#7e57c2]">👑 CLASH ROYALE</span>
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div className="font-mono text-xs text-on-surface font-semibold">
                  Tag: {currentUser.gameAccounts?.cr || '#8P8Y20R'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-1 border-t border-card-border">
                  <span>Ultimate Champion</span>
                  <span className="text-[#7e57c2] font-bold">8,400 Trophies</span>
                </div>
              </div>

              {/* Call of Duty */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-[#4caf50]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#4caf50]">💀 CALL OF DUTY</span>
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div className="font-mono text-xs text-on-surface font-semibold">
                  Activision: {currentUser.gameAccounts?.cod || 'Vortex#91823'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-1 border-t border-card-border">
                  <span>Legendary Tier</span>
                  <span className="text-[#4caf50] font-bold">2.14 KD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2: CAREER & TOURNAMENT RECORD
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'career' && (
        <div className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
          <h3 className="font-display font-bold text-lg text-on-surface">
            Competitive Placements &amp; Tournaments Won
          </h3>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-card-border">
            {currentUser.careerMilestones?.map((milestone, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-8">
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-surface-container-low" />
                <div className="space-y-0.5">
                  <span className="font-mono text-xs text-secondary font-bold">{milestone.year}</span>
                  <h4 className="font-display font-bold text-base text-on-surface">{milestone.title}</h4>
                  <p className="font-body text-xs text-on-surface-variant">{milestone.team}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 3: ENDORSEMENTS & SCOUT REVIEWS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'endorsements' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
            <h3 className="font-display font-bold text-lg text-on-surface">
              Coach &amp; Teammate Recommendations
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-surface-container border border-card-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center font-display font-bold text-xs text-secondary">
                      M
                    </div>
                    <div>
                      <span className="font-display font-bold text-xs text-on-surface block">Mortal (S8UL)</span>
                      <span className="font-mono text-[10px] text-on-surface-variant">Team Owner &amp; Captain</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-secondary font-bold">★ Verified Review</span>
                </div>
                <p className="font-body text-xs text-on-surface-variant italic">
                  &ldquo;Alex is one of the most disciplined communicators we've scrimmed with. Excellent mid-round reads and ice-cold clutches in overtime.&rdquo;
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container border border-card-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-display font-bold text-xs text-primary">
                      G
                    </div>
                    <div>
                      <span className="font-display font-bold text-xs text-on-surface block">Global Esports Scout Desk</span>
                      <span className="font-mono text-[10px] text-on-surface-variant">Tactical Scout Department</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-primary font-bold">★ Scout Endorsement</span>
                </div>
                <p className="font-body text-xs text-on-surface-variant italic">
                  &ldquo;High mechanical baseline with 34% headshot accuracy. Strong candidate for any tier-1 academy or VCT split roster.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          EDIT PROFILE MODAL
      ═══════════════════════════════════════════════════════ */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl glass-modal p-6 sm:p-8 space-y-5 shadow-2xl border border-card-border max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="font-display font-bold text-2xl text-on-surface">Edit Gamer Profile</h3>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">
                Update your LinkedIn-style gaming portfolio, linked game tags, and scrim availability.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                  Full Name / Gamer Tag
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                  Professional Tagline
                </label>
                <input
                  type="text"
                  required
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                  Bio / Competitive Dossier
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Discord Tag
                  </label>
                  <input
                    type="text"
                    value={formDiscord}
                    onChange={(e) => setFormDiscord(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    LFT Status
                  </label>
                  <input
                    type="text"
                    value={formLft}
                    onChange={(e) => setFormLft(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1">
                    Daily Scrim Hours
                  </label>
                  <input
                    type="text"
                    value={formScrimHours}
                    onChange={(e) => setFormScrimHours(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-card-border text-on-surface text-sm font-body focus:outline-none"
                  />
                </div>
              </div>

              {/* Game IDs */}
              <div className="space-y-2 pt-2 border-t border-card-border">
                <span className="font-mono text-xs font-bold text-on-surface block">
                  Link In-Game IDs for Verified Badges:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Valorant (Riot ID #tag)"
                    value={formValId}
                    onChange={(e) => setFormValId(e.target.value)}
                    className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-mono"
                  />
                  <input
                    type="text"
                    placeholder="BGMI Character ID"
                    value={formBgmiId}
                    onChange={(e) => setFormBgmiId(e.target.value)}
                    className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Free Fire UID"
                    value={formFfId}
                    onChange={(e) => setFormFfId(e.target.value)}
                    className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Clash of Clans Tag"
                    value={formCocId}
                    onChange={(e) => setFormCocId(e.target.value)}
                    className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Clash Royale Tag"
                    value={formCrId}
                    onChange={(e) => setFormCrId(e.target.value)}
                    className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Call of Duty Activision ID"
                    value={formCodId}
                    onChange={(e) => setFormCodId(e.target.value)}
                    className="p-2 rounded-lg bg-surface-container border border-card-border text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 font-display text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-display font-bold text-xs uppercase tracking-wider shadow-glow active:scale-95 transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
