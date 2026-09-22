import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore.js';
import { fetchTopicProblems } from '../lib/api.js';
import { 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Search, 
  Loader2, 
  Flame,
  Sparkles,
  Check,
  Circle,
  Layers,
  ArrowUpDown,
  Hash,
  Percent
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'id-asc', label: 'Serial # (Low → High)', short: 'ID Low', icon: Hash },
  { value: 'id-desc', label: 'Serial # (High → Low)', short: 'ID High', icon: Hash },
  { value: 'ac-desc', label: 'Acceptance (High → Low)', short: 'AC High', icon: Percent },
  { value: 'ac-asc', label: 'Acceptance (Low → High)', short: 'AC Low', icon: Percent },
];

/**
 * Helper to sort problem lists based on acceptance rate or serial number (question ID)
 */
function sortProblemList(list, sortBy) {
  if (!list || list.length === 0) return [];
  const copy = [...list];
  if (sortBy === 'ac-desc') {
    return copy.sort((a, b) => (parseFloat(b.acRate) || 0) - (parseFloat(a.acRate) || 0));
  }
  if (sortBy === 'ac-asc') {
    return copy.sort((a, b) => (parseFloat(a.acRate) || 0) - (parseFloat(b.acRate) || 0));
  }
  if (sortBy === 'id-desc') {
    return copy.sort((a, b) => {
      const idA = parseInt(a.questionId || a.frontendQuestionId || 0, 10);
      const idB = parseInt(b.questionId || b.frontendQuestionId || 0, 10);
      return idB - idA;
    });
  }
  // Default to serial number ascending (id-asc)
  return copy.sort((a, b) => {
    const idA = parseInt(a.questionId || a.frontendQuestionId || 0, 10);
    const idB = parseInt(b.questionId || b.frontendQuestionId || 0, 10);
    return idA - idB;
  });
}

/**
 * Split problems into a 3-tier intuition ladder:
 * - Foundation (Easy + high AC rate)
 * - Application (Medium)
 * - Frontier (Hard + low AC rate)
 */
function tierProblems(problems) {
  const foundation = [];
  const application = [];
  const frontier = [];

  for (const p of problems) {
    if (p.difficulty === 'Easy') {
      foundation.push(p);
    } else if (p.difficulty === 'Medium') {
      application.push(p);
    } else {
      frontier.push(p);
    }
  }

  return { foundation, application, frontier };
}

const TIER_CONFIG = {
  foundation: { label: 'Foundation', desc: 'Core invariant & baseline patterns', color: 'text-[#3FB950]', border: 'border-[#3FB950]/30' },
  application: { label: 'Application', desc: 'Contest Q2/Q3 variations', color: 'text-[#FF7A00]', border: 'border-[#FF7A00]/30' },
  frontier: { label: 'Frontier', desc: 'Contest Q3/Q4 edge constraints', color: 'text-red-400', border: 'border-red-800/40' },
};

const CATEGORIES = ['All', 'Techniques', 'Data Structures', 'Algorithms', 'Graphs', 'Math'];

/**
 * Windowed pagination helper: returns at most 7 buttons (including jump ellipses)
 * to guarantee that all pagination controls fit inside a single non-scrollable viewport.
 */
const getPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => ({ type: 'page', pageIndex: i }));
  }

  const items = [];
  // First page always present
  items.push({ type: 'page', pageIndex: 0 });

  if (currentPage <= 3) {
    // Near beginning: 1, 2, 3, 4, 5, ..., totalPages
    for (let i = 1; i <= 4; i++) {
      items.push({ type: 'page', pageIndex: i });
    }
    items.push({ 
      type: 'ellipsis', 
      jumpTo: Math.min(totalPages - 1, currentPage + 5), 
      key: 'ell-r',
      label: 'Jump 5 groups forward'
    });
    items.push({ type: 'page', pageIndex: totalPages - 1 });
  } else if (currentPage >= totalPages - 4) {
    // Near end: 1, ..., totalPages-5, totalPages-4, totalPages-3, totalPages-2, totalPages
    items.push({ 
      type: 'ellipsis', 
      jumpTo: Math.max(0, currentPage - 5), 
      key: 'ell-l',
      label: 'Jump 5 groups backward'
    });
    for (let i = totalPages - 5; i < totalPages; i++) {
      items.push({ type: 'page', pageIndex: i });
    }
  } else {
    // In middle: 1, ..., curr-1, curr, curr+1, ..., totalPages
    items.push({ 
      type: 'ellipsis', 
      jumpTo: Math.max(0, currentPage - 4), 
      key: 'ell-l',
      label: 'Jump 4 groups backward'
    });
    items.push({ type: 'page', pageIndex: currentPage - 1 });
    items.push({ type: 'page', pageIndex: currentPage });
    items.push({ type: 'page', pageIndex: currentPage + 1 });
    items.push({ 
      type: 'ellipsis', 
      jumpTo: Math.min(totalPages - 1, currentPage + 4), 
      key: 'ell-r',
      label: 'Jump 4 groups forward'
    });
    items.push({ type: 'page', pageIndex: totalPages - 1 });
  }

  return items;
};

