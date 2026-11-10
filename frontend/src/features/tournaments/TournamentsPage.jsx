import React, { useState, useEffect } from 'react';
import {
  Trophy, Swords, Calendar, Users, Shield, CheckCircle, Flame, ExternalLink,
  Clock, ArrowRight, Lock, ChevronRight, Plus
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { scrimService, discoveryService } from '../../services';

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
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [scrims, setScrims] = useState([]);
  const [loadingScrims, setLoadingScrims] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [scrimsData, tourneysData] = await Promise.allSettled([
          scrimService.listScrims(),
          discoveryService.getTournaments(),
        ]);
        if (mounted && scrimsData.status === 'fulfilled') {
          setScrims(scrimsData.value || []);
        }
        if (mounted && tourneysData.status === 'fulfilled') {
          const list = Array.isArray(tourneysData.value) ? tourneysData.value : (tourneysData.value?.data || []);
          setTournaments(list);
        }
      } catch (err) {
        console.error('Failed to load tournaments/scrims:', err);
      } finally {
        if (mounted) {
          setLoadingScrims(false);
          setLoadingTournaments(false);
        }
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);


  const filteredScrims = scrims.filter(s => {
    if (selectedGameFilter === 'all') return true;
    return s.game?.toLowerCase() === selectedGameFilter.toLowerCase();
  });

  const featuredTournament = tournaments[0] || null;
  const prizeDisplay = featuredTournament?.prize_pool
    ? (String(featuredTournament.prize_pool).startsWith('₹') || String(featuredTournament.prize_pool).startsWith('$')
        ? featuredTournament.prize_pool
        : `₹${Number(featuredTournament.prize_pool).toLocaleString('en-IN')}`)
    : null;

  return (
    <div className="flux-page-shell mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 space-y-8 animate-fadeIn">
      {/* Featured tournament, when one is published */}
      {featuredTournament && <div className="flux-feature-panel relative overflow-hidden rounded-3xl border border-card-border p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/15 border border-error/30 text-error font-mono text-xs uppercase font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-error animate-ping" />
              <span>{featuredTournament.status || 'Tournament'}</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-on-surface">
              {featuredTournament.name || featuredTournament.title}
            </h1>
            <p className="font-body text-sm text-on-surface-variant max-w-xl">
              {featuredTournament.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-on-surface-variant pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-secondary" />
                {featuredTournament.start_time ? new Date(featuredTournament.start_time).toLocaleDateString() : 'Date to be announced'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                {featuredTournament.max_teams ? `${featuredTournament.max_teams} team limit` : 'Team limit to be announced'}
              </span>
              <span className="flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-accent" />
                {featuredTournament.format || 'Format to be announced'}
              </span>
            </div>
          </div>

          {/* Prize Vault & Action */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-surface-container border border-card-border text-center md:text-right min-w-[200px]">
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Prize Pool Vault</span>
              {prizeDisplay && <div className="font-display font-bold text-3xl text-secondary mt-1">{prizeDisplay}</div>}
              <span className="text-[11px] font-mono text-primary font-bold">{featuredTournament.first_prize || ''}</span>
            </div>

            <button
              onClick={() => onRegisterModal && onRegisterModal()}
              className="w-full py-2.5 px-5 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Register Qualified Squad
            </button>
          </div>
        </div>
      </div>}

      {!loadingTournaments && tournaments.length === 0 && <section className="flux-empty-panel rounded-3xl border border-card-border px-6 py-14 text-center"><Trophy className="mx-auto h-8 w-8 text-secondary" /><h1 className="mt-4 font-display text-3xl font-bold">Tournaments</h1><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">No tournaments have been published yet. Check back when organizers share their next event.</p></section>}

      {/* ── Active Championship Tournaments ── */}
      {tournaments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-primary font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" />
                Official Circuit Cups
              </div>
              <h2 className="font-display font-bold text-2xl text-on-surface">
                Featured Championships
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((t) => (
                <div
                key={t.id}
                className="flux-content-card p-5 rounded-2xl bg-surface-container border border-card-border hover:border-primary/40 transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] uppercase font-bold">
                      {t.game || 'OPEN'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono text-[10px] uppercase font-bold">
                      {(t.status || 'STATUS PENDING').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition line-clamp-1">
                    {t.name}
                  </h3>

                  <div className="space-y-1 text-xs text-on-surface-variant font-mono">
                    <div className="flex items-center justify-between">
                      <span>Organizer:</span>
                      <span className="text-on-surface font-semibold">{t.organizer_name || 'Organizer details pending'}</span>
                    </div>
                    {t.start_date && (
                      <div className="flex items-center justify-between">
                        <span>Drop Date:</span>
                        <span className="text-secondary font-medium">
                          {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onRegisterModal && onRegisterModal()}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition"
                >
                  <span>Register Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              Browse scheduled practice lobbies and open a room to view its check-in details.
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
                    ? 'bg-primary text-white shadow-sm'
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
                      {scrim.registered_teams_count != null && scrim.slots_max != null && <span>{scrim.registered_teams_count} / {scrim.slots_max} registered teams</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenScrimLobby?.(scrim.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high group-hover:bg-primary group-hover:text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  Enter Scrim Match Room
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
