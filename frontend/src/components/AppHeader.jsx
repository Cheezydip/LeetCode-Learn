import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore.js';
import { useSearchStore } from '../store/useSearchStore.js';
import { 
  Activity, 
  Compass, 
  Flame, 
  LayoutDashboard, 
  LineChart, 
  Lock, 
  LogOut, 
  Search, 
  ShieldCheck, 
  Menu, 
  X 
} from 'lucide-react';

export const AppHeader = () => {
  const { handle, contestElo, isVerified, setSyncModalOpen, unlinkAccount } = useProfileStore();
  const { openSearch } = useSearchStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Growth', path: '/growth', icon: LineChart },
    { label: 'Topics', path: '/topics', icon: Activity },
    { label: 'Paths', path: '/paths', icon: Compass },
    { label: 'Practice', path: '/practice', icon: Flame },
  ];

  return (
    <header className="sticky top-2 sm:top-3 z-40 max-w-7xl mx-auto px-2 sm:px-4 mb-4 sm:mb-6">
      <div className="h-14 rounded-xl bg-[#0D1117]/95 backdrop-blur-md border border-[#21262D] px-3 sm:px-4 flex items-center justify-between shadow-2xl shadow-black/50">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 pl-0.5 sm:pl-1">
            <div className={`size-2.5 rounded-full ${isVerified ? 'bg-[#3FB950]' : 'bg-[#FF7A00] animate-pulse'}`}></div>
            <div className="size-2.5 rounded-full bg-[#30363D] hidden sm:block"></div>
            <div className="size-2.5 rounded-full bg-[#30363D] hidden sm:block"></div>
          </div>
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-xs sm:text-sm text-[#F0F6FC] font-bold tracking-tight group-hover:text-[#FF7A00] transition-colors">
              LeetCode-Learn
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#8B949E] border border-[#21262D] hidden xl:inline">
              v2.4.0
            </span>
          </NavLink>
        </div>

        {/* Desktop Navigation Links (Only shown on lg+ viewports) */}
        {isVerified ? (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 py-1">
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
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161B22] border border-[#21262D] text-xs text-[#8B949E]">
            <Lock className="size-3.5 text-[#FF7A00]" />
            <span>Verify your account to unlock navigation</span>
          </div>
        )}

        {/* Action Controls: Search, Profile, Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Search Bar Trigger */}
          <button
            type="button"
            onClick={() => openSearch()}
            className="flex items-center justify-between gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] hover:border-[#FF7A00]/50 text-[#8B949E] hover:text-[#F0F6FC] transition-all text-xs cursor-pointer shadow-sm group w-auto sm:w-40 md:w-52"
            title="Global Problem Search (Ctrl+K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="size-3.5 text-[#FF7A00] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[11px] truncate hidden sm:inline text-[#8B949E] group-hover:text-[#F0F6FC]">
                Search problems...
              </span>
            </div>
            <kbd className="hidden md:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] font-mono group-hover:text-[#FF7A00] group-hover:border-[#FF7A00]/40 transition-colors shrink-0">
              Ctrl K
            </kbd>
          </button>

          {isVerified ? (
            <>
              {/* Profile Sync Trigger */}
              <button
                type="button"
                onClick={() => setSyncModalOpen(true)}
                className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] hover:border-[#FF7A00]/50 text-[#F0F6FC] flex items-center gap-1.5 transition-all shadow-sm group cursor-pointer"
                title="Sync Settings"
              >
                <ShieldCheck className="size-3.5 text-[#3FB950] shrink-0" />
                <span className="text-xs font-semibold group-hover:text-[#FF7A00] transition-colors truncate max-w-[80px] sm:max-w-[120px]">
                  @{handle || 'user'}
                </span>
                <span className="text-[11px] text-[#8B949E] hidden xl:inline">
                  • {contestElo || 1500}
                </span>
              </button>

              {/* Unlink Account Button (Desktop) */}
              <button
                type="button"
                onClick={unlinkAccount}
                className="hidden lg:flex p-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] hover:border-red-500/50 text-[#8B949E] hover:text-red-400 transition-colors cursor-pointer"
                title="Unlink Account / Sign Out"
              >
                <LogOut className="size-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-bold">
              <Lock className="size-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs">LOCKED</span>
            </div>
          )}

          {/* Mobile Navigation Toggle (Shown on screens < lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] hover:border-[#FF7A00]/50 text-[#F0F6FC] transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-4 text-[#FF7A00]" /> : <Menu className="size-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-3 rounded-xl bg-[#0D1117]/98 backdrop-blur-xl border border-[#21262D] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 font-mono">
          {isVerified ? (
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pb-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all min-h-[42px] ${
                        isActive
                          ? 'bg-[#FF7A00] text-black font-bold shadow-md shadow-[#FF7A00]/25'
                          : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] border border-[#21262D]/60'
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          ) : (
            <div className="p-3 mb-2 rounded-lg bg-[#161B22] border border-[#21262D] text-xs text-[#8B949E] flex items-center gap-2">
              <Lock className="size-4 text-[#FF7A00] shrink-0" />
              <span>Verify your account to unlock full navigation.</span>
            </div>
          )}

          {isVerified && (
            <div className="pt-2 border-t border-[#21262D] flex items-center justify-between text-xs text-[#8B949E]">
              <div className="flex items-center gap-2 truncate">
                <span className="size-2 rounded-full bg-[#3FB950]"></span>
                <span className="text-[#F0F6FC] font-semibold truncate">@{handle}</span>
                <span>• {contestElo || 1500} Rating</span>
              </div>
              <button
                type="button"
                onClick={unlinkAccount}
                className="px-2.5 py-1 rounded bg-[#161B22] hover:bg-red-950/40 text-red-400 border border-[#21262D] hover:border-red-500/40 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <LogOut className="size-3" />
                <span>Unlink</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
