import React from 'react';
import { Sparkles, Swords, Trophy, Shield, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export default function MobileNav({ activeTab, onSelectTab }) {
  const { activeRole } = useGameStore();

  const tabs = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'discovery', label: 'Discover', icon: Swords },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'feed', label: 'Feed', icon: MessageSquare },
    { id: 'dashboard', label: activeRole === 'org' ? 'Org' : 'Dash', icon: LayoutDashboard },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-card-border pb-safe transition-colors">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-secondary animate-pulse' : ''}`} />
              <span className="font-display text-[10px] font-medium tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