export const PracticePage = () => {
  const { 
    topicMetrics, 
    contestElo, 
    handle, 
    region, 
    syncLeetCode,
    solvedSlugs,
    solvedByTopic,
    toggleProblemSolvedAction,
    isProblemSolved,
    setSyncModalOpen,
    selectedTopic,
    setSelectedTopic
  } = useProfileStore();

  // Auto-sync if profile has stale 8-topic cache
  useEffect(() => {
    if (handle && (!topicMetrics || Object.keys(topicMetrics).length <= 8)) {
      syncLeetCode(handle, region, true);
    }
  }, [handle, topicMetrics, region, syncLeetCode]);

  const [viewMode, setViewMode] = useState('weakSpots'); // 'weakSpots' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopicKey, setSelectedTopicKey] = useState(selectedTopic || null);

  // Consume and clear the global selectedTopic so it doesn't persist across visits
  useEffect(() => {
    if (selectedTopic) {
      setSelectedTopicKey(selectedTopic);
      if (topicMetrics) {
        const meta = Object.values(topicMetrics).find(
          (t) => (t.catalogKey || t.key) === selectedTopic || t.tagSlug === selectedTopic
        );
        if (meta) {
          if (!meta.isDeficit) {
            setViewMode('all');
          }
          if (selectedCategory !== 'All' && selectedCategory !== meta.category) {
            setSelectedCategory('All');
          }
        }
      }
      setSelectedTopic(null);
    }
  }, [selectedTopic, setSelectedTopic, topicMetrics, selectedCategory]);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemError, setProblemError] = useState(null);
  const [activeDifficultyTab, setActiveDifficultyTab] = useState('All'); // 'All' | 'Easy' | 'Medium' | 'Hard'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unsolved' | 'solved'
  const [sortBy, setSortBy] = useState('id-asc'); // 'id-asc' | 'id-desc' | 'ac-desc' | 'ac-asc'
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close custom sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSortMenuOpen(false);
    };
    if (isSortMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortMenuOpen]);

  const [tierPages, setTierPages] = useState({
    foundation: 0,
    application: 0,
    frontier: 0,
  });

  // Reset pagination when selected topic, status filter, active difficulty, or sort order changes
  useEffect(() => {
    setTierPages({ foundation: 0, application: 0, frontier: 0 });
  }, [selectedTopicKey, statusFilter, activeDifficultyTab, sortBy]);

  // All topics list from metrics
  const allTopics = useMemo(() => {
    if (!topicMetrics) return [];
    return Object.values(topicMetrics);
  }, [topicMetrics]);

  // Weak topics sorted by deficit magnitude (worst deficit first)
  const weakTopics = useMemo(() => {
    return allTopics
      .filter((t) => t.isDeficit)
      .sort((a, b) => (a.deficitDelta || 0) - (b.deficitDelta || 0));
  }, [allTopics]);

  // Filtered topics based on search, category, and viewMode
  const displayedTopics = useMemo(() => {
    const baseList = viewMode === 'weakSpots' ? weakTopics : allTopics;
    return baseList.filter((t) => {
      const matchesSearch = !searchQuery || 
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.key && t.key.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [viewMode, weakTopics, allTopics, searchQuery, selectedCategory]);

  // Auto-select first topic on mount or when displayed list changes
  useEffect(() => {
    if (!selectedTopicKey) {
      if (weakTopics.length > 0) {
        setSelectedTopicKey(weakTopics[0].catalogKey);
      } else if (allTopics.length > 0) {
        setSelectedTopicKey(allTopics[0].catalogKey);
      }
    }
  }, [weakTopics, allTopics, selectedTopicKey]);

  // Fetch all real problems for the topic (enables instant client-side difficulty tab switching)
  useEffect(() => {
    if (!selectedTopicKey) return;

    let cancelled = false;
    setLoadingProblems(true);
    setProblemError(null);

    fetchTopicProblems(selectedTopicKey, null)
      .then((data) => {
        if (cancelled) return;
        setProblems(data.problems || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setProblemError(err.message);
        setProblems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingProblems(false);
      });

    return () => { cancelled = true; };
  }, [selectedTopicKey]);

  const selectedMeta = topicMetrics && selectedTopicKey
    ? Object.values(topicMetrics).find((t) => (t.catalogKey || t.key) === selectedTopicKey || t.tagSlug === selectedTopicKey)
    : null;

  const topicDisplayName = selectedMeta?.label || selectedMeta?.name || (selectedTopicKey ? selectedTopicKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Topic Practice');

  // Filter problems by status filter (All, Unsolved Only, Already Solved)
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const solved = isProblemSolved(p.titleSlug);
      if (statusFilter === 'unsolved') return !solved;
      if (statusFilter === 'solved') return solved;
      return true;
    });
  }, [problems, statusFilter, isProblemSolved]);

  const tiered = useMemo(() => tierProblems(filteredProblems), [filteredProblems]);
  const sortedTiered = useMemo(() => {
    return {
      foundation: sortProblemList(tiered.foundation, sortBy),
      application: sortProblemList(tiered.application, sortBy),
      frontier: sortProblemList(tiered.frontier, sortBy),
    };
  }, [tiered, sortBy]);
  const allTiered = useMemo(() => tierProblems(problems), [problems]);

  // Compute solved counts for the active topic and each difficulty
  const topicTotal = problems.length;
  const topicSolvedCount = useMemo(() => {
    return problems.filter(p => isProblemSolved(p.titleSlug)).length;
  }, [problems, solvedSlugs, isProblemSolved]);
  const topicUnsolvedCount = Math.max(0, topicTotal - topicSolvedCount);
  const topicSolvedPct = topicTotal > 0 ? Math.round((topicSolvedCount / topicTotal) * 100) : 0;
  const liveSelectedSolves = useMemo(() => {
    if (!selectedMeta) return 0;
    if (problems.length > 0) return topicSolvedCount;
    const trackedList = solvedByTopic?.[selectedMeta.catalogKey] || solvedByTopic?.[selectedMeta.key];
    if (trackedList) return trackedList.length;
    return selectedMeta.problemsSolved || 0;
  }, [selectedMeta, topicSolvedCount, problems.length, solvedByTopic]);

  const easyTotal = allTiered.foundation.length;
  const easySolvedCount = allTiered.foundation.filter(p => isProblemSolved(p.titleSlug)).length;

  const mediumTotal = allTiered.application.length;
  const mediumSolvedCount = allTiered.application.filter(p => isProblemSolved(p.titleSlug)).length;

  const hardTotal = allTiered.frontier.length;
  const hardSolvedCount = allTiered.frontier.filter(p => isProblemSolved(p.titleSlug)).length;

  const tiersToRender = useMemo(() => {
    if (activeDifficultyTab === 'Easy') return ['foundation'];
    if (activeDifficultyTab === 'Medium') return ['application'];
    if (activeDifficultyTab === 'Hard') return ['frontier'];
    return ['foundation', 'application', 'frontier'];
  }, [activeDifficultyTab]);

  // Unsynced state
  if (!topicMetrics) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
              <span>Weak Spots & Practice Queue</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F0F6FC]">
              Weak Spots & Practice Queue
            </h1>
          </div>
        </div>
        <div className="p-8 rounded-xl bg-[#0D1117] border border-[#21262D] text-center space-y-3">
          <AlertTriangle className="size-8 text-[#FF7A00] mx-auto" />
          <p className="text-sm text-[#8B949E] font-mono">
            Sync your LeetCode profile first to detect weak spots across all topics.
          </p>
          <p className="text-xs text-[#484F58] font-mono">
            Go to the Dashboard and click "Sync Settings" or use the demo sandbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
            <span>Weak Spots & Practice Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F0F6FC]">
            Weak Spots & Practice Queue
          </h1>
          <p className="text-xs text-[#8B949E] font-mono mt-1">
            Independent topic-level diagnostics evaluated across all {allTopics.length} LeetCode topics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSyncModalOpen(true, 'past')}
            className="px-2.5 py-1 rounded bg-[#161B22] hover:bg-[#21262D] text-[#FF7A00] hover:text-[#FFA040] text-xs font-bold border border-[#FF7A00]/30 font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="size-3.5" />
            <span>Import Past Solved ({solvedSlugs.length})</span>
          </button>

          <span className="px-2.5 py-1 rounded bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-bold border border-[#FF7A00]/30 font-mono flex items-center gap-1.5">
            <Flame className="size-3.5" />
            <span>{weakTopics.length} WEAK {weakTopics.length === 1 ? 'SPOT' : 'SPOTS'}</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-white/5 text-[#8B949E] text-xs font-bold border border-[#21262D] font-mono">
            {allTopics.length} TOPICS TRACKED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TOPIC SELECTOR (4 Cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-4 font-mono">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#FF7A00]" />
              <h3 className="font-bold text-sm text-[#F0F6FC]">Topic Navigator</h3>
            </div>
            <div className="flex items-center rounded-lg bg-[#161B22] border border-[#21262D] p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setViewMode('weakSpots')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'weakSpots' ? 'bg-[#FF7A00] text-black font-bold' : 'text-[#8B949E] hover:text-white'
                }`}
              >
                Deficits ({weakTopics.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'all' ? 'bg-[#FF7A00] text-black font-bold' : 'text-[#8B949E] hover:text-white'
                }`}
              >
                All ({allTopics.length})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#8B949E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. sliding window, two pointers, prefix sum)..."
              className="w-full bg-[#161B22] border border-[#21262D] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F0F6FC] placeholder-[#484F58] focus:border-[#FF7A00]/50 focus:outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40'
                    : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Topic List */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {displayedTopics.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8B949E]">
                No topics matching "{searchQuery}" in {selectedCategory}
              </div>
            ) : (
              displayedTopics.map((t) => {
                const isSelected = selectedTopicKey === t.catalogKey;
                const trackedList = solvedByTopic?.[t.catalogKey] || solvedByTopic?.[t.key];
                const topicSolvesCount = isSelected && problems.length > 0
                  ? topicSolvedCount
                  : (trackedList ? trackedList.length : (t.problemsSolved || 0));

                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setSelectedTopicKey(t.catalogKey);
                      setActiveDifficultyTab('All');
                      setStatusFilter('all');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#161B22] border-[#FF7A00]/60 shadow-lg shadow-[#FF7A00]/5'
                        : 'bg-[#161B22] border-[#21262D] hover:border-[#FF7A00]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[#F0F6FC] font-bold text-xs flex items-center gap-1.5">
                        <span>{t.label}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        t.isUndertrained
                          ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                          : t.isDeficit
                          ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30'
                          : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                      }`}>
                        {t.isUndertrained ? 'UNDERTRAINED' : t.isDeficit ? 'DEFICIT' : 'HEALTHY'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8B949E] mt-1.5 flex items-center justify-between">
                      <span>{topicSolvesCount} LC solves</span>
                      <span>z = <span className={t.zScore < -1 ? 'text-[#F85149] font-bold' : 'text-[#8B949E]'}>{t.zScore}</span></span>
                      <span>Elo <span className="text-[#FF7A00] font-bold">{t.competencyElo}</span></span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Algorithm explainer */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#21262D] space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-[#FF7A00] font-bold text-[11px]">
              <AlertTriangle className="size-3.5" />
              <span>Independent Detection Algorithm</span>
            </div>
            <p className="text-[#8B949E] text-[11px] leading-relaxed">
              Every topic is individually evaluated. Topics more than 1σ below your own average or with &lt; 5 solves are flagged as weak spots.
            </p>
            {contestElo && (
              <p className="text-[#484F58] text-[10px]">
                Contest Elo baseline: <span className="text-white font-semibold">{contestElo}</span>
              </p>
            )}
          </div>

        </div>

        {/* PROBLEM PROGRESSION LADDER (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* Single-Line Topic Dashboard Bar */}
          {selectedMeta && (
            <div className="p-2.5 px-4 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-lg font-mono flex flex-wrap items-center justify-between gap-3">
              
              {/* Left: Topic Identity & Solved Count */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`size-2 rounded-full shrink-0 ${
                  selectedMeta.isDeficit ? 'bg-[#F85149] shadow-sm shadow-red-500/50 animate-pulse' : 'bg-[#3FB950] shadow-sm shadow-emerald-500/50'
                }`} />

                <h2 className="text-sm font-bold text-[#F0F6FC] truncate">
                  {topicDisplayName}
                </h2>

                {selectedMeta.category && (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[10px] text-[#8B949E] shrink-0">
                    {selectedMeta.category}
                  </span>
                )}

                <span className="text-[11px] text-[#8B949E] shrink-0">
                  <strong className="text-emerald-400">{topicSolvedCount}</strong>/{topicTotal} Solved
                </span>
              </div>

              {/* Right: Difficulty Tabs + Solved/Unsolved Status + Sort Icon */}
              <div className="flex items-center gap-2 shrink-0">
                
                {/* Difficulty Tabs */}
                <div className="flex items-center p-0.5 bg-[#161B22] rounded-lg border border-[#21262D] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveDifficultyTab('All')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      activeDifficultyTab === 'All'
                        ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
                        : 'text-[#8B949E] hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDifficultyTab('Easy')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                      activeDifficultyTab === 'Easy'
                        ? 'bg-emerald-500 text-black font-bold shadow-sm'
                        : 'text-[#8B949E] hover:text-emerald-400'
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-[#3FB950] shrink-0" />
                    <span>Easy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDifficultyTab('Medium')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                      activeDifficultyTab === 'Medium'
                        ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
                        : 'text-[#8B949E] hover:text-[#FFA040]'
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-[#FF7A00] shrink-0" />
                    <span>Med</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDifficultyTab('Hard')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                      activeDifficultyTab === 'Hard'
                        ? 'bg-red-500 text-white font-bold shadow-sm'
                        : 'text-[#8B949E] hover:text-red-400'
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-red-400 shrink-0" />
                    <span>Hard</span>
                  </button>
                </div>

                {/* Status Tabs (All / Unsolved / Solved) */}
                <div className="flex items-center p-0.5 bg-[#161B22] rounded-lg border border-[#21262D] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-[#21262D] text-white font-bold shadow-sm'
                        : 'text-[#8B949E] hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('unsolved')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      statusFilter === 'unsolved'
                        ? 'bg-[#FF7A00]/20 text-[#FF7A00] font-bold border border-[#FF7A00]/40'
                        : 'text-[#8B949E] hover:text-white'
                    }`}
                  >
                    Unsolved
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('solved')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'solved'
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                        : 'text-[#8B949E] hover:text-emerald-400'
                    }`}
                  >
                    <Check className="size-3" />
                    <span>Solved</span>
                  </button>
                </div>

                {/* Custom Theme-Styled Sort Dropdown */}
                <div 
                  ref={sortDropdownRef}
                  className="relative shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setIsSortMenuOpen((prev) => !prev)}
                    className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                      isSortMenuOpen || sortBy !== 'id-asc' 
                        ? 'bg-[#FF7A00]/15 border border-[#FF7A00]/60 text-[#FF7A00] shadow-sm shadow-[#FF7A00]/20' 
                        : 'bg-[#161B22] border border-[#21262D] text-[#8B949E] hover:text-white hover:border-[#FF7A00]/40'
                    }`}
                    title="Sort problems"
                    aria-haspopup="true"
                    aria-expanded={isSortMenuOpen}
                  >
                    <ArrowUpDown className="size-3.5" />
                  </button>

                  {/* Dropdown Menu Styled to Cockpit Theme */}
                  {isSortMenuOpen && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#0D1117] border border-[#30363D] shadow-2xl shadow-black/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono"
                      role="menu"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8B949E] border-b border-[#21262D] flex items-center justify-between">
                        <span>Sort Problems</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00]">
                          {SORT_OPTIONS.find(o => o.value === sortBy)?.short || 'ID Low'}
                        </span>
                      </div>
                      
                      <div className="p-1 space-y-0.5">
                        {SORT_OPTIONS.map((opt) => {
                          const isSelected = sortBy === opt.value;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.value);
                                setIsSortMenuOpen(false);
                              }}
                              className={`w-full px-2.5 py-2 rounded-lg text-xs text-left transition-all flex items-center justify-between cursor-pointer group ${
                                isSelected
                                  ? 'bg-[#FF7A00]/15 text-[#FF7A00] font-bold border border-[#FF7A00]/30'
                                  : 'text-[#C9D1D9] hover:bg-[#161B22] hover:text-white border border-transparent'
                              }`}
                              role="menuitem"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`size-3.5 shrink-0 ${isSelected ? 'text-[#FF7A00]' : 'text-[#8B949E] group-hover:text-[#FF7A00]'}`} />
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && (
                                <Check className="size-3.5 text-[#FF7A00] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Loading / Error states */}
          {loadingProblems && (
            <div className="p-8 rounded-xl bg-[#0D1117] border border-[#21262D] flex items-center justify-center gap-3 text-sm text-[#8B949E] font-mono">
              <Loader2 className="size-5 animate-spin text-[#FF7A00]" />
              <span>Loading real problems from catalog...</span>
            </div>
          )}

          {problemError && (
            <div className="p-5 rounded-xl bg-[#0D1117] border border-red-800/40 text-sm text-red-400 font-mono">
              Failed to load problems: {problemError}
            </div>
          )}

          {/* 3-Tier Progression Ladder with Horizontal Group Switching */}
          {!loadingProblems && !problemError && filteredProblems.length > 0 && (
            <div className="space-y-6 font-mono">
              {tiersToRender.map((tierKey) => {
                const config = TIER_CONFIG[tierKey];
                const tierProblemsList = sortedTiered[tierKey] || [];
                if (tierProblemsList.length === 0 && activeDifficultyTab === 'All') return null;

                const ITEMS_PER_PAGE = 6;
                const totalPages = Math.max(1, Math.ceil(tierProblemsList.length / ITEMS_PER_PAGE));
                const currentPage = Math.min(tierPages[tierKey] || 0, totalPages - 1);
                const pageProblems = tierProblemsList.slice(
                  currentPage * ITEMS_PER_PAGE,
                  (currentPage + 1) * ITEMS_PER_PAGE
                );
                const tierSolved = tierProblemsList.filter(p => isProblemSolved(p.titleSlug)).length;

                return (
                  <div key={tierKey} className="space-y-3 p-4 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-lg">
                    
                    {/* Tier Header with solved count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#21262D]">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${
                          config.color === 'text-[#3FB950]' 
                            ? 'bg-[#3FB950]' 
                            : config.color === 'text-[#FF7A00]' 
                            ? 'bg-[#FF7A00]' 
                            : 'bg-red-400'
                        }`} />
                        <span className={`font-bold text-xs ${config.color}`}>{config.label}</span>
                        <span className="text-[#484F58]">•</span>
                        <span className="text-[11px] text-[#8B949E]">{config.desc}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-[#8B949E]">
                          <strong className="text-white">{tierSolved}</strong> / {tierProblemsList.length} Solved
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#161B22] border border-[#21262D] text-[#8B949E]">
                          {tierProblemsList.length} problems
                        </span>
                      </div>
                    </div>

                    {tierProblemsList.length === 0 ? (
                      <div className="p-6 rounded-lg bg-[#161B22] border border-[#21262D] text-center text-xs text-[#8B949E]">
                        {statusFilter === 'solved'
                          ? `No ${config.label} problems solved in this topic yet.`
                          : statusFilter === 'unsolved'
                          ? `All ${config.label} problems in this topic solved! 🎉`
                          : `No ${config.label} problems found for this topic.`}
                      </div>
                    ) : (
                      <>
                        {/* Horizontal Pagination Bar: Strictly non-scrollable, fits in single viewport line */}
                        {totalPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 px-3 bg-[#161B22] rounded-lg border border-[#21262D] text-xs">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#8B949E] shrink-0">
                              <span>Showing</span>
                              <span className="text-[#F0F6FC] font-bold">
                                {currentPage * ITEMS_PER_PAGE + 1}–{Math.min((currentPage + 1) * ITEMS_PER_PAGE, tierProblemsList.length)}
                              </span>
                              <span>of</span>
                              <span className="text-[#F0F6FC] font-bold">{tierProblemsList.length}</span>
                              <span>problems</span>
                            </div>

                            {/* Horizontal Tabs & Arrow Controls */}
                            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 select-none">
                              <button
                                type="button"
                                onClick={() => setTierPages(prev => ({ ...prev, [tierKey]: Math.max(0, currentPage - 1) }))}
                                disabled={currentPage === 0}
                                className="w-[26px] h-[26px] rounded bg-[#090C10] border border-[#21262D] text-[#8B949E] hover:text-white hover:bg-[#21262D] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                title="Previous group of problems"
                              >
                                <ChevronLeft className="size-4" />
                              </button>

                              {/* Numbered Group Tabs & Ellipses (Max 7 buttons, strictly non-scrollable) */}
                              <div className="flex items-center gap-1 shrink-0">
                                {getPaginationItems(currentPage, totalPages).map((item, itemIdx) => {
                                  if (item.type === 'ellipsis') {
                                    return (
                                      <button
                                        key={item.key || `ell-${itemIdx}`}
                                        type="button"
                                        onClick={() => setTierPages(prev => ({ ...prev, [tierKey]: item.jumpTo }))}
                                        className="w-[26px] h-[26px] rounded text-[11px] font-mono text-[#8B949E] hover:text-[#FF7A00] hover:bg-[#21262D] transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                        title={item.label}
                                      >
                                        ...
                                      </button>
                                    );
                                  }

                                  const pageIdx = item.pageIndex;
                                  const isSelected = pageIdx === currentPage;
                                  const startNum = pageIdx * ITEMS_PER_PAGE + 1;
                                  const endNum = Math.min((pageIdx + 1) * ITEMS_PER_PAGE, tierProblemsList.length);

                                  return (
                                    <button
                                      key={pageIdx}
                                      type="button"
                                      onClick={() => setTierPages(prev => ({ ...prev, [tierKey]: pageIdx }))}
                                      className={`w-[26px] h-[26px] rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? 'bg-[#FF7A00] text-black shadow-sm font-extrabold'
                                          : 'bg-[#090C10] border border-[#21262D] text-[#8B949E] hover:text-white hover:border-[#FF7A00]/40'
                                      }`}
                                      title={`Problems ${startNum}–${endNum}`}
                                    >
                                      {pageIdx + 1}
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={() => setTierPages(prev => ({ ...prev, [tierKey]: Math.min(totalPages - 1, currentPage + 1) }))}
                                disabled={currentPage >= totalPages - 1}
                                className="w-[26px] h-[26px] rounded bg-[#090C10] border border-[#21262D] text-[#8B949E] hover:text-white hover:bg-[#21262D] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                title="Next group of problems"
                              >
                                <ChevronRight className="size-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Smaller, Compact Problem Cards (Responsive 3-Column Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                          {pageProblems.map((p) => {
                            const isSolved = isProblemSolved(p.titleSlug);

                            return (
                              <div
                                key={p.questionId || p.titleSlug}
                                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                                  isSolved
                                    ? 'border-emerald-500/40 bg-emerald-950/15 shadow-sm'
                                    : `${config.border} bg-[#161B22] hover:border-[#FF7A00]/50 hover:-translate-y-0.5 shadow-md`
                                }`}
                              >
                                <div>
                                  {/* Header: ID + Difficulty + Status */}
                                  <div className="flex items-center justify-between gap-1 mb-1.5 text-[10px]">
                                    <span className="text-[#8B949E] font-semibold">LC #{p.questionId}</span>
                                    <div className="flex items-center gap-1.5">
                                      {isSolved && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                          <Check className="size-2.5" />
                                          <span>SOLVED</span>
                                        </span>
                                      )}
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                        p.difficulty === 'Easy'
                                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                          : p.difficulty === 'Medium'
                                          ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30'
                                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                                      }`}>
                                        {p.difficulty}
                                      </span>
                                      <span className="text-[10px] text-[#8B949E]">{p.acRate}% AC</span>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <h4 
                                    title={p.title}
                                    className={`font-bold text-xs leading-snug line-clamp-2 mb-2 ${
                                      isSolved ? 'text-white' : 'text-[#F0F6FC]'
                                    }`}
                                  >
                                    {p.title}
                                  </h4>
                                </div>

                                {/* Card Actions */}
                                <div className="mt-2 pt-2 border-t border-[#21262D] flex items-center justify-between text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const derivedTopicSlugs = Array.isArray(p.tags)
                                        ? Array.from(new Set(p.tags.map(tag => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).concat([selectedTopicKey])))
                                        : (p.topicSlugs || [selectedTopicKey]);
                                      toggleProblemSolvedAction(
                                        p.titleSlug, 
                                        selectedTopicKey, 
                                        derivedTopicSlugs, 
                                        p.difficulty
                                      );
                                    }}
                                    className={`flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded text-[10px] ${
                                      isSolved
                                        ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/60 font-bold border border-emerald-800/40'
                                        : 'text-[#8B949E] hover:text-white bg-[#090C10] hover:bg-[#21262D] border border-[#21262D]'
                                    }`}
                                  >
                                    {isSolved ? (
                                      <CheckCircle2 className="size-3 text-emerald-400" />
                                    ) : (
                                      <Circle className="size-3 text-[#484F58]" />
                                    )}
                                    <span>{isSolved ? 'Solved ✓' : 'Mark Solved'}</span>
                                  </button>

                                  <a
                                    href={p.url || `https://leetcode.com/problems/${p.titleSlug}/`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[#FF7A00] hover:text-[#FFA040] font-bold text-[10px] transition-colors"
                                  >
                                    <span>Solve</span>
                                    <ExternalLink className="size-2.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {!loadingProblems && !problemError && filteredProblems.length === 0 && (
            <div className="p-8 rounded-xl bg-[#0D1117] border border-[#21262D] text-center space-y-2 font-mono">
              <p className="text-sm text-[#8B949E]">
                {statusFilter === 'solved'
                  ? `You haven't marked any problems as solved in ${selectedMeta?.label || selectedTopicKey} yet.`
                  : statusFilter === 'unsolved'
                  ? `Congratulations! You've solved all matching problems in ${selectedMeta?.label || selectedTopicKey}!`
                  : `No problems found for topic "${selectedMeta?.label || selectedTopicKey}".`}
              </p>
              {statusFilter === 'solved' && (
                <button
                  type="button"
                  onClick={() => setSyncModalOpen(true, 'past')}
                  className="px-3 py-1.5 rounded bg-[#FF7A00] text-black font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
                >
                  <Sparkles className="size-3.5" />
                  <span>Import Past Solved Problems via Snippet or Cookie</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
