import React, { useState, useMemo } from 'react';
import { useProfileStore } from '../store/useProfileStore.js';
import { safeUrl } from '../lib/utils.js';
import { 
  SHEETS_METADATA, 
  getSheetData, 
  getMaangCompany, 
  getMaangCompaniesList 
} from '../data/sheetsData.js';
import { 
  Zap, 
  Target, 
  Building2, 
  GraduationCap, 
  Database, 
  Cpu, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  Check,
  FolderOpen
} from 'lucide-react';

const ICON_MAP = {
  Zap,
  Target,
  Building2,
  GraduationCap,
  Database,
  Cpu
};

export const CuratedSheetsView = ({ initialSheetKey = 'master-dsa', onSheetChange, hideSheetSelector = false }) => {
  const { 
    isProblemSolved, 
    toggleProblemSolvedAction,
    solvedSlugs
  } = useProfileStore();

  const [activeSheetKey, setActiveSheetKey] = useState(initialSheetKey || 'blind75');
  const [activeCompanySlug, setActiveCompanySlug] = useState('google');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All'); // 'All' | 'Easy' | 'Medium' | 'Hard'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Solved' | 'Unsolved'
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('All');
  const [expandedSections, setExpandedSections] = useState({});

  React.useEffect(() => {
    if (initialSheetKey && initialSheetKey !== activeSheetKey) {
      setActiveSheetKey(initialSheetKey);
      setSelectedSectionFilter('All');
      setExpandedSections({});
    }
  }, [initialSheetKey]);

  const activeSheet = useMemo(() => {
    return getSheetData(activeSheetKey);
  }, [activeSheetKey]);

  const maangCompanies = useMemo(() => {
    return getMaangCompaniesList();
  }, []);

  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const expandAll = () => {
    if (!sectionsToRender) return;
    const all = {};
    sectionsToRender.forEach(s => { all[s.title] = true; });
    setExpandedSections(all);
  };

  // Extract sections & problems according to the selected sheet
  const sectionsToRender = useMemo(() => {
    if (!activeSheet) return [];

    let rawSections = [];

    if (activeSheetKey === 'maang') {
      const comp = getMaangCompany(activeCompanySlug);
      if (comp) {
        rawSections = [{
          title: `${comp.company} Most Asked Questions`,
          problemCount: comp.problems.length,
          problems: comp.problems
        }];
      }
    } else if (activeSheet.sections) {
      rawSections = activeSheet.sections;
    }

    if (selectedSectionFilter !== 'All') {
      rawSections = rawSections.filter(s => s.title === selectedSectionFilter);
    }

    // Apply filtering (search, difficulty, status)
    const cleanSearch = searchQuery.trim().toLowerCase();

    return rawSections.map(sec => {
      let filteredProblems = (sec.problems || []).filter(p => {
        const matchesDiff = difficultyFilter === 'All' || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
        const matchesSearch = !cleanSearch || 
          p.title.toLowerCase().includes(cleanSearch) || 
          p.slug.toLowerCase().includes(cleanSearch) ||
          sec.title.toLowerCase().includes(cleanSearch);
        
        const isSolved = isProblemSolved(p.slug);
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'Solved' ? isSolved : !isSolved);

        return matchesDiff && matchesSearch && matchesStatus;
      });

      let filteredSubsections = [];
      if (sec.subsections) {
        filteredSubsections = sec.subsections.map(sub => {
          const subProbs = (sub.problems || []).filter(p => {
            const matchesDiff = difficultyFilter === 'All' || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
            const matchesSearch = !cleanSearch || 
              p.title.toLowerCase().includes(cleanSearch) || 
              p.slug.toLowerCase().includes(cleanSearch) ||
              sub.title.toLowerCase().includes(cleanSearch) ||
              sec.title.toLowerCase().includes(cleanSearch);
            
            const isSolved = isProblemSolved(p.slug);
            const matchesStatus = statusFilter === 'All' || (statusFilter === 'Solved' ? isSolved : !isSolved);

            return matchesDiff && matchesSearch && matchesStatus;
          });
          return {
            title: sub.title,
            problems: subProbs
          };
        }).filter(sub => sub.problems.length > 0);
      }

      const totalFiltered = filteredProblems.length + filteredSubsections.reduce((acc, sub) => acc + sub.problems.length, 0);

      return {
        title: sec.title,
        problems: filteredProblems,
        subsections: filteredSubsections,
        totalFiltered
      };
    }).filter(sec => sec.totalFiltered > 0 || !cleanSearch);
  }, [activeSheet, activeSheetKey, activeCompanySlug, searchQuery, difficultyFilter, statusFilter, isProblemSolved, solvedSlugs]);

  // Aggregate stats for current active sheet/company
  const sheetStats = useMemo(() => {
    let total = 0;
    let solved = 0;
    let easyTotal = 0;
    let easySolved = 0;
    let medTotal = 0;
    let medSolved = 0;
    let hardTotal = 0;
    let hardSolved = 0;

    const countProb = (p) => {
      total++;
      const isS = isProblemSolved(p.slug);
      if (isS) solved++;
      if (p.difficulty === 'Easy') {
        easyTotal++;
        if (isS) easySolved++;
      } else if (p.difficulty === 'Medium') {
        medTotal++;
        if (isS) medSolved++;
      } else if (p.difficulty === 'Hard') {
        hardTotal++;
        if (isS) hardSolved++;
      }
    };

    if (activeSheetKey === 'maang') {
      const comp = getMaangCompany(activeCompanySlug);
      if (comp) {
        comp.problems.forEach(countProb);
      }
    } else if (activeSheet && activeSheet.sections) {
      activeSheet.sections.forEach(sec => {
        (sec.problems || []).forEach(countProb);
        (sec.subsections || []).forEach(sub => {
          (sub.problems || []).forEach(countProb);
        });
      });
    }

    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, pct, easyTotal, easySolved, medTotal, medSolved, hardTotal, hardSolved };
  }, [activeSheet, activeSheetKey, activeCompanySlug, isProblemSolved, solvedSlugs]);

  return (
    <div className="space-y-6">
      
      {/* Sheets Navigation Bar */}
      {!hideSheetSelector && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SHEETS_METADATA.map((sheet) => {
            const isSelected = activeSheetKey === sheet.key;
            const Icon = ICON_MAP[sheet.icon] || Target;

            return (
              <button
                key={sheet.key}
                type="button"
                onClick={() => {
                  setActiveSheetKey(sheet.key);
                  setSearchQuery('');
                  if (onSheetChange) onSheetChange(sheet.key);
                }}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#161B22] border-[#FF7A00] shadow-lg shadow-[#FF7A00]/5 ring-1 ring-[#FF7A00]/30'
                    : 'bg-[#0D1117] border-[#21262D] hover:bg-[#161B22]/80 hover:border-[#30363D]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div 
                    className="p-1.5 rounded-lg" 
                    style={{ backgroundColor: `${sheet.color}15`, color: sheet.color }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E]">
                    {sheet.totalProblems}
                  </span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#C9D1D9]'}`}>
                    {sheet.title}
                  </h4>
                  <p className="text-[10px] text-[#8B949E] mt-0.5 truncate">
                    {sheet.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* MAANG Company Sub-Selector */}
      {activeSheetKey === 'maang' && (
        <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#21262D] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="size-3.5 text-[#58A6FF]" /> Select Company Set
            </span>
            <span className="text-[11px] font-mono text-[#8B949E]">
              14 Tier-1 Tech Firms
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {maangCompanies.map(c => {
              const isSelected = activeCompanySlug === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setActiveCompanySlug(c.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#58A6FF]/20 text-[#58A6FF] font-bold border border-[#58A6FF]/40 shadow-sm'
                      : 'bg-[#161B22] text-[#8B949E] hover:text-white border border-[#21262D]'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-70">({c.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sheet Overview & Progress Cockpit */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1117] border border-[#21262D] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {activeSheetKey === 'maang' 
                  ? `${getMaangCompany(activeCompanySlug)?.company || 'Company'} Interview Questions` 
                  : (activeSheet?.name || 'Curated Sheet')}
              </h2>
              {activeSheet?.badge && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30">
                  {activeSheet.badge}
                </span>
              )}
            </div>
          </div>

          {/* Solved Metric Ring / Stats */}
          <div className="flex items-center gap-4 bg-[#161B22] px-4 py-2.5 rounded-xl border border-[#21262D] self-start md:self-auto shrink-0 font-mono">
            <div>
              <div className="text-[11px] text-[#8B949E]">Completion</div>
              <div className="text-base font-bold text-white flex items-baseline gap-1">
                <span>{sheetStats.solved}</span>
                <span className="text-xs text-[#8B949E]">/ {sheetStats.total}</span>
                <span className="text-xs text-[#3FB950] ml-1">({sheetStats.pct}%)</span>
              </div>
            </div>
            <div className="w-16 h-2 bg-[#21262D] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF7A00] to-[#3FB950] transition-all duration-500 rounded-full"
                style={{ width: `${sheetStats.pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#21262D]/60 text-xs font-mono">
          <span className="text-[11px] text-[#8B949E] mr-1">Progress by Difficulty:</span>
          
          <div className="px-2.5 py-1 rounded bg-[#3FB950]/10 border border-[#3FB950]/20 text-[#3FB950] flex items-center gap-1.5">
            <span>Easy:</span>
            <span className="font-bold">{sheetStats.easySolved} / {sheetStats.easyTotal}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] flex items-center gap-1.5">
            <span>Medium:</span>
            <span className="font-bold">{sheetStats.medSolved} / {sheetStats.medTotal}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1.5">
            <span>Hard:</span>
            <span className="font-bold">{sheetStats.hardSolved} / {sheetStats.hardTotal}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-3 rounded-xl bg-[#0D1117] border border-[#21262D] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B949E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by name or topic..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-[#FF7A00] transition-colors font-mono"
          />
        </div>

        {/* Topic / Section Selector Dropdown */}
        {activeSheet?.sections && activeSheet.sections.length > 1 && (
          <div className="flex items-center gap-1.5 bg-[#161B22] px-2.5 py-1 rounded-lg border border-[#21262D] focus-within:border-[#FF7A00]/50 transition-colors">
            <FolderOpen className="size-3.5 text-[#FF7A00] shrink-0" />
            <div className="relative flex items-center">
              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="appearance-none bg-transparent text-xs text-white border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 font-mono cursor-pointer pr-5 max-w-[200px] truncate"
              >
                <option value="All" className="bg-[#161B22] text-white">
                  All Topics ({activeSheet.sections.length})
                </option>
                {activeSheet.sections.map(s => (
                  <option key={s.title} value={s.title} className="bg-[#161B22] text-white">
                    {s.title} ({s.problemCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 size-3 text-[#8B949E] pointer-events-none" />
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Difficulty Toggles */}
          <div className="flex items-center bg-[#161B22] p-1 rounded-lg border border-[#21262D] text-xs font-mono">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-[#FF7A00] text-black font-bold shadow'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Toggles */}
          <div className="flex items-center bg-[#161B22] p-1 rounded-lg border border-[#21262D] text-xs font-mono">
            {['All', 'Unsolved', 'Solved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#21262D] text-white font-bold'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Accordion Controls */}
          <div className="hidden sm:flex items-center gap-1 border-l border-[#21262D] pl-2 text-xs font-mono text-[#8B949E]">
            <button 
              type="button" 
              onClick={expandAll}
              className="px-2 py-1 rounded hover:bg-[#161B22] hover:text-white transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span>/</span>
            <button 
              type="button" 
              onClick={collapseAll}
              className="px-2 py-1 rounded hover:bg-[#161B22] hover:text-white transition-colors cursor-pointer"
            >
              Collapse
            </button>
          </div>

        </div>

      </div>

      {/* Sections and Problem Tables */}
      <div className="space-y-4">
        {sectionsToRender.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0D1117] border border-[#21262D] text-center space-y-2">
            <p className="text-sm text-[#8B949E] font-mono">
              No problems match your current search or filter criteria.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setDifficultyFilter('All'); setStatusFilter('All'); }}
              className="text-xs font-mono text-[#FF7A00] hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          sectionsToRender.map((section) => {
            const hasActiveSearch = searchQuery.trim().length > 0;
            const isExpanded = hasActiveSearch ? true : !!expandedSections[section.title];
            const isCollapsed = !isExpanded;

            // Compute total & solved counts from raw section to determine complete status
            const rawSection = activeSheet?.sections?.find(s => s.title === section.title);
            let totalProblemsInSection = 0;
            let solvedProblemsInSection = 0;

            if (rawSection) {
              (rawSection.problems || []).forEach(p => {
                totalProblemsInSection++;
                if (isProblemSolved(p.slug)) solvedProblemsInSection++;
              });
              (rawSection.subsections || []).forEach(sub => {
                (sub.problems || []).forEach(p => {
                  totalProblemsInSection++;
                  if (isProblemSolved(p.slug)) solvedProblemsInSection++;
                });
              });
            } else {
              (section.problems || []).forEach(p => {
                totalProblemsInSection++;
                if (isProblemSolved(p.slug)) solvedProblemsInSection++;
              });
              (section.subsections || []).forEach(sub => {
                (sub.problems || []).forEach(p => {
                  totalProblemsInSection++;
                  if (isProblemSolved(p.slug)) solvedProblemsInSection++;
                });
              });
            }

            const isSectionComplete = totalProblemsInSection > 0 && solvedProblemsInSection === totalProblemsInSection;

            return (
              <div 
                key={section.title}
                className={`rounded-xl overflow-hidden transition-all duration-200 ${
                  isSectionComplete
                    ? 'bg-gradient-to-b from-[#3FB950]/10 via-[#0D1117] to-[#0D1117] border-2 border-[#3FB950]/60 shadow-lg shadow-[#3FB950]/10 ring-1 ring-[#3FB950]/30'
                    : 'bg-[#0D1117] border border-[#21262D] shadow-sm'
                }`}
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className={`w-full px-4 py-3 transition-colors flex items-center justify-between text-left cursor-pointer border-b ${
                    isSectionComplete
                      ? 'bg-[#3FB950]/15 hover:bg-[#3FB950]/25 border-[#3FB950]/30'
                      : 'bg-[#161B22]/70 hover:bg-[#161B22] border-[#21262D]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isSectionComplete ? (
                      <CheckCircle2 className="size-4.5 text-[#3FB950] shrink-0" />
                    ) : isCollapsed ? (
                      <ChevronRight className="size-4 text-[#8B949E] shrink-0" />
                    ) : (
                      <ChevronDown className="size-4 text-[#FF7A00] shrink-0" />
                    )}
                    <span className={`text-sm font-bold ${isSectionComplete ? 'text-[#3FB950]' : 'text-white'}`}>
                      {section.title}
                    </span>
                    {isSectionComplete ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3FB950]/20 text-[#3FB950] font-bold border border-[#3FB950]/40 flex items-center gap-1">
                        <Check className="size-3 stroke-[2.5]" />
                        <span>All {totalProblemsInSection} Solved</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#21262D] text-[#8B949E]">
                        {solvedProblemsInSection > 0 
                          ? `${solvedProblemsInSection}/${totalProblemsInSection} solved` 
                          : `${section.totalFiltered} problems`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    {isSectionComplete && (
                      <span className="hidden sm:inline-block text-[11px] font-bold text-[#3FB950] uppercase tracking-wider">
                        Completed
                      </span>
                    )}
                    <span className={isSectionComplete ? 'text-[#3FB950]' : 'text-[#8B949E]'}>
                      {isCollapsed ? 'Click to expand' : 'Collapse'}
                    </span>
                  </div>
                </button>

                {/* Section Content */}
                {!isCollapsed && (
                  <div className="p-2 sm:p-3 space-y-3">
                    
                    {/* Direct Section Problems */}
                    {section.problems && section.problems.length > 0 && (
                      <div className="divide-y divide-[#21262D]/60">
                        {section.problems.map((prob) => (
                          <ProblemRow 
                            key={prob.id || prob.slug} 
                            problem={prob} 
                            isSolved={isProblemSolved(prob.slug)}
                            onToggleSolved={() => toggleProblemSolvedAction(prob.slug)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Subsections if any */}
                    {section.subsections && section.subsections.map((subsec) => {
                      const subsecTotal = subsec.problems.length;
                      const subsecSolved = subsec.problems.filter(p => isProblemSolved(p.slug)).length;
                      const isSubsecComplete = subsecTotal > 0 && subsecSolved === subsecTotal;

                      return (
                        <div 
                          key={subsec.title} 
                          className={`mt-3 pl-2 sm:pl-3 border-l-2 space-y-1 transition-colors ${
                            isSubsecComplete ? 'border-[#3FB950]' : 'border-[#21262D]'
                          }`}
                        >
                          <div className={`text-xs font-mono font-bold py-1 flex items-center justify-between ${
                            isSubsecComplete ? 'text-[#3FB950]' : 'text-[#FF7A00]'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {isSubsecComplete ? (
                                <CheckCircle2 className="size-3.5 text-[#3FB950]" />
                              ) : (
                                <FolderOpen className="size-3.5" />
                              )}
                              <span>{subsec.title}</span>
                              <span className="text-[10px] text-[#8B949E]">({subsec.problems.length})</span>
                            </div>
                            {isSubsecComplete && (
                              <span className="text-[10px] text-[#3FB950] font-mono font-bold px-1.5 py-0.2 rounded bg-[#3FB950]/15">
                                Complete
                              </span>
                            )}
                          </div>
                          <div className="divide-y divide-[#21262D]/40">
                            {subsec.problems.map((prob) => (
                              <ProblemRow 
                                key={prob.id || prob.slug} 
                                problem={prob} 
                                isSolved={isProblemSolved(prob.slug)}
                                onToggleSolved={() => toggleProblemSolvedAction(prob.slug)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

/**
 * Individual problem row component
 */
function ProblemRow({ problem, isSolved, onToggleSolved }) {
  const diffBadgeColor = {
    Easy: 'bg-[#3FB950]/10 text-[#3FB950] border-[#3FB950]/20',
    Medium: 'bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
  }[problem.difficulty] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <div className="py-2.5 px-2 rounded-lg hover:bg-[#161B22]/60 transition-colors flex items-center justify-between gap-3 group">
      
      {/* Left: Solved Checkbox & Title */}
      <div className="flex items-center gap-3 min-w-0">
        
        {/* Toggle Solved Button */}
        <button
          type="button"
          onClick={onToggleSolved}
          title={isSolved ? "Mark as unsolved" : "Mark as solved"}
          className="text-[#8B949E] hover:text-[#3FB950] transition-colors cursor-pointer shrink-0"
        >
          {isSolved ? (
            <CheckCircle2 className="size-4 text-[#3FB950]" />
          ) : (
            <Circle className="size-4 text-[#30363D] group-hover:text-[#8B949E]" />
          )}
        </button>

        {/* Title & Platform */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={safeUrl(problem.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs sm:text-sm font-mono hover:text-[#FF7A00] transition-colors inline-flex items-center gap-1 truncate ${
                isSolved ? 'text-[#8B949E] line-through' : 'text-[#C9D1D9] font-medium'
              }`}
            >
              <span>{problem.title}</span>
              <ExternalLink className="size-3 text-[#8B949E] opacity-60 group-hover:opacity-100" />
            </a>

            {problem.platform && problem.platform !== 'LeetCode' && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#21262D] text-[#8B949E]">
                {problem.platform}
              </span>
            )}

            {problem.important && (
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ★ Must Do
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Difficulty & Resource Actions */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Difficulty Pill */}
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${diffBadgeColor}`}>
          {problem.difficulty}
        </span>

        {/* Video Tutorial Link */}
        {problem.youtube && problem.youtube.length > 0 && (
          <a
            href={safeUrl(Array.isArray(problem.youtube) ? problem.youtube[0].url : problem.youtube)}
            target="_blank"
            rel="noopener noreferrer"
            title="Watch Video Tutorial"
            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-[#21262D] transition-colors hidden sm:inline-flex"
          >
            <Play className="size-3.5" />
          </a>
        )}

      </div>

    </div>
  );
}
