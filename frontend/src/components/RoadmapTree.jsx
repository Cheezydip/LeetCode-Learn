import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle2 } from 'lucide-react';

const DIFF_CONFIG = {
  easy: {
    color: '#3FB950',
    label: 'Easy',
    bgClass: 'bg-[#3FB950]/10',
    borderClass: 'border-[#3FB950]/30',
    textClass: 'text-[#3FB950]',
    dotClass: 'bg-[#3FB950]',
  },
  medium: {
    color: '#FF7A00',
    label: 'Medium',
    bgClass: 'bg-[#FF7A00]/10',
    borderClass: 'border-[#FF7A00]/30',
    textClass: 'text-[#FF7A00]',
    dotClass: 'bg-[#FF7A00]',
  },
  hard: {
    color: '#F85149',
    label: 'Hard',
    bgClass: 'bg-[#F85149]/10',
    borderClass: 'border-[#F85149]/30',
    textClass: 'text-[#F85149]',
    dotClass: 'bg-[#F85149]',
  },
};

function ProblemNode({ problem, diffKey, isProblemSolved, staggerIdx }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = DIFF_CONFIG[diffKey];
  const slug = problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const solved = isProblemSolved(slug);

  return (
    <div
      className={`tree-node animate-fade-slide-up`}
      style={{ animationDelay: `${staggerIdx * 0.03}s` }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer group
          ${solved
            ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400/60'
            : `bg-[#0D1117] ${cfg.borderClass} hover:border-[#FF7A00]/50`
          }
          hover:-translate-y-0.5 hover:shadow-lg`}
      >
        <div className="flex items-center gap-2">
          {/* Solved indicator or difficulty dot */}
          {solved ? (
            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
          ) : (
            <span className={`size-2 rounded-full shrink-0 ${cfg.dotClass}`} />
          )}

          {/* Problem name */}
          <span className={`text-xs font-semibold flex-1 truncate ${solved ? 'text-emerald-300' : 'text-[#F0F6FC]'} group-hover:text-[#FF7A00] transition-colors`}>
            {problem.name}
          </span>

          {/* LC number badge */}
          <span className="text-[10px] font-mono text-[#8B949E] shrink-0">
            #{problem.lcId}
          </span>

          {/* Expand indicator */}
          {expanded ? (
            <ChevronDown className="size-3 text-[#8B949E] shrink-0" />
          ) : (
            <ChevronRight className="size-3 text-[#8B949E] shrink-0" />
          )}
        </div>
      </button>

      {/* Expanded intuition panel */}
      {expanded && (
        <div className={`mt-1 ml-5 px-3 py-2.5 rounded-lg border text-xs leading-relaxed animate-fade-slide-up
          ${solved
            ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-200/80'
            : `bg-[#161B22] ${cfg.borderClass} text-[#8B949E]`
          }`}
        >
          <p className="font-mono">{problem.intuition}</p>
          <a
            href={`https://leetcode.com/problems/${slug}/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[#FF7A00] hover:text-[#FFA040] font-semibold transition-colors"
          >
            <span>Open on LeetCode</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, diffKey, isProblemSolved, baseIdx }) {
  const cfg = DIFF_CONFIG[diffKey];

  return (
    <div className="tree-group">
      {/* Group label */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`size-1.5 rounded-full ${cfg.dotClass} opacity-60`} />
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${cfg.textClass} opacity-80`}>
          {group.name}
        </span>
        <span className="text-[10px] font-mono text-[#484F58]">
          {group.problems.length} problems
        </span>
      </div>

      {/* Problems */}
      <div className="space-y-1.5 ml-1 pl-3 border-l border-[#21262D]">
        {group.problems.map((problem, pIdx) => (
          <ProblemNode
            key={problem.lcId}
            problem={problem}
            diffKey={diffKey}
            isProblemSolved={isProblemSolved}
            staggerIdx={baseIdx + pIdx}
          />
        ))}
      </div>
    </div>
  );
}

function TierSection({ diffKey, tier, isProblemSolved }) {
  const cfg = DIFF_CONFIG[diffKey];
  const [collapsed, setCollapsed] = useState(false);

  // Count total and solved
  let totalProblems = 0;
  let solvedCount = 0;
  tier.groups.forEach(g => {
    g.problems.forEach(p => {
      totalProblems++;
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (isProblemSolved(slug)) solvedCount++;
    });
  });

  let runningIdx = 0;

  return (
    <div className="tree-tier">
      {/* Tier header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group
          ${cfg.bgClass} ${cfg.borderClass} hover:shadow-lg`}
      >
        <span className={`size-3 rounded-full ${cfg.dotClass} shadow-sm`} style={{ boxShadow: `0 0 8px ${cfg.color}40` }} />
        <div className="flex-1 text-left">
          <span className={`text-sm font-bold ${cfg.textClass}`}>
            {cfg.label}
          </span>
          <span className="text-[11px] text-[#8B949E] ml-2 font-mono">
            {tier.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#8B949E]">
            <span className={`font-bold ${solvedCount > 0 ? 'text-emerald-400' : ''}`}>{solvedCount}</span>
            /{totalProblems}
          </span>
          {collapsed ? (
            <ChevronRight className={`size-4 ${cfg.textClass}`} />
          ) : (
            <ChevronDown className={`size-4 ${cfg.textClass}`} />
          )}
        </div>
      </button>

      {/* Groups (collapsible) */}
      {!collapsed && (
        <div className="mt-3 space-y-5 pl-2">
          {/* Vertical connector from tier header */}
          {tier.groups.map((group, gIdx) => {
            const thisIdx = runningIdx;
            runningIdx += group.problems.length;
            return (
              <GroupCard
                key={gIdx}
                group={group}
                diffKey={diffKey}
                isProblemSolved={isProblemSolved}
                baseIdx={thisIdx}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RoadmapTree({ data, isProblemSolved }) {
  if (!data || !data.tiers) return null;

  // Calculate total stats
  let totalProblems = 0;
  let totalSolved = 0;
  const tierOrder = ['easy', 'medium', 'hard'];

  tierOrder.forEach(key => {
    const tier = data.tiers[key];
    if (!tier) return;
    tier.groups.forEach(g => {
      g.problems.forEach(p => {
        totalProblems++;
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (isProblemSolved(slug)) totalSolved++;
      });
    });
  });

  return (
    <div className="roadmap-tree">
      {/* Tree root node */}
      <div className="flex items-center justify-center mb-6">
        <div className="px-5 py-3 rounded-xl bg-[#0D1117] border border-[#FF7A00]/40 shadow-lg shadow-[#FF7A00]/5 animate-fade-slide-up">
          <div className="text-center">
            <h2 className="text-base font-bold text-[#F0F6FC]">{data.title}</h2>
            <p className="text-[10px] font-mono text-[#8B949E] mt-0.5">
              {totalSolved} / {totalProblems} solved
            </p>
          </div>
        </div>
      </div>

      {/* Trunk connector */}
      <div className="tree-trunk-line" />

      {/* Tier sections - vertical flow */}
      <div className="space-y-6 relative">
        {/* Vertical trunk line behind tiers */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[#21262D] hidden lg:block" />

        {tierOrder.map(key => {
          const tier = data.tiers[key];
          if (!tier) return null;
          return (
            <TierSection
              key={key}
              diffKey={key}
              tier={tier}
              isProblemSolved={isProblemSolved}
            />
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="mt-6 pt-4 border-t border-[#21262D] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#8B949E]">
        <div className="flex items-center gap-4">
          {tierOrder.map(key => {
            const tier = data.tiers[key];
            if (!tier) return null;
            const cfg = DIFF_CONFIG[key];
            let count = 0;
            tier.groups.forEach(g => { count += g.problems.length; });
            return (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${cfg.dotClass}`} />
                <span className={cfg.textClass}>{count} {cfg.label}</span>
              </span>
            );
          })}
        </div>
        <span>
          {totalProblems} total problems
        </span>
      </div>
    </div>
  );
}
