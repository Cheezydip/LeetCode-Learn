import React, { useEffect, useState } from 'react';
import { useProfileStore } from '../store/useProfileStore.js';
import { CheckCircle2, Clock, Globe, RefreshCw, ShieldCheck, X } from 'lucide-react';

export const LeetCodeSyncModal = () => {
  const {
    syncModalOpen,
    setSyncModalOpen,
    handle,
    setHandle,
    region,
    setRegion,
    contestElo,
    contestRank,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    lastSyncedAt,
    isVerified,
    syncStatus,
    syncError,
    cooldownRemainingSeconds,
    tickCooldown,
    syncLeetCode,
    verificationToken,
    verificationInstructions,
    verificationMessage,
    isGeneratingToken,
    isVerifyingToken,
    generateTokenAction,
    verifyTokenAction,
  } = useProfileStore();

  const [inputHandle, setInputHandle] = useState(handle);

  // Sync internal input if global handle changes externally
  useEffect(() => {
    setInputHandle(handle);
  }, [handle]);

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldownRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      tickCooldown();
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemainingSeconds, tickCooldown]);

  if (!syncModalOpen) return null;

  const handleSyncSubmit = (e) => {
    e.preventDefault();
    if (!inputHandle.trim() || cooldownRemainingSeconds > 0) return;
    setHandle(inputHandle.trim());
    syncLeetCode(inputHandle.trim(), region);
  };

  const cooldownMinutes = Math.floor(cooldownRemainingSeconds / 60);
  const cooldownSeconds = cooldownRemainingSeconds % 60;
  const cooldownProgress = ((600 - cooldownRemainingSeconds) / 600) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#0D1117] border border-[#21262D] p-5 sm:p-6 space-y-4 font-mono shadow-2xl text-xs text-[#F0F6FC] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${syncStatus === 'syncing' ? 'bg-yellow-400 animate-ping' : 'bg-[#FF7A00]'}`} />
            <h3 className="font-bold text-sm text-[#F0F6FC]">LeetCode Profile Integration</h3>
          </div>
          <button
            type="button"
            onClick={() => setSyncModalOpen(false)}
            className="size-6 rounded flex items-center justify-center text-[#8B949E] hover:text-white hover:bg-[#161B22] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Informational Architecture Notice */}
        <div className="p-3 rounded-lg bg-[#161B22] border border-[#21262D] text-[11px] text-[#8B949E] leading-relaxed space-y-1">
          <div className="text-[#F0F6FC] font-semibold flex items-center gap-1.5">
            <Globe className="size-3.5 text-[#FF7A00]" />
            <span>How LeetCode Auth Works</span>
          </div>
          <p>
            LeetCode does not provide an external OAuth2 provider. LeetCode-Learn directly ingests your public profile, contest rating, and topic metrics via the authenticated <span className="text-[#FF7A00]">LeetCode GraphQL API</span>.
          </p>
        </div>

        {/* Handle Input Form */}
        <form onSubmit={handleSyncSubmit} className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-[#8B949E] font-semibold block">
            LeetCode Username / Handle
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-[#8B949E]">@</span>
              <input
                type="text"
                value={inputHandle}
                onChange={(e) => setInputHandle(e.target.value)}
                placeholder="username"
                className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#090C10] border border-[#21262D] focus:border-[#FF7A00] text-[#F0F6FC] outline-none text-xs"
              />
            </div>
            
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#090C10] border border-[#21262D] text-[#8B949E] text-[11px] outline-none focus:border-[#FF7A00]"
            >
              <option value="global">Global</option>
              <option value="cn">China (CN)</option>
            </select>

            <button
              type="submit"
              disabled={syncStatus === 'syncing' || cooldownRemainingSeconds > 0}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF7A00] hover:bg-[#FFA040] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <RefreshCw className={`size-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncStatus === 'syncing' ? 'Querying...' : 'Sync GraphQL'}</span>
            </button>
          </div>

          {/* Cooldown Timer Bar */}
          {cooldownRemainingSeconds > 0 && (
            <div className="pt-1">
              <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-[#FF7A00]" />
                  <span>10-Minute Sync Cooldown Active</span>
                </span>
                <span className="text-[#FF7A00] font-bold">
                  {cooldownMinutes}:{String(cooldownSeconds).padStart(2, '0')} remaining
                </span>
              </div>
              <div className="h-1.5 rounded bg-[#161B22] border border-[#21262D] overflow-hidden">
                <div
                  className="h-full bg-[#FF7A00] transition-all duration-1000"
                  style={{ width: `${cooldownProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>

        {/* Live Ingested Profile Telemetry */}
        <div className="p-3.5 rounded-lg bg-[#090C10] border border-[#21262D] space-y-2.5 text-[11px]">
          <div className="flex items-center justify-between text-[#8B949E] text-[10px] pb-1.5 border-b border-[#21262D]">
            <span>INGESTED GRAPHQL TELEMETRY</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                syncStatus === 'synced'
                  ? 'bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/30'
                  : syncStatus === 'cached'
                  ? 'bg-white/10 text-white border-white/20'
                  : syncStatus === 'error'
                  ? 'bg-red-900/30 text-red-400 border-red-500/30'
                  : 'bg-white/5 text-[#8B949E] border-white/10'
              }`}
            >
              {syncStatus === 'synced'
                ? 'LIVE SYNCED'
                : syncStatus === 'cached'
                ? 'CACHED (10m Cooldown)'
                : syncStatus === 'error'
                ? 'SYNC FAILED'
                : 'AWAITING SYNC'}
            </span>
          </div>

          {syncError && (
            <div className="text-red-400 text-[10px] bg-red-950/40 p-2 rounded border border-red-800/40">
              Error: {syncError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[9px] uppercase text-[#8B949E] block">Contest Elo</span>
              <span className="font-bold text-[#F0F6FC] text-sm">{contestElo.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#8B949E] block">Worldwide Rank</span>
              <span className="font-bold text-[#FF7A00] text-sm">#{contestRank.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#8B949E] block">Problems Solved</span>
              <span className="font-bold text-[#F0F6FC] text-sm">{totalSolved} Total</span>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-[#21262D]">
            <div>
              <span className="text-[9px] uppercase text-[#8B949E] block">Easy</span>
              <span className="font-bold text-[#3FB950] text-xs">{easySolved}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#8B949E] block">Medium</span>
              <span className="font-bold text-[#FF7A00] text-xs">{mediumSolved}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#8B949E] block">Hard</span>
              <span className="font-bold text-[#F85149] text-xs">{hardSolved}</span>
            </div>
          </div>

          {/* Sync Metadata */}
          <div className="pt-1.5 text-[10px] text-[#8B949E] border-t border-[#21262D] flex items-center justify-between">
            <span>Source: LeetCode GraphQL ({region})</span>
            <span>{lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Current Session'}</span>
          </div>
        </div>

        {/* Bio Token Verification Section */}
        <div className="p-3 rounded-lg bg-[#161B22] border border-[#21262D] space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#F0F6FC] font-semibold text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#FF7A00]" />
              <span>Account Ownership Verification</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                isVerified
                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/10 text-[#8B949E] border-white/20'
              }`}
            >
              {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
            </span>
          </div>
          
          <p className="text-[#8B949E] text-[10px] leading-relaxed">
            Generate an anti-impersonation token, add it to your LeetCode profile bio ("About Me"), then click <strong className="text-white">Verify</strong>.
          </p>

          <div className="flex items-center gap-2">
            <code className="flex-1 text-white px-2.5 py-1.5 rounded-lg bg-[#090C10] border border-[#21262D] text-center font-bold tracking-wider select-all">
              {verificationToken || '—'}
            </code>
            <button
              type="button"
              onClick={generateTokenAction}
              disabled={isGeneratingToken}
              className="px-2.5 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] text-[10px] font-bold transition-colors cursor-pointer"
            >
              {isGeneratingToken ? '...' : 'Generate'}
            </button>
            <button
              type="button"
              onClick={verifyTokenAction}
              disabled={isVerifyingToken || !verificationToken}
              className="px-2.5 py-1.5 rounded-lg bg-[#FF7A00] hover:bg-[#FFA040] disabled:opacity-40 text-black text-[10px] font-bold transition-colors cursor-pointer"
            >
              {isVerifyingToken ? 'Checking...' : 'Verify'}
            </button>
          </div>

          {verificationInstructions && (
            <div className="text-[10px] text-[#8B949E] italic">
              {verificationInstructions}
            </div>
          )}

          {verificationMessage && (
            <div className={`text-[10px] font-medium ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
              {verificationMessage}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-1 border-t border-[#21262D]">
          <button
            type="button"
            onClick={() => setSyncModalOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => setSyncModalOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-[#FF7A00] hover:bg-[#FFA040] text-black font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Apply Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
};
