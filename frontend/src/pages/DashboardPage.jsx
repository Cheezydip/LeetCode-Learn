import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore.js';
import { Activity, ArrowRight, Compass, Flame, LineChart, Sparkles, Terminal } from 'lucide-react';

export const DashboardPage = () => {
  const {
    handle,
    realName,
    contestElo,
    contestRank,
    topPercentage,
    profileRank,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    isVerified,
    region,
    lastSyncedAt,
    setSyncModalOpen,
    topicMetrics,
    syncLeetCode,
  } = useProfileStore();

  // Auto-sync if profile has stale 8-topic cache
  useEffect(() => {
    if (handle && (!topicMetrics || Object.keys(topicMetrics).length <= 8)) {
      syncLeetCode(handle, region, true);
    }
  }, [handle, topicMetrics, region, syncLeetCode]);

  const eloVal = contestElo ?? 1500;
  const eloTier = eloVal >= 2150 ? 'Guardian' : eloVal >= 1850 ? 'Knight' : 'Contender';

  // Only Worldwide Profile Rank & Contest Rank in the typewriter animation
  const typewriterLines = useMemo(() => {
    const pRank = profileRank
      ? `#${profileRank.toLocaleString()}`
      : (handle ? 'Top 1% Worldwide' : '#150,000');

    const cRank = contestRank
      ? `#${contestRank.toLocaleString()}`
      : (handle ? 'Unrated' : '#45,200');

    const topPctStr = topPercentage ? ` (Top ${topPercentage}%)` : '';

    return [
      `Worldwide Profile Rank: ${pRank}`,
      `Worldwide Contest Rank: ${cRank}${topPctStr}`,
    ];
  }, [handle, profileRank, contestRank, topPercentage]);

  // Typewriter kinetic effect
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullLine = typewriterLines[currentLineIdx % typewriterLines.length] || '';
    let timeout;

    if (!isDeleting) {
      if (displayText.length < currentFullLine.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentFullLine.slice(0, displayText.length + 1));
        }, 35);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentFullLine.slice(0, displayText.length - 1));
        }, 15);
      } else {
        setIsDeleting(false);
        setCurrentLineIdx((prev) => (prev + 1) % typewriterLines.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentLineIdx, typewriterLines]);

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* SECTION 1: HERO IDE PANEL */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Main IDE Editor Panel */}
          <div className="lg:col-span-8 rounded-xl border border-[#21262D] bg-[#0D1117] overflow-hidden shadow-2xl">
            
            {/* File Tabs Header */}
            <div className="h-10 bg-[#090C10] border-b border-[#21262D] flex items-center px-2 select-none text-xs font-mono">
              <div className="h-full px-4 flex items-center gap-2 bg-[#0D1117] border-t-2 border-t-[#FF7A00] border-r border-r-[#21262D] text-[#F0F6FC]">
                <span className="text-[#FF7A00] font-bold text-[11px]">JS</span>
                <span>growth_engine.js</span>
              </div>
              <div className="h-full px-4 flex items-center gap-2 border-r border-r-[#21262D] text-[#8B949E] hidden sm:flex">
                <span className="text-[#F0F6FC] text-[11px]">RS</span>
                <span>review_queue.rs</span>
              </div>
              <div className="h-full px-4 flex items-center gap-2 border-r border-r-[#21262D] text-[#8B949E] hidden sm:flex">
                <span className="text-[#FF7A00] text-[11px]">PY</span>
                <span>staircase_dp.py</span>
              </div>
            </div>

            {/* Code Editor Body */}
            <div className="p-5 sm:p-6 font-mono text-xs leading-relaxed space-y-2">
              <div className="text-[#484F58] text-[11px] mb-2">
                // Section 01: Core Algorithmic Growth & Profile Telemetry
              </div>

              {/* Line 01: Account Name & Details */}
              <div className="text-[#8B949E]">
                <span className="text-[#484F58] select-none mr-3">01</span>
                <span className="text-[#FF7A00]">const</span> <span className="text-[#F0F6FC]">account</span> = <span className="text-[#A5D6FF]">"{handle ? `@${handle}` : '@guest'}"</span>; <span className="text-[#484F58]">// {realName ? realName : (handle ? 'LeetCode Account' : 'Demo Profile')}{isVerified ? ' (Verified)' : ''}</span>
              </div>

              {/* Line 02: Contest Rating & Tier */}
              <div className="text-[#8B949E]">
                <span className="text-[#484F58] select-none mr-3">02</span>
                <span className="text-[#FF7A00]">const</span> <span className="text-[#F0F6FC]">contestRating</span> = <span className="text-[#FF7A00]">{eloVal.toLocaleString()}</span>; <span className="text-[#484F58]">// {eloTier} Tier ({region.toUpperCase()})</span>
              </div>

              {/* Line 03: Growth Sweet Spot Target */}
              <div className="text-[#8B949E]">
                <span className="text-[#484F58] select-none mr-3">03</span>
                <span className="text-[#FF7A00]">const</span> <span className="text-[#F0F6FC]">targetSweetSpot</span> = <span className="text-white">goldilocksBand</span>(contestRating); <span className="text-[#484F58]">// [{(eloVal + 50).toLocaleString()}, {(eloVal + 250).toLocaleString()}]</span>
              </div>

              {/* Line 04: Solved Problems Stats */}
              <div className="text-[#8B949E]">
                <span className="text-[#484F58] select-none mr-3">04</span>
                <span className="text-[#FF7A00]">const</span> <span className="text-[#F0F6FC]">solvedProblems</span> = &#123; <span className="text-[#3FB950]">easy:</span> {easySolved ?? 0}, <span className="text-[#FF7A00]">med:</span> {mediumSolved ?? 0}, <span className="text-[#F85149]">hard:</span> {hardSolved ?? 0}, <span className="text-[#F0F6FC]">total:</span> {totalSolved ?? 0} &#125;;
              </div>

              {/* Line 05: Kinetic Typewriter Line (Rankings Only) */}
              <div className="text-[#F0F6FC] flex items-center pt-2 min-h-[28px] overflow-x-auto">
                <span className="text-[#484F58] select-none mr-3">05</span>
                <span className="text-[#FF7A00] font-bold select-none mr-2">›</span>
                <span className="font-semibold text-[#F0F6FC] whitespace-pre">{displayText}</span>
                <span className="inline-block w-2 h-4 ml-1 bg-[#FF7A00] animate-pulse shrink-0" />
              </div>

              <div className="pt-4 mt-4 border-t border-[#21262D] text-[11px] text-[#8B949E] flex flex-col sm:flex-row justify-between gap-1">
                <span>Dashboard • React Router 7</span>
                <span className="text-[#FF7A00]">JavaScript ES2023 • Vite</span>
              </div>
            </div>

          </div>

          {/* Floating HUD Stack */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Card 1: Live Contest Elo */}
            <div className="p-5 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl hover:border-[#FF7A00]/40 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#8B949E] font-mono font-semibold">
                  Live Contest Rating
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 font-bold">
                  ▲ +38 Proj
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono text-4xl font-extrabold text-[#F0F6FC]">
                  {contestElo.toLocaleString()}
                </div>
                <span className="text-xs text-[#FF7A00] font-mono font-bold">
                  {contestElo >= 2150 ? 'Guardian' : contestElo >= 1850 ? 'Knight' : 'Contender'}
                </span>
              </div>
              <p className="text-[11px] text-[#8B949E] mt-2 font-mono">
                Worldwide Rank: <span className="text-[#F0F6FC] font-semibold">#{contestRank.toLocaleString()}</span>
              </p>
              <div className="w-full bg-[#161B22] h-1.5 rounded mt-3 overflow-hidden border border-[#21262D]">
                <div className="bg-[#FF7A00] h-full" style={{ width: `${Math.min(100, Math.max(10, ((contestElo - 1500) / 700) * 100))}%` }} />
              </div>
            </div>

            {/* Card 2: Spaced Repetition Due Vault */}
            <div className="p-5 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl hover:border-[#F0F6FC]/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#8B949E] font-mono font-semibold">
                  Review Queue
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20 font-bold">
                  Due Today
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono text-4xl font-extrabold text-[#FF7A00]">3</div>
                <span className="text-sm font-mono text-[#8B949E]">struggled problems</span>
              </div>
              <p className="text-[11px] text-[#8B949E] mt-2 font-mono">Trapping Rain Water (7d review cadence)</p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-0.5 rounded bg-[#161B22] text-[10px] font-mono text-[#F85149] border border-[#F85149]/30 font-bold">
                  Hard
                </span>
                <span className="px-2 py-0.5 rounded bg-[#161B22] text-[10px] font-mono text-[#FF7A00] border border-[#FF7A00]/30 font-bold">
                  Stage 1
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* QUICK NAVIGATION CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-[#FF7A00]" />
            <h2 className="text-sm font-bold text-[#F0F6FC] uppercase tracking-wider">
              Explore All Pages
            </h2>
          </div>
          <button
            onClick={() => setSyncModalOpen(true)}
            className="text-xs text-[#8B949E] hover:text-[#FF7A00] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Sync Profile (@{handle})</span>
            <ArrowRight className="size-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Module 1: Simulator */}
          <Link
            to="/growth"
            className="group p-5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#FF7A00]/50 transition-all hover:-translate-y-0.5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="size-8 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] border border-[#FF7A00]/20 group-hover:bg-[#FF7A00] group-hover:text-black transition-colors">
                  <LineChart className="size-4" />
                </div>
                <span className="text-[10px] text-[#8B949E] font-mono">[02]</span>
              </div>
              <h3 className="font-bold text-sm text-[#F0F6FC] group-hover:text-[#FF7A00] transition-colors">
                Growth Charts
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Rating projections, contest rank trends, and practice volume controls.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#FF7A00] font-semibold">
              <span>View Charts</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: Radar */}
          <Link
            to="/topics"
            className="group p-5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#FF7A00]/50 transition-all hover:-translate-y-0.5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="size-8 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] border border-[#FF7A00]/20 group-hover:bg-[#FF7A00] group-hover:text-black transition-colors">
                  <Activity className="size-4" />
                </div>
                <span className="text-[10px] text-[#8B949E] font-mono">[03]</span>
              </div>
              <h3 className="font-bold text-sm text-[#F0F6FC] group-hover:text-[#FF7A00] transition-colors">
                Topic Analysis
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Visual skill breakdown by topic with interactive inspection and progress tracking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#FF7A00] font-semibold">
              <span>View Topics</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: Roadmaps */}
          <Link
            to="/paths"
            className="group p-5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#FF7A00]/50 transition-all hover:-translate-y-0.5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="size-8 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] border border-[#FF7A00]/20 group-hover:bg-[#FF7A00] group-hover:text-black transition-colors">
                  <Compass className="size-4" />
                </div>
                <span className="text-[10px] text-[#8B949E] font-mono">[04]</span>
              </div>
              <h3 className="font-bold text-sm text-[#F0F6FC] group-hover:text-[#FF7A00] transition-colors">
                Learning Paths
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Step-by-step problem progressions across 56 topics, sorted Easy → Medium → Hard.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#FF7A00] font-semibold">
              <span>Browse Paths</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 4: Upsolve */}
          <Link
            to="/practice"
            className="group p-5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#FF7A00]/50 transition-all hover:-translate-y-0.5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="size-8 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] border border-[#FF7A00]/20 group-hover:bg-[#FF7A00] group-hover:text-black transition-colors">
                  <Flame className="size-4" />
                </div>
                <span className="text-[10px] text-[#8B949E] font-mono">[05]</span>
              </div>
              <h3 className="font-bold text-sm text-[#F0F6FC] group-hover:text-[#FF7A00] transition-colors">
                Weak Spots & Practice
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Weakness analysis, post-contest practice queue, and struggle detection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#FF7A00] font-semibold">
              <span>View Queue</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* QUICK INGESTION TELEMETRY STRIP */}
      <section className="p-4 rounded-xl bg-[#0D1117] border border-[#21262D] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-[#3FB950]"></div>
          <div>
            <span className="text-[#8B949E]">Active Synced Handle: </span>
            <span className="font-bold text-white">@{handle}</span>
          </div>
          <span className="text-[#484F58]">•</span>
          <div>
            <span className="text-[#8B949E]">Profile Rank: </span>
            <span className="font-bold text-[#FF7A00]">#{profileRank.toLocaleString()}</span>
          </div>
          <span className="text-[#484F58]">•</span>
          <div>
            <span className="text-[#8B949E]">Total Solved: </span>
            <span className="font-bold text-white">{totalSolved}</span>
            <span className="text-[#8B949E] ml-1">({easySolved}E • {mediumSolved}M • {hardSolved}H)</span>
          </div>
        </div>

        <button
          onClick={() => setSyncModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-[#F0F6FC] border border-[#21262D] font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="size-3.5 text-[#FF7A00]" />
          <span>Sync Settings</span>
        </button>
      </section>

    </div>
  );
};
