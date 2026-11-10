import React, { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, MessageSquare, Bell, LogIn, User, Sparkles,
  LayoutDashboard, UserCheck, CheckCircle2, LogOut, Users,
  Gamepad2, Search, X, ChevronDown, Shield, Clock, ExternalLink, Zap,
  Home, Building2, Rocket
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';

export default function Navbar({ activeTab, onSelectTab, onOpenAuth, onOpenChat, onOpenTeamCreator }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentUser, orgs, activeOrgId, myInvitations = [], respondToInvitation, players = [] } = useGameStore();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  const activeOrg = (orgs && orgs.find((o) => o.id === activeOrgId)) || orgs?.[0] || null;
  const userRole = user?.role || 'guest';
  const pendingInvites = (myInvitations || []).filter((inv) => inv && inv.status === 'pending');
  const totalNotifications = pendingInvites.length;

  // Track window scroll for elevated backdrop
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setNotificationsOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  // Primary Nav Links
  const navLinks = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'feed', label: 'Community', icon: MessageSquare },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'organizer', label: 'Organizations', icon: Building2 },
  ];


  // Filter search results
  const filteredSearchItems = searchQuery.trim() === '' ? [] : [
    ...players
      .filter((p) => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.username || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map((p) => ({ type: 'Athlete', title: p.name || p.username, subtitle: `@${p.username} · ${p.primaryGame?.toUpperCase()}`, tab: 'discovery', data: p })),
    { type: 'Game', title: 'VALORANT', subtitle: '5v5 Tactical FPS Esport', tab: 'discovery' },
    { type: 'Game', title: 'BGMI', subtitle: 'Battlegrounds Mobile India Pro Circuit', tab: 'discovery' },
    { type: 'Game', title: 'Free Fire', subtitle: 'Clash Squad Pro League', tab: 'discovery' },
    { type: 'Tournament', title: 'BMPS 2026 Season Major', subtitle: '₹50,00,000 Prize Pool · Open Registrations', tab: 'tournaments' },
    { type: 'Tournament', title: 'VCT Pacific Challenger Circuit', subtitle: 'Tactical 5v5 Elimination', tab: 'tournaments' },
  ].filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#090B12]/92 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-black/50'
            : 'bg-[#090B12]/80 backdrop-blur-xl border-b border-white/[0.06]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            {/* FLUX Crest */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#22D3EE] p-[1.5px] shadow-lg shadow-purple-600/30 group-hover:shadow-cyan-400/50 transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-[10px] bg-[#090B12] flex items-center justify-center overflow-hidden">
                <span className="font-display font-black text-xl bg-gradient-to-br from-white via-slate-100 to-[#22D3EE] bg-clip-text text-transparent">
                  F
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-wider text-[#F8FAFC] leading-none flex items-center">
                FLU<span className="text-[#22D3EE]">X</span>
              </span>
              <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-[#94A3B8] font-bold mt-1">
                PLAY · CONNECT · COMPETE
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-display text-xs font-bold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 shadow-md shadow-purple-900/40 border border-purple-400/30'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-[#A855F7] to-[#38BDF8] rounded-full shadow-[0_0_8px_#A855F7]" />
                  )}
                </button>
              );
            })}

            {/* More ▾ Dropdown / Quick Links */}
            <button
              onClick={() => {
                if (activeTab !== 'landing') onSelectTab('landing');
                setTimeout(() => {
                  const el = document.getElementById('leaderboard-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl font-display text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04] transition-all"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>
          </nav>

          {/* Search Trigger, Notification, Theme, and Profile/Auth */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden sm:flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-xl bg-[#151B2B]/90 hover:bg-[#1B2335] border border-white/[0.1] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-body transition-all group shadow-inner"
              title="Search players, teams... (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#A855F7] transition-colors" />
              <span className="text-[12px] font-medium hidden md:inline text-[#94A3B8]">
                Search players, teams...
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#090B12] border border-white/[0.1] font-mono text-[9px] text-[#94A3B8]">
                ⌘ K
              </kbd>
            </button>

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className="relative p-2 rounded-xl bg-[#151B2B] hover:bg-[#1B2335] border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8B5CF6] text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {totalNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#151B2B] border border-white/[0.12] p-4 shadow-2xl z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#8B5CF6]" />
                        <span className="font-display font-bold text-sm text-[#F8FAFC]">Notifications</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#22D3EE] font-bold">
                        {pendingInvites.length} Action Needed
                      </span>
                    </div>

                    <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                      {pendingInvites.length > 0 ? (
                        pendingInvites.map((inv) => (
                          <div
                            key={inv.id}
                            className="p-3 rounded-xl bg-[#1B2335] border border-white/[0.06] space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-display font-bold text-[#F8FAFC] block">
                                  {inv.team_name}
                                </span>
                                <span className="font-mono text-[10px] text-[#22D3EE]">
                                  Offered: {inv.role || 'Roster Member'}
                                </span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold uppercase">
                                Squad Invite
                              </span>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                              <button
                                onClick={async () => {
                                  await respondToInvitation(inv.id, 'accept');
                                  onSelectTab('dashboard');
                                  setNotificationsOpen(false);
                                }}
                                className="flex-1 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-display font-bold text-[10px] uppercase tracking-wider text-center"
                              >
                                Accept & Join
                              </button>
                              <button
                                onClick={async () => {
                                  await respondToInvitation(inv.id, 'decline');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-error/20 text-[#94A3B8] hover:text-[#F43F5E] font-display font-bold text-[10px] uppercase"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs font-mono text-[#94A3B8]">
                          No pending squad join requests or alerts.
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] text-center">
                      <button
                        onClick={() => {
                          onSelectTab('dashboard');
                          setNotificationsOpen(false);
                        }}
                        className="text-[11px] font-mono text-[#22D3EE] font-bold hover:underline"
                      >
                        View Full Dashboard →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If NOT Authenticated: Show Sign In & Register Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth?.('player', 'login')}
                  className="px-4 py-2 rounded-xl bg-[#151B2B]/90 hover:bg-[#1E2738] border border-white/[0.1] font-display font-bold text-xs text-[#F8FAFC] transition-all flex items-center gap-2 shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth?.('player', 'signup')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white font-display font-bold text-xs tracking-wide shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Register</span>
                </button>
              </div>
            ) : (
              /* If Authenticated: Show Verified User Profile & Role Badge */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-[#151B2B] hover:bg-[#1B2335] border border-white/[0.08] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6]/30 to-[#22D3EE]/30 flex items-center justify-center font-display font-bold text-xs text-[#F8FAFC] ring-1 ring-white/[0.1]">
                    {user.name?.[0] || user.username?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <span className="font-display text-xs font-semibold text-[#F8FAFC] max-w-[100px] truncate hidden sm:inline">
                    {user.name || user.username || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#151B2B] border border-white/[0.12] p-2 shadow-2xl z-50 animate-fade-in space-y-1">
                    <div className="p-3 rounded-xl bg-[#1B2335] border border-white/[0.06] mb-1">
                      <div className="font-display font-bold text-sm text-[#F8FAFC] truncate">
                        {user.name || user.username}
                      </div>
                      <div className="font-mono text-xs text-[#94A3B8] truncate">{user.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                        {userRole.toUpperCase()} ACCOUNT
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTab('dashboard');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-semibold text-[#F8FAFC] hover:bg-white/[0.06] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#22D3EE]" />
                      <span>Player Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-semibold text-[#F8FAFC] hover:bg-white/[0.06] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#8B5CF6]" />
                      <span>Gamer Passport &amp; Stats</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenTeamCreator?.();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-semibold text-[#F8FAFC] hover:bg-white/[0.06] transition-colors"
                    >
                      <Users className="w-4 h-4 text-[#F59E0B]" />
                      <span>Form / Register Squad</span>
                    </button>

                    <div className="pt-1 border-t border-white/[0.08]">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-semibold text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Overlay Modal (Cmd+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-[#151B2B] border border-white/[0.12] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-5 h-5 text-[#8B5CF6]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games, athletes, tournaments, or squads..."
                  className="w-full bg-transparent text-[#F8FAFC] placeholder:text-[#94A3B8] text-sm font-body focus:outline-none"
                />
              </div>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick suggestions or results */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {searchQuery.trim() === '' ? (
                <div className="space-y-3 py-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold block">
                    Featured Titles &amp; Shortcuts
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'VALORANT', desc: 'Tactical 5v5', tab: 'discovery' },
                      { name: 'BGMI', desc: 'Battle Royale Majors', tab: 'discovery' },
                      { name: 'Live Scrims', desc: 'Active Match Lobbies', tab: 'tournaments' },
                      { name: 'Pro Squads', desc: 'Verified Rosters', tab: 'teams' },
                    ].map((s) => (
                      <button
                        key={s.name}
                        onClick={() => {
                          onSelectTab(s.tab);
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-xl bg-[#1B2335] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors"
                      >
                        <span className="font-display font-bold text-xs text-[#F8FAFC] block">{s.name}</span>
                        <span className="font-mono text-[10px] text-[#94A3B8]">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredSearchItems.length > 0 ? (
                filteredSearchItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectTab(item.tab);
                      setSearchModalOpen(false);
                    }}
                    className="w-full p-3 rounded-xl bg-[#1B2335] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-xs text-[#F8FAFC]">{item.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] font-mono text-[9px] uppercase font-bold">
                          {item.type}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#94A3B8] mt-0.5 block">{item.subtitle}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-mono text-[#94A3B8]">
                  No matching games or athletes found for &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-[#090B12] text-[#F8FAFC]">ESC</kbd> to exit</span>
              <span>FLUX Global Esports Index</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
