import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, ExternalLink, Flame, AlertTriangle, Loader2, Filter, ChevronDown, Search } from 'lucide-react';
import { useProfileStore } from '../store/useProfileStore';
import { fetchTopicProblems } from '../lib/api';

/**
 * Tiers an array of problems into 3 learning progression buckets:
 * 1. Foundation: Easy problems with highest acceptance rates
 * 2. Application: Medium problems
 * 3. Frontier: Hard problems + challenging mediums
 */
function tierProblems(problems = []) {
  const easy = problems.filter((p) => p.difficulty === 'Easy');
  const medium = problems.filter((p) => p.difficulty === 'Medium');
  const hard = problems.filter((p) => p.difficulty === 'Hard');

  return {
    foundation: easy.slice(0, 4),
    application: medium.slice(0, 4),
    frontier: hard.length > 0 ? hard.slice(0, 3) : medium.slice(4, 7),
  };
}

const TIER_CONFIG = {
  foundation: { label: 'Foundation', desc: 'Core invariant & baseline patterns', color: 'text-[#3FB950]', border: 'border-[#3FB950]/30' },
  application: { label: 'Application', desc: 'Contest Q2/Q3 variations', color: 'text-[#FF7A00]', border: 'border-[#FF7A00]/30' },
  frontier: { label: 'Frontier', desc: 'Contest Q3/Q4 edge constraints', color: 'text-red-400', border: 'border-red-800/40' },
};

const CATEGORIES = ['All', 'Techniques', 'Data Structures', 'Algorithms', 'Graphs', 'Math'];

