import React, { useEffect, useState } from 'react';
import { useProfileStore } from '../store/useProfileStore.js';
import { 
  CheckCircle2, 
  Clock, 
  Globe, 
  RefreshCw, 
  ShieldCheck, 
  X, 
  Terminal, 
  Key, 
  Copy, 
  Check, 
  Sparkles,
  AlertCircle,
  ClipboardPaste
} from 'lucide-react';

export const LeetCodeSyncModal = () => {
  const {
    syncModalOpen,
    setSyncModalOpen,
    syncModalTab,
    setSyncModalTab,
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
    solvedSlugs,
    loadUserSolved,
    isImportingSolved,
    solvedImportMessage,
    solvedImportError,
    importSolvedViaSnippet,
    importSolvedViaCookie,
    clearSolvedImportStatus,
  } = useProfileStore();

  const [inputHandle, setInputHandle] = useState(handle);
  const [activePastOption, setActivePastOption] = useState('snippet'); // 'snippet' | 'cookie'
  const [sessionCookieInput, setSessionCookieInput] = useState('');
  const [manualJsonInput, setManualJsonInput] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [pastedClipboard, setPastedClipboard] = useState(false);

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

  // Live polling: keep solved problem counts fresh whenever past tab is open
  useEffect(() => {
    if (!syncModalOpen || syncModalTab !== 'past') return;
    loadUserSolved();
    const interval = setInterval(() => {
      loadUserSolved();
    }, 2500);
    return () => clearInterval(interval);
  }, [syncModalOpen, syncModalTab, loadUserSolved]);

  if (!syncModalOpen) return null;

  const handleSyncSubmit = (e) => {
    e.preventDefault();
    if (!inputHandle.trim() || cooldownRemainingSeconds > 0) return;
    setHandle(inputHandle.trim());
    syncLeetCode(inputHandle.trim(), region);
  };

  const cleanHandle = (inputHandle || handle || 'username').trim().replace(/^@/, '');

  // Generates the 1-click copyable snippet tailored to the user's handle
  const browserSnippetCode = `(async () => {
  console.log("%c[LeetCode-Learn]%c Querying your solved problems from leetcode.com...", "color:#FF7A00;font-weight:bold", "");
  try {
    const res = await fetch('/api/problems/all/');
    if (!res.ok) throw new Error('HTTP ' + res.status + ' when fetching problem index');
    const data = await res.json();
    const solved = (data.stat_status_pairs || [])
      .filter(p => p.status === 'ac')
      .map(p => p.stat?.question__title_slug)
      .filter(Boolean);

    console.log(\`%c[LeetCode-Learn]%c Found \${solved.length} solved problems!\`, "color:#FF7A00;font-weight:bold", "");

    // 1. DevTools native copy command (synchronously copies directly to OS clipboard in console)
    if (typeof copy === 'function') {
      copy(JSON.stringify(solved));
      console.log("%c[LeetCode-Learn] ✓ Solved slugs copied to your clipboard!", "color:#10B981;font-weight:bold");
    }

    // 2. Attempt direct transmission to local app
    let directSynced = false;
    try {
      const targetUser = "${cleanHandle}" || data.user_name || "username";
      const postRes = await fetch('http://localhost:5000/api/users/' + targetUser + '/import-solved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solvedSlugs: solved, source: 'console_snippet' })
      });
      const result = await postRes.json();
      if (result.success) {
        directSynced = true;
        console.log(\`%c[LeetCode-Learn] ✓ Imported \${result.data.importedCount} solved problems to app!\`, "color:#10B981;font-weight:bold");
        alert(\`✓ SUCCESS! Directly imported \${result.data.importedCount} solved problems into LeetCode-Learn!\`);
      }
    } catch (err) {
      // Browser blocked localhost cross-origin request
    }

    if (!directSynced) {
      alert(\`✓ Found \${solved.length} solved problems!\\n\\nTheir slugs have been COPIED TO YOUR CLIPBOARD.\\n\\nSwitch back to LeetCode-Learn and click "Paste from Clipboard & Import" (or press Ctrl+V).\`);
    }
  } catch (err) {
    console.error("[LeetCode-Learn] Error:", err);
    alert("Could not extract solved problems: " + err.message + "\\nMake sure you are logged in to leetcode.com!");
  }
})();`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(browserSnippetCode);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 3000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const parseSlugsInput = (input) => {
    if (!input || !input.trim()) return [];
    const text = input.trim();
    let parsed = null;
    try {
      if (text.startsWith('[') || text.startsWith('{')) {
        parsed = JSON.parse(text);
      }
    } catch {
      // not JSON format
    }

    if (parsed) {
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') return item.trim().toLowerCase();
          if (item?.titleSlug) return item.titleSlug.trim().toLowerCase();
          if (item?.slug) return item.slug.trim().toLowerCase();
          if (item?.stat?.question__title_slug) return item.stat.question__title_slug.trim().toLowerCase();
          if (item?.question__title_slug) return item.question__title_slug.trim().toLowerCase();
          return null;
        }).filter(Boolean);
      }
      if (parsed.stat_status_pairs && Array.isArray(parsed.stat_status_pairs)) {
        return parsed.stat_status_pairs
          .filter(p => p.status === 'ac')
          .map(p => p.stat?.question__title_slug)
          .filter(Boolean);
      }
      if (Array.isArray(parsed.solvedSlugs)) return parsed.solvedSlugs;
      if (Array.isArray(parsed.solvedProblems)) return parsed.solvedProblems;
      if (Array.isArray(parsed.data)) return parsed.data;
    }

    // Comma, whitespace, quotes, newline separation
    return text
      .split(/[\n,\r\t"]+/)
      .map(s => s.trim().replace(/^['"\[\],]+|['"\[\],]+$/g, '').toLowerCase())
      .filter(s => s && s.length > 1 && !['null', 'undefined', 'true', 'false'].includes(s));
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('Clipboard is empty! Run the snippet in your leetcode.com console first to copy your solved problems.');
        return;
      }
      const slugs = parseSlugsInput(text);
      if (slugs.length === 0) {
        alert('Could not detect problem slugs in clipboard text. Try pasting manually in the box below.');
        return;
      }
      setPastedClipboard(true);
      setTimeout(() => setPastedClipboard(false), 2000);
      importSolvedViaSnippet(slugs);
    } catch (err) {
      console.warn('Clipboard read error:', err);
      alert('Could not read clipboard automatically (' + err.message + '). Please paste (Ctrl+V) directly into the text box below.');
    }
  };

  const handleManualJsonSubmit = (e) => {
    e.preventDefault();
    if (!manualJsonInput.trim()) return;
    try {
      const slugs = parseSlugsInput(manualJsonInput);
      if (slugs.length === 0) {
        alert('No valid problem slugs found in input.');
        return;
      }
      importSolvedViaSnippet(slugs);
      setManualJsonInput('');
    } catch (err) {
      alert('Invalid input format: ' + err.message);
    }
  };

  const handleCookieSubmit = (e) => {
    e.preventDefault();
    if (!sessionCookieInput.trim()) return;
    importSolvedViaCookie(sessionCookieInput.trim(), region);
    setSessionCookieInput('');
  };

  const cooldownMinutes = Math.floor(cooldownRemainingSeconds / 60);
  const cooldownSeconds = cooldownRemainingSeconds % 60;
  const cooldownProgress = ((600 - cooldownRemainingSeconds) / 600) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-xl bg-[#0D1117] border border-[#21262D] p-5 sm:p-6 space-y-4 font-mono shadow-2xl text-xs text-[#F0F6FC] animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D] shrink-0">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${syncStatus === 'syncing' || isImportingSolved ? 'bg-yellow-400 animate-ping' : 'bg-[#FF7A00]'}`} />
            <h3 className="font-bold text-sm text-[#F0F6FC]">LeetCode Profile & Problem Tracking</h3>
          </div>
          <button
            type="button"
            onClick={() => setSyncModalOpen(false)}
            className="size-6 rounded flex items-center justify-center text-[#8B949E] hover:text-white hover:bg-[#161B22] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-[#161B22] rounded-lg border border-[#21262D] shrink-0">
          <button
            type="button"
            onClick={() => { setSyncModalTab('sync'); clearSolvedImportStatus(); }}
            className={`flex-1 py-1.5 px-3 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              syncModalTab === 'sync'
                ? 'bg-[#FF7A00] text-black shadow-sm'
                : 'text-[#8B949E] hover:text-white hover:bg-[#21262D]'
            }`}
          >
            <RefreshCw className="size-3" />
            <span>Live Sync</span>
          </button>

          <button
            type="button"
            onClick={() => { setSyncModalTab('past'); clearSolvedImportStatus(); }}
            className={`flex-1 py-1.5 px-3 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              syncModalTab === 'past'
                ? 'bg-[#FF7A00] text-black shadow-sm'
                : 'text-[#8B949E] hover:text-white hover:bg-[#21262D]'
            }`}
          >
            <Sparkles className="size-3" />
            <span>Past Solved History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[9px] font-semibold">
              {solvedSlugs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setSyncModalTab('verify'); clearSolvedImportStatus(); }}
            className={`flex-1 py-1.5 px-3 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              syncModalTab === 'verify'
                ? 'bg-[#FF7A00] text-black shadow-sm'
                : 'text-[#8B949E] hover:text-white hover:bg-[#21262D]'
            }`}
          >
            <ShieldCheck className="size-3" />
            <span>Verify Bio</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">

          {/* TAB 1: LIVE SYNC */}
          {syncModalTab === 'sync' && (
            <div className="space-y-4">
              {/* Architecture Notice */}
              <div className="p-3 rounded-lg bg-[#161B22] border border-[#21262D] text-[11px] text-[#8B949E] leading-relaxed space-y-1">
                <div className="text-[#F0F6FC] font-semibold flex items-center gap-1.5">
                  <Globe className="size-3.5 text-[#FF7A00]" />
                  <span>Public GraphQL Profile Ingestion</span>
                </div>
                <p>
                  Ingests contest ratings, difficulty counts, and topic skill mastery across all 56 topics directly from LeetCode GraphQL without requiring credentials.
                </p>
              </div>

              {/* Handle Input Form */}
              <form onSubmit={handleSyncSubmit} className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-[#8B949E] font-semibold block">
                  LeetCode Handle / Username
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
                    <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Profile'}</span>
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

              {/* Ingested Profile Telemetry */}
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
                    <span className="font-bold text-[#F0F6FC] text-sm">{contestElo ? contestElo.toLocaleString() : '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8B949E] block">Worldwide Rank</span>
                    <span className="font-bold text-[#FF7A00] text-sm">#{contestRank ? contestRank.toLocaleString() : '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8B949E] block">Lifetime Solved</span>
                    <span className="font-bold text-[#F0F6FC] text-sm">{totalSolved ?? 0} Total</span>
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-[#21262D]">
                  <div>
                    <span className="text-[9px] uppercase text-[#8B949E] block">Easy</span>
                    <span className="font-bold text-[#3FB950] text-xs">{easySolved ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8B949E] block">Medium</span>
                    <span className="font-bold text-[#FF7A00] text-xs">{mediumSolved ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8B949E] block">Hard</span>
                    <span className="font-bold text-[#F85149] text-xs">{hardSolved ?? 0}</span>
                  </div>
                </div>

                {/* Sync Metadata */}
                <div className="pt-1.5 text-[10px] text-[#8B949E] border-t border-[#21262D] flex items-center justify-between">
                  <span>Source: LeetCode GraphQL ({region})</span>
                  <span>{lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Current Session'}</span>
                </div>
              </div>

              {/* Callout to Past History */}
              <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#21262D] flex items-center justify-between text-[11px]">
                <div className="text-[#8B949E]">
                  Want to organize all your past solved problems by topic?
                </div>
                <button
                  type="button"
                  onClick={() => setSyncModalTab('past')}
                  className="text-[#FF7A00] hover:text-[#FFA040] font-bold text-[10px] underline cursor-pointer"
                >
                  Import Past Solved →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PAST SOLVED HISTORY */}
          {syncModalTab === 'past' && (
            <div className="space-y-4">
              {/* Tracker Banner */}
              <div className="p-3 rounded-lg bg-[#090C10] border border-[#21262D] flex items-center justify-between">
                <div>
                  <div className="text-[#8B949E] text-[10px] uppercase font-semibold">Active Solved Database</div>
                  <div className="text-base font-bold text-[#F0F6FC] flex items-center gap-2">
                    <span className="text-[#FF7A00]">{solvedSlugs.length}</span>
                    <span className="text-xs font-normal text-[#8B949E]">problems indexed across 56 topics</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadUserSolved()}
                    title="Refresh solved count from local cache"
                    className="px-2 py-1 rounded bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-white border border-[#21262D] text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="size-3" />
                    <span>Refresh</span>
                  </button>
                  <div className="px-2 py-1 rounded bg-[#161B22] border border-[#21262D] text-[10px] text-[#8B949E]">
                    User: <span className="text-white font-bold">@{cleanHandle}</span>
                  </div>
                </div>
              </div>

              {/* Feedback messages */}
              {solvedImportMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  <span>{solvedImportMessage}</span>
                </div>
              )}

              {solvedImportError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0 text-red-400" />
                  <span>{solvedImportError}</span>
                </div>
              )}

              {/* Option Selector Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePastOption('snippet')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    activePastOption === 'snippet'
                      ? 'bg-[#161B22] border-[#FF7A00] text-white shadow-sm'
                      : 'bg-[#090C10] border-[#21262D] text-[#8B949E] hover:border-[#30363D]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Terminal className="size-3.5 text-[#FF7A00]" />
                    <span>Option 1: Browser Snippet</span>
                  </div>
                  <div className="text-[10px] text-[#8B949E] mt-1 leading-snug">
                    Zero risk • No credentials shared • Runs in your own browser on LeetCode.com
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePastOption('cookie')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    activePastOption === 'cookie'
                      ? 'bg-[#161B22] border-[#FF7A00] text-white shadow-sm'
                      : 'bg-[#090C10] border-[#21262D] text-[#8B949E] hover:border-[#30363D]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Key className="size-3.5 text-[#FF7A00]" />
                    <span>Option 2: Session Cookie</span>
                  </div>
                  <div className="text-[10px] text-[#8B949E] mt-1 leading-snug">
                    1-time backfill • Queried once & immediately discarded from memory
                  </div>
                </button>
              </div>

              {/* OPTION 1 CONTENT: BROWSER SNIPPET */}
              {activePastOption === 'snippet' && (
                <div className="space-y-3 p-3.5 rounded-lg bg-[#161B22] border border-[#21262D]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Terminal className="size-3.5 text-[#FF7A00]" />
                      <span>5-Second Browser Console Snippet</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySnippet}
                      className="px-2.5 py-1 rounded bg-[#FF7A00] hover:bg-[#FFA040] text-black font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSnippet ? <Check className="size-3" /> : <Copy className="size-3" />}
                      <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#8B949E] leading-relaxed">
                    Because your browser is already authenticated on LeetCode, this snippet queries your accepted questions and copies them to your clipboard with zero credentials shared.
                  </p>

                  {/* 3 Step Instructions */}
                  <div className="space-y-1.5 text-[10px] text-[#8B949E] bg-[#090C10] p-2.5 rounded-lg border border-[#21262D]">
                    <div className="flex items-start gap-2">
                      <span className="size-4 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold flex items-center justify-center shrink-0">1</span>
                      <span>Open <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" className="text-[#FF7A00] underline">leetcode.com</a> in your browser (make sure you are logged in).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="size-4 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold flex items-center justify-center shrink-0">2</span>
                      <span>Press <kbd className="px-1 py-0.5 rounded bg-[#21262D] text-white">F12</kbd> (or right click → Inspect) and click the <strong>Console</strong> tab.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="size-4 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold flex items-center justify-center shrink-0">3</span>
                      <span>Paste the snippet and hit <kbd className="px-1 py-0.5 rounded bg-[#21262D] text-white">Enter</kbd>. It automatically copies all solved slugs to your clipboard!</span>
                    </div>
                  </div>

                  {/* Action Bar: 1-Click Clipboard Import */}
                  <div className="pt-2 border-t border-[#21262D] space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#090C10] border border-[#21262D]">
                      <div>
                        <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <ClipboardPaste className="size-3.5 text-[#FF7A00]" />
                          <span>Ran the snippet? Click to import:</span>
                        </div>
                        <div className="text-[10px] text-[#8B949E] mt-0.5">
                          Imports your problem slugs directly from your system clipboard.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        disabled={isImportingSolved}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF7A00] to-[#FFA040] hover:brightness-110 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 disabled:opacity-50"
                      >
                        <ClipboardPaste className="size-3.5" />
                        <span>{isImportingSolved ? 'Importing...' : pastedClipboard ? '✓ Pasted!' : 'Paste & Import From Clipboard'}</span>
                      </button>
                    </div>

                    {/* Manual Paste Box */}
                    <form onSubmit={handleManualJsonSubmit} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-[#8B949E] font-semibold">
                          Or Paste Slugs / JSON Manually:
                        </label>
                        <span className="text-[9px] text-[#8B949E]">
                          Accepts JSON array, LeetCode data, or comma-separated
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={manualJsonInput}
                        onChange={(e) => setManualJsonInput(e.target.value)}
                        placeholder='Paste here e.g. ["two-sum", "3sum"] or two-sum, 3sum...'
                        className="w-full p-2 rounded bg-[#090C10] border border-[#21262D] text-white text-[10px] focus:border-[#FF7A00] outline-none font-mono"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!manualJsonInput.trim() || isImportingSolved}
                          className="px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] hover:text-white disabled:opacity-40 text-[#F0F6FC] font-bold text-[10px] cursor-pointer transition-colors border border-[#30363D]"
                        >
                          {isImportingSolved ? 'Importing...' : 'Import From Text'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* OPTION 2 CONTENT: SESSION COOKIE */}
              {activePastOption === 'cookie' && (
                <div className="space-y-3 p-3.5 rounded-lg bg-[#161B22] border border-[#21262D]">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Key className="size-3.5 text-[#FF7A00]" />
                    <span>1-Time Disposable Session Cookie Import</span>
                  </div>

                  <p className="text-[11px] text-[#8B949E] leading-relaxed">
                    Paste your <code className="text-white bg-[#090C10] px-1 py-0.5 rounded border border-[#21262D]">LEETCODE_SESSION</code> cookie. The backend will fetch your lifetime accepted problems and <strong>immediately purge the cookie from memory</strong>.
                  </p>

                  <div className="text-[10px] text-[#8B949E] bg-[#090C10] p-2.5 rounded border border-[#21262D] space-y-1">
                    <div className="font-semibold text-white">Where to find it:</div>
                    <div>1. On leetcode.com, press <kbd className="px-1 py-0.5 rounded bg-[#21262D] text-white">F12</kbd> → <strong>Application</strong> tab.</div>
                    <div>2. Under <strong>Storage → Cookies</strong>, select <code className="text-[#FF7A00]">https://leetcode.com</code>.</div>
                    <div>3. Copy the value of <code className="text-white">LEETCODE_SESSION</code> and paste below.</div>
                  </div>

                  <form onSubmit={handleCookieSubmit} className="space-y-2 pt-1">
                    <input
                      type="password"
                      value={sessionCookieInput}
                      onChange={(e) => setSessionCookieInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#090C10] border border-[#21262D] focus:border-[#FF7A00] text-white outline-none text-xs"
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        <span>Zero Retention Guarantee</span>
                      </div>
                      <button
                        type="submit"
                        disabled={!sessionCookieInput.trim() || isImportingSolved}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FF7A00] hover:bg-[#FFA040] disabled:opacity-40 text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className={`size-3 ${isImportingSolved ? 'animate-spin' : ''}`} />
                        <span>{isImportingSolved ? 'Verifying & Ingesting...' : 'Import & Discard Cookie'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OWNERSHIP VERIFICATION */}
          {syncModalTab === 'verify' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#161B22] border border-[#21262D] space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#F0F6FC] font-semibold text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-[#FF7A00]" />
                    <span>Anti-Impersonation Bio Verification</span>
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
                  Generate a temporary verification code, add it to your LeetCode profile bio ("About Me"), then click <strong className="text-white">Verify</strong> to confirm you own this handle.
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
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#21262D] shrink-0">
          <div className="text-[10px] text-[#8B949E]">
            {solvedSlugs.length > 0 && (
              <span className="text-emerald-400 font-semibold">✓ {solvedSlugs.length} solved problems tracked</span>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              <span>Done</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
