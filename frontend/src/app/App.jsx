import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '../stores/themeContext';
import { AuthProvider, useAuth } from '../stores/authContext';
import { GameStoreProvider, useGameStore } from '../stores/gameStore';
import Navbar from '../components/layout/Navbar';
import MobileNav from '../components/layout/MobileNav';
import LandingPage from '../features/landing/LandingPage';
import DiscoveryPage from '../features/discovery/DiscoveryPage';
import TournamentsPage from '../features/tournaments/TournamentsPage';
import ScrimLobbyPage from '../features/tournaments/ScrimLobbyPage';
import TeamsPage from '../features/teams/TeamsPage';
import ApplicationsPage from '../features/recruitment/ApplicationsPage';
import SocialFeedPage from '../features/social/SocialFeedPage';
import PlayerDashboard from '../features/dashboard/PlayerDashboard';
import OrgDashboard from '../features/dashboard/OrgDashboard';
import OrganizerDashboard from '../features/dashboard/OrganizerDashboard';
import AdminPortalPage from '../features/admin/AdminPortalPage';
import PlayerProfilePage from '../features/profile/PlayerProfilePage';
import OnboardingPage from '../features/onboarding/OnboardingPage';
import TeamCreationModal from '../features/teams/TeamCreationModal';
import AuthModal from '../features/auth/AuthModal';
import ChatDrawer from '../features/chat/ChatDrawer';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { Lock, ShieldAlert, LogIn, Sparkles, Trophy, Gamepad2, Shield } from 'lucide-react';
import { parsePath, formatPath } from '../lib/router';

