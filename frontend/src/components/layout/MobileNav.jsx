import React, { useState, useEffect } from 'react';
import {
  Home, Trophy, Users, MessageSquare, Grid, Sparkles, Building2,
  Gamepad2, User, LayoutDashboard, FileText, LogOut, LogIn,
  X, ChevronRight, ShieldCheck, Bell
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';

export default function MobileNav({
  activeTab,
  onSelectTab,
  onOpenAuth,
  onOpenChat,
  onOpenTeamCreator,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { myInvitations = [] } = useGameStore();
  const [hubOpen, setHubOpen] = useState(false);

  const pendingInvites = (myInvitations || []).filter((inv) => inv && inv.status === 'pending');
  const userRole = user?.role || 'guest';

  // Lock body scroll while mobile hub drawer is open
  useEffect(() => {
    if (hubOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [hubOpen]);

  // Handle ESC key to dismiss sheet
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setHubOpen(false);
    };
    if (hubOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hubOpen]);

  // Primary mobile tabs (clean 4-letter / short words for zero horizontal text truncation)
  const tabs = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'tournaments', label: 'Compete', icon: Trophy },
    { id: 'teams', label: 'Squads', icon: Users },
    { id: 'feed', label: 'Feed', icon: MessageSquare },
  ];

  const isHubActive = ['organizer', 'dashboard', 'profile', 'discovery', 'applications', 'admin', 'onboarding'].includes(activeTab);

  const handleTabClick = (tabId) => {
    setHubOpen(false);
    onSelectTab(tabId);
  };

  const handleNavigateFromHub = (tabId) => {
    setHubOpen(false);
    onSelectTab(tabId);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090B12]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.6)] pb-safe transition-all select-none"
      >
        <div className="flex items-center justify-around h-[58px] px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !hubOpen;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-90"
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
                )}
                <Icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive
                      ? 'text-[#22D3EE] drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      : 'text-[#94A3B8]'
                  }`}
                />
                <span
                  className={`font-display text-[10px] tracking-tight font-bold transition-colors ${
                    isActive ? 'text-white' : 'text-[#94A3B8]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* 5th Hub / More Tab */}
          <button
            onClick={() => setHubOpen((prev) => !prev)}
            aria-label="Open mobile hub menu"
            className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-90"
          >
            {(isHubActive || hubOpen) && (
              <span className="absolute top-0 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#22D3EE] shadow-[0_0_8px_#8B5CF6]" />
            )}
            <div className="relative">
              <Grid
                className={`w-[18px] h-[18px] transition-colors ${
                  isHubActive || hubOpen
                    ? 'text-[#8B5CF6] drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]'
                    : 'text-[#94A3B8]'
                }`}
              />
              {pendingInvites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping" />
              )}
            </div>
            <span
              className={`font-display text-[10px] tracking-tight font-bold transition-colors ${
                isHubActive || hubOpen ? 'text-white' : 'text-[#94A3B8]'
              }`}
            >
              {isAuthenticated ? 'Hub' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Hub Bottom Sheet (Drawer) */}
      {hubOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Tap to Close */}
          <div className="flex-1" onClick={() => setHubOpen(false)} />

          <div className="w-full rounded-t-3xl bg-[#0F1422] border-t border-white/[0.12] p-5 shadow-2xl space-y-4 max-h-[82vh] overflow-y-auto no-scrollbar pb-safe animate-in slide-in-from-bottom-8 duration-300">
            {/* Sheet Handle */}
            <div className="w-10 h-1 rounded-full bg-white/25 mx-auto mb-2" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white font-black text-xs font-display">
                  F
                </div>
                <span className="font-display font-extrabold text-sm text-[#F8FAFC]">
                  FLUX Mobile Hub
                </span>
              </div>
              <button
                onClick={() => setHubOpen(false)}
                className="p-1.5 rounded-xl bg-white/[0.06] text-[#94A3B8] hover:text-white"
                aria-label="Close hub"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Authenticated User Status Card */}
            {isAuthenticated ? (
              <div className="p-3.5 rounded-2xl bg-[#171E30] border border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#22D3EE]/30 flex items-center justify-center font-display font-bold text-sm text-[#F8FAFC] ring-1 ring-white/[0.1] shrink-0">
                    {user?.name?.[0] || user?.username?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-[#F8FAFC] truncate">
                      {user?.name || user?.username}
                    </div>
                    <div className="font-mono text-[11px] text-[#94A3B8] truncate">{user?.email}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 shrink-0">
                  {userRole}
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#171E30] to-cyan-950/40 border border-purple-500/25 space-y-3">
                <div>
                  <h4 className="font-display font-bold text-sm text-[#F8FAFC]">Join the Arena</h4>
                  <p className="font-body text-xs text-[#94A3B8] mt-0.5">
                    Sign in to track tryouts, enter scrim match rooms, and build your gamer passport.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setHubOpen(false);
                      onOpenAuth?.('player', 'login');
                    }}
                    className="py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setHubOpen(false);
                      onOpenAuth?.('player', 'signup');
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Navigation Grid */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold block">
                Quick Navigation &amp; Tools
              </span>

              <div className="grid grid-cols-1 gap-2">
                {/* Organizations & Scrim Rooms */}
                <button
                  onClick={() => handleNavigateFromHub('organizer')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    activeTab === 'organizer'
                      ? 'bg-purple-950/30 border-purple-400/40 text-white'
                      : 'bg-[#151B2B] hover:bg-[#1B2335] border-white/[0.06] text-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-[#22D3EE]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-xs">Organizations &amp; Scrims</div>
                      <div className="font-mono text-[10px] text-[#94A3B8]">Verified clubs and match lobbies</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </button>

                {/* Discover Games */}
                <button
                  onClick={() => handleNavigateFromHub('discovery')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    activeTab === 'discovery'
                      ? 'bg-purple-950/30 border-purple-400/40 text-white'
                      : 'bg-[#151B2B] hover:bg-[#1B2335] border-white/[0.06] text-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-[#8B5CF6]">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-xs">Discover Titles</div>
                      <div className="font-mono text-[10px] text-[#94A3B8]">VALORANT, BGMI, Free Fire</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </button>

                {/* Dashboard (if logged in) */}
                {isAuthenticated && (
                  <button
                    onClick={() => handleNavigateFromHub('dashboard')}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-purple-950/30 border-purple-400/40 text-white'
                        : 'bg-[#151B2B] hover:bg-[#1B2335] border-white/[0.06] text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-display font-bold text-xs">Command Dashboard</div>
                        <div className="font-mono text-[10px] text-[#94A3B8]">Progression, rosters, invitations</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                )}

                {/* Gamer Passport & Stats (if logged in) */}
                {isAuthenticated && (
                  <button
                    onClick={() => handleNavigateFromHub('profile')}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      activeTab === 'profile'
                        ? 'bg-purple-950/30 border-purple-400/40 text-white'
                        : 'bg-[#151B2B] hover:bg-[#1B2335] border-white/[0.06] text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-display font-bold text-xs">Gamer Passport &amp; Stats</div>
                        <div className="font-mono text-[10px] text-[#94A3B8]">Verified K/D, IGNs, milestones</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                )}

                {/* Tryout Applications (if logged in) */}
                {isAuthenticated && (
                  <button
                    onClick={() => handleNavigateFromHub('applications')}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      activeTab === 'applications'
                        ? 'bg-purple-950/30 border-purple-400/40 text-white'
                        : 'bg-[#151B2B] hover:bg-[#1B2335] border-white/[0.06] text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-display font-bold text-xs">Tryout Applications</div>
                        <div className="font-mono text-[10px] text-[#94A3B8]">Track squad roster submissions</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                )}

                {/* Admin Portal (if admin) */}
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleNavigateFromHub('admin')}
                    className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="font-display font-bold text-xs">Admin Review Portal</div>
                        <div className="font-mono text-[10px] text-amber-400/80">Compliance &amp; verifications</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions Row: Chat & Team Creator */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  setHubOpen(false);
                  onOpenChat?.();
                }}
                className="py-3 px-3 rounded-2xl bg-[#151B2B] hover:bg-[#1B2335] border border-white/[0.08] text-xs font-display font-bold text-[#F8FAFC] flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-[#22D3EE]" />
                <span>Live Chat</span>
              </button>

              <button
                onClick={() => {
                  setHubOpen(false);
                  onOpenTeamCreator?.();
                }}
                className="py-3 px-3 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:opacity-95 text-xs font-display font-bold text-white flex items-center justify-center gap-2 shadow-md shadow-purple-900/30"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Form Squad</span>
              </button>
            </div>

            {/* Sign Out (if logged in) */}
            {isAuthenticated && (
              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    setHubOpen(false);
                    logout?.();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-display font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
