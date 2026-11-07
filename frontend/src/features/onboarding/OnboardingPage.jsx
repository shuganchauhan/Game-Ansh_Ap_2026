import React, { useState } from 'react';
import {
  Gamepad2, Trophy, Building, ShieldCheck, CheckCircle2, ArrowRight,
  Crosshair, User, Sparkles, Flame, Shield, Globe, MessageSquare, AlertCircle,
  Clock, Award
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';
import { api } from '../../lib/api';

const COMPETITIVE_GAMES = [
  { id: 'valorant', name: 'VALORANT', publisher: 'Riot Games', roles: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'IGL'] },
  { id: 'bgmi', name: 'BGMI', publisher: 'Krafton', roles: ['Assaulter', 'Sniper', 'IGL', 'Support', 'Fragger'] },
  { id: 'cs2', name: 'Counter-Strike 2', publisher: 'Valve', roles: ['Entry Fragger', 'AWPer', 'IGL', 'Rifler', 'Support'] },
  { id: 'freefire', name: 'Free Fire', publisher: 'Garena', roles: ['Rusher', 'Sniper', 'IGL', 'Flanker'] },
  { id: 'codm', name: 'Call of Duty: Mobile', publisher: 'Activision', roles: ['Slayer', 'Objective / Anchor', 'Sniper', 'SMG Entry'] },
  { id: 'dota2', name: 'Dota 2', publisher: 'Valve', roles: ['Carry (Pos 1)', 'Mid (Pos 2)', 'Offlane (Pos 3)', 'Support (Pos 4)', 'Hard Support (Pos 5)'] },
];

