import React, { useState } from 'react';
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
import TeamCreationModal from '../features/teams/TeamCreationModal';
import AuthModal from '../features/auth/AuthModal';
import ChatDrawer from '../features/chat/ChatDrawer';
import { Lock, ShieldAlert, LogIn, Sparkles, Trophy, Gamepad2, Shield } from 'lucide-react';

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
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('landing');
  const [activeScrimId, setActiveScrimId] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState('player');
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [chatOpen, setChatOpen] = useState(false);
  const [teamCreationModalOpen, setTeamCreationModalOpen] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'guest';

  const handleOpenAuthWithRole = (role = 'player', mode = 'login') => {
    setAuthInitialRole(role);
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedUser) => {
    if (loggedUser?.role === 'admin') {
      setActiveTab('admin');
    } else if (loggedUser?.role === 'organizer') {
      setActiveTab('organizer');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleOpenTeamCreator = () => {
    if (!isAuthenticated) {
      handleOpenAuthWithRole('player', 'login');
      return;
    }
    setTeamCreationModalOpen(true);
  };

  const handleTeamCreated = () => {
    setActiveTab('teams');
  };

  const handleOpenScrimLobby = (scrimId) => {
    setActiveScrimId(scrimId);
    setActiveTab('scrim-lobby');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface transition-colors selection:bg-primary/30">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={handleOpenAuthWithRole}
        onOpenChat={() => setChatOpen((prev) => !prev)}
        onOpenTeamCreator={handleOpenTeamCreator}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-20 md:pb-10">
        {/* Public Routes */}
        {activeTab === 'landing' && (
          <LandingPage
            onSelectTab={setActiveTab}
            onOpenAuthWithRole={handleOpenAuthWithRole}
          />
        )}

        {activeTab === 'discovery' && (
          <DiscoveryPage
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'tournaments' && (
          <TournamentsPage
            onRegisterModal={() => handleOpenAuthWithRole('org')}
            onOpenScrimLobby={handleOpenScrimLobby}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsPage
            onOpenTeamCreator={handleOpenTeamCreator}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'feed' && (
          <SocialFeedPage
            onSelectTab={setActiveTab}
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
              onBack={() => setActiveTab('tournaments')}
              onSelectTab={setActiveTab}
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
              onSelectTab={setActiveTab}
            />
          )
        )}

        {/* Protected Route: Organizer Hub (Organizer or Admin Role Required) */}
        {activeTab === 'organizer' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Tournament Organizer Hub Locked"
              message="Please sign in with a Tournament Organizer account to host scrims and provision dedicated match rooms."
              requiredRole="organizer"
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : userRole !== 'organizer' && userRole !== 'admin' ? (
            <ProtectedGate
              title="Organizer Authorization Required"
              message="Only certified Tournament Organizers can manage dedicated scrim match rooms."
              requiredRole="organizer"
              currentRole={userRole}
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : (
            <OrganizerDashboard
              onSelectTab={setActiveTab}
              onOpenScrimLobby={handleOpenScrimLobby}
            />
          )
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
              onSelectTab={setActiveTab}
            />
          ) : userRole === 'organizer' ? (
            <OrganizerDashboard
              onSelectTab={setActiveTab}
              onOpenScrimLobby={handleOpenScrimLobby}
            />
          ) : userRole === 'org' ? (
            <OrgDashboard
              onSelectTab={setActiveTab}
              onOpenTeamCreator={handleOpenTeamCreator}
            />
          ) : (
            <PlayerDashboard
              onSelectTab={setActiveTab}
              onOpenTeamCreator={handleOpenTeamCreator}
            />
          )
        )}

        {/* Protected Route: Player Profile */}
        {activeTab === 'profile' && (
          !isAuthenticated ? (
            <ProtectedGate
              title="Gamer Profile Locked"
              message="Sign in to view and customize your LinkedIn-style competitive gaming profile, stats, and milestones."
              onOpenAuth={handleOpenAuthWithRole}
            />
          ) : (
            <PlayerProfilePage
              onSelectTab={setActiveTab}
              onBack={() => setActiveTab('dashboard')}
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
      </main>

      {/* Floating Bottom Nav for Mobile Screens */}
      <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} />

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

      {/* Real-Time Live Chat Drawer */}
      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
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
