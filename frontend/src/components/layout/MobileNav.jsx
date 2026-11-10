import React from 'react';
import { Sparkles, Swords, Trophy, MessageSquare, Users } from 'lucide-react';

export default function MobileNav({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'discovery', label: 'Discover', icon: Swords },
    { id: 'teams', label: 'Squads', icon: Users },
    { id: 'tournaments', label: 'Compete', icon: Trophy },
    { id: 'feed', label: 'Community', icon: MessageSquare },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090B12]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-2xl pb-safe transition-colors"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[#F8FAFC] bg-[#151B2B] border border-white/[0.1] shadow-inner'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#22D3EE]' : ''}`} />
              <span className="font-display text-[10px] font-bold tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