export const PracticePage = () => {
  const { topicMetrics, contestElo, recentSubmissions, handle, region, syncLeetCode } = useProfileStore();

  // Auto-sync if profile has stale 8-topic cache
  useEffect(() => {
    if (handle && (!topicMetrics || Object.keys(topicMetrics).length <= 8)) {
      syncLeetCode(handle, region, true);
    }
  }, [handle, topicMetrics, region, syncLeetCode]);

  const [viewMode, setViewMode] = useState('weakSpots'); // 'weakSpots' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopicKey, setSelectedTopicKey] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemError, setProblemError] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [solvedSet, setSolvedSet] = useState(() => {
    try {
      const saved = localStorage.getItem('lc_learn_solved');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

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

  // Fetch real problems when selected topic or difficulty filter changes
  useEffect(() => {
    if (!selectedTopicKey) return;

    let cancelled = false;
    setLoadingProblems(true);
    setProblemError(null);

    fetchTopicProblems(selectedTopicKey, difficultyFilter !== 'All' ? difficultyFilter : null)
      .then((data) => {
        if (cancelled) return;
        const recentSlugs = new Set((recentSubmissions || []).map((s) => s.titleSlug));
        const filtered = (data.problems || []).filter((p) => !recentSlugs.has(p.titleSlug));
        setProblems(filtered);
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
  }, [selectedTopicKey, difficultyFilter, recentSubmissions]);

  // Solved toggle
  const toggleSolved = (titleSlug) => {
    setSolvedSet((prev) => {
      const next = new Set(prev);
      if (next.has(titleSlug)) {
        next.delete(titleSlug);
      } else {
        next.add(titleSlug);
      }
      try {
        localStorage.setItem('lc_learn_solved', JSON.stringify([...next]));
      } catch { /* ignore */ }
      return next;
    });
  };

  const selectedMeta = topicMetrics && selectedTopicKey
    ? Object.values(topicMetrics).find((t) => t.catalogKey === selectedTopicKey)
    : null;

  const tiered = useMemo(() => tierProblems(problems), [problems]);

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

        <div className="flex items-center gap-2">
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
              displayedTopics.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setSelectedTopicKey(t.catalogKey);
                    setDifficultyFilter('All');
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedTopicKey === t.catalogKey
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
                    <span>{t.problemsSolved} solved</span>
                    <span>z = <span className={t.zScore < -1 ? 'text-[#F85149] font-bold' : 'text-[#8B949E]'}>{t.zScore}</span></span>
                    <span>Elo <span className="text-[#FF7A00] font-bold">{t.competencyElo}</span></span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Algorithm explainer */}
          <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#21262D] space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-[#FF7A00] font-bold text-[11px]">
              <AlertTriangle className="size-3.5" />
              <span>Independent Detection Algorithm</span>
            </div>
            <p className="text-[#8B949E] text-[11px] leading-relaxed">
              Every topic (e.g. Sliding Window, Two Pointers, Prefix Sum, Linked List) is individually evaluated.
              Topics more than 1σ below your own average or with &lt; 5 solves are flagged.
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

          {/* Selected topic banner */}
          {selectedMeta && (
            <div className="p-4 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-xl font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`size-2.5 rounded-full shrink-0 ${
                    selectedMeta.isDeficit ? 'bg-[#F85149] animate-pulse' : 'bg-[#3FB950]'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[#F0F6FC] font-bold text-sm">{selectedMeta.label} — Practice Ladder</h2>
                      {selectedMeta.category && (
                        <span className="px-1.5 py-0.2 rounded bg-[#161B22] border border-[#21262D] text-[10px] text-[#8B949E]">
                          {selectedMeta.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8B949E] mt-0.5">
                      {selectedMeta.problemsSolved} solved • z-score: {selectedMeta.zScore} • Topic Elo: {selectedMeta.competencyElo} ({selectedMeta.deficitDelta > 0 ? '+' : ''}{selectedMeta.deficitDelta} vs baseline)
                    </p>
                  </div>
                </div>

                {/* Difficulty filter */}
                <div className="relative">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="appearance-none bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-1.5 pr-7 text-xs text-[#F0F6FC] font-mono cursor-pointer focus:border-[#FF7A00]/50 focus:outline-none"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-[#8B949E] pointer-events-none" />
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

          {/* 3-Tier Progression Ladder */}
          {!loadingProblems && !problemError && problems.length > 0 && (
            <div className="space-y-6">
              {Object.entries(TIER_CONFIG).map(([tierKey, config]) => {
                const tierProblemsList = tiered[tierKey] || [];
                if (tierProblemsList.length === 0) return null;

                return (
                  <div key={tierKey} className="space-y-3 font-mono">
                    
                    {/* Tier Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${config.color}`}>{config.label}</span>
                        <span className="text-[#484F58]">•</span>
                        <span className="text-[11px] text-[#8B949E]">{config.desc}</span>
                      </div>
                      <span className="text-[10px] text-[#484F58]">
                        {tierProblemsList.filter((p) => solvedSet.has(p.titleSlug)).length} / {tierProblemsList.length} Solved
                      </span>
                    </div>

                    {/* Problem Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tierProblemsList.map((p) => {
                        const isSolved = solvedSet.has(p.titleSlug);

                        return (
                          <div
                            key={p.questionId}
                            className={`p-4 rounded-xl bg-[#0D1117] border transition-all flex flex-col justify-between ${
                              isSolved
                                ? 'border-[#3FB950]/40 bg-[#3FB950]/5'
                                : `${config.border} hover:border-[#FF7A00]/50 hover:-translate-y-0.5 shadow-xl`
                            }`}
                          >
                            <div>
                              {/* Header: ID + Difficulty + Acceptance Rate */}
                              <div className="flex items-center justify-between mb-2 text-[11px]">
                                <span className="text-[#8B949E]">LC #{p.questionId}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                              <h4 className="font-bold text-sm text-[#F0F6FC] leading-snug mb-2">
                                {p.title}
                              </h4>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 pt-2.5 border-t border-[#21262D] flex items-center justify-between text-xs">
                              <button
                                type="button"
                                onClick={() => toggleSolved(p.titleSlug)}
                                className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                                  isSolved
                                    ? 'text-[#3FB950] font-bold'
                                    : 'text-[#8B949E] hover:text-[#F0F6FC]'
                                }`}
                              >
                                <CheckCircle2 className={`size-3.5 ${isSolved ? 'text-[#3FB950]' : 'text-[#484F58]'}`} />
                                <span className="text-[11px]">{isSolved ? 'Solved' : 'Mark Solved'}</span>
                              </button>

                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[#FF7A00] hover:text-[#FFA040] font-bold text-[11px] transition-colors"
                              >
                                <span>Solve on LC</span>
                                <ExternalLink className="size-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {!loadingProblems && !problemError && problems.length === 0 && (
            <div className="p-8 rounded-xl bg-[#0D1117] border border-[#21262D] text-center space-y-2 font-mono">
              <p className="text-sm text-[#8B949E]">
                No problems found for topic "{selectedMeta?.label || selectedTopicKey}" with difficulty "{difficultyFilter}".
              </p>
              <p className="text-xs text-[#484F58]">
                Try switching the difficulty filter to "All".
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
