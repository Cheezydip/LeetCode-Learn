import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Compass,
  Search,
  Flame,
  Target,
  Sparkles,
  Code2,
  Database,
  Wrench,
  Share2,
  Sigma
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_ORDER = ['Algorithms', 'Data Structures', 'Techniques', 'Graphs', 'Math'];

const CATEGORY_META = {
  'Algorithms':       { icon: Code2,    color: '#58A6FF', bgClass: 'bg-[#58A6FF]/10', borderClass: 'border-[#58A6FF]/30' },
  'Data Structures':  { icon: Database, color: '#F778BA', bgClass: 'bg-[#F778BA]/10', borderClass: 'border-[#F778BA]/30' },
  'Techniques':       { icon: Wrench,   color: '#FF7A00', bgClass: 'bg-[#FF7A00]/10', borderClass: 'border-[#FF7A00]/30' },
  'Graphs':           { icon: Share2,   color: '#3FB950', bgClass: 'bg-[#3FB950]/10', borderClass: 'border-[#3FB950]/30' },
  'Math':             { icon: Sigma,    color: '#D2A8FF', bgClass: 'bg-[#D2A8FF]/10', borderClass: 'border-[#D2A8FF]/30' },
};

const SORT_OPTIONS = [
  { value: 'deficit', label: 'Deficit Severity' },
  { value: 'elo-asc', label: 'Competency Elo (Low → High)' },
  { value: 'elo-desc', label: 'Competency Elo (High → Low)' },
  { value: 'solved-desc', label: 'Solve Count (High → Low)' },
  { value: 'solved-asc', label: 'Solve Count (Low → High)' },
  { value: 'alpha', label: 'Alphabetical' },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export const RadarPage = () => {
  const navigate = useNavigate();
  const {
    topicMetrics,
    setSelectedTopic,
    contestElo,
    handle,
    region,
    syncLeetCode,
    solvedSlugs,
    setSyncModalOpen
  } = useProfileStore();

  // Auto-sync if profile has stale 8-topic cache
  useEffect(() => {
    if (handle && (!topicMetrics || Object.keys(topicMetrics).length <= 8)) {
      syncLeetCode(handle, region, true);
    }
  }, [handle, topicMetrics, region, syncLeetCode]);

  const [activeCategory, setActiveCategory] = useState(null); // null = All
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicKey, setSelectedTopicKey] = useState(null);
  const [sortBy, setSortBy] = useState('deficit');
  const [chartView, setChartView] = useState('category'); // 'category' | 'deficits' | 'bars'

  // ── Derived Data ──────────────────────────────────────────────────────────────
  const allTopics = useMemo(() => {
    if (!topicMetrics) return [];
    return Object.values(topicMetrics);
  }, [topicMetrics]);

  // ── Category Aggregates ───────────────────────────────────────────────────────
  const categoryAggregates = useMemo(() => {
    if (!allTopics.length) return [];

    const groups = {};
    for (const cat of CATEGORY_ORDER) {
      groups[cat] = { topics: [], totalSolved: 0, eloSum: 0, deficits: 0 };
    }

    for (const t of allTopics) {
      const cat = t.category || 'General';
      if (!groups[cat]) {
        // Put uncategorized topics in a "General" bucket — won't appear on radar
        continue;
      }
      groups[cat].topics.push(t);
      groups[cat].totalSolved += t.problemsSolved || 0;
      groups[cat].eloSum += t.competencyElo || 0;
      if (t.isDeficit) groups[cat].deficits += 1;
    }

    const base = contestElo || 1500;

    return CATEGORY_ORDER.map((cat) => {
      const g = groups[cat];
      const topicCount = g.topics.length || 1;
      const avgElo = Math.round(g.eloSum / topicCount);
      const healthPct = Math.round(((topicCount - g.deficits) / topicCount) * 100);
      // Normalized score 20–100 for radar radius
      const score = Math.max(20, Math.min(100, Math.round((avgElo / (base * 1.15)) * 100)));
      const meta = CATEGORY_META[cat] || CATEGORY_META['Techniques'];

      return {
        category: cat,
        topicCount,
        totalSolved: g.totalSolved,
        avgElo,
        deficitCount: g.deficits,
        healthPct,
        score,
        ...meta,
      };
    });
  }, [allTopics, contestElo]);

  // ── Radar Geometry (5-axis pentagon) ──────────────────────────────────────────
  const radarData = useMemo(() => {
    if (categoryAggregates.length !== 5) return { vertices: [], polygon: '', rings: [] };

    const n = 5;
    const centerX = 150;
    const centerY = 140;
    const maxRadius = 95;

    const vertices = categoryAggregates.map((cat, idx) => {
      const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
      const r = (cat.score / 100) * maxRadius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      // Label positioning
      const labelRadius = maxRadius + 28;
      const textX = centerX + labelRadius * Math.cos(angle);
      const textY = centerY + labelRadius * Math.sin(angle) + 4;

      let anchor = 'middle';
      if (Math.cos(angle) > 0.3) anchor = 'start';
      else if (Math.cos(angle) < -0.3) anchor = 'end';

      // Outer ring vertex (100%)
      const outerX = centerX + maxRadius * Math.cos(angle);
      const outerY = centerY + maxRadius * Math.sin(angle);

      return { ...cat, x, y, textX, textY, anchor, angle, outerX, outerY };
    });

    const polygon = vertices.map((v) => `${v.x},${v.y}`).join(' ');

    // Concentric rings at 33%, 66%, 100%
    const rings = [0.33, 0.66, 1.0].map((scale) => {
      return vertices
        .map((_, idx) => {
          const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
          const r = maxRadius * scale;
          return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
        })
        .join(' ');
    });

    return { vertices, polygon, rings, centerX, centerY, maxRadius };
  }, [categoryAggregates]);

  // ── Deficit Focus Radar (top 8 weakest topics) ────────────────────────────────
  const deficitRadarData = useMemo(() => {
    if (!allTopics.length) return { vertices: [], polygon: '', rings: [] };
    const base = contestElo || 1500;
    const pool = [...allTopics]
      .sort((a, b) => (a.deficitDelta || 0) - (b.deficitDelta || 0))
      .slice(0, 8);
    if (pool.length < 3) return { vertices: [], polygon: '', rings: [] };

    const n = pool.length;
    const centerX = 150;
    const centerY = 140;
    const maxRadius = 95;

    const vertices = pool.map((t, idx) => {
      const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
      const score = Math.max(20, Math.min(100, Math.round((t.competencyElo / (base * 1.15)) * 100)));
      const r = (score / 100) * maxRadius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      const labelRadius = maxRadius + 22;
      const textX = centerX + labelRadius * Math.cos(angle);
      const textY = centerY + labelRadius * Math.sin(angle) + 4;
      let anchor = 'middle';
      if (Math.cos(angle) > 0.3) anchor = 'start';
      else if (Math.cos(angle) < -0.3) anchor = 'end';
      const outerX = centerX + maxRadius * Math.cos(angle);
      const outerY = centerY + maxRadius * Math.sin(angle);
      return { ...t, score, x, y, textX, textY, anchor, angle, outerX, outerY };
    });

    const polygon = vertices.map((v) => `${v.x},${v.y}`).join(' ');
    const rings = [0.33, 0.66, 1.0].map((scale) => {
      return vertices
        .map((_, idx) => {
          const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
          const r = maxRadius * scale;
          return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
        })
        .join(' ');
    });
    return { vertices, polygon, rings, centerX, centerY, maxRadius };
  }, [allTopics, contestElo]);

  // ── Sub-topic bar chart data (for active category or all) ────────────────────────────
  const subTopicBars = useMemo(() => {
    const base = contestElo || 1500;
    const catTopics = activeCategory
      ? allTopics.filter((t) => t.category === activeCategory)
      : allTopics;
    const sorted = [...catTopics].sort((a, b) => {
      if (a.isDeficit && !b.isDeficit) return -1;
      if (!a.isDeficit && b.isDeficit) return 1;
      return (a.competencyElo || 0) - (b.competencyElo || 0);
    });
    const maxElo = Math.max(base * 1.15, ...sorted.map((t) => t.competencyElo || 0));
    return sorted.map((t) => ({
      ...t,
      barPct: Math.max(5, Math.round(((t.competencyElo || 0) / maxElo) * 100)),
    }));
  }, [allTopics, activeCategory, contestElo]);

  // ── Overall Balance Score ─────────────────────────────────────────────────────
  const overallBalance = useMemo(() => {
    if (!categoryAggregates.length) return 0;
    const avg = categoryAggregates.reduce((sum, c) => sum + c.healthPct, 0) / categoryAggregates.length;
    return Math.round(avg);
  }, [categoryAggregates]);

  // ── Selected topic details ────────────────────────────────────────────────────
  const currentTopic = useMemo(() => {
    if (!allTopics.length) return null;
    if (selectedTopicKey) {
      const found = allTopics.find((t) => t.key === selectedTopicKey || t.catalogKey === selectedTopicKey);
      if (found) return found;
    }
    return null;
  }, [allTopics, selectedTopicKey]);

  // ── Filtered & sorted topic list ──────────────────────────────────────────────
  const filteredTopics = useMemo(() => {
    let list = allTopics.filter((t) => {
      const matchesSearch = !searchQuery ||
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.key.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (sortBy) {
      case 'deficit':
        list = [...list].sort((a, b) => {
          // Deficits first, then by deficit delta (most negative first)
          if (a.isDeficit && !b.isDeficit) return -1;
          if (!a.isDeficit && b.isDeficit) return 1;
          return (a.deficitDelta || 0) - (b.deficitDelta || 0);
        });
        break;
      case 'elo-asc':
        list = [...list].sort((a, b) => (a.competencyElo || 0) - (b.competencyElo || 0));
        break;
      case 'elo-desc':
        list = [...list].sort((a, b) => (b.competencyElo || 0) - (a.competencyElo || 0));
        break;
      case 'solved-desc':
        list = [...list].sort((a, b) => (b.problemsSolved || 0) - (a.problemsSolved || 0));
        break;
      case 'solved-asc':
        list = [...list].sort((a, b) => (a.problemsSolved || 0) - (b.problemsSolved || 0));
        break;
      case 'alpha':
        list = [...list].sort((a, b) => a.label.localeCompare(b.label));
        break;
      default:
        break;
    }

    return list;
  }, [allTopics, searchQuery, activeCategory, sortBy]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handlePracticeTopic = (topicKey) => {
    setSelectedTopic(topicKey);
    navigate('/practice');
  };

  const handleJumpToPath = (topicKey) => {
    setSelectedTopic(topicKey);
    navigate(`/paths/${topicKey}`);
  };

  const handleCategoryClick = (cat) => {
    const nextCat = activeCategory === cat ? null : cat;
    setActiveCategory(nextCat);
    setChartView('bars');
  };

  const handleTopicSelect = (topicKey) => {
    setSelectedTopicKey(topicKey);
    setChartView('topic');
  };

  // ── Unsynced State ────────────────────────────────────────────────────────────
  if (!topicMetrics) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
              <span>Topic Analysis & Competency Matrix</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F0F6FC]">
              Topic Competency Overview
            </h1>
          </div>
        </div>
        <div className="p-8 rounded-xl bg-[#0D1117] border border-[#21262D] text-center space-y-3 font-mono">
          <AlertTriangle className="size-8 text-[#FF7A00] mx-auto" />
          <p className="text-sm text-[#8B949E]">
            Sync your LeetCode profile to view competency ratings across all topics.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-[#FF7A00] text-black font-bold text-xs hover:bg-[#FFA040] transition-colors cursor-pointer"
          >
            Go to Dashboard to Sync
          </button>
        </div>
      </div>
    );
  }

  const totalDeficits = allTopics.filter((t) => t.isDeficit).length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-200">

      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
            <span>5-Axis Category Analysis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F0F6FC]">
            Topic Competency Overview
          </h1>
          <p className="text-xs text-[#8B949E] font-mono mt-1">
            Aggregate competency across {allTopics.length} topics, grouped into 5 core algorithmic disciplines.
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
            <Target className="size-3.5" />
            <span>{allTopics.length} TOPICS TRACKED</span>
          </span>
          {totalDeficits > 0 && (
            <span className="px-2.5 py-1 rounded bg-red-950/40 text-red-400 text-xs font-bold border border-red-800/30 font-mono flex items-center gap-1.5">
              <Flame className="size-3.5" />
              <span>{totalDeficits} DEFICITS</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Radar + Topic List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Radar + Category Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-5">

          {/* Radar Chart Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#21262D] gap-2">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-[#FF7A00]" />
                <div>
                  <h3 className="font-bold text-sm text-[#F0F6FC] font-mono">
                    {chartView === 'category'
                      ? 'Category Competency Radar'
                      : chartView === 'deficits'
                      ? 'Deficit Focus Radar'
                      : chartView === 'bars'
                      ? `${activeCategory || 'All'} — Sub-Topics Breakdown`
                      : `${currentTopic?.label || 'Topic'} — Deep-Dive Chart`}
                  </h3>
                  <p className="text-[10px] text-[#8B949E] font-mono">
                    {chartView === 'category'
                      ? '5 core algorithmic disciplines • Click any axis to view sub-topics'
                      : chartView === 'deficits'
                      ? 'Top 8 weakest topics by deficit delta • Click to inspect'
                      : chartView === 'bars'
                      ? `${subTopicBars.length} sub-topics • Click any sub-topic to open deep-dive chart`
                      : `Topic competency rating vs ${contestElo || 1500} contest Elo baseline`}
                  </p>
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center p-0.5 bg-[#161B22] rounded-lg border border-[#21262D] text-[10px] font-mono shrink-0">
                <button
                  type="button"
                  onClick={() => setChartView('category')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    chartView === 'category'
                      ? 'bg-[#FF7A00] text-black font-bold'
                      : 'text-[#8B949E] hover:text-white'
                  }`}
                  title="5-Axis Category Radar"
                >
                  <Target className="size-3" />
                  <span>Categories</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('deficits')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    chartView === 'deficits'
                      ? 'bg-[#FF7A00] text-black font-bold'
                      : 'text-[#8B949E] hover:text-white'
                  }`}
                  title="Top 8 Deficit Topics Radar"
                >
                  <Flame className="size-3" />
                  <span>Deficits</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setChartView('bars'); if (!activeCategory) setActiveCategory('Algorithms'); }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    chartView === 'bars'
                      ? 'bg-[#FF7A00] text-black font-bold'
                      : 'text-[#8B949E] hover:text-white'
                  }`}
                  title="Sub-Topics Bar Chart"
                >
                  <BarChart3 className="size-3" />
                  <span>Sub-Topics</span>
                </button>
                {currentTopic && (
                  <button
                    type="button"
                    onClick={() => setChartView('topic')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                      chartView === 'topic'
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'text-[#8B949E] hover:text-white'
                    }`}
                    title={`Deep-dive chart for ${currentTopic.label}`}
                  >
                    <Sparkles className="size-3" />
                    <span className="max-w-[75px] truncate">{currentTopic.label}</span>
                  </button>
                )}
              </div>
            </div>

            {/* ─── CATEGORY RADAR (5-axis pentagon) ─── */}
            {chartView === 'category' && (
              <div className="relative w-full flex items-center justify-center select-none py-2" style={{ height: '320px' }}>
                <svg className="w-full h-full max-w-md" viewBox="0 0 300 280">
                  {radarData.rings.map((ringPoints, i) => (
                    <polygon
                      key={`ring-${i}`}
                      points={ringPoints}
                      fill="none"
                      stroke="#21262D"
                      strokeWidth="1"
                      strokeDasharray={i < 2 ? '3,3' : ''}
                    />
                  ))}
                  {radarData.vertices.map((v) => (
                    <line
                      key={`spoke-${v.category}`}
                      x1={radarData.centerX}
                      y1={radarData.centerY}
                      x2={v.outerX}
                      y2={v.outerY}
                      stroke="#21262D"
                      strokeWidth="1"
                    />
                  ))}
                  {radarData.polygon && (
                    <polygon
                      points={radarData.polygon}
                      fill="rgba(255, 122, 0, 0.12)"
                      stroke="#FF7A00"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      className="transition-all duration-500"
                    />
                  )}
                  {radarData.vertices.map((v) => {
                    const isActive = activeCategory === v.category;
                    const hasDeficits = v.deficitCount > 0;
                    return (
                      <g key={`vertex-${v.category}`} className="cursor-pointer" onClick={() => handleCategoryClick(v.category)}>
                        {isActive && (
                          <circle cx={v.x} cy={v.y} r="10" fill="none" stroke={v.color} strokeWidth="1.5" opacity="0.4" className="animate-pulse" />
                        )}
                        <circle
                          cx={v.x} cy={v.y}
                          r={isActive ? 7 : hasDeficits ? 6 : 5}
                          fill={isActive ? v.color : hasDeficits ? '#F85149' : '#F0F6FC'}
                          stroke="#090C10" strokeWidth="2.5"
                          className="hover:stroke-[#FF7A00] transition-colors"
                        />
                        <text x={v.textX} y={v.textY} fill={isActive ? v.color : '#8B949E'} fontSize="9" fontFamily="monospace" textAnchor={v.anchor} fontWeight={isActive ? 'bold' : 'normal'} className="select-none">
                          {v.category}
                        </text>
                        {hasDeficits && (
                          <text x={v.textX} y={v.textY + 12} fill="#F85149" fontSize="8" fontFamily="monospace" textAnchor={v.anchor} fontWeight="bold">
                            {v.deficitCount} deficit{v.deficitCount > 1 ? 's' : ''}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <text x={radarData.centerX} y={radarData.centerY - 8} fill="#F0F6FC" fontSize="18" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    {overallBalance}%
                  </text>
                  <text x={radarData.centerX} y={radarData.centerY + 8} fill="#8B949E" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    HEALTH
                  </text>
                </svg>
              </div>
            )}

            {/* ─── DEFICIT FOCUS RADAR (top 8 weakest topics) ─── */}
            {chartView === 'deficits' && deficitRadarData.vertices.length > 0 && (
              <div className="relative w-full flex items-center justify-center select-none py-2" style={{ height: '320px' }}>
                <svg className="w-full h-full max-w-md" viewBox="0 0 300 280">
                  {deficitRadarData.rings.map((ringPoints, i) => (
                    <polygon key={`dring-${i}`} points={ringPoints} fill="none" stroke="#21262D" strokeWidth="1" strokeDasharray={i < 2 ? '3,3' : ''} />
                  ))}
                  {deficitRadarData.vertices.map((v) => (
                    <line key={`dspoke-${v.key}`} x1={deficitRadarData.centerX} y1={deficitRadarData.centerY} x2={v.outerX} y2={v.outerY} stroke="#21262D" strokeWidth="1" />
                  ))}
                  {deficitRadarData.polygon && (
                    <polygon points={deficitRadarData.polygon} fill="rgba(248, 81, 73, 0.12)" stroke="#F85149" strokeWidth="2" strokeLinejoin="round" className="transition-all duration-500" />
                  )}
                  {deficitRadarData.vertices.map((v) => {
                    const isSelected = selectedTopicKey === v.key;
                    return (
                      <g key={`dv-${v.key}`} className="cursor-pointer" onClick={() => handleTopicSelect(v.key)}>
                        {isSelected && (
                          <circle cx={v.x} cy={v.y} r="10" fill="none" stroke="#FF7A00" strokeWidth="1.5" opacity="0.4" className="animate-pulse" />
                        )}
                        <circle cx={v.x} cy={v.y} r={isSelected ? 7 : v.isDeficit ? 6 : 5} fill={isSelected ? '#FF7A00' : v.isDeficit ? '#F85149' : '#F0F6FC'} stroke="#090C10" strokeWidth="2.5" className="hover:stroke-[#FF7A00] transition-colors" />
                        <text x={v.textX} y={v.textY} fill={isSelected ? '#FF7A00' : v.isDeficit ? '#F85149' : '#8B949E'} fontSize="8" fontFamily="monospace" textAnchor={v.anchor} fontWeight={isSelected || v.isDeficit ? 'bold' : 'normal'} className="select-none">
                          {v.label.length > 14 ? `${v.label.slice(0, 12)}…` : v.label}
                        </text>
                      </g>
                    );
                  })}
                  <text x={deficitRadarData.centerX} y={deficitRadarData.centerY - 4} fill="#F85149" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    TOP 8
                  </text>
                  <text x={deficitRadarData.centerX} y={deficitRadarData.centerY + 10} fill="#8B949E" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    WEAKEST
                  </text>
                </svg>
              </div>
            )}

            {/* ─── BAR CHART (sub-topics within category or all) ─── */}
            {chartView === 'bars' && (
              <div className="space-y-3 font-mono">
                {/* Category selector for bars */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-[#21262D]">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveCategory(null)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                        !activeCategory
                          ? 'bg-[#FF7A00] text-black font-bold'
                          : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-white'
                      }`}
                    >
                      All ({allTopics.length})
                    </button>
                    {CATEGORY_ORDER.map((cat) => {
                      const meta = CATEGORY_META[cat];
                      const isActive = activeCategory === cat;
                      const count = allTopics.filter((t) => t.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                            isActive
                              ? 'font-bold text-black'
                              : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-white'
                          }`}
                          style={isActive ? { backgroundColor: meta.color } : {}}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setChartView('category')}
                    className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="size-3" />
                    <span>Radar View</span>
                  </button>
                </div>

                {/* Horizontal sub-topic bar list */}
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {subTopicBars.map((t) => {
                    const catMeta = CATEGORY_META[t.category] || CATEGORY_META['Techniques'];
                    const isSelected = selectedTopicKey === t.key;
                    return (
                      <div
                        key={t.key}
                        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-[#161B22] border-[#FF7A00]/60 ring-1 ring-[#FF7A00]/30 shadow-md'
                            : 'bg-[#090C10] hover:bg-[#161B22] border-[#21262D] hover:border-[#FF7A00]/40'
                        }`}
                        onClick={() => handleTopicSelect(t.key)}
                        title={`Click to open ${t.label} detailed performance chart`}
                      >
                        {/* Status Icon */}
                        {t.isDeficit ? (
                          <AlertTriangle className="size-3 text-[#F85149] shrink-0" />
                        ) : (
                          <CheckCircle2 className="size-3 text-[#3FB950] shrink-0" />
                        )}

                        {/* Topic label & meta */}
                        <div className="w-32 sm:w-40 shrink-0 truncate">
                          <span className={`text-[11px] truncate block ${
                            isSelected ? 'text-[#FF7A00] font-bold' : t.isDeficit ? 'text-[#F85149] font-bold' : 'text-[#C9D1D9]'
                          }`}>
                            {t.label}
                          </span>
                          <span className="text-[9px] text-[#8B949E]">
                            {t.problemsSolved} solved • <span style={{ color: catMeta.color }}>{t.category}</span>
                          </span>
                        </div>

                        {/* Bar */}
                        <div className="flex-1 h-4 bg-[#161B22] rounded overflow-hidden relative border border-[#21262D]">
                          <div
                            className="h-full rounded transition-all duration-500"
                            style={{
                              width: `${t.barPct}%`,
                              backgroundColor: t.isDeficit ? '#F85149' : catMeta.color,
                              opacity: t.isDeficit ? 0.85 : 0.65,
                            }}
                          />
                          <span className="absolute inset-y-0 right-1.5 flex items-center text-[9px] font-mono text-[#F0F6FC] font-bold">
                            {t.competencyElo} Elo
                          </span>
                        </div>

                        {/* Chart hint */}
                        <span className="hidden sm:inline-block text-[9px] text-[#8B949E] opacity-0 group-hover:opacity-100 transition-opacity">
                          Chart ↗
                        </span>

                        {/* Quick practice button */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handlePracticeTopic(t.catalogKey); }}
                          className="p-1 rounded bg-[#FF7A00]/10 hover:bg-[#FF7A00]/30 transition-all text-[#FF7A00]"
                          title="Practice problems for this topic"
                        >
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                  {subTopicBars.length === 0 && (
                    <div className="p-4 text-center text-xs text-[#8B949E]">
                      Select a category above to see topic breakdown
                    </div>
                  )}
                </div>

                {/* Baseline reference */}
                <div className="flex items-center justify-between text-[10px] text-[#484F58] pt-1 border-t border-[#21262D]">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#FF7A00]" />
                    <span>Contest Elo Baseline: <strong className="text-white">{contestElo || 1500}</strong></span>
                  </div>
                  <span className="text-[#8B949E]">Click any sub-topic to open deep-dive chart</span>
                </div>
              </div>
            )}

            {/* ─── TOPIC DEEP-DIVE PERFORMANCE CHART ─── */}
            {chartView === 'topic' && currentTopic && (
              <div className="space-y-4 font-mono">
                {/* Topic Header & Breadcrumbs */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#21262D]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCategory) setChartView('bars');
                        else setChartView('category');
                      }}
                      className="px-2 py-1 rounded bg-[#161B22] border border-[#21262D] text-[#8B949E] hover:text-white hover:bg-[#21262D] transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                    >
                      <ArrowLeft className="size-3" />
                      <span>{activeCategory ? `${activeCategory} Sub-Topics` : 'Category Radar'}</span>
                    </button>
                    <span className="text-xs text-[#8B949E]">/</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        color: (CATEGORY_META[currentTopic.category] || CATEGORY_META['Techniques']).color,
                        backgroundColor: `${(CATEGORY_META[currentTopic.category] || CATEGORY_META['Techniques']).color}15`,
                        border: `1px solid ${(CATEGORY_META[currentTopic.category] || CATEGORY_META['Techniques']).color}40`,
                      }}
                    >
                      {currentTopic.category}
                    </span>
                    <span className="font-bold text-sm text-[#F0F6FC] truncate">
                      {currentTopic.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentTopic.isDeficit ? (
                      <span className="px-2 py-0.5 rounded bg-red-950/50 text-[#F85149] text-[10px] font-bold border border-red-800/40 flex items-center gap-1">
                        <AlertTriangle className="size-3" />
                        <span>Deficit ({currentTopic.deficitDelta} Elo)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-[#3FB950] text-[10px] font-bold border border-emerald-800/40 flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        <span>Proficient (+{currentTopic.deficitDelta} Elo)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Topic Competency vs Contest Baseline Visual Gauge */}
                <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#21262D] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8B949E]">Topic Competency Rating</span>
                    <span className="font-bold text-[#FF7A00]">{currentTopic.competencyElo} Elo</span>
                  </div>

                  {/* Multi-zone Progress Bar */}
                  <div className="relative w-full h-3.5 bg-[#0D1117] rounded-full overflow-hidden border border-[#21262D]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(10, Math.round((currentTopic.competencyElo / ((contestElo || 1500) * 1.25)) * 100)))}%`,
                        backgroundColor: currentTopic.isDeficit ? '#F85149' : '#3FB950',
                      }}
                    />
                    {/* Baseline Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#FF7A00] z-10"
                      style={{ left: `${Math.round(((contestElo || 1500) / ((contestElo || 1500) * 1.25)) * 100)}%` }}
                      title={`Contest Baseline: ${contestElo || 1500} Elo`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-[#8B949E]">
                    <span>Floor: 1050</span>
                    <span className="text-[#FF7A00] font-bold">Contest Baseline: {contestElo || 1500}</span>
                    <span>Target: {Math.round((contestElo || 1500) * 1.15)}</span>
                  </div>
                </div>

                {/* Performance Metrics Trio */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#21262D] text-center space-y-0.5">
                    <span className="text-[10px] text-[#8B949E] block">Problems Solved</span>
                    <span className="text-base font-bold text-white block">{currentTopic.problemsSolved}</span>
                    <span className="text-[9px] text-[#484F58]">Target: 10+ Solved</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#21262D] text-center space-y-0.5">
                    <span className="text-[10px] text-[#8B949E] block">Z-Score Deviation</span>
                    <span className={`text-base font-bold block ${currentTopic.zScore < -1 ? 'text-[#F85149]' : 'text-[#3FB950]'}`}>
                      {currentTopic.zScore > 0 ? `+${currentTopic.zScore}` : currentTopic.zScore}σ
                    </span>
                    <span className="text-[9px] text-[#484F58]">vs Average Topic</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#21262D] text-center space-y-0.5">
                    <span className="text-[10px] text-[#8B949E] block">Deficit Delta</span>
                    <span className={`text-base font-bold block ${currentTopic.deficitDelta < 0 ? 'text-[#F85149]' : 'text-[#3FB950]'}`}>
                      {currentTopic.deficitDelta > 0 ? `+${currentTopic.deficitDelta}` : currentTopic.deficitDelta}
                    </span>
                    <span className="text-[9px] text-[#484F58]">Elo vs Baseline</span>
                  </div>
                </div>

                {/* Topic Focus & Description */}
                <div className="p-3 rounded-lg bg-[#161B22]/60 border border-[#21262D] space-y-1 text-[11px] text-[#8B949E]">
                  <span className="font-bold text-[#F0F6FC] block">Topic Focus & Core Invariants</span>
                  <p className="leading-relaxed">
                    {currentTopic.description || `Algorithmic problems and recurring sub-patterns focused on ${currentTopic.label}.`}
                  </p>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handlePracticeTopic(currentTopic.catalogKey)}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#FF7A00] text-black font-bold text-xs hover:bg-[#FFA040] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF7A00]/10"
                  >
                    <span>Practice {currentTopic.label} Problems</span>
                    <ArrowRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJumpToPath(currentTopic.catalogKey)}
                    className="py-2.5 px-4 rounded-lg bg-[#161B22] text-[#F0F6FC] hover:text-white border border-[#21262D] hover:border-[#FF7A00]/40 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="size-4 text-[#FF7A00]" />
                    <span>Roadmap Path</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {categoryAggregates.map((cat) => {
              const isActive = activeCategory === cat.category;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => handleCategoryClick(cat.category)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left font-mono ${
                    isActive
                      ? `bg-[#161B22] ${cat.borderClass} shadow-lg`
                      : 'bg-[#0D1117] border-[#21262D] hover:border-[#FF7A00]/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className={`size-5 rounded flex items-center justify-center ${cat.bgClass}`}
                      style={{ color: cat.color }}
                    >
                      <CatIcon className="size-3" />
                    </div>
                    <span
                      className={`text-[10px] font-bold truncate ${isActive ? 'text-white' : 'text-[#8B949E]'}`}
                    >
                      {cat.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#8B949E]">
                      <span className="text-white font-bold">{cat.totalSolved}</span> solved
                    </div>
                    <div className="text-[10px] text-[#8B949E]">
                      Elo <span style={{ color: cat.color }} className="font-bold">{cat.avgElo}</span>
                    </div>
                    {/* Health bar */}
                    <div className="h-1 rounded-full bg-[#21262D] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.healthPct}%`,
                          backgroundColor: cat.deficitCount > 0 ? '#F85149' : '#3FB950',
                        }}
                      />
                    </div>
                    <div className="text-[9px]">
                      {cat.deficitCount > 0 ? (
                        <span className="text-red-400 font-bold">{cat.deficitCount} deficit{cat.deficitCount > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Healthy</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Topic Diagnostic Panel */}
          {currentTopic && (
            <div className="p-4 rounded-xl bg-[#0D1117] border border-[#21262D] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B949E] uppercase tracking-wider text-[10px]">Inspecting:</span>
                  <span className="font-bold text-[#FF7A00]">{currentTopic.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentTopic.isUndertrained
                    ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                    : currentTopic.isDeficit
                    ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30'
                    : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                }`}>
                  {currentTopic.isUndertrained ? 'UNDERTRAINED' : currentTopic.isDeficit ? 'DEFICIT' : 'HEALTHY'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-[#8B949E] block">Problems Solved:</span>
                  <span className="text-base font-bold text-white">{currentTopic.problemsSolved}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B949E] block">Z-Score:</span>
                  <span className={`text-base font-bold ${currentTopic.zScore < -1 ? 'text-[#F85149]' : 'text-white'}`}>
                    {currentTopic.zScore}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B949E] block">Competency Elo:</span>
                  <span className={`text-base font-bold ${currentTopic.isDeficit ? 'text-[#F85149]' : 'text-[#FF7A00]'}`}>
                    {currentTopic.competencyElo}
                  </span>
                </div>
              </div>

              {currentTopic.description && (
                <p className="text-[11px] text-[#8B949E] pt-1">
                  {currentTopic.description}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#21262D] gap-2">
                <span className="text-[11px] text-[#8B949E]">
                  {currentTopic.isDeficit
                    ? `Deficit of ${Math.abs(currentTopic.deficitDelta)} Elo vs contest baseline`
                    : 'Proficient volume and balanced solve ratio'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePracticeTopic(currentTopic.catalogKey)}
                    className="text-[#FF7A00] hover:text-[#FFA040] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Practice Topic</span>
                    <ArrowRight className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJumpToPath(currentTopic.catalogKey)}
                    className="text-[#8B949E] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Path</span>
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Granular Topic Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-4 font-mono">

          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
            <h3 className="font-bold text-sm text-[#F0F6FC]">
              {activeCategory ? `${activeCategory} Topics` : 'All Topics'}
            </h3>
            <span className="text-[10px] text-[#8B949E]">{filteredTopics.length} TOPICS</span>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-[#8B949E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter topics..."
                className="w-full bg-[#161B22] border border-[#21262D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F0F6FC] placeholder-[#484F58] focus:border-[#FF7A00]/50 focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#161B22] border border-[#21262D] rounded-lg pl-2 pr-7 py-1.5 text-[10px] text-[#8B949E] focus:border-[#FF7A00]/50 focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-[#484F58] pointer-events-none" />
            </div>
          </div>

          {/* Category quick pills (only when viewing All) */}
          {!activeCategory && (
            <div className="flex flex-wrap gap-1">
              {CATEGORY_ORDER.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-white transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Clear filter pill */}
          {activeCategory && (
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="px-2 py-0.5 rounded text-[10px] bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 font-bold cursor-pointer hover:bg-[#FF7A00]/20 transition-colors"
            >
              ✕ Clear Filter — Show All Topics
            </button>
          )}

          {/* Topic List */}
          <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredTopics.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8B949E]">
                No topics matching "{searchQuery}"
                {activeCategory && ` in ${activeCategory}`}
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const isSelected = selectedTopicKey === topic.key;
                const catMeta = CATEGORY_META[topic.category] || CATEGORY_META['Techniques'];

                return (
                  <div
                    key={topic.key}
                    onClick={() => handleTopicSelect(topic.key)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#161B22] border-[#FF7A00]/60 shadow-md shadow-[#FF7A00]/10'
                        : 'bg-[#090C10] hover:bg-[#161B22] border-[#21262D] hover:border-[#FF7A00]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {topic.isDeficit ? (
                        <AlertTriangle className="size-3.5 text-[#F85149] shrink-0" />
                      ) : (
                        <CheckCircle2 className="size-3.5 text-[#3FB950] shrink-0" />
                      )}
                      <div className="truncate">
                        <span className={`font-semibold text-xs block truncate ${
                          isSelected ? 'text-[#FF7A00]' : topic.isDeficit ? 'text-[#F85149]' : 'text-[#F0F6FC]'
                        }`}>
                          {topic.label}
                        </span>
                        <span className="text-[10px] text-[#8B949E]">
                          {topic.problemsSolved} solved •{' '}
                          <span style={{ color: catMeta.color }}>{topic.category}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-[#FF7A00]">{topic.competencyElo}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePracticeTopic(topic.catalogKey);
                        }}
                        className="p-1 rounded hover:bg-[#FF7A00]/20 transition-colors"
                        title="Practice this topic"
                      >
                        <ArrowRight className="size-3 text-[#FF7A00]" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
