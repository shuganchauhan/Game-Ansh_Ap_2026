import React, { useState } from 'react';
import {
  Swords, Trophy, Briefcase, MessageSquare, Bell, LogIn, User, Sparkles,
  LayoutDashboard, UserCheck, Building, CheckCircle2, RefreshCw, Lock, LogOut, Users
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';

export default function Navbar({ activeTab, onSelectTab, onOpenAuth, onOpenChat, onOpenTeamCreator }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentUser, orgs, activeOrgId } = useGameStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];
  const userRole = user?.role || 'guest';

  // Role-based Nav Links
  const navLinks = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'discovery', label: 'Discover', icon: Swords },
    { id: 'tournaments', label: 'Tournaments & Scrims', icon: Trophy },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'feed', label: 'Community Feed', icon: MessageSquare },
  ];

  // Dynamic role dashboard link
  if (isAuthenticated) {
    if (userRole === 'admin') {
      navLinks.push({ id: 'admin', label: 'Admin Portal', icon: Lock });
    } else if (userRole === 'organizer') {
      navLinks.push({ id: 'organizer', label: 'Organizer Hub', icon: Trophy });
    } else if (userRole === 'org') {
      navLinks.push({ id: 'dashboard', label: 'Org Hub', icon: LayoutDashboard });
    } else {
      navLinks.push({ id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard });
    }
  }

  const handleProtectedAction = (tabId) => {
    if (!isAuthenticated) {
      onOpenAuth?.();
      return;
    }
    onSelectTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-card-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <span className="font-display font-extrabold text-xl text-white dark:text-black">G</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-wider text-on-surface leading-tight">
              GAMERS<span className="text-secondary">'G</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-secondary font-bold leading-none">
              Production Arena // 2026
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-surface-container-high text-primary shadow-sm border border-card-border'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-secondary' : ''}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Authentication Status */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* If NOT Authenticated: Show Sign In & Register Buttons */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth?.('player', 'login')}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-on-surface-variant" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuth?.('player', 'signup')}
                className="px-4 py-2 rounded-xl bg-primary text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-white dark:text-black" />
                <span>Register</span>
              </button>
            </div>
          ) : (
            /* If Authenticated: Show Verified User Profile & Role Badge */
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-card-border transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-display font-bold text-xs text-on-surface ring-1 ring-card-border">
                  {user.name?.[0] || user.username?.[0] || user.email?.[0] || 'U'}
                </div>
                <span className="font-display text-xs font-semibold text-on-surface max-w-[100px] truncate hidden sm:inline">
                  {user.name || user.username || user.email.split('@')[0]}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                    userRole === 'admin'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : userRole === 'org'
                      ? 'bg-secondary/20 text-secondary border border-secondary/30'
                      : userRole === 'organizer'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-primary/20 text-primary border border-primary/30'
                  }`}
                >
                  {userRole}
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-modal py-2 shadow-2xl z-50 animate-in fade-in border border-card-border">
                  <div className="px-4 py-2.5 border-b border-card-border text-xs">
                    <span className="text-on-surface-variant block font-mono text-[10px] uppercase">Signed In As:</span>
                    <span className="font-display font-bold text-on-surface truncate block text-sm">
                      {user.name || user.username || user.email}
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant truncate block">
                      {user.email}
                    </span>
                    <span className="inline-block mt-1 font-mono text-[10px] text-emerald-400 font-bold uppercase">
                      ● Active Backend Session ({userRole})
                    </span>
                  </div>

                  {userRole === 'admin' && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSelectTab('admin');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-display font-semibold text-red-400 hover:bg-surface-container transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-red-400" />
                      <span>Admin Verification Portal</span>
                    </button>
                  )}

                  {userRole === 'organizer' && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSelectTab('organizer');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-display font-semibold text-amber-300 hover:bg-surface-container transition-colors flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Organizer Hub & Scrims</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSelectTab('dashboard');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-display font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSelectTab('profile');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-display font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-secondary" />
                    <span>LinkedIn Gamer Profile</span>
                  </button>

                  <div className="border-t border-card-border my-1" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      onSelectTab('landing');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-display font-semibold text-error hover:bg-surface-container transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-error" />
                    <span>Sign Out (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