function ProtectedGate({ title, message, requiredRole = null, currentRole = null, onOpenAuth }) {
  return (
    <div className="max-w-xl mx-auto my-20 px-4">
      <div className="p-8 sm:p-10 rounded-3xl bg-surface-container-low border border-card-border text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-lg">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface">
            {title || 'Sign In Required'}
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {message || 'Please sign in with your account credentials to access this competitive area.'}
          </p>
        </div>

        {currentRole && requiredRole && currentRole !== requiredRole && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-500 dark:text-amber-300">
            Account role: <strong>{currentRole.toUpperCase()}</strong> · Required privileges: <strong>{requiredRole.toUpperCase()}</strong>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('player', 'login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>Sign In to Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const initialRoute = parsePath(window.location.pathname);
  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  const [activeScrimId, setActiveScrimId] = useState(initialRoute.scrimId);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState('player');
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialTab, setChatInitialTab] = useState('direct');
  const [chatInitialTeamId, setChatInitialTeamId] = useState(null);
  const [teamCreationModalOpen, setTeamCreationModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const { user, isAuthenticated, setAuthSession } = useAuth();
  const { setCurrentUser, setActiveRole, setActiveOrgId } = useGameStore();
  const userRole = user?.role || 'guest';

  // Handle Google OAuth 2.0 Redirect Callback
  useEffect(() => {
    if (window.location.pathname.startsWith('/auth/callback')) {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (token) {
        const id = searchParams.get('id');
        const role = searchParams.get('role') || 'player';
        const name = searchParams.get('name') || 'Athlete';
        const email = searchParams.get('email') || '';
        const avatar = searchParams.get('avatar') || '';

        const authUser = {
          id,
          role,
          name,
          username: name,
          email,
          avatar_url: avatar,
        };

        if (typeof setAuthSession === 'function') {
          setAuthSession(token, authUser);
        }

        window.history.replaceState({ tab: 'dashboard' }, '', '/dashboard');
        setActiveTab('dashboard');
      } else if (error) {
        console.warn('[Google OAuth Error]:', error);
        window.history.replaceState({ tab: 'landing' }, '', '/');
        setActiveTab('landing');
        setAuthModalOpen(true);
      }
    }
  }, [setAuthSession]);

  const handleOpenChat = (mode = 'direct', teamId = null) => {
    setChatInitialTab(typeof mode === 'string' ? mode : 'direct');
    setChatInitialTeamId(teamId || null);
    setChatOpen(true);
  };

  // Navigate to tab and synchronize browser history & URL bar
  const navigateToTab = (tab, options = {}) => {
    const scrimId = options.scrimId !== undefined ? options.scrimId : (tab === 'scrim-lobby' ? activeScrimId : null);
    const targetPath = formatPath(tab, { scrimId });

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab, scrimId }, '', targetPath);
    }
    setActiveTab(tab);
    if (tab === 'scrim-lobby') {
      setActiveScrimId(scrimId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = parsePath(window.location.pathname);
      setActiveTab(route.tab);
      setActiveScrimId(route.scrimId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!user) return;
    setCurrentUser(user);
    setActiveRole(user.role);
    if (user.role === 'org') setActiveOrgId(user.id);
  }, [user]);

  const handleOpenAuthWithRole = (role = 'player', mode = 'login') => {
    setAuthInitialRole(role);
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleLandingNavigation = (tab) => navigateToTab(tab);

  const handleAuthSuccess = (loggedUser, isNewSignup = false) => {
    if (pendingAction === 'createTeam') {
      setPendingAction(null);
      setTeamCreationModalOpen(true);
      return;
    }

    if (loggedUser?.role === 'admin') {
      navigateToTab('admin');
      return;
    }

    // Check if user has completed profile setup (primary_game and game_ign)
    const hasCompletedProfile =
      loggedUser?.primary_game &&
      loggedUser?.game_ign &&
      loggedUser?.game_ign !== 'gamer' &&
      !loggedUser?.game_ign?.startsWith('gamer_');

    if (isNewSignup || !hasCompletedProfile) {
      navigateToTab('onboarding');
    } else if (loggedUser?.role === 'organizer') {
      navigateToTab('organizer');
    } else {
      navigateToTab('dashboard');
    }
  };

  const handleOpenTeamCreator = () => {
    if (!isAuthenticated) {
      setPendingAction('createTeam');
      handleOpenAuthWithRole('player', 'login');
      return;
    }
    setTeamCreationModalOpen(true);
  };

  const handleTeamCreated = () => {
    setTeamCreationModalOpen(false);
    navigateToTab('dashboard');
  };

  const handleOpenScrimLobby = (scrimId) => {
    navigateToTab('scrim-lobby', { scrimId });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface transition-colors selection:bg-primary/30">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        onOpenAuth={handleOpenAuthWithRole}
        onOpenChat={handleOpenChat}
        onOpenTeamCreator={handleOpenTeamCreator}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-28 md:pb-10">
        <ErrorBoundary key={activeTab} fallbackTitle={`Unable to render ${activeTab} view`} onReset={() => navigateToTab('landing')}>
        {/* Public Routes */}
        {activeTab === 'landing' && (
          <LandingPage
            onSelectTab={handleLandingNavigation}
            onOpenAuthWithRole={handleOpenAuthWithRole}
            onOpenTeamCreator={handleOpenTeamCreator}
          />
        )}

        {activeTab === 'discovery' && (
          <DiscoveryPage
            onSelectTab={navigateToTab}
            onOpenAuth={handleOpenAuthWithRole}
          />
        )}

        {activeTab === 'tournaments' && (
          <TournamentsPage
            onRegisterModal={() => {
              if (!isAuthenticated) {
                handleOpenAuthWithRole('org', 'signup');
              } else {
                handleOpenTeamCreator();
              }
            }}
            onOpenScrimLobby={handleOpenScrimLobby}
            onSelectTab={navigateToTab}
            onOpenAuth={handleOpenAuthWithRole}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsPage
            onOpenTeamCreator={handleOpenTeamCreator}
            onSelectTab={navigateToTab}
            onOpenAuth={handleOpenAuthWithRole}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'feed' && (
          <SocialFeedPage
            onSelectTab={navigateToTab}
            onOpenAuth={() => handleOpenAuthWithRole('player')}
          />
        )}

        {/* Protected Route: Dedicated Scrim Lobby */}
        {activeTab === 'scrim-lobby' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Scrim Match Room Locked"
              message="You must be signed in with your verified athlete or org account to view confidential room credentials and check into match lobbies."
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : (
            <ScrimLobbyPage
              scrimId={activeScrimId}
              onBack={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigateToTab('tournaments');
                }
              }}
              onSelectTab={navigateToTab}
            />
          )
        )}

        {/* Protected Route: Admin Portal (Strictly Admin Role Required) */}
        {activeTab === 'admin' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Admin Portal Protected"
              message="Platform administrator authorization is required to access organization verifications and compliance operations."
              requiredRole="admin"
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : userRole !== 'admin' ? (
            <ProtectedGate
              title="Access Denied: Administrator Only"
              message="Your current session does not hold platform administrator privileges. Please sign in with an admin account."
              requiredRole="admin"
              currentRole={userRole}
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : (
            <AdminPortalPage
              onSelectTab={navigateToTab}
            />
          )
        )}

        {/* Organizations & Tournament Hub (Publicly browsable, scrims & ops require auth inside) */}
        {activeTab === 'organizer' && (
          <OrganizerDashboard
            onSelectTab={navigateToTab}
            onOpenScrimLobby={handleOpenScrimLobby}
            onOpenAuth={handleOpenAuthWithRole}
          />
        )}

        {/* Protected Route: User Dashboard (Role-based: Org vs Player) */}
        {activeTab === 'dashboard' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Dashboard Sign In Required"
              message="Sign in to manage your gaming profile, view roster applications, and organize competitive scrims."
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : userRole === 'admin' ? (
            <AdminPortalPage
              onSelectTab={navigateToTab}
            />
          ) : userRole === 'organizer' ? (
            <OrganizerDashboard
              onSelectTab={navigateToTab}
              onOpenScrimLobby={handleOpenScrimLobby}
            />
          ) : userRole === 'org' ? (
            <OrgDashboard
              onSelectTab={navigateToTab}
              onOpenTeamCreator={handleOpenTeamCreator}
            />
          ) : (
            <PlayerDashboard
              onSelectTab={navigateToTab}
              onOpenTeamCreator={handleOpenTeamCreator}
              onOpenChat={handleOpenChat}
            />
          )
        )}

        {/* Protected Route: Player Profile */}
        {activeTab === 'profile' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Gamer Profile Locked"
              message="Sign in to view and customize your competitive gamer passport, verified stats, and career milestones."
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : (
            <PlayerProfilePage
              onSelectTab={navigateToTab}
              onBack={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigateToTab('dashboard');
                }
              }}
            />
          )
        )}

        {/* Protected Route: Identity Setup & Onboarding */}
        {activeTab === 'onboarding' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Identity Setup Required"
              message="Sign in or create an account to configure your competitive gaming identity or apply as an organizer."
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : (
            <OnboardingPage
              onSelectTab={navigateToTab}
            />
          )
        )}

        {/* Protected Route: Recruitment Applications */}
        {activeTab === 'applications' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Tryout Applications Locked"
              message="Sign in to track your team roster applications and tryout invitations."
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : (
            <ApplicationsPage
              onOpenAuth={() => handleOpenAuthWithRole('player')}
            />
          )
        )}
        </ErrorBoundary>
      </main>

      {/* Floating Bottom Nav for Mobile Screens */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        onOpenAuth={handleOpenAuthWithRole}
        onOpenChat={handleOpenChat}
        onOpenTeamCreator={handleOpenTeamCreator}
      />

      {/* Team Formation Modal (Unified Identity • Login Required) */}
      <TeamCreationModal
        isOpen={teamCreationModalOpen}
        onClose={() => setTeamCreationModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />

      {/* Authentication Modal with Real Backend API & 1-Click Demo Logins */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialRole={authInitialRole}
        initialMode={authInitialMode}
      />

      {/* Real-Time Live Chat Drawer (Direct DMs & Private Squad Tactical Comms) */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialTab={chatInitialTab}
        initialTeamId={chatInitialTeamId}
        onNavigateToTeams={() => navigateToTab('teams')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameStoreProvider>
          <AppContent />
        </GameStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
