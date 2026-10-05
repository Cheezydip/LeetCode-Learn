import React, { useRef, useState } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { calculateProfileRank, calculateTrajectory, eloToWorldwideRank, getProblemBreakdown } from '../lib/elo-math';
import { Calculator, Sparkles } from 'lucide-react';

export const GrowthPage = () => {
  const {
    contestElo,
    profileRank,
    chartMode,
    setChartMode,
    volume,
    setVolume,
    horizon,
    setHorizon,
  } = useProfileStore();

  const [scrubDay, setScrubDay] = useState(Math.round(horizon * 0.5));
  const [isHovering, setIsHovering] = useState(false);
  const svgRef = useRef(null);

  const startElo = contestElo || 1842;
  const actualProfileRank = profileRank || null;
  const trajectory = calculateTrajectory(startElo, volume, horizon, 10, actualProfileRank);
  const breakdown = getProblemBreakdown(volume, horizon);

  // Scrubber: interpolate from real trajectory points
  const activeDay = scrubDay ?? Math.round(horizon * 0.5);
  const progress = Math.max(0, Math.min(horizon, activeDay)) / horizon;
  const clampedX = 48 + progress * 552;

  // Interpolate rating from trajectory points (real Elo engine output)
  const pts = trajectory.trajectoryPoints || [];
  const interpolateRating = (day) => {
    if (!pts.length) return startElo;
    if (day <= pts[0].day) return pts[0].rating;
    if (day >= pts[pts.length - 1].day) return pts[pts.length - 1].rating;
    for (let i = 0; i < pts.length - 1; i++) {
      if (day >= pts[i].day && day <= pts[i + 1].day) {
        const t = (day - pts[i].day) / (pts[i + 1].day - pts[i].day);
        return Math.round(pts[i].rating + t * (pts[i + 1].rating - pts[i].rating));
      }
    }
    return pts[pts.length - 1].rating;
  };

  const dayElo = interpolateRating(activeDay);
  const startRank = eloToWorldwideRank(startElo);
  const dayRank = eloToWorldwideRank(dayElo);
  const startProfileRank = actualProfileRank || 185420;
  const projectedProfileRank = calculateProfileRank(trajectory.currentProjectedElo, volume, horizon, startProfileRank);
  const dayProgress = Math.max(0, Math.min(1, activeDay / horizon));
  const dayProfileRank = Math.round(startProfileRank - (startProfileRank - projectedProfileRank) * dayProgress);

  // Dynamic range & Y-coordinate mapper for active chartMode
  const rankRange = Math.max(10000, Math.round((startProfileRank - projectedProfileRank) * 1.3));
  const topProfileRank = Math.max(1, startProfileRank - rankRange);

  const getY = (val) => {
    if (chartMode === 'elo') {
      return Math.round(190 - Math.max(0, Math.min(1, (val - 1500) / 700)) * 170);
    }
    if (chartMode === 'rank') {
      return Math.round(190 - Math.max(0, Math.min(1, (50000 - val) / 49000)) * 170);
    }
    return Math.round(180 - Math.max(0, Math.min(1, (startProfileRank - val) / Math.max(1, startProfileRank - topProfileRank))) * 155);
  };

  const dayVal = chartMode === 'elo' ? dayElo : chartMode === 'rank' ? dayRank : dayProfileRank;
  const dayY = getY(dayVal);

  const startVal = chartMode === 'elo' ? startElo : chartMode === 'rank' ? startRank : startProfileRank;
  const y0 = getY(startVal);

  const val25 = chartMode === 'elo'
    ? interpolateRating(horizon * 0.25)
    : chartMode === 'rank'
    ? eloToWorldwideRank(interpolateRating(horizon * 0.25))
    : Math.round(startProfileRank - (startProfileRank - projectedProfileRank) * 0.25);
  const y15 = getY(val25);

  const val50 = chartMode === 'elo'
    ? interpolateRating(horizon * 0.50)
    : chartMode === 'rank'
    ? eloToWorldwideRank(interpolateRating(horizon * 0.50))
    : Math.round(startProfileRank - (startProfileRank - projectedProfileRank) * 0.50);
  const y30 = getY(val50);

  const val75 = chartMode === 'elo'
    ? interpolateRating(horizon * 0.75)
    : chartMode === 'rank'
    ? eloToWorldwideRank(interpolateRating(horizon * 0.75))
    : Math.round(startProfileRank - (startProfileRank - projectedProfileRank) * 0.75);
  const y45 = getY(val75);

  const endVal = chartMode === 'elo'
    ? trajectory.currentProjectedElo
    : chartMode === 'rank'
    ? trajectory.projectedRank
    : projectedProfileRank;
  const yEnd = getY(endVal);

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * 620;
    const clampedSvgX = Math.max(48, Math.min(600, svgX));
    const dayRatio = (clampedSvgX - 48) / 552;
    const day = Math.round(dayRatio * horizon);
    setScrubDay(day);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setScrubDay(Math.round(horizon * 0.5));
  };

  return (
    <div className="space-y-8 animate-fade-slide-up">
      
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
            <span>MODULE 02</span>
            <span>//</span>
            <span>PREDICTIVE GROWTH SIMULATOR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F0F6FC] animate-heading-reveal">
            Algorithmic Trajectory & Rank Forecasting
          </h1>
          <p className="text-xs text-[#8B949E] font-mono mt-1">
            Simulate contest rating momentum, worldwide contest rank gains, and platform-wide profile rank velocity.
          </p>
        </div>

        {/* Global Chart Mode Switcher */}
        <div className="inline-flex rounded-lg border border-[#21262D] p-1 bg-[#0D1117] text-xs font-mono self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('elo')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              chartMode === 'elo'
                ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/20'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Contest Rating
          </button>
          <button
            type="button"
            onClick={() => setChartMode('rank')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              chartMode === 'rank'
                ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/20'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Contest Rank
          </button>
          <button
            type="button"
            onClick={() => setChartMode('profile')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              chartMode === 'profile'
                ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/20'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Profile Rank
          </button>
        </div>
      </div>

      {/* Main Layout (8 cols simulator + 4 cols intake ledger) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* SIMULATOR CANVAS & CONTROLS (8 Cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-5">
          
          {/* Header Controls & Telemetry */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#21262D]">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#FF7A00]" />
                <h3 className="font-bold text-sm text-[#F0F6FC] font-mono">
                  {horizon}-Day{' '}
                  {chartMode === 'elo'
                    ? 'Rating Projection'
                    : chartMode === 'rank'
                    ? 'Contest Rank Forecast'
                    : 'Global Profile Rank Forecast'}
                </h3>
              </div>
              <p className="text-[11px] text-[#8B949E] font-mono mt-0.5">
                {chartMode === 'elo'
                  ? 'Contest rating trajectory modeled with spaced repetition volume.'
                  : chartMode === 'rank'
                  ? 'Active contest leaderboard advancement across 50,000+ contestants.'
                  : 'Platform-wide profile score leap modeled across 5,000,000+ registered accounts.'}
              </p>
            </div>

            {/* Time Horizon Selector Chips */}
            <div className="inline-flex rounded-lg border border-[#21262D] p-0.5 bg-[#161B22] text-[11px] font-mono">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setHorizon(d)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    horizon === d ? 'bg-[#FF7A00] text-black' : 'text-[#8B949E] hover:text-white'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          {/* Controls Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#090C10] border border-[#21262D] space-y-4 font-mono text-xs shadow-inner">
            
            {/* Projected Stats Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-[#8B949E] uppercase tracking-wider">
                  {horizon}-Day{' '}
                  {chartMode === 'elo'
                    ? 'Projected Rating'
                    : chartMode === 'rank'
                    ? 'Projected Contest Rank'
                    : 'Projected Profile Rank'}
                </div>
                <div className="text-xl font-bold text-[#F0F6FC]">
                  {chartMode === 'elo'
                    ? `${trajectory.currentProjectedElo.toLocaleString()} Rating`
                    : chartMode === 'rank'
                    ? `#${trajectory.projectedRank.toLocaleString()}`
                    : `#${trajectory.projectedProfileRank.toLocaleString()}`}
                </div>
              </div>

              <div className="flex items-center gap-5 text-right">
                <div>
                  <div className="text-[10px] text-[#8B949E] uppercase tracking-wider">Advancement</div>
                  <div className="text-xs font-bold text-[#FF7A00]">
                    {chartMode === 'elo'
                      ? `+${trajectory.deltaElo} pts (${trajectory.currentProjectedElo >= 2150 ? 'Guardian Tier' : 'Knight Tier'})`
                      : chartMode === 'rank'
                      ? `+${trajectory.rankPositionsGained.toLocaleString()} spots`
                      : `+${trajectory.profileGain.toLocaleString()} spots`}
                  </div>
                </div>
                <div className="pl-4 border-l border-[#21262D]">
                  <div className="text-[10px] text-[#8B949E] uppercase tracking-wider">Effort</div>
                  <div className="text-xs font-bold text-[#F0F6FC]">
                    {volume <= 4 ? '~20 min/day' : volume <= 8 ? '~40 min/day' : volume <= 14 ? '~75 min/day' : '~1h 45m/day'}
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Volume Slider */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8B949E] font-semibold uppercase tracking-wider">Practice Volume</span>
                <span className="text-base font-bold text-[#FF7A00]">{volume} <span className="text-[11px] text-[#8B949E] font-normal">problems / week</span></span>
              </div>

              {/* Slider Track */}
              <div className="relative pt-1 pb-6">
                <div className="relative h-2 rounded-full bg-[#161B22] border border-[#21262D]">
                  {/* Fill */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF9A40] transition-all duration-100"
                    style={{ width: `${((volume - 4) / 16) * 100}%` }}
                  />
                  {/* Thumb indicator */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-5 rounded-full bg-[#FF7A00] border-2 border-[#F0F6FC] shadow-lg shadow-[#FF7A00]/30 transition-all duration-100 pointer-events-none"
                    style={{ left: `${((volume - 4) / 16) * 100}%` }}
                  />
                </div>
                {/* Invisible native input over the track */}
                <input
                  type="range"
                  min={4}
                  max={20}
                  step={1}
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  className="absolute inset-x-0 top-0 w-full h-5 opacity-0 cursor-ew-resize z-10"
                  style={{ marginTop: '1px' }}
                />
                {/* Snap-point labels */}
                <div className="absolute inset-x-0 top-6 flex justify-between select-none text-[10px]">
                  {[
                    { val: 4, label: 'Casual' },
                    { val: 8, label: 'Standard' },
                    { val: 12, label: 'Focused' },
                    { val: 16, label: 'Sprint' },
                    { val: 20, label: 'Intensive' },
                  ].map((tick) => (
                    <button
                      key={tick.val}
                      type="button"
                      onClick={() => setVolume(tick.val)}
                      className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer min-w-[48px] ${
                        volume === tick.val ? 'text-[#FF7A00]' : 'text-[#484F58] hover:text-[#8B949E]'
                      }`}
                    >
                      <span className={`text-[11px] font-bold ${volume === tick.val ? 'text-[#FF7A00]' : 'text-[#6E7681]'}`}>{tick.val}</span>
                      <span className="font-medium">{tick.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Compact Telemetry Row */}
            <div className="pt-3 border-t border-[#21262D] flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[#8B949E]">
              <span>
                <span className="text-[#484F58] text-[9px] uppercase tracking-wider mr-1.5">Rank:</span>
                <strong className="text-[#FF7A00]">#{startRank.toLocaleString()} → #{trajectory.projectedRank.toLocaleString()}</strong>
              </span>
              <span>
                <span className="text-[#484F58] text-[9px] uppercase tracking-wider mr-1.5">Standing:</span>
                <strong className="text-white">
                  {chartMode === 'profile'
                    ? `Top ${((startProfileRank / 5000000) * 100).toFixed(1)}% → ${((projectedProfileRank / 5000000) * 100).toFixed(1)}%`
                    : volume <= 8 ? 'Top 5.5% → 2.5%' : 'Top 5.5% → 0.8%'}
                </strong>
              </span>
              <span>
                <span className="text-[#484F58] text-[9px] uppercase tracking-wider mr-1.5">Upsolves:</span>
                <strong className="text-[#F0F6FC]">+2 / biweek</strong>
              </span>
            </div>

          </div>

          {/* SVG FORECAST CHART WITH SCRUBBER */}
          <div className="relative h-64 w-full pt-2 select-none">
            
            {/* Scrubber Tooltip */}
            {(isHovering || scrubDay !== null) && (
              <div
                className="absolute pointer-events-none bg-[#161B22] border border-[#FF7A00] px-3.5 py-2 rounded-lg text-[11px] font-mono shadow-2xl z-30 transform -translate-x-1/2 -translate-y-full transition-transform duration-75"
                style={{
                  left: `${(clampedX / 620) * 100}%`,
                  top: `${Math.max(10, (dayY / 220) * 100 - 6)}%`,
                }}
              >
                <div className="flex items-center justify-between gap-4 text-[#8B949E] text-[10px] pb-1 border-b border-[#21262D]">
                  <span className="font-bold text-[#F0F6FC]">Day {activeDay} / {horizon}</span>
                  <span className="text-[#FF7A00]">{Math.round((volume / 7) * activeDay)} Solved</span>
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-[#F0F6FC] font-bold text-sm">
                    {chartMode === 'elo'
                      ? `${dayElo.toLocaleString()} Rating`
                      : chartMode === 'rank'
                      ? `Rank #${dayRank.toLocaleString()}`
                      : `Profile #${dayProfileRank.toLocaleString()}`}
                  </span>
                  <span className="text-[#FF7A00] font-semibold text-xs">
                    {chartMode === 'elo'
                      ? `(+${dayElo - startElo} pts)`
                      : chartMode === 'rank'
                      ? `(+${Math.max(0, startRank - dayRank).toLocaleString()} spots)`
                      : `(+${Math.max(0, startProfileRank - dayProfileRank).toLocaleString()} spots)`}
                  </span>
                </div>
                <div className="text-[10px] text-[#8B949E] pt-0.5 font-semibold">
                  {chartMode === 'elo'
                    ? dayElo >= 2150 ? 'Guardian Tier (Top 1%)' : dayElo >= 1850 ? 'Knight Tier (Top 5%)' : 'Contender'
                    : chartMode === 'rank'
                    ? dayRank <= 1650 ? 'Top 0.8% Global · Guardian' : 'Top 5% Global · Knight'
                    : dayProfileRank <= 50000 ? 'Top 1.0% Platform · Hard Surge' : 'Top 2.5% Platform'}
                </div>
              </div>
            )}

            <svg
              ref={svgRef}
              className="w-full h-full overflow-visible cursor-crosshair"
              viewBox="0 0 620 220"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Guardian / Knight Tier Bands (for Contest Mode) */}
              {chartMode !== 'profile' && (
                <>
                  <rect x="48" y="15" width="552" height="22" fill="rgba(255, 122, 0, 0.04)" />
                  <line x1="48" y1="37" x2="600" y2="37" stroke="#FF7A00" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                  <text x="595" y="27" fill="#FF7A00" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">
                    GUARDIAN CUTOFF (2150+)
                  </text>

                  <rect x="48" y="37" width="552" height="68" fill="rgba(255, 255, 255, 0.01)" />
                  <line x1="48" y1="105" x2="600" y2="105" stroke="#F0F6FC" strokeWidth="1" strokeDasharray="3,3" opacity="0.25" />
                  <text x="595" y="99" fill="#8B949E" fontSize="8" fontFamily="monospace" textAnchor="end">
                    KNIGHT CUTOFF (1850)
                  </text>
                </>
              )}

              {/* Grid Lines */}
              <line x1="48" y1="20" x2="600" y2="20" stroke="#21262D" strokeDasharray="3,3" />
              <text x="42" y="23" fill="#6E7681" fontSize="9" fontFamily="monospace" textAnchor="end">
                {chartMode === 'elo' ? '2200' : chartMode === 'rank' ? '#1,100' : `#${topProfileRank.toLocaleString()}`}
              </text>

              <line x1="48" y1="65" x2="600" y2="65" stroke="#21262D" strokeDasharray="3,3" />
              <text x="42" y="68" fill="#6E7681" fontSize="9" fontFamily="monospace" textAnchor="end">
                {chartMode === 'elo' ? '2000' : chartMode === 'rank' ? '#4,500' : `#${Math.round(startProfileRank - rankRange * 0.75).toLocaleString()}`}
              </text>

              <line x1="48" y1="105" x2="600" y2="105" stroke="#21262D" strokeDasharray="3,3" />
              <text x="42" y="108" fill="#8B949E" fontSize="9" fontFamily="monospace" textAnchor="end">
                {chartMode === 'elo' ? '1850' : chartMode === 'rank' ? '#12,000' : `#${Math.round(startProfileRank - rankRange * 0.50).toLocaleString()}`}
              </text>

              <line x1="48" y1="145" x2="600" y2="145" stroke="#21262D" strokeDasharray="3,3" />
              <text x="42" y="148" fill="#6E7681" fontSize="9" fontFamily="monospace" textAnchor="end">
                {chartMode === 'elo' ? '1700' : chartMode === 'rank' ? '#25,000' : `#${Math.round(startProfileRank - rankRange * 0.25).toLocaleString()}`}
              </text>

              <line x1="48" y1="190" x2="600" y2="190" stroke="#21262D" strokeWidth="1" />
              <text x="42" y="193" fill="#6E7681" fontSize="9" fontFamily="monospace" textAnchor="end">
                {chartMode === 'elo' ? '1500' : chartMode === 'rank' ? '#50,000' : `#${startProfileRank.toLocaleString()}`}
              </text>

              {/* X-Axis Days */}
              <text x="48" y="208" fill="#8B949E" fontSize="9" fontFamily="monospace">Day 0</text>
              <text x="181" y="208" fill="#8B949E" fontSize="9" fontFamily="monospace">Day {Math.round(horizon * 0.25)}</text>
              <text x="317" y="208" fill="#8B949E" fontSize="9" fontFamily="monospace">Day {Math.round(horizon * 0.5)}</text>
              <text x="453" y="208" fill="#8B949E" fontSize="9" fontFamily="monospace">Day {Math.round(horizon * 0.75)}</text>
              <text x="575" y="208" fill="#8B949E" fontSize="9" fontFamily="monospace">Day {horizon}</text>

              {/* Baseline Plateau Curve */}
              <path d={`M 48 ${y0} C 180 ${y0}, 360 ${y0}, 600 ${y0}`} fill="none" stroke="#6E7681" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="595" y={Math.min(185, y0 + 15)} fill="#6E7681" fontSize="8" fontFamily="monospace" textAnchor="end">
                Baseline
              </text>

              {/* ±1σ Confidence Corridor (in Elo mode) */}
              {chartMode === 'elo' && trajectory.corridorPoints && trajectory.corridorPoints.length > 1 && (
                <>
                  <path
                    d={(() => {
                      const cp = trajectory.corridorPoints;
                      const upper = cp.map(p => `${p.x},${Math.max(20, p.upperY)}`).join(' L ');
                      const lower = [...cp].reverse().map(p => `${p.x},${Math.min(190, p.lowerY)}`).join(' L ');
                      return `M ${upper} L ${lower} Z`;
                    })()}
                    fill="rgba(255, 122, 0, 0.06)"
                    stroke="none"
                  />
                  <path
                    d={`M ${trajectory.corridorPoints.map(p => `${p.x},${Math.max(20, p.upperY)}`).join(' L ')}`}
                    fill="none"
                    stroke="#FF7A00"
                    strokeWidth="0.75"
                    strokeDasharray="2,3"
                    opacity={0.35}
                  />
                  <path
                    d={`M ${trajectory.corridorPoints.map(p => `${p.x},${Math.min(190, p.lowerY)}`).join(' L ')}`}
                    fill="none"
                    stroke="#FF7A00"
                    strokeWidth="0.75"
                    strokeDasharray="2,3"
                    opacity={0.35}
                  />
                </>
              )}

              {/* Area Fill */}
              <path
                d={`M 48 ${y0} C 181 ${y15}, 453 ${y45}, 600 ${yEnd} L 600 190 L 48 190 Z`}
                fill="rgba(255, 122, 0, 0.08)"
              />

              {/* Spline Curve */}
              <path
                d={`M 48 ${y0} C 181 ${y15}, 453 ${y45}, 600 ${yEnd}`}
                fill="none"
                stroke="#FF7A00"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Milestone Checkpoint Nodes */}
              <circle cx="48" cy={y0} r="4.5" fill="#FF7A00" stroke="#090C10" strokeWidth="2" />
              <circle cx="181" cy={y15} r="3.5" fill="#F0F6FC" stroke="#090C10" strokeWidth="1.5" />
              <circle cx="317" cy={y30} r="3.5" fill="#F0F6FC" stroke="#090C10" strokeWidth="1.5" />
              <circle cx="453" cy={y45} r="3.5" fill="#F0F6FC" stroke="#090C10" strokeWidth="1.5" />
              <circle cx="600" cy={yEnd} r="5.5" fill="#FF7A00" stroke="#F0F6FC" strokeWidth="2" />

              {/* Hover Scrubber Line & Dot */}
              <line
                x1={clampedX}
                y1="20"
                x2={clampedX}
                y2="190"
                stroke="#F0F6FC"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                opacity={0.9}
              />
              <circle cx={clampedX} cy={dayY} r="5.5" fill="#FF7A00" stroke="#F0F6FC" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex flex-wrap justify-between items-center text-[11px] font-mono text-[#8B949E] pt-2 border-t border-[#21262D]">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#FF7A00]" />
              <span>Hover to scrub • {trajectory.contestsSimulated || 0} contests simulated • ±{trajectory.confidence?.sigma || 0} pts confidence</span>
            </span>
            <span className="text-[#8B949E]">
              {chartMode === 'elo'
                ? 'Elo Engine: ERank = Σ P(opp > user) | m = √(ERank × ARank) | Damped δ'
                : chartMode === 'rank'
                ? 'Model: R(E) = 50,000 · (0.022)^((E - 1500)/700)^1.414'
                : 'Model: Density dR/dS = -c · R^1.25 | Calibrated against 5M+ LC accounts'}
            </span>
          </div>

        </div>

        {/* PROBLEM COMPOSITION & TYPES SOLVED LEDGER (4 Cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-2xl space-y-4 font-mono text-xs">
          
          <div className="pb-3 border-b border-[#21262D]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#F0F6FC] flex items-center gap-2">
                <Calculator className="size-4 text-[#FF7A00]" />
                <span>Problem Composition</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#161B22] text-[#FF7A00] font-bold border border-[#21262D]">
                {horizon}-DAY TARGET
              </span>
            </div>
            <p className="text-[11px] text-[#8B949E] mt-1">
              Optimized practice problem distribution required to sustain the modeled slope.
            </p>
          </div>

          {/* Difficulty Allocation Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-[#8B949E]">Intake Volume:</span>
              <span className="font-bold text-white">{breakdown.total} Problems</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#21262D]">
                <span className="text-[9px] uppercase text-[#8B949E] block">Easy</span>
                <span className="text-sm font-bold text-[#3FB950]">{breakdown.easy}</span>
                <span className="text-[9px] text-[#8B949E] block">25% warmup</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#21262D]">
                <span className="text-[9px] uppercase text-[#8B949E] block">Medium</span>
                <span className="text-sm font-bold text-[#FF7A00]">{breakdown.med}</span>
                <span className="text-[9px] text-[#8B949E] block">54% core</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#21262D]">
                <span className="text-[9px] uppercase text-[#8B949E] block">Hard</span>
                <span className="text-sm font-bold text-[#F85149]">{breakdown.hard}</span>
                <span className="text-[9px] text-[#8B949E] block">21% breakthrough</span>
              </div>
            </div>
          </div>

          {/* Topic Breakdown Distribution */}
          <div className="space-y-2 pt-2 border-t border-[#21262D]">
            <span className="text-[10px] uppercase text-[#8B949E] font-semibold tracking-wider block">
              Pattern Distribution
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center p-2 rounded bg-[#090C10] border border-[#21262D]">
                <span className="text-[#F0F6FC]">Dynamic Programming</span>
                <span className="font-bold text-[#FF7A00]">{breakdown.dp} solved</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-[#090C10] border border-[#21262D]">
                <span className="text-[#F0F6FC]">Graph Traversal / BFS / DFS</span>
                <span className="font-bold text-white">{breakdown.graph} solved</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-[#090C10] border border-[#21262D]">
                <span className="text-[#F0F6FC]">Sliding Window / 2-Pointers</span>
                <span className="font-bold text-white">{breakdown.windowP} solved</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-[#090C10] border border-[#21262D]">
                <span className="text-[#F0F6FC]">Monotonic Stack (Weak Spot)</span>
                <span className="font-bold text-[#FF7A00]">{breakdown.stack} solved</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-[#090C10] border border-[#21262D]">
                <span className="text-[#F0F6FC]">Binary Search Predicates</span>
                <span className="font-bold text-white">{breakdown.binsearch} solved</span>
              </div>
            </div>
          </div>

          {/* Impact Explainer Notice */}
          <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#21262D] space-y-1 text-[11px] leading-relaxed">
            <div className="text-[#F0F6FC] font-semibold flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#FF7A00]" />
              <span>
                {chartMode === 'profile'
                  ? 'Hard Problem Profile Velocity'
                  : chartMode === 'rank'
                  ? 'Contest Leaderboard Advancement'
                  : 'Contest Rating Calibration'}
              </span>
            </div>
            <p className="text-[#8B949E]">
              {chartMode === 'profile'
                ? `In your rank tier (#${startProfileRank.toLocaleString()}), solving ${breakdown.hard} Hards + ${breakdown.med} Meds advances your global profile rank by +${trajectory.profileGain.toLocaleString()} spots.`
                : chartMode === 'rank'
                ? `Active contest pool is ~50,000 contestants. Consistent practice builds contest pace, advancing your projected rank to #${trajectory.projectedRank.toLocaleString()}.`
                : `Allocating ${volume} probs/wk (${breakdown.hard} Hards + ${breakdown.med} Meds) builds algorithmic intuition, steadily projecting +${trajectory.deltaElo} Elo to reach ${trajectory.currentProjectedElo} Rating.`}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
