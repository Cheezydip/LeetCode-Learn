import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore.js';
import { Activity, Compass, Flame, LayoutDashboard, LineChart, Lock, LogOut, ShieldCheck } from 'lucide-react';

export const AppHeader = () => {
  const { handle, contestElo, syncStatus, isVerified, setSyncModalOpen, unlinkAccount } = useProfileStore();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Growth', path: '/growth', icon: LineChart },
    { label: 'Topics', path: '/topics', icon: Activity },
    { label: 'Paths', path: '/paths', icon: Compass },
    { label: 'Practice', path: '/practice', icon: Flame },
  ];

  return (
    <header className="sticky top-3 z-40 max-w-7xl mx-auto px-4 mb-6 font-mono">
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

        {/* Action: Profile Sync Trigger & Unlink */}
        <div className="flex items-center gap-2">
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
