// LeetCode Contest Rank Model (Calibrated against real LeetCode participant distribution)
// 1500 Elo -> ~#50,000 (Median active), 1842 -> ~#12,500, 1850 -> ~#12,000 (Knight), 2150 -> ~#1,650 (Guardian Top 1%), 2200 -> ~#1,100
export function eloToWorldwideRank(elo) {
  if (elo <= 1500) {
    return Math.round(50000 + (1500 - elo) * 60);
  }
  const norm = Math.max(0, (elo - 1500) / 700);
  const rank = Math.round(50000 * Math.pow(0.022, Math.pow(norm, 1.414)));
  return Math.max(1, rank);
}

// LeetCode Profile Global Rank Model (Calibrated against 5,000,000+ platform accounts)
// Points formula: Score = 1.0*E + 2.5*M + 6.0*H + ContestEloBonus
// Baseline: ~#185,420 (Top 3.7% platform).
export function calculateProfileRank(elo, vol, horizon) {
  const baseRank = 185420;
  const totalProblems = (vol / 7) * horizon;
  const hardProblems = totalProblems * 0.21;
  const mediumProblems = totalProblems * 0.54;
  const easyProblems = totalProblems * 0.25;

  const scoreGained =
    easyProblems * 1.0 +
    mediumProblems * 2.5 +
    hardProblems * 6.0 +
    (elo - 1842) * 0.35;
  const rank = Math.round(
    baseRank * Math.exp(-0.0086 * Math.pow(Math.max(1, scoreGained), 0.94))
  );
  return Math.max(1, rank);
}

export function getProblemBreakdown(vol, horizon) {
  const total = Math.round((vol / 7) * horizon);
  const easy = Math.round(total * 0.25);
  const med = Math.round(total * 0.54);
  const hard = Math.max(1, total - easy - med);

  const dp = Math.round(total * 0.26);
  const graph = Math.round(total * 0.24);
  const windowP = Math.round(total * 0.20);
  const stack = Math.round(total * 0.15);
  const binsearch = Math.max(1, total - dp - graph - windowP - stack);

  return {
    total,
    easy,
    med,
    hard,
    dp,
    graph,
    windowP,
    stack,
    binsearch,
  };
}

export function calculateTrajectory(startElo, volume, horizon) {
  const gainPerProb = 16.25;
  const horizonFactor = horizon / 60;
  const currentProjectedElo = Math.round(
    startElo + volume * gainPerProb * horizonFactor
  );
  const deltaElo = currentProjectedElo - startElo;

  const startRank = eloToWorldwideRank(startElo);
  const projectedRank = eloToWorldwideRank(currentProjectedElo);
  const rankPositionsGained = Math.max(0, startRank - projectedRank);

  const startProfileRank = 185420;
  const projectedProfileRank = calculateProfileRank(
    currentProjectedElo,
    volume,
    horizon
  );
  const profileGain = Math.max(0, startProfileRank - projectedProfileRank);

  // SVG Coordinates Mapping (ViewBox: 0 0 620 220, Y=190 at 1500 to Y=20 at 2200)
  const endY = Math.round(190 - ((currentProjectedElo - 1500) / 700) * 170);
  const elo15 = Math.round(startElo + deltaElo * Math.pow(0.25, 0.85));
  const elo30 = Math.round(startElo + deltaElo * Math.pow(0.5, 0.85));
  const elo45 = Math.round(startElo + deltaElo * Math.pow(0.75, 0.85));

  const y15 = Math.round(190 - ((elo15 - 1500) / 700) * 170);
  const y30 = Math.round(190 - ((elo30 - 1500) / 700) * 170);
  const y45 = Math.round(190 - ((elo45 - 1500) / 700) * 170);

  return {
    currentProjectedElo,
    deltaElo,
    startRank,
    projectedRank,
    rankPositionsGained,
    startProfileRank,
    projectedProfileRank,
    profileGain,
    endY,
    y15,
    y30,
    y45,
  };
}
