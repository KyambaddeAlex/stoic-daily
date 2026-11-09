import React from 'react';
import {
  SunMedium,
  BookOpen,
  Compass,
  Wallet,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAdmin: boolean;
}

export function Navigation({ activeTab, onSelectTab, isAdmin }: NavigationProps) {
  const tabs = [
    {
      id: 'practice',
      label: "Today's Practice",
      shortLabel: 'Today',
      icon: SunMedium,
      number: '01',
    },
    {
      id: 'history',
      label: 'Journal & History',
      shortLabel: 'History',
      icon: BookOpen,
      number: '02',
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Virtues',
      shortLabel: 'Roadmap',
      icon: Compass,
      number: '03',
    },
    {
      id: 'spending',
      label: 'Mindful Spending',
      shortLabel: 'Finance',
      icon: Wallet,
      number: '04',
    },
    {
      id: 'admin',
      label: 'Admin Hub',
      shortLabel: 'Admin',
      icon: ShieldCheck,
      number: '05',
      badge: 'Admin',
    },
    {
      id: 'export',
      label: 'Project Source',
      shortLabel: 'Source',
      icon: ExternalLink,
      number: '06',
      badge: 'GitHub',
    },
  ];

  return (
    <nav className="border-b border-[#242924] bg-[#141714]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#222822] text-[#e6c875] border border-[#c89b3c]/40 shadow-sm'
                    : 'text-[#8f9b8e] hover:text-[#e4e7e2] hover:bg-[#1a1f1a]'
                }`}
              >
                <span className={`text-[10px] font-mono ${isActive ? 'text-[#c89b3c]' : 'text-[#616c60]'}`}>
                  {tab.number}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#c89b3c]' : 'text-[#7e8b7d]'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#c89b3c] text-[#121412]'
                        : 'bg-[#2b332b] text-[#c89b3c]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
