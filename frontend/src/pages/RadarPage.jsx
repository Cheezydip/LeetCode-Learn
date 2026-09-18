import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Search, Flame, Target } from 'lucide-react';

const CATEGORIES = ['All', 'Techniques', 'Data Structures', 'Algorithms', 'Graphs', 'Math'];

export const RadarPage = () => {
  const navigate = useNavigate();
  const { topicMetrics, setSelectedTopic, contestElo, recentSubmissions, handle, region, syncLeetCode } = useProfileStore();

  // Auto-sync if profile has stale 8-topic cache
  useEffect(() => {
    if (handle && (!topicMetrics || Object.keys(topicMetrics).length <= 8)) {
      syncLeetCode(handle, region, true);
    }
  }, [handle, topicMetrics, region, syncLeetCode]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicKey, setSelectedTopicKey] = useState(null);

  // Convert topicMetrics dictionary to array
  const allTopics = useMemo(() => {
    if (!topicMetrics) return [];
    return Object.values(topicMetrics);
  }, [topicMetrics]);

  // Set default selected topic
  const currentTopic = useMemo(() => {
    if (!allTopics.length) return null;
    if (selectedTopicKey) {
      const found = allTopics.find((t) => t.key === selectedTopicKey || t.catalogKey === selectedTopicKey);
      if (found) return found;
    }
    // Default to the highest deficit topic or the first one
    const deficitTopic = allTopics.find((t) => t.isDeficit);
    return deficitTopic || allTopics[0];
  }, [allTopics, selectedTopicKey]);

  // Topics filtered for the matrix view
  const filteredTopics = useMemo(() => {
    return allTopics.filter((t) => {
      const matchesSearch = !searchQuery ||
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.key.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allTopics, searchQuery, activeCategory]);

  // Subset of topics to render on the dynamic radar (top 6-8 topics from active category or top deficits)
  const radarTopics = useMemo(() => {
    if (!allTopics.length) return [];
    let pool = activeCategory === 'All'
      ? allTopics.filter((t) => t.isDeficit || t.problemsSolved > 0)
      : allTopics.filter((t) => t.category === activeCategory);

    if (pool.length < 5) {
      pool = allTopics;
    }

    // Pick 8 representative topics for clear radar polygon visualization
    const picked = pool.slice(0, 8);
    const n = picked.length;
    const centerX = 140;
    const centerY = 130;
    const maxRadius = 85;

    return picked.map((t, idx) => {
      const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
      // Score normalized 0 - 100 based on Elo relative to baseline
      const base = contestElo || 1500;
      const score = Math.max(20, Math.min(100, Math.round((t.competencyElo / (base * 1.15)) * 100)));
      const r = (score / 100) * maxRadius;

      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      // Label positioning
      const labelRadius = maxRadius + 22;
      const textX = centerX + labelRadius * Math.cos(angle);
      const textY = centerY + labelRadius * Math.sin(angle) + 4;

      let anchor = 'middle';
      if (Math.cos(angle) > 0.3) anchor = 'start';
      else if (Math.cos(angle) < -0.3) anchor = 'end';

      return {
        ...t,
        score,
        x,
        y,
        textX,
        textY,
        anchor,
        angle,
      };
    });
  }, [allTopics, activeCategory, contestElo]);

  const handleJumpToPractice = (topicKey) => {
    setSelectedTopic(topicKey);
    navigate('/practice');
  };

  const handleJumpToPath = (topicKey) => {
    setSelectedTopic(topicKey);
    navigate(`/paths/${topicKey}`);
  };

  // If user hasn't synced yet
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

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
            <span>Topic Analysis & Skill Breakdown</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F0F6FC]">
            Topic Competency Overview
          </h1>
          <p className="text-xs text-[#8B949E] font-mono mt-1">
            Separated competency ratings and solve distributions across all {allTopics.length} LeetCode algorithmic topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RADAR VISUALIZATION & DIAGNOSTICS (7 Cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#21262D]">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-[#FF7A00]" />
              <h3 className="font-bold text-sm text-[#F0F6FC] font-mono">
                {activeCategory === 'All' ? 'Key Focus Spider Radar' : `${activeCategory} Radar`}
              </h3>
            </div>
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#FF7A00] text-black font-bold'
                      : 'bg-[#161B22] text-[#8B949E] hover:text-white border border-[#21262D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Radar */}
          <div className="relative h-76 w-full flex items-center justify-center select-none py-2">
            <svg className="w-full h-full max-w-md" viewBox="0 0 280 260">
              {/* Spider concentric rings */}
              {[0.33, 0.66, 1.0].map((scale, i) => {
                const ringPoints = radarTopics.map((_, idx) => {
                  const angle = (Math.PI * 2 * idx) / radarTopics.length - Math.PI / 2;
                  const r = 85 * scale;
                  return `${140 + r * Math.cos(angle)},${130 + r * Math.sin(angle)}`;
                }).join(' ');
                return (
                  <polygon
                    key={i}
                    points={ringPoints}
                    fill="none"
                    stroke="#21262D"
                    strokeWidth="1"
                    strokeDasharray={scale === 1.0 ? '' : '2,2'}
                  />
                );
              })}

              {/* Spokes */}
              {radarTopics.map((v) => (
                <line
                  key={`spoke-${v.key}`}
                  x1="140"
                  y1="130"
                  x2={140 + 85 * Math.cos(v.angle)}
                  y2={130 + 85 * Math.sin(v.angle)}
                  stroke="#21262D"
                  strokeWidth="1"
                />
              ))}

              {/* Competency Polygon */}
              {radarTopics.length > 2 && (
                <polygon
                  points={radarTopics.map((v) => `${v.x},${v.y}`).join(' ')}
                  fill="rgba(255, 122, 0, 0.18)"
                  stroke="#FF7A00"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              )}

              {/* Vertex Nodes */}
              {radarTopics.map((v) => {
                const isSelected = currentTopic?.key === v.key;
                return (
                  <g
                    key={v.key}
                    className="cursor-pointer"
                    onClick={() => setSelectedTopicKey(v.key)}
                  >
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r={isSelected ? 6 : v.isDeficit ? 5 : 4}
                      fill={isSelected ? '#FF7A00' : v.isDeficit ? '#F85149' : '#F0F6FC'}
                      stroke="#090C10"
                      strokeWidth="2"
                      className="hover:stroke-[#FF7A00] transition-colors"
                    />
                    <text
                      x={v.textX}
                      y={v.textY}
                      fill={isSelected ? '#FF7A00' : v.isDeficit ? '#F85149' : '#8B949E'}
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor={v.anchor || 'middle'}
                      fontWeight={isSelected || v.isDeficit ? 'bold' : 'normal'}
                    >
                      {v.label.length > 15 ? `${v.label.slice(0, 13)}...` : v.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dynamic Active Topic Diagnostic Inspection Box */}
          {currentTopic && (
            <div className="p-4 rounded-xl bg-[#090C10] border border-[#21262D] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B949E] uppercase tracking-wider text-[10px]">Active Topic:</span>
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
                    onClick={() => handleJumpToPractice(currentTopic.catalogKey)}
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

        {/* ALL TOPICS COMPETENCY MATRIX (5 Cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-4 font-mono">
          
          <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
            <h3 className="font-bold text-sm text-[#F0F6FC]">All Topic Competencies</h3>
            <span className="text-[10px] text-[#8B949E]">{filteredTopics.length} TOPICS</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-[#8B949E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics (e.g. sliding window, two pointers, prefix sum)..."
              className="w-full bg-[#161B22] border border-[#21262D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F0F6FC] placeholder-[#484F58] focus:border-[#FF7A00]/50 focus:outline-none"
            />
          </div>

          {/* Topic List */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const isSelected = currentTopic?.key === topic.key;

              return (
                <div
                  key={topic.key}
                  onClick={() => setSelectedTopicKey(topic.key)}
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
                        {topic.problemsSolved} solved • {topic.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="text-[11px] font-bold text-[#FF7A00]">{topic.competencyElo} Elo</span>
                    <ChevronRight className="size-3 text-[#8B949E]" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