export default function OnboardingPage({ onSelectTab }) {
  const { user, updateUser } = useAuth();
  const { setCurrentUser, setActiveRole, setActiveOrgId } = useGameStore();

  const [selectedPathway, setSelectedPathway] = useState('player'); // 'player' | 'organizer' | 'org'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Player Profile Form State
  const [playerIgn, setPlayerIgn] = useState(user?.game_ign || user?.username || '');
  const [selectedGame, setSelectedGame] = useState(user?.primary_game?.toLowerCase() || 'valorant');
  const [playerRole, setPlayerRole] = useState('Duelist');
  const [playerRank, setPlayerRank] = useState('');
  const [playerBio, setPlayerBio] = useState(user?.bio || '');
  const [playerTagline, setPlayerTagline] = useState(user?.tagline || 'Competitive Esports Athlete');
  const [playerDiscord, setPlayerDiscord] = useState(user?.discord || '');
  const [playerLft, setPlayerLft] = useState('Available for Scrims & Teams');

  // Organizer Form State
  const [organizerName, setOrganizerName] = useState('');
  const [organizerWebsite, setOrganizerWebsite] = useState('');
  const [organizerTwitter, setOrganizerTwitter] = useState('');
  const [organizerExperience, setOrganizerExperience] = useState('');

  // Organization Form State
  const [orgName, setOrgName] = useState('');
  const [orgLegalName, setOrgLegalName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgRepName, setOrgRepName] = useState('');
  const [orgHeadquarters, setOrgHeadquarters] = useState('India');

  // Get active roles for currently selected game
  const activeGameMeta = COMPETITIVE_GAMES.find((g) => g.id === selectedGame) || COMPETITIVE_GAMES[0];

  const handleSavePlayerProfile = async (e) => {
    e.preventDefault();
    if (!playerIgn.trim()) {
      setError('Please specify your In-Game Name (IGN) or gamer tag.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload = {
        game_ign: playerIgn.trim(),
        primary_game: selectedGame,
        tagline: playerTagline.trim() || 'Competitive Esports Athlete',
        bio: playerBio.trim() || `Competitive ${activeGameMeta.name} player focused on tournament circuit.`,
        discord: playerDiscord.trim(),
        lft_status: playerLft,
        stats: {
          role: playerRole,
          rank: playerRank.trim() || 'Unranked Competitor',
          fair_play_score: 99.8,
        },
      };

      const updated = await api.put(`/players/${user.id}`, payload);
      const mergedUser = { ...user, ...updated, role: 'player' };

      updateUser(mergedUser);
      setCurrentUser(mergedUser);
      setActiveRole('player');

      setSuccessMessage('Gamer profile successfully created! Entering platform...');
      setTimeout(() => {
        onSelectTab('dashboard');
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update player profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOrganizer = async (e) => {
    e.preventDefault();
    if (!organizerName.trim()) {
      setError('Please provide an organizer or league name.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.post('/tournaments/organizer/verification', {
        org_name: organizerName.trim(),
        website: organizerWebsite.trim(),
        twitter: organizerTwitter.trim(),
        experience_summary: organizerExperience.trim() || 'Tournament Organizer & Scrim Host',
      });

      const mergedUser = {
        ...user,
        role: 'organizer',
        name: organizerName.trim(),
        organizer_name: organizerName.trim(),
      };

      updateUser(mergedUser);
      setCurrentUser(mergedUser);
      setActiveRole('organizer');

      setSuccessMessage('Tournament Organizer registered! Transferring to Organizer Hub...');
      setTimeout(() => {
        onSelectTab('organizer');
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit organizer application.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError('Please enter your Esports Organization brand name.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/orgs/verification', {
        legal_name: orgLegalName.trim() || `${orgName.trim()} Esports`,
        org_name: orgName.trim(),
        website: orgWebsite.trim(),
        rep_name: orgRepName.trim() || user?.username || 'Team Owner',
        rep_email: user?.email,
      });

      const assignedOrgId = res?.org_id || user.id;
      const mergedUser = {
        ...user,
        role: 'org',
        id: assignedOrgId,
        name: orgName.trim(),
        org_name: orgName.trim(),
      };

      updateUser(mergedUser);
      setCurrentUser(mergedUser);
      setActiveRole('org');
      setActiveOrgId(assignedOrgId);

      setSuccessMessage('Esports Organization successfully registered! Opening Org Hub...');
      setTimeout(() => {
        onSelectTab('dashboard');
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to register organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* ── Header Telemetry ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-card-border shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1ac5b0] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1ac5b0]" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface font-semibold">
            Onboarding Protocol
          </span>
          <span className="text-on-surface-variant/40">|</span>
          <span className="font-mono text-[11px] text-[#37ebf3] font-medium">
            Setup Your Competitive Identity
          </span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-on-surface">
          Choose Your Path in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#37ebf3] to-primary">FLUX</span>
        </h1>
        <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Create your verified pro gamer dossier to participate in automated scrims, or register as a sanctioned tournament organizer or esports organization.
        </p>
      </div>

      {/* ── Status Messages ── */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-error/15 border border-error/30 text-error text-xs font-body max-w-2xl mx-auto animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-[#1ac5b0]/15 border border-[#1ac5b0]/30 text-[#1ac5b0] text-xs font-body max-w-2xl mx-auto animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-semibold">{successMessage}</span>
        </div>
      )}

      {/* ── Pathway Selector Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pathway 1: Pro Gamer / Athlete */}
        <button
          type="button"
          onClick={() => {
            setSelectedPathway('player');
            setError(null);
          }}
          className={`text-left p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
            selectedPathway === 'player'
              ? 'bg-surface-container-high border-primary ring-2 ring-primary/20 shadow-xl'
              : 'bg-surface-container-low hover:bg-surface-container border-card-border text-on-surface-variant'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                Recommended
              </span>
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-on-surface">Pro Gamer Profile</h2>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Build your athlete passport, link game accounts, showcase rank, join rosters, and play in scrims.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-card-border/60 flex items-center text-xs font-mono text-primary font-bold">
            <span>Configure Athlete Identity</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </div>
        </button>

        {/* Pathway 2: Tournament Organizer */}
        <button
          type="button"
          onClick={() => {
            setSelectedPathway('organizer');
            setError(null);
          }}
          className={`text-left p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
            selectedPathway === 'organizer'
              ? 'bg-surface-container-high border-[#C48200] ring-2 ring-[#C48200]/20 shadow-xl'
              : 'bg-surface-container-low hover:bg-surface-container border-card-border text-on-surface-variant'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#C48200]/15 border border-[#C48200]/30 flex items-center justify-center text-[#C48200]">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#C48200]/10 text-[#C48200] border border-[#C48200]/20">
                Organizer Hub
              </span>
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-on-surface">Tournament Organizer</h2>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Host official championships, provision automated scrim lobbies, and distribute escrowed prize pools.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-card-border/60 flex items-center text-xs font-mono text-[#C48200] font-bold">
            <span>Register as Organizer</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </div>
        </button>

        {/* Pathway 3: Esports Organization */}
        <button
          type="button"
          onClick={() => {
            setSelectedPathway('org');
            setError(null);
          }}
          className={`text-left p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
            selectedPathway === 'org'
              ? 'bg-surface-container-high border-[#37ebf3] ring-2 ring-[#37ebf3]/20 shadow-xl'
              : 'bg-surface-container-low hover:bg-surface-container border-card-border text-on-surface-variant'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#37ebf3]/15 border border-[#37ebf3]/30 flex items-center justify-center text-[#37ebf3]">
                <Building className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#37ebf3]/10 text-[#37ebf3] border border-[#37ebf3]/20">
                Team Brand
              </span>
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-on-surface">Esports Organization</h2>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Manage multi-game rosters, scout elite talent, review tryouts, and build an official gaming franchise.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-card-border/60 flex items-center text-xs font-mono text-[#37ebf3] font-bold">
            <span>Register Organization</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </div>
        </button>

      </div>

      {/* ── Active Pathway Form Container ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-card-border shadow-2xl">
        
        {/* ── PATHWAY 1: PRO GAMER FORM ── */}
        {selectedPathway === 'player' && (
          <form onSubmit={handleSavePlayerProfile} className="space-y-6">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  <span>Configure Your Competitive Gamer Identity</span>
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  This identity is displayed across scrim lobbies, team rosters, and tournaments.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1ac5b0]/10 text-[#1ac5b0] border border-[#1ac5b0]/20 font-mono text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> FairPlay Protected
              </span>
            </div>

            {/* In-Game Name & Primary Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  In-Game Name (IGN) / Tag *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vortex#9921"
                    value={playerIgn}
                    onChange={(e) => setPlayerIgn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Discord Handle
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="e.g. vortex_esports"
                    value={playerDiscord}
                    onChange={(e) => setPlayerDiscord(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary font-body"
                  />
                </div>
              </div>
            </div>

            {/* Select Primary Game */}
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-2 font-bold">
                Select Primary Competitive Game
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COMPETITIVE_GAMES.map((game) => {
                  const isSelected = selectedGame === game.id;
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => {
                        setSelectedGame(game.id);
                        setPlayerRole(game.roles[0]);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-primary/15 border-primary text-on-surface font-bold shadow-md'
                          : 'bg-surface-container-low hover:bg-surface-container border-card-border text-on-surface-variant'
                      }`}
                    >
                      <Crosshair className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                      <div className="min-w-0">
                        <p className="font-display text-xs truncate leading-tight">{game.name}</p>
                        <p className="font-mono text-[9px] text-on-surface-variant/70 truncate">{game.publisher}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role & Division / Rank */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Tactical Role in {activeGameMeta.name}
                </label>
                <select
                  value={playerRole}
                  onChange={(e) => setPlayerRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary font-body"
                >
                  {activeGameMeta.roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Current Rank / Rating
                </label>
                <input
                  type="text"
                  placeholder="e.g. Immortal 3 / Ace Dominator / Global Elite"
                  value={playerRank}
                  onChange={(e) => setPlayerRank(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary font-body"
                />
              </div>
            </div>

            {/* LFT Status & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Team & Scrim Availability
                </label>
                <select
                  value={playerLft}
                  onChange={(e) => setPlayerLft(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary font-body"
                >
                  <option value="Available for Scrims & Teams">Available for Scrims & Teams</option>
                  <option value="Actively Seeking Tier-1 Team">Actively Seeking Tier-1 Team</option>
                  <option value="In an Active Roster">In an Active Roster</option>
                  <option value="Free Agent / Sub">Free Agent / Sub</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Professional Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tier-1 Duelist · VCT SA Finalist"
                  value={playerTagline}
                  onChange={(e) => setPlayerTagline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary font-body"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                Competitive Bio & Milestones
              </label>
              <textarea
                rows={3}
                placeholder="Share your competitive background, previous rosters, tournament finishes, and training schedule..."
                value={playerBio}
                onChange={(e) => setPlayerBio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary font-body"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Skip for now and browse platform
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary via-[#9381ff] to-[#37ebf3] text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-white" />
                <span>{loading ? 'Saving Profile...' : 'Save Gaming Profile & Enter Platform'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        )}

        {/* ── PATHWAY 2: TOURNAMENT ORGANIZER FORM ── */}
        {selectedPathway === 'organizer' && (
          <form onSubmit={handleRegisterOrganizer} className="space-y-6">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#C48200]" />
                  <span>Register as Tournament Organizer</span>
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Organizers gain access to automated scrim room management and bracket administration.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C48200]/10 text-[#C48200] border border-[#C48200]/20 font-mono text-[10px] font-bold">
                <Shield className="w-3.5 h-3.5" /> Escrow Authorized
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Organizer / League Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Esports Circuit"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#C48200] font-body"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Official Website or Tournament Portal
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://apexchampionship.gg"
                  value={organizerWebsite}
                  onChange={(e) => setOrganizerWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#C48200] font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Twitter / X / Discord Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. @apex_circuit"
                  value={organizerTwitter}
                  onChange={(e) => setOrganizerTwitter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#C48200] font-body"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Contact Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high border border-card-border text-on-surface-variant text-sm font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                Tournament Organizing Experience & Portfolio
              </label>
              <textarea
                rows={3}
                placeholder="Describe your previous tournaments, teams hosted, prize pool management, and referee experience..."
                value={organizerExperience}
                onChange={(e) => setOrganizerExperience(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#C48200] font-body"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Skip for now and browse platform
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C48200] to-amber-600 text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C48200]/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-white" />
                <span>{loading ? 'Registering...' : 'Register as Tournament Organizer'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        )}

        {/* ── PATHWAY 3: ESPORTS ORGANIZATION FORM ── */}
        {selectedPathway === 'org' && (
          <form onSubmit={handleRegisterOrg} className="space-y-6">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#37ebf3]" />
                  <span>Register an Esports Organization</span>
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Manage multi-title rosters, recruit players, review tryout applications, and build your brand.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#37ebf3]/10 text-[#37ebf3] border border-[#37ebf3]/20 font-mono text-[10px] font-bold">
                <Award className="w-3.5 h-3.5" /> Official Roster Badge
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Organization Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Velocity Gaming"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#37ebf3] font-body"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Legal Entity / Registered Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Velocity Gaming Pvt Ltd"
                  value={orgLegalName}
                  onChange={(e) => setOrgLegalName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#37ebf3] font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Official Website
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://velocity.gg"
                  value={orgWebsite}
                  onChange={(e) => setOrgWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#37ebf3] font-body"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Representative / Founder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manoj K."
                  value={orgRepName}
                  onChange={(e) => setOrgRepName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#37ebf3] font-body"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">
                  Headquarters / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  value={orgHeadquarters}
                  onChange={(e) => setOrgHeadquarters(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-[#37ebf3] font-body"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Skip for now and browse platform
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#37ebf3] to-teal-500 text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#37ebf3]/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Building className="w-4 h-4 text-black" />
                <span>{loading ? 'Registering Org...' : 'Register Esports Organization'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
