import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProfileStore } from '../store/useProfileStore.js';
import { getMasterDsaProblemsForTopic } from '../data/sheetsData.js';
import { safeUrl } from '../lib/utils.js';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Play,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  ArrowRight,
  GitFork,
  Search,
  Filter,
  Trophy,
  Star,
  X,
  ArrowUpRight,
  LayoutGrid,
  Network,
  ListOrdered,
  Check,
  Zap,
  Target,
} from 'lucide-react';

/* ─── DIFFICULTY THEMES ───────────────────────────────────────────── */
const DIFF = {
  Easy:   { dot: '#3FB950', glow: 'rgba(63,185,80,0.15)',  bg: 'rgba(63,185,80,0.06)',  border: 'rgba(63,185,80,0.25)',  text: '#3FB950' },
  Medium: { dot: '#FF7A00', glow: 'rgba(255,122,0,0.15)',  bg: 'rgba(255,122,0,0.06)',  border: 'rgba(255,122,0,0.25)',  text: '#FF7A00' },
  Hard:   { dot: '#F85149', glow: 'rgba(248,81,73,0.15)',  bg: 'rgba(248,81,73,0.06)',  border: 'rgba(248,81,73,0.25)',  text: '#F85149' },
};
const diffOf = (d) => DIFF[d] || DIFF.Medium;

/* ─── STAGE PARTITIONING FOR SUBTOPICS (MAIN TREE) ────────────────── */
function partitionIntoStages(subtopics) {
  const n = subtopics.length;
  if (n <= 3) {
    return [
      {
        stageNum: 1,
        title: 'Stage 1 · Core Foundations',
        subtitle: 'Essential patterns & baseline intuition',
        subtopics,
      },
    ];
  }
  if (n <= 6) {
    const s1 = Math.ceil(n / 2);
    return [
      {
        stageNum: 1,
        title: 'Stage 1 · Core Foundations',
        subtitle: 'Fundamental patterns & state transitions',
        subtopics: subtopics.slice(0, s1),
      },
      {
        stageNum: 2,
        title: 'Stage 2 · Advanced Patterns',
        subtitle: 'Optimization & complex formulations',
        subtopics: subtopics.slice(s1),
      },
    ];
  }
  // 7 or more subtopics -> 3 progressive stages
  const s1 = Math.ceil(n * 0.35);
  const s2 = s1 + Math.ceil((n - s1) * 0.5);
  return [
    {
      stageNum: 1,
      title: 'Stage 1 · Core Fundamentals',
      subtitle: 'Baseline intuition & 1D transitions',
      subtopics: subtopics.slice(0, s1),
    },
    {
      stageNum: 2,
      title: 'Stage 2 · Standard Invariants',
      subtitle: 'Multidimensional states & classical variations',
      subtopics: subtopics.slice(s1, s2),
    },
    {
      stageNum: 3,
      title: 'Stage 3 · Advanced Optimization',
      subtitle: 'Complex state formulations & boundary constraints',
      subtopics: subtopics.slice(s2),
    },
  ];
}

/* ─── TIER PARTITIONING FOR PROBLEMS (INSIDE MODAL) ───────────────── */
function partitionProblemsIntoTiers(problems) {
  const easy = problems.filter((p) => p.difficulty === 'Easy');
  const med = problems.filter((p) => p.difficulty === 'Medium');
  const hard = problems.filter((p) => p.difficulty === 'Hard');

  const tiers = [];
  if (easy.length > 0) {
    tiers.push({
      tierNum: 1,
      title: 'Tier 1 · Foundation & Warmup',
      subtitle: 'Establish core invariant & baseline edge cases',
      color: '#3FB950',
      problems: easy,
    });
  }
  if (med.length > 0) {
    tiers.push({
      tierNum: tiers.length + 1,
      title: `Tier ${tiers.length + 1} · Core Pattern Variations`,
      subtitle: 'Standard interview formulations & multidimensional transitions',
      color: '#FF7A00',
      problems: med,
    });
  }
  if (hard.length > 0) {
    tiers.push({
      tierNum: tiers.length + 1,
      title: `Tier ${tiers.length + 1} · Advanced & Edge Mastery`,
      subtitle: 'Boundary compressions, bitmasks, & complex state optimizations',
      color: '#F85149',
      problems: hard,
    });
  }
  if (tiers.length === 0) {
    tiers.push({
      tierNum: 1,
      title: 'All Problems',
      subtitle: 'Comprehensive module problem set',
      color: '#FF7A00',
      problems,
    });
  }
  return tiers;
}

