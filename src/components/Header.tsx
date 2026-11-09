import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { formatDisplayDate, localDateKey, type UserAccount } from '../utils/stoicLogic';
import { ZenAudio } from './ZenAudio';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  currentUser: UserAccount;
  onSignOut: () => void;
  onOpenProfile: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export function Header({
  currentDate,
  onDateChange,
  currentUser,
  onSignOut,
  onOpenProfile,
  activeTab,
  onSelectTab,
}: HeaderProps) {
  const todayKey = localDateKey();

  const handlePrevDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    onDateChange(localDateKey(date));
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    onDateChange(localDateKey(date));
  };

  const handleToday = () => {
    onDateChange(todayKey);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="border-b border-[#262c26] bg-[#151815]/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <button
            type="button"
            onClick={() => onSelectTab('practice')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-full border border-[#c89b3c]/50 bg-[#1e221e] flex items-center justify-center text-[#c89b3c] font-serif font-bold text-xl shadow-inner group-hover:border-[#c89b3c] transition-colors">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#f0f3ee]">
                  Stoic Daily
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#c89b3c]/20 text-[#e6c875] border border-[#c89b3c]/40">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[10px] tracking-widest uppercase text-[#889487]">
                A practice, not a performance
              </p>
            </div>
          </button>

          {/* Quick Date Switcher (Mobile top-right) */}
          <div className="flex md:hidden items-center gap-1 bg-[#1a1e1a] px-2 py-1 rounded-lg border border-[#2c332c]">
            <button
              type="button"
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-1 text-[#9ba399] hover:text-[#e4e7e2]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#d1d7ce] font-medium px-1">
              {currentDate === todayKey ? 'Today' : currentDate.slice(5)}
            </span>
            <button
              type="button"
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-1 text-[#9ba399] hover:text-[#e4e7e2]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Navigator (Desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-[#1a1e1a] px-3 py-1.5 rounded-lg border border-[#2b332b]">
          <button
            type="button"
            onClick={handlePrevDay}
            aria-label="Previous day"
            className="p-1 text-[#949e92] hover:text-[#e4e7e2] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2 text-xs font-medium text-[#dce1da]">
            <CalendarIcon className="w-3.5 h-3.5 text-[#c89b3c]" />
            <span>{formatDisplayDate(currentDate)}</span>
            {currentDate !== todayKey && (
              <button
                type="button"
                onClick={handleToday}
                className="ml-1 px-1.5 py-0.5 bg-[#252c25] hover:bg-[#323b32] text-[10px] text-[#e6c875] rounded transition-colors"
              >
                Return to Today
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            aria-label="Next day"
            className="p-1 text-[#949e92] hover:text-[#e4e7e2] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right actions: Audio, account, Profile */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <ZenAudio />

          {/* Sign out */}
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#222822] border border-[#3b473b] hover:border-[#c89b3c]/60 text-xs text-[#e6c875] transition-colors font-medium shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-[#c89b3c]" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          {/* Profile Modal trigger */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#1e231e] border border-[#2e362e] hover:border-[#c89b3c]/50 text-xs text-[#e4e7e2] transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-[#c89b3c]/20 text-[#e6c875] flex items-center justify-center font-bold text-[10px]">
              {(currentUser.displayName || currentUser.email || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-medium">{currentUser.displayName.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
