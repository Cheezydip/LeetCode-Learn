import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  CornerDownLeft, 
  Tag, 
  Building2,
  Filter
} from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore.js';
import { useProfileStore } from '../store/useProfileStore.js';
import { searchLocalProblems, getAllCachedProblems } from '../services/problemCache.js';

const QUICK_FILTERS = [
  { label: 'All', query: '' },
  { label: 'Easy', query: 'easy' },
  { label: 'Medium', query: 'medium' },
  { label: 'Hard', query: 'hard' },
  { label: 'Blind 75', query: 'blind75' },
  { label: 'MAANG', query: 'maang' },
  { label: 'Dynamic Programming', query: 'dynamic programming' },
];

const SUGGESTED_SLUGS = [
  'two-sum',
  'valid-anagram',
  'best-time-to-buy-and-sell-stock',
  'longest-substring-without-repeating-characters',
  'lru-cache',
  'trapping-rain-water',
  'merge-k-sorted-lists',
  'coin-change',
];

export const GlobalSearchModal = () => {
  const { isOpen, closeSearch, initialQuery } = useSearchStore();
  const { solvedSlugs, isProblemSolved } = useProfileStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedProblems, setSuggestedProblems] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync initial query if passed
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || '');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Load starter/suggested problems when search opens
  useEffect(() => {
    if (isOpen && suggestedProblems.length === 0) {
      getAllCachedProblems().then((all) => {
        if (!all || all.length === 0) return;
        const matches = all.filter((p) => SUGGESTED_SLUGS.includes(p.title_slug));
        setSuggestedProblems(matches.length > 0 ? matches : all.slice(0, 8));
      }).catch(() => {});
    }
  }, [isOpen, suggestedProblems.length]);

  // Live search effect with debouncing
  useEffect(() => {
    if (!isOpen) return;

    const effectiveQuery = (query.trim() + (activeFilter && !query.toLowerCase().includes(activeFilter) ? ` ${activeFilter}` : '')).trim();

    if (!effectiveQuery) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await searchLocalProblems(effectiveQuery, { limit: 35 });
        setResults(matches);
        setSelectedIndex(0);
      } catch (err) {
        console.warn('[GlobalSearch] Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [query, activeFilter, isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const items = results.length > 0 ? results : suggestedProblems;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
        scrollSelectedIntoView();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
        scrollSelectedIntoView();
      } else if (e.key === 'Enter') {
        if (items.length > 0 && items[selectedIndex]) {
          e.preventDefault();
          handleSelectProblem(items[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, suggestedProblems, selectedIndex]);

  const scrollSelectedIntoView = () => {
    setTimeout(() => {
      const activeEl = listRef.current?.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }, 10);
  };

  const handleSelectProblem = (problem) => {
    if (!problem) return;
    closeSearch();
    // If it has a primary topic, navigate to practice with topic selected
    if (problem.topic_tags && problem.topic_tags.length > 0) {
      navigate('/practice');
    }
    // Open LeetCode in new tab
    if (problem.leetcode_url) {
      window.open(problem.leetcode_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  const displayList = results.length > 0 ? results : (query.trim() ? [] : suggestedProblems);
  const isShowingSuggestions = !query.trim() && displayList.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSearch();
      }}
    >
      <div className="w-full max-w-2xl bg-[#0D1117] border border-[#30363D] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[82vh] font-mono">
        
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#21262D] bg-[#161B22]/60">
          <Search className="size-5 text-[#FF7A00] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 3,216 problems by #ID, title, topic, company..."
            className="w-full bg-transparent text-sm text-[#F0F6FC] placeholder-[#8B949E] outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-[#8B949E] bg-[#21262D] rounded border border-[#30363D]">
            ESC
          </kbd>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#090C10] border-b border-[#21262D] overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-[#8B949E] flex items-center gap-1 shrink-0 mr-1">
            <Filter className="size-3 text-[#FF7A00]" /> Filter:
          </span>
          {QUICK_FILTERS.map((f) => {
            const isSelected = activeFilter === f.query;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => {
                  setActiveFilter(isSelected ? '' : f.query);
                  inputRef.current?.focus();
                }}
                className={`px-2 py-0.5 rounded-md shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-[#FF7A00] text-black font-bold border-[#FF7A00]'
                    : 'bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border-[#21262D] hover:border-[#30363D]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto divide-y divide-[#21262D]/60 max-h-[55vh]"
        >
          {isShowingSuggestions && (
            <div className="px-4 py-2 bg-[#161B22]/30 text-[11px] text-[#8B949E] flex items-center justify-between font-sans">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3 text-[#FF7A00]" /> Essential & Popular Problems
              </span>
              <span>3,216 Problems in Local Cache</span>
            </div>
          )}

          {displayList.map((p, idx) => {
            const isSelected = idx === selectedIndex;
            const solved = isProblemSolved(p.title_slug);

            const diffColor = 
              p.difficulty === 'Easy' ? 'text-[#3FB950] border-[#3FB950]/30 bg-[#3FB950]/10' :
              p.difficulty === 'Medium' ? 'text-[#FF7A00] border-[#FF7A00]/30 bg-[#FF7A00]/10' :
              'text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10';

            return (
              <div
                key={p.title_slug || p.frontend_id || idx}
                data-selected={isSelected}
                onClick={() => handleSelectProblem(p)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#161B22] border-l-2 border-l-[#FF7A00]' : 'hover:bg-[#161B22]/50'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {solved ? (
                      <CheckCircle2 className="size-4 text-[#3FB950]" />
                    ) : (
                      <span className="size-2 rounded-full bg-[#30363D] block ml-1" />
                    )}
                  </div>

                  {/* ID & Title */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {p.frontend_id && (
                        <span className="text-[11px] text-[#8B949E] font-bold shrink-0">
                          #{p.frontend_id}
                        </span>
                      )}
                      <h4 className="text-xs sm:text-sm font-semibold text-[#F0F6FC] truncate">
                        {p.title}
                      </h4>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-[#8B949E]">
                      {p.ac_rate && (
                        <span>{p.ac_rate}% AC</span>
                      )}
                      {p.sheet_tags && p.sheet_tags.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20">
                          {p.sheet_tags[0].toUpperCase()}
                        </span>
                      )}
                      {p.company_tags && p.company_tags.length > 0 && (
                        <span className="flex items-center gap-1 text-[#F778BA]">
                          <Building2 className="size-2.5" />
                          {p.company_tags.slice(0, 2).join(', ')}
                        </span>
                      )}
                      {p.topic_tags && p.topic_tags.length > 0 && (
                        <span className="text-[#8B949E] truncate hidden sm:inline">
                          • {p.topic_tags.slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Badge & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${diffColor}`}>
                    {p.difficulty}
                  </span>

                  {isSelected && (
                    <a
                      href={p.leetcode_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] transition-colors"
                      title="Open on LeetCode"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {!isLoading && query.trim() && displayList.length === 0 && (
            <div className="py-12 text-center text-xs text-[#8B949E]">
              <Search className="size-8 mx-auto mb-2 text-[#484F58]" />
              <p>No problems found matching "<span className="text-[#F0F6FC]">{query}</span>"</p>
              <p className="mt-1 text-[11px] text-[#484F58]">Try searching by LeetCode ID (e.g. #1) or topic tag.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-2.5 bg-[#090C10] border-t border-[#21262D] flex items-center justify-between text-[11px] text-[#8B949E]">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#161B22] border border-[#21262D] rounded text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 bg-[#161B22] border border-[#21262D] rounded text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft className="size-3 text-[#FF7A00]" />
              Open Problem
            </span>
          </div>

          <span className="text-[10px] text-[#484F58]">
            Press <kbd className="px-1 py-0.5 bg-[#161B22] border border-[#21262D] rounded text-[9px]">Ctrl+K</kbd> anywhere
          </span>
        </div>

      </div>
    </div>
  );
};