/* ─── CURVED SVG BEZIER BRANCH CONNECTOR ─────────────────────────── */
const CurvedBranchConnector = ({ count, cardWidth = 270, gap = 20, height = 44 }) => {
  if (count <= 0) return null;
  if (count === 1) {
    return (
      <div className="flex justify-center" style={{ height }}>
        <div className="w-[2px] h-full bg-gradient-to-b from-[#FF7A00] to-[#30363D]" />
      </div>
    );
  }

  const totalCardsWidth = count * cardWidth + (count - 1) * gap;
  const svgWidth = Math.max(totalCardsWidth + 40, 600);
  const midX = svgWidth / 2;
  const startY = 0;
  const endY = height;

  return (
    <>
      <div className="hidden sm:flex justify-center overflow-visible pointer-events-none select-none my-0">
        <svg
          width={svgWidth}
          height={height}
          viewBox={`0 0 ${svgWidth} ${height}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#30363D" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Central origin node */}
          <circle cx={midX} cy={startY} r="4" fill="#0D1117" stroke="#FF7A00" strokeWidth="2" />
          <circle cx={midX} cy={startY} r="1.5" fill="#FF7A00" />

          {/* Draw smooth cubic bezier curve to each card */}
          {Array.from({ length: count }).map((_, i) => {
            const cardCenterX = midX - totalCardsWidth / 2 + i * (cardWidth + gap) + cardWidth / 2;
            const cpY1 = startY + (endY - startY) * 0.45;
            const cpY2 = startY + (endY - startY) * 0.55;
            const pathD = `M ${midX} ${startY} C ${midX} ${cpY1}, ${cardCenterX} ${cpY2}, ${cardCenterX} ${endY}`;

            return (
              <g key={i}>
                {/* Outer soft glow line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="rgba(255,122,0,0.12)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Crisp connection line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#30363D"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                {/* Terminal connection pin */}
                <circle
                  cx={cardCenterX}
                  cy={endY}
                  r="3.5"
                  fill="#0D1117"
                  stroke="#FF7A00"
                  strokeWidth="1.5"
                />
                <circle cx={cardCenterX} cy={endY} r="1.5" fill="#FF7A00" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="sm:hidden flex justify-center py-1.5">
        <div className="w-[1.5px] h-4 bg-gradient-to-b from-[#FF7A00] to-[#21262D]" />
      </div>
    </>
  );
};

/* ─── STAGE MILESTONE DIVIDER (MAIN TREE) ─────────────────────────── */
function StageMilestone({ title, totalProblems, solvedProblems, isComplete }) {
  const pct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-3 px-2">
      <div className="hidden xs:block h-[1px] flex-1 max-w-[140px] bg-gradient-to-r from-transparent to-[#21262D]" />
      <div
        className={`px-3 sm:px-4 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-2 sm:gap-2.5 transition-all max-w-full
          ${isComplete
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-500/10'
            : 'bg-[#161B22]/90 border-[#30363D] text-[#C9D1D9] shadow-sm'
          }`}
      >
        <span
          className={`size-2 rounded-full shrink-0 ${
            isComplete ? 'bg-emerald-400 animate-pulse' : 'bg-[#FF7A00]'
          }`}
        />
        <span className="tracking-wide uppercase text-[10px] sm:text-[11px] truncate">{title}</span>
        <span className="text-[10px] text-[#8B949E] font-normal shrink-0">
          ({solvedProblems}/{totalProblems} • {pct}%)
        </span>
      </div>
      <div className="hidden xs:block h-[1px] flex-1 max-w-[140px] bg-gradient-to-l from-transparent to-[#21262D]" />
    </div>
  );
}

/* ─── SUBTOPIC CARD (MAIN TREE NODE) ─────────────────────────────── */
function SubtopicSkillCard({ subtopic, isProblemSolved, onOpen }) {
  const solved = subtopic.problems.filter((p) => isProblemSolved(p.slug)).length;
  const total = subtopic.problems.length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const isComplete = solved === total && total > 0;

  const easy = subtopic.problems.filter((p) => p.difficulty === 'Easy').length;
  const med = subtopic.problems.filter((p) => p.difficulty === 'Medium').length;
  const hard = subtopic.problems.filter((p) => p.difficulty === 'Hard').length;

  return (
    <button
      type="button"
      onClick={() => onOpen(subtopic)}
      className={`group relative w-full sm:w-[270px] p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left
        hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-1 focus:ring-[#FF7A00]/50
        ${isComplete
          ? 'bg-gradient-to-b from-emerald-950/20 to-[#0D1117] border-emerald-500/35 hover:border-emerald-400/60 shadow-emerald-950/10'
          : 'bg-gradient-to-b from-[#161B22]/90 to-[#0D1117]/95 border-[#21262D] hover:border-[#FF7A00]/50 hover:bg-[#161B22]'
        }`}
    >
      {/* Top row: Icon + Title + Chevron */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isComplete
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-[#21262D] text-[#FF7A00] group-hover:bg-[#FF7A00]/15'
          }`}
        >
          {isComplete ? (
            <Trophy className="size-3.5" />
          ) : (
            <GitFork className="size-3.5 group-hover:rotate-12 transition-transform" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span
            className={`text-xs font-bold block truncate transition-colors ${
              isComplete
                ? 'text-emerald-300'
                : 'text-[#F0F6FC] group-hover:text-[#FF7A00]'
            }`}
          >
            {subtopic.subtopicTitle}
          </span>
          <span className="text-[10px] font-mono text-[#8B949E] block truncate">
            {total} problems
          </span>
        </div>

        <ChevronRight className="size-3.5 text-[#484F58] group-hover:text-[#FF7A00] group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-[#21262D] overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #059669, #34D399)'
              : 'linear-gradient(90deg, #FF7A00, #FFB347)',
          }}
        />
      </div>

      {/* Bottom stats: Solved count & Difficulty pills */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span
          className={`font-semibold ${
            isComplete
              ? 'text-emerald-400'
              : solved > 0
              ? 'text-[#FF7A00]'
              : 'text-[#8B949E]'
          }`}
        >
          {solved}/{total} ({pct}%)
        </span>

        <div className="flex items-center gap-1.5">
          {easy > 0 && (
            <span className="flex items-center gap-0.5 text-[9px] text-[#3FB950]">
              <span className="size-1 rounded-full bg-[#3FB950]" />
              {easy}
            </span>
          )}
          {med > 0 && (
            <span className="flex items-center gap-0.5 text-[9px] text-[#FF7A00]">
              <span className="size-1 rounded-full bg-[#FF7A00]" />
              {med}
            </span>
          )}
          {hard > 0 && (
            <span className="flex items-center gap-0.5 text-[9px] text-[#F85149]">
              <span className="size-1 rounded-full bg-[#F85149]" />
              {hard}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CENTERED RECTANGULAR PROBLEM MODAL (INDEPENDENT SCROLL)
   ═══════════════════════════════════════════════════════════════════ */
function ProblemModal({
  subtopic,
  allSubtopics,
  onClose,
  onNavigateSubtopic,
  isProblemSolved,
  toggleSolved,
}) {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [starOnly, setStarOnly] = useState(false);
  const [problemViewMode, setProblemViewMode] = useState('ladder'); // 'ladder' | 'grid' | 'tree'

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Subtopic navigation
  const currentIndex = allSubtopics.findIndex((s) => s.id === subtopic.id);
  const prevSubtopic = currentIndex > 0 ? allSubtopics[currentIndex - 1] : null;
  const nextSubtopic =
    currentIndex < allSubtopics.length - 1
      ? allSubtopics[currentIndex + 1]
      : null;

  // Filtered problems list
  const problems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subtopic.problems.filter((p) => {
      if (
        q &&
        !p.title?.toLowerCase().includes(q) &&
        !p.slug?.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
      if (statusFilter === 'solved' && !isProblemSolved(p.slug)) return false;
      if (statusFilter === 'unsolved' && isProblemSolved(p.slug)) return false;
      if (starOnly && !p.important) return false;
      return true;
    });
  }, [
    subtopic.problems,
    search,
    diffFilter,
    statusFilter,
    starOnly,
    isProblemSolved,
  ]);

  const solved = subtopic.problems.filter((p) => isProblemSolved(p.slug)).length;
  const total = subtopic.problems.length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const easy = subtopic.problems.filter((p) => p.difficulty === 'Easy').length;
  const med = subtopic.problems.filter((p) => p.difficulty === 'Medium').length;
  const hard = subtopic.problems.filter((p) => p.difficulty === 'Hard').length;

  const problemTiers = useMemo(
    () => partitionProblemsIntoTiers(problems),
    [problems]
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Centered Modal Container */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 md:p-8 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-4xl h-[86vh] max-h-[820px] rounded-2xl bg-[#0D1117] border border-[#21262D] shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-zoom-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── 1. Top Subtopic Navigation Bar (Fixed) ───────────── */}
          <div className="shrink-0 px-5 py-2.5 bg-[#161B22]/90 border-b border-[#21262D] flex items-center justify-between text-xs font-mono">
            <button
              type="button"
              disabled={!prevSubtopic}
              onClick={() => prevSubtopic && onNavigateSubtopic(prevSubtopic)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                prevSubtopic
                  ? 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] cursor-pointer'
                  : 'text-[#484F58] cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronLeft className="size-3.5" />
              <span className="truncate max-w-[130px]">
                {prevSubtopic ? prevSubtopic.subtopicTitle : 'First Module'}
              </span>
            </button>

            <span className="text-[#8B949E] text-[11px] font-bold">
              Module {currentIndex + 1} of {allSubtopics.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!nextSubtopic}
                onClick={() => nextSubtopic && onNavigateSubtopic(nextSubtopic)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  nextSubtopic
                    ? 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] cursor-pointer'
                    : 'text-[#484F58] cursor-not-allowed opacity-40'
                }`}
              >
                <span className="truncate max-w-[130px]">
                  {nextSubtopic ? nextSubtopic.subtopicTitle : 'End'}
                </span>
                <ChevronRight className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#21262D] transition-colors cursor-pointer text-[#8B949E] hover:text-white ml-2"
                title="Close (Esc)"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* ── 2. Modal Header & Stats Summary (Fixed) ──────────── */}
          <div className="shrink-0 px-6 py-4 border-b border-[#21262D] bg-[#0D1117]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <GitFork className="size-5 text-[#FF7A00] shrink-0" />
                  <h3 className="text-base sm:text-lg font-extrabold text-[#F0F6FC] truncate">
                    {subtopic.subtopicTitle}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] hidden sm:inline">
                    {subtopic.sectionTitle}
                  </span>
                </div>
              </div>

              {/* Progress & Difficulty Pills */}
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                <div className="w-36">
                  <div className="w-full h-1.5 rounded-full bg-[#21262D] overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background:
                          solved === total && total > 0
                            ? 'linear-gradient(90deg, #059669, #34D399)'
                            : 'linear-gradient(90deg, #FF7A00, #FFB347)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8B949E]">
                      <span
                        className={`font-bold ${
                          solved === total && total > 0
                            ? 'text-emerald-400'
                            : 'text-[#FF7A00]'
                        }`}
                      >
                        {solved}
                      </span>
                      /{total}
                    </span>
                    <span className="text-[#484F58]">{pct}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
                  {easy > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#3FB950]/10 border border-[#3FB950]/20 text-[#3FB950]">
                      <span className="size-1 rounded-full bg-[#3FB950]" />
                      {easy}E
                    </span>
                  )}
                  {med > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00]">
                      <span className="size-1 rounded-full bg-[#FF7A00]" />
                      {med}M
                    </span>
                  )}
                  {hard > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#F85149]/10 border border-[#F85149]/20 text-[#F85149]">
                      <span className="size-1 rounded-full bg-[#F85149]" />
                      {hard}H
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Filter Bar & Problem View Switcher ─────────────── */}
            <div className="mt-3.5 flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Filters */}
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[260px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[140px] max-w-[240px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-[#484F58]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter problems..."
                    className="w-full pl-8 pr-3 py-1 rounded-lg bg-[#161B22] border border-[#21262D] text-[11px] text-[#F0F6FC] font-mono placeholder-[#484F58] focus:outline-none focus:border-[#FF7A00]/50 transition-colors"
                  />
                </div>

                {/* Diff filter */}
                <div className="flex items-center gap-0.5 bg-[#161B22] rounded-lg border border-[#21262D] p-0.5">
                  {['all', 'Easy', 'Medium', 'Hard'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setDiffFilter(f)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all cursor-pointer ${
                        diffFilter === f
                          ? f === 'all'
                            ? 'bg-[#21262D] text-white'
                            : 'text-black'
                          : 'text-[#8B949E] hover:text-white'
                      }`}
                      style={
                        diffFilter === f && f !== 'all'
                          ? { background: DIFF[f]?.dot }
                          : {}
                      }
                    >
                      {f === 'all' ? 'All' : f[0]}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-0.5 bg-[#161B22] rounded-lg border border-[#21262D] p-0.5">
                  {[
                    { k: 'all', l: 'All' },
                    { k: 'solved', l: '✓' },
                    { k: 'unsolved', l: '○' },
                  ].map(({ k, l }) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setStatusFilter(k)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all cursor-pointer ${
                        statusFilter === k
                          ? 'bg-[#21262D] text-white'
                          : 'text-[#8B949E] hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Star toggle */}
                <button
                  type="button"
                  onClick={() => setStarOnly(!starOnly)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    starOnly
                      ? 'bg-[#FF7A00]/15 border-[#FF7A00] text-[#FF7A00]'
                      : 'bg-[#161B22] border-[#21262D] text-[#484F58] hover:text-[#8B949E]'
                  }`}
                  title="Filter must-do questions"
                >
                  <Star className={`size-3 ${starOnly ? 'fill-[#FF7A00]' : ''}`} />
                </button>
              </div>

              {/* Right: Problem View Mode Switcher (Tree / Grid / Ladder) */}
              <div className="flex items-center gap-0.5 bg-[#161B22] p-1 rounded-xl border border-[#21262D] shrink-0">
                <button
                  type="button"
                  onClick={() => setProblemViewMode('ladder')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    problemViewMode === 'ladder'
                      ? 'bg-[#FF7A00] text-black shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                  title="Structured problem table with difficulty and links"
                >
                  <ListOrdered className="size-3.5" />
                  <span>Ladder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProblemViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    problemViewMode === 'grid'
                      ? 'bg-[#FF7A00] text-black shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                  title="Compact problem card matrix"
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProblemViewMode('tree')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    problemViewMode === 'tree'
                      ? 'bg-[#FF7A00] text-black shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}
                  title="Hierarchical problem progression tree (Tiers & Invariants)"
                >
                  <Network className="size-3.5" />
                  <span>Tree</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── 3. INDEPENDENT SCROLLABLE MODAL BODY ──────────────── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
            {problems.length === 0 && (
              <div className="text-center py-20 text-[#484F58] text-xs font-mono">
                No problems match your current filters.
              </div>
            )}

            {/* ── VIEW A: LADDER / TABLE VIEW ────────────────────── */}
            {problemViewMode === 'ladder' && problems.length > 0 && (
              <div className="rounded-xl border border-[#21262D] overflow-hidden">
                <div
                  className="sticky top-0 z-10 bg-[#161B22] border-b border-[#21262D] px-4 py-2 grid gap-2 text-[9px] font-mono font-bold uppercase tracking-wider text-[#484F58]"
                  style={{ gridTemplateColumns: '28px 1fr 64px 58px 70px' }}
                >
                  <span></span>
                  <span>Problem</span>
                  <span className="text-center">Diff</span>
                  <span className="text-center">Links</span>
                  <span className="text-center">Status</span>
                </div>

                {problems.map((prob, i) => {
                  const isSolved = isProblemSolved(prob.slug);
                  const d = diffOf(prob.difficulty);

                  return (
                    <div
                      key={prob.id || prob.slug || i}
                      className={`group grid gap-2 px-4 py-2.5 border-b border-[#161B22] transition-colors items-center
                        hover:bg-[#161B22]/80 ${isSolved ? 'bg-emerald-950/5' : ''}`}
                      style={{
                        gridTemplateColumns: '28px 1fr 64px 58px 70px',
                      }}
                    >
                      {/* Checkbox */}
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleSolved(prob.slug)}
                          className="cursor-pointer hover:scale-110 transition-transform"
                          title={isSolved ? 'Mark unsolved' : 'Mark solved'}
                        >
                          {isSolved ? (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          ) : (
                            <Circle className="size-4 text-[#30363D] hover:text-[#8B949E] transition-colors" />
                          )}
                        </button>
                      </div>

                      {/* Title & Badges */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        {prob.important && (
                          <Star className="size-3 text-[#FF7A00] fill-[#FF7A00] shrink-0" />
                        )}
                        <a
                          href={safeUrl(prob.url)}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-xs font-semibold truncate transition-colors hover:underline ${
                            isSolved
                              ? 'text-emerald-300/60 line-through decoration-emerald-500/30'
                              : 'text-[#F0F6FC] group-hover:text-[#FF7A00]'
                          }`}
                        >
                          {prob.title}
                        </a>
                      </div>

                      {/* Difficulty */}
                      <div className="flex items-center justify-center">
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border"
                          style={{
                            color: d.text,
                            background: d.bg,
                            borderColor: d.border,
                          }}
                        >
                          {prob.difficulty}
                        </span>
                      </div>

                      {/* Links */}
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={safeUrl(prob.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#484F58] hover:text-[#FF7A00] transition-colors"
                          title="Open on LeetCode"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </a>

                        {prob.videoUrl && (
                          <a
                            href={safeUrl(prob.videoUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#484F58] hover:text-red-400 transition-colors"
                            title="Video walkthrough"
                          >
                            <Play className="size-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-center">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isSolved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-[#21262D] text-[#8B949E]'
                          }`}
                        >
                          {isSolved ? 'Solved' : 'Todo'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── VIEW B: GRID / CARDS VIEW ──────────────────────── */}
            {problemViewMode === 'grid' && problems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {problems.map((prob, i) => {
                  const isSolved = isProblemSolved(prob.slug);
                  const d = diffOf(prob.difficulty);

                  return (
                    <div
                      key={prob.id || prob.slug || i}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-150
                        ${isSolved
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : 'bg-[#161B22]/80 border-[#21262D] hover:border-[#FF7A00]/40 hover:bg-[#161B22]'
                        }`}
                    >
                      {/* Card Top: Number, Star, Diff, Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-[#8B949E]">
                            #{i + 1}
                          </span>
                          {prob.important && (
                            <Star className="size-3 text-[#FF7A00] fill-[#FF7A00]" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border"
                            style={{
                              color: d.text,
                              background: d.bg,
                              borderColor: d.border,
                            }}
                          >
                            {prob.difficulty}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isSolved
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-[#21262D] text-[#8B949E]'
                            }`}
                          >
                            {isSolved ? '✓' : '○'}
                          </span>
                        </div>
                      </div>

                      {/* Card Middle: Title */}
                      <a
                        href={safeUrl(prob.url)}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-xs font-bold leading-snug hover:underline line-clamp-2 ${
                          isSolved
                            ? 'text-emerald-300/80 line-through decoration-emerald-500/30'
                            : 'text-[#F0F6FC] hover:text-[#FF7A00]'
                        }`}
                      >
                        {prob.title}
                      </a>

                      {/* Card Bottom: Quick Toggle + Links */}
                      <div className="pt-2 border-t border-[#21262D]/60 flex items-center justify-between text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => toggleSolved(prob.slug)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                            isSolved
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]'
                          }`}
                        >
                          {isSolved ? (
                            <>
                              <CheckCircle2 className="size-3.5" />
                              <span>Solved</span>
                            </>
                          ) : (
                            <>
                              <Circle className="size-3.5" />
                              <span>Mark Solved</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2">

                          {prob.videoUrl && (
                            <a
                              href={safeUrl(prob.videoUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#484F58] hover:text-red-400 transition-colors"
                              title="Video walkthrough"
                            >
                              <Play className="size-3.5" />
                            </a>
                          )}
                          <a
                            href={safeUrl(prob.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#484F58] hover:text-[#FF7A00] transition-colors"
                            title="Open on LeetCode"
                          >
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── VIEW C: TREE / PROGRESSION TIERS VIEW ───────────── */}
            {problemViewMode === 'tree' && problems.length > 0 && (
              <div className="space-y-4">
                {problemTiers.map((tier, tIdx) => {
                  const tierTotal = tier.problems.length;
                  const tierSolved = tier.problems.filter((p) =>
                    isProblemSolved(p.slug)
                  ).length;
                  const isTierComplete =
                    tierSolved === tierTotal && tierTotal > 0;

                  return (
                    <div key={tier.tierNum} className="space-y-3">
                      {/* Tier Milestone Divider */}
                      <div className="flex items-center justify-center gap-3 pt-1">
                        <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#21262D]" />
                        <div
                          className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-2 transition-all ${
                            isTierComplete
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                              : 'bg-[#161B22] border-[#30363D] text-[#C9D1D9]'
                          }`}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              background: isTierComplete ? '#34D399' : tier.color,
                            }}
                          />
                          <span className="uppercase">{tier.title}</span>
                          <span className="text-[#8B949E]">
                            ({tierSolved}/{tierTotal})
                          </span>
                        </div>
                        <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#21262D]" />
                      </div>

                      {/* Tier Problem Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {tier.problems.map((prob, i) => {
                          const isSolved = isProblemSolved(prob.slug);
                          const d = diffOf(prob.difficulty);

                          return (
                            <div
                              key={prob.id || prob.slug || i}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                                isSolved
                                  ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-300'
                                  : 'bg-[#161B22]/90 border-[#21262D] hover:border-[#FF7A00]/40'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => toggleSolved(prob.slug)}
                                  className="cursor-pointer shrink-0 hover:scale-110 transition-transform"
                                >
                                  {isSolved ? (
                                    <CheckCircle2 className="size-4 text-emerald-400" />
                                  ) : (
                                    <Circle className="size-4 text-[#30363D] hover:text-[#8B949E]" />
                                  )}
                                </button>
                                <div className="min-w-0">
                                  <a
                                    href={safeUrl(prob.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`text-xs font-semibold block truncate hover:underline ${
                                      isSolved
                                        ? 'text-emerald-300/80 line-through'
                                        : 'text-[#F0F6FC] hover:text-[#FF7A00]'
                                    }`}
                                  >
                                    {prob.title}
                                  </a>
                                  <span
                                    className="text-[9px] font-mono font-bold"
                                    style={{ color: d.text }}
                                  >
                                    {prob.difficulty}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">

                                <a
                                  href={safeUrl(prob.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#484F58] hover:text-[#FF7A00]"
                                  title="Open LeetCode"
                                >
                                  <ArrowUpRight className="size-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Stem to next tier */}
                      {tIdx < problemTiers.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <div className="w-[2px] h-4 bg-gradient-to-b from-[#30363D] to-[#21262D]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 4. Modal Footer (Fixed) ─────────────────────────── */}
          <div className="shrink-0 px-6 py-3 border-t border-[#21262D] bg-[#0D1117] flex items-center justify-between text-xs font-mono text-[#8B949E]">
            <span>
              Showing {problems.length} of {total} problems
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-white font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-zoom-in { animation: zoom-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
      `}</style>
    </>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT: TopicSubtopicsView (FOCUSED SKILL TREE)
   ═══════════════════════════════════════════════════════════════════ */
export const TopicSubtopicsView = ({
  topicKey,
  topicTitle,
  topicDesc,
  onSwitchToMasterDsa,
}) => {
  const { isProblemSolved, toggleProblemSolvedAction } = useProfileStore();
  const [modalSubtopic, setModalSubtopic] = useState(null);

  /* ── Fetch matching subtopics from Master DSA ─────────────── */
  const matchingSections = useMemo(
    () => getMasterDsaProblemsForTopic(topicKey),
    [topicKey]
  );

  const allSubtopics = useMemo(() => {
    const list = [];
    matchingSections.forEach((sec) => {
      if (sec.problems?.length > 0) {
        list.push({
          id: `${sec.title}__direct`,
          sectionTitle: sec.title,
          subtopicTitle:
            sec.subsections?.length > 0 ? `${sec.title} – Core` : sec.title,
          problems: sec.problems,
        });
      }
      sec.subsections?.forEach((sub) => {
        if (sub.problems?.length > 0) {
          list.push({
            id: `${sec.title}__${sub.title}`,
            sectionTitle: sec.title,
            subtopicTitle: sub.title,
            problems: sub.problems,
          });
        }
      });
    });
    return list;
  }, [matchingSections]);

  const stages = useMemo(
    () => partitionIntoStages(allSubtopics),
    [allSubtopics]
  );

  const totalProblems = useMemo(
    () => allSubtopics.reduce((a, s) => a + s.problems.length, 0),
    [allSubtopics]
  );

  const solvedCount = useMemo(() => {
    let count = 0;
    allSubtopics.forEach((s) =>
      s.problems.forEach((p) => {
        if (isProblemSolved(p.slug)) count++;
      })
    );
    return count;
  }, [allSubtopics, isProblemSolved]);

  const easyTotal = useMemo(
    () =>
      allSubtopics.reduce(
        (a, s) => a + s.problems.filter((p) => p.difficulty === 'Easy').length,
        0
      ),
    [allSubtopics]
  );
  const medTotal = useMemo(
    () =>
      allSubtopics.reduce(
        (a, s) =>
          a + s.problems.filter((p) => p.difficulty === 'Medium').length,
        0
      ),
    [allSubtopics]
  );
  const hardTotal = useMemo(
    () =>
      allSubtopics.reduce(
        (a, s) => a + s.problems.filter((p) => p.difficulty === 'Hard').length,
        0
      ),
    [allSubtopics]
  );

  if (!matchingSections?.length || totalProblems === 0) return null;

  const pct = Math.round((solvedCount / totalProblems) * 100);
  const isComplete = solvedCount === totalProblems && totalProblems > 0;

  return (
    <div className="space-y-4">
      {/* ── TOPIC HEADER DASHBOARD (FOCUSED & SLEEK) ───────────── */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isComplete
            ? 'bg-gradient-to-r from-emerald-950/30 via-[#0D1117] to-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
            : 'bg-gradient-to-r from-[#161B22]/90 via-[#0D1117] to-[#161B22]/90 border-[#21262D]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Title & Invariant */}
          <div className="space-y-1.5 max-w-xl min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 shrink-0">
                DSA Skill Tree
              </span>
              <span className="text-[11px] font-mono text-[#8B949E] shrink-0">
                {allSubtopics.length} modules • {totalProblems} problems
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#F0F6FC] tracking-tight truncate">
              {topicTitle || 'Topic Roadmap'}
            </h2>
          </div>

          {/* Right: Progress Meter Dial & Difficulty Breakdown */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative size-12">
              <svg viewBox="0 0 36 36" className="size-12 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#21262D"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={isComplete ? '#3FB950' : '#FF7A00'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold font-mono text-white">
                {pct}%
              </span>
            </div>

            <div className="text-left font-mono">
              <div className="text-xs font-bold text-[#F0F6FC]">
                <span
                  className={
                    isComplete ? 'text-emerald-400' : 'text-[#FF7A00]'
                  }
                >
                  {solvedCount}
                </span>
                <span className="text-[#484F58]">/{totalProblems} solved</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] mt-0.5">
                <span className="text-[#3FB950] font-bold">{easyTotal} Easy</span>
                <span className="text-[#484F58]">•</span>
                <span className="text-[#FF7A00] font-bold">{medTotal} Med</span>
                <span className="text-[#484F58]">•</span>
                <span className="text-[#F85149] font-bold">{hardTotal} Hard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VISUAL SKILL TREE (STAGES & CURVED BRANCHES) ───────── */}
      <div className="space-y-1">
        {stages.map((stage, sIdx) => {
          const totalProblemsInStage = stage.subtopics.reduce(
            (acc, s) => acc + s.problems.length,
            0
          );
          const solvedProblemsInStage = stage.subtopics.reduce(
            (acc, s) =>
              acc + s.problems.filter((p) => isProblemSolved(p.slug)).length,
            0
          );
          const isStageComplete =
            solvedProblemsInStage === totalProblemsInStage &&
            totalProblemsInStage > 0;

          return (
            <div key={stage.stageNum} className="space-y-0">
              {/* Stage Milestone Divider */}
              <StageMilestone
                stageNum={stage.stageNum}
                title={stage.title}
                subtitle={stage.subtitle}
                totalProblems={totalProblemsInStage}
                solvedProblems={solvedProblemsInStage}
                isComplete={isStageComplete}
              />

              {/* Curved SVG branch connector */}
              <CurvedBranchConnector
                count={stage.subtopics.length}
                cardWidth={270}
                gap={20}
                height={42}
              />

              {/* Subtopic Cards Row */}
              <div className="flex justify-center gap-5 flex-wrap pt-0.5">
                {stage.subtopics.map((sub, i) => (
                  <SubtopicSkillCard
                    key={sub.id}
                    subtopic={sub}
                    isProblemSolved={isProblemSolved}
                    onOpen={setModalSubtopic}
                    index={i}
                  />
                ))}
              </div>

              {/* Connecting stem between stages */}
              {sIdx < stages.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-[2px] h-6 bg-gradient-to-b from-[#21262D] via-[#FF7A00]/40 to-[#21262D]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <div className="pt-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#161B22] via-[#0D1117] to-[#161B22] border border-[#A371F7]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#A371F7]/10 border border-[#A371F7]/20">
              <BookOpen className="size-4 text-[#A371F7]" />
            </div>
            <div className="text-xs font-mono">
              <span className="text-[#F0F6FC] font-bold block text-xs sm:text-[13px]">
                Full Master DSA Curriculum
              </span>
              <span className="text-[#8B949E] text-[11px]">
                35 topics • 877 problems • SQL & LLD tracks
              </span>
            </div>
          </div>
          {onSwitchToMasterDsa && (
            <button
              type="button"
              onClick={onSwitchToMasterDsa}
              className="px-3.5 py-1.5 rounded-lg bg-[#A371F7] hover:bg-[#8957e5] text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-[#A371F7]/20"
            >
              <span>Open Master DSA</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── CENTERED RECTANGULAR PROBLEM MODAL ────────────────── */}
      {modalSubtopic && (
        <ProblemModal
          subtopic={modalSubtopic}
          allSubtopics={allSubtopics}
          onClose={() => setModalSubtopic(null)}
          onNavigateSubtopic={(newSub) => setModalSubtopic(newSub)}
          isProblemSolved={isProblemSolved}
          toggleSolved={toggleProblemSolvedAction}
        />
      )}
    </div>
  );
};
