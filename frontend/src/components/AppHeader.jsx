import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore.js';
import { useSearchStore } from '../store/useSearchStore.js';
import { Activity, Compass, Flame, LayoutDashboard, LineChart, Lock, LogOut, Search, ShieldCheck } from 'lucide-react';

export const AppHeader = () => {
  const { handle, contestElo, syncStatus, isVerified, setSyncModalOpen, unlinkAccount } = useProfileStore();
  const { openSearch } = useSearchStore();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Growth', path: '/growth', icon: LineChart },
    { label: 'Topics', path: '/topics', icon: Activity },
    { label: 'Paths', path: '/paths', icon: Compass },
    { label: 'Practice', path: '/practice', icon: Flame },
  ];

  return (
    <header className="sticky top-3 z-40 max-w-7xl mx-auto px-4 mb-6">
      <div className="h-14 rounded-xl bg-[#0D1117]/95 backdrop-blur-md border border-[#21262D] px-3 sm:px-4 flex items-center justify-between shadow-2xl shadow-black/50">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 pl-1">
            <div className={`size-2.5 rounded-full ${isVerified ? 'bg-[#3FB950]' : 'bg-[#FF7A00] animate-pulse'}`}></div>
            <div className="size-2.5 rounded-full bg-[#30363D]"></div>
            <div className="size-2.5 rounded-full bg-[#30363D]"></div>
          </div>
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-xs sm:text-sm text-[#F0F6FC] font-bold tracking-tight group-hover:text-[#FF7A00] transition-colors">
              LeetCode-Learn
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#8B949E] border border-[#21262D] hidden md:inline">
              v2.4.0
            </span>
          </NavLink>
        </div>

        {/* Route Navigation Links (Only clickable when verified) */}
        {isVerified ? (
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FF7A00] text-black font-bold shadow-md shadow-[#FF7A00]/20'
                        : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]'
                    }`
                  }
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161B22] border border-[#21262D] text-xs text-[#8B949E]">
            <Lock className="size-3.5 text-[#FF7A00]" />
            <span>Verify your account to unlock navigation</span>
          </div>
        )}

        {/* Action: Search Trigger, Profile Sync Trigger & Unlink */}
        <div className="flex items-center gap-2">
          {/* Global Search Bar Trigger */}
          <button
            type="button"
            onClick={() => openSearch()}
            className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] hover:border-[#FF7A00]/50 text-[#8B949E] hover:text-[#F0F6FC] transition-all text-xs cursor-pointer shadow-sm group w-auto sm:w-48 md:w-60"
            title="Global Problem Search (Ctrl+K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="size-3.5 text-[#FF7A00] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[11px] truncate hidden sm:inline text-[#8B949E] group-hover:text-[#F0F6FC]">
                Search 3,216 problems...
              </span>
              <span className="font-sans text-[11px] sm:hidden">Search</span>
            </div>
            <kbd className="hidden md:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] font-mono group-hover:text-[#FF7A00] group-hover:border-[#FF7A00]/40 transition-colors shrink-0">
              Ctrl K
            </kbd>
          </button>

          {isVerified ? (
            <>
              <button
                type="button"
                onClick={() => setSyncModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] hover:border-[#FF7A00]/50 text-[#F0F6FC] flex items-center gap-2 transition-all shadow-sm group cursor-pointer"
                title="Sync Settings"
              >
                <ShieldCheck className="size-3.5 text-[#3FB950]" />
                <span className="text-xs font-semibold group-hover:text-[#FF7A00] transition-colors">
                  @{handle}
                </span>
                <span className="text-[11px] text-[#8B949E] hidden lg:inline">
                  • {contestElo || 1500} Elo
                </span>
              </button>

              <button
                type="button"
                onClick={unlinkAccount}
                className="p-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] hover:border-red-500/50 text-[#8B949E] hover:text-red-400 transition-colors cursor-pointer"
                title="Unlink Account / Sign Out"
              >
                <LogOut className="size-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-bold">
              <Lock className="size-3.5" />
              <span>UNVERIFIED</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
