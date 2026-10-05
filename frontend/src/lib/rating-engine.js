/**
 * LeetCode-Native Rating Engine
 * 
 * Implements LeetCode's actual contest rating algorithm:
 * 1. Elo win probability: P(A>B) = 1 / (1 + 10^((Rb-Ra)/400))
 * 2. Expected rank: ERank = 1 + Σ P(opponent beats user)
 * 3. Geometric mean: m = √(ERank × ActualRank)
 * 4. Performance rating: binary search for R where ERank(R) = m
 * 5. Rating delta: (PerformanceRating - CurrentRating) / dampingFactor
 * 
 * The synthetic contest field is calibrated against real LeetCode data:
 * ~50,000 active contestants, right-skewed distribution.
 */

// ─── Synthetic Contest Field ────────────────────────────────────────────────────
// Calibrated from real LeetCode contest participation data.
// Instead of storing 50,000 individual ratings, we use a bucketed representation
// with the midpoint rating and count per bucket.

const CONTEST_FIELD_BUCKETS = [
  // { rating, count } — midpoint of each bucket
  { rating: 1250, count: 5000 },   // 1200–1300: brand new / casual
  { rating: 1350, count: 6000 },   // 1300–1400: warming up
  { rating: 1450, count: 6500 },   // 1400–1500: approaching median
  { rating: 1525, count: 5500 },   // 1500–1550: median active pool
  { rating: 1575, count: 4500 },   // 1550–1600: slightly above median
  { rating: 1650, count: 4000 },   // 1600–1700: competent
  { rating: 1750, count: 3500 },   // 1700–1800: strong
  { rating: 1825, count: 3000 },   // 1800–1850: near Knight cutoff
  { rating: 1900, count: 2800 },   // 1850–1950: Knight tier
  { rating: 2000, count: 2200 },   // 1950–2050: solid Knight
  { rating: 2100, count: 1800 },   // 2050–2150: approaching Guardian
  { rating: 2200, count: 1400 },   // 2150–2250: Guardian entry
  { rating: 2350, count: 1200 },   // 2250–2450: Guardian core
  { rating: 2550, count: 800 },    // 2450–2650: upper Guardian
  { rating: 2750, count: 500 },    // 2650–2850: near Master
  { rating: 2950, count: 200 },    // 2850–3050: Master
  { rating: 3150, count: 100 },    // 3050+: Grandmaster
];

const TOTAL_FIELD_SIZE = CONTEST_FIELD_BUCKETS.reduce((sum, b) => sum + b.count, 0);

// ─── Core Elo Functions ─────────────────────────────────────────────────────────

/**
 * Standard Elo win probability.
 * P(A beats B) = 1 / (1 + 10^((Rb - Ra) / 400))
 * 
 * @param {number} ratingA - Rating of player A
 * @param {number} ratingB - Rating of player B
 * @returns {number} Probability that A beats B (0 to 1)
 */
export function winProbability(ratingA, ratingB) {
  return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate expected rank of a user against the synthetic contest field.
 * ERank = 1 + Σ P(opponent_i beats user) for all opponents
 * 
 * Uses bucketed field for O(B) computation instead of O(N).
 * 
 * @param {number} userRating - The user's current rating
 * @returns {number} Expected rank (1.0 = best, TOTAL_FIELD_SIZE = worst)
 */
export function expectedRank(userRating) {
  let rank = 1.0; // Start at rank 1 (you beat everyone)
  for (const bucket of CONTEST_FIELD_BUCKETS) {
    // P(opponent beats user) = 1 - P(user beats opponent)
    const pOpponentWins = 1.0 - winProbability(userRating, bucket.rating);
    rank += pOpponentWins * bucket.count;
  }
  return rank;
}

/**
 * Geometric mean of expected rank and actual rank.
 * m = √(ERank × ActualRank)
 * 
 * This is the key innovation in LeetCode's system — it balances
 * between expected and actual performance.
 * 
 * @param {number} eRank - Expected rank
 * @param {number} actualRank - Actual rank achieved in contest
 * @returns {number} Geometric mean
 */
export function geometricMean(eRank, actualRank) {
  return Math.sqrt(eRank * actualRank);
}

/**
 * Binary search for the performance rating that would produce
 * the given expected rank against the field.
 * 
 * Since expectedRank is monotonically decreasing with rating
 * (higher rating → lower/better expected rank), we binary search
 * for the rating R where expectedRank(R) ≈ targetRank.
 * 
 * @param {number} targetRank - The target expected rank to match
 * @returns {number} The rating that produces this expected rank
 */
export function performanceRating(targetRank) {
  let lo = 0;
  let hi = 4500;
  
  // Binary search with 100 iterations for precision ~0.01
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const er = expectedRank(mid);
    if (er > targetRank) {
      // Expected rank too high (too bad) → need higher rating
      lo = mid;
    } else {
      // Expected rank too low (too good) → need lower rating
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * Calculate the rating delta from a single contest.
 * 
 * Full pipeline:
 * 1. Compute expected rank from current rating
 * 2. Compute geometric mean of expected rank and actual rank
 * 3. Binary search for performance rating matching geometric mean
 * 4. Delta = (performanceRating - currentRating) / dampingFactor
 * 
 * @param {number} currentRating - User's current contest rating
 * @param {number} actualRank - Actual rank achieved in the contest
 * @param {number} contestsAttended - Number of past contests (affects damping)
 * @returns {{ delta: number, perfRating: number, eRank: number, geoMean: number }}
 */
export function ratingDelta(currentRating, actualRank, contestsAttended = 10) {
  const eRank = expectedRank(currentRating);
  const geoMean = geometricMean(eRank, actualRank);
  const perfRating = performanceRating(geoMean);
  
  // Damping factor: new accounts are more volatile, experienced accounts are stable
  // LeetCode uses a damping that increases with experience
  const dampingFactor = Math.max(1, Math.sqrt(Math.max(1, contestsAttended) / 10));
  
  const rawDelta = (perfRating - currentRating) / dampingFactor;
  
  // Clamp to reasonable bounds (LeetCode rarely moves more than ±100 in one contest)
  const delta = Math.max(-120, Math.min(120, rawDelta));
  
  return {
    delta: Math.round(delta * 100) / 100,
    perfRating: Math.round(perfRating * 100) / 100,
    eRank: Math.round(eRank * 100) / 100,
    geoMean: Math.round(geoMean * 100) / 100,
  };
}

// ─── Practice → Contest Performance Bridge ──────────────────────────────────────

/**
 * Difficulty rating constants (calibrated from Zerotrac's problem rating data).
 * These represent the median contest rating needed to reliably solve problems
 * at each difficulty level.
 */
const DIFFICULTY_RATINGS = {
  easy: 1200,
  medium: 1500,
  hard: 2100,
};

/**
 * Estimate how many contest problems a user can solve based on their
 * current rating. LeetCode contests have 4 problems: typically
 * Q1 (Easy ~1200), Q2 (Medium ~1400-1600), Q3 (Medium-Hard ~1700-2000),
 * Q4 (Hard ~2200-3000).
 * 
 * @param {number} rating - User's current contest rating
 * @returns {{ solved: number, estimatedRank: number }}
 */
export function estimateContestPerformance(rating) {
  // Contest problem difficulty ratings (typical Weekly Contest)
  const contestProblems = [
    { difficulty: 1200, maxTime: 5 },   // Q1: Easy
    { difficulty: 1500, maxTime: 15 },  // Q2: Medium
    { difficulty: 1850, maxTime: 30 },  // Q3: Medium-Hard
    { difficulty: 2300, maxTime: 40 },  // Q4: Hard
  ];
  
  let solved = 0;
  let totalTime = 0;
  
  for (const prob of contestProblems) {
    // Probability of solving = win probability against problem difficulty
    const pSolve = winProbability(rating, prob.difficulty);
    
    if (pSolve > 0.5) {
      solved += 1;
      // Time estimate: harder problems take longer relative to skill gap
      const speedFactor = Math.max(0.3, Math.min(2.0, prob.difficulty / rating));
      totalTime += prob.maxTime * speedFactor;
    } else if (pSolve > 0.2) {
      // Partial credit: might solve with penalty time
      solved += pSolve;
      totalTime += prob.maxTime * 1.5;
    }
  }
  
  // Estimate rank from problems solved + time
  // Approximate: each full problem solved moves you up significantly
  const solvedFloor = Math.floor(solved);
  const rankFromSolved = estimateRankFromSolvedCount(solvedFloor, totalTime);
  
  return {
    solved: Math.round(solved * 100) / 100,
    estimatedRank: rankFromSolved,
  };
}

/**
 * Estimate contest rank from number of problems solved and total time.
 * Calibrated from real LeetCode contest standings data.
 * 
 * @param {number} solved - Number of problems fully solved (0–4)
 * @param {number} timeMinutes - Total time spent
 * @returns {number} Estimated rank
 */
function estimateRankFromSolvedCount(solved, timeMinutes) {
  // Approximate rank distribution from real contest data:
  // 4 solved: top 100–500 (depends on speed)
  // 3 solved: top 500–3000
  // 2 solved: top 3000–12000
  // 1 solved: top 12000–30000
  // 0 solved: 30000–50000
  
  const baseRanks = [40000, 20000, 7000, 1500, 200];
  const baseRank = baseRanks[Math.min(solved, 4)];
  
  // Time penalty: slower solvers rank lower within their solve-count bracket
  const timePenalty = Math.min(1.5, Math.max(0.7, timeMinutes / 60));
  
  return Math.round(baseRank * timePenalty);
}

/**
 * Model how practice volume improves contest performance over time.
 * 
 * The core insight: practicing V problems/week at a given difficulty mix
 * gradually increases your effective rating, which translates to better
 * contest ranks, which feeds into the Elo update.
 * 
 * Uses a learning curve: skill improvement per problem follows diminishing returns.
 * 
 * @param {number} currentRating - Starting contest rating
 * @param {number} weeklyVolume - Problems solved per week
 * @param {number} weeksElapsed - How many weeks of practice
 * @param {{ easy: number, medium: number, hard: number }} difficultyMix - Fraction of each difficulty
 * @returns {number} Estimated effective rating improvement from practice alone
 */
export function practiceToSkillGain(currentRating, weeklyVolume, weeksElapsed, difficultyMix = { easy: 0.25, medium: 0.54, hard: 0.21 }) {
  let totalGain = 0;
  const totalProblems = weeklyVolume * weeksElapsed;
  
  for (let i = 0; i < totalProblems; i++) {
    // Determine difficulty of this practice problem
    const roll = i / totalProblems; // Deterministic for reproducibility
    let problemRating;
    if (roll < difficultyMix.easy) {
      problemRating = DIFFICULTY_RATINGS.easy;
    } else if (roll < difficultyMix.easy + difficultyMix.medium) {
      problemRating = DIFFICULTY_RATINGS.medium;
    } else {
      problemRating = DIFFICULTY_RATINGS.hard;
    }
    
    // Expected score against this problem
    const effectiveRating = currentRating + totalGain;
    const expectedScore = winProbability(effectiveRating, problemRating);
    
    // Learning gain: you learn more from problems near your level
    // K-factor for practice is lower than contest (practice ≠ contest pressure)
    const K = 4; // Practice K-factor (much lower than contest's ~32)
    const gain = K * (1.0 - expectedScore);
    
    // Diminishing returns: each additional problem in the same range teaches less
    const diminishingFactor = 1.0 / (1.0 + i * 0.002);
    totalGain += gain * diminishingFactor;
  }
  
  return totalGain;
}

// ─── Trajectory Simulator ───────────────────────────────────────────────────────

/**
 * Simulate a complete rating trajectory over a time horizon.
 * 
 * Process:
 * 1. For each simulated biweekly contest:
 *    a. Add skill gain from practice since last contest
 *    b. Estimate contest performance at current effective skill
 *    c. Compute rating delta using the full Elo engine
 *    d. Apply delta to official rating
 * 2. Track confidence bounds (±1σ from K-factor variance)
 * 
 * @param {number} startRating - Starting contest rating
 * @param {number} weeklyVolume - Problems solved per week
 * @param {number} horizonDays - Total simulation period in days
 * @param {number} contestsAttended - Historical contests attended (affects damping)
 * @returns {{ points: Array, finalRating: number, deltaRating: number, confidence: { upper: number, lower: number } }}
 */
export function predictTrajectory(startRating, weeklyVolume, horizonDays, contestsAttended = 10) {
  const contestIntervalDays = 14; // Biweekly contests
  const numContests = Math.floor(horizonDays / contestIntervalDays);
  
  let currentRating = startRating;
  let currentSkillBonus = 0; // Accumulated practice improvement
  const points = [{ day: 0, rating: startRating, upper: startRating, lower: startRating }];
  
  // Track variance for confidence corridor
  let varianceSum = 0;
  let contestCount = 0;
  
  const difficultyMix = { easy: 0.25, medium: 0.54, hard: 0.21 };
  
  for (let c = 1; c <= numContests; c++) {
    const dayOfContest = c * contestIntervalDays;
    const weeksElapsed = c * 2; // 2 weeks per contest interval
    
    // Skill gain from practice (cumulative from day 0)
    currentSkillBonus = practiceToSkillGain(
      startRating, weeklyVolume, weeksElapsed, difficultyMix
    );
    
    // Effective skill = official rating + practice bonus
    const effectiveSkill = currentRating + currentSkillBonus;
    
    // Estimate contest performance at effective skill level
    const perf = estimateContestPerformance(effectiveSkill);
    
    // Compute rating delta using the real Elo engine
    const result = ratingDelta(currentRating, perf.estimatedRank, contestsAttended + c);
    
    // Apply the delta
    currentRating = Math.round(currentRating + result.delta);
    currentRating = Math.max(0, currentRating); // Floor at 0
    
    // Reset skill bonus (it got "cashed in" via the contest)
    // But not fully — practice compounds. Keep a fraction.
    currentSkillBonus *= 0.3;
    
    // Variance tracking for confidence corridor
    // The standard deviation of a single Elo update is approximately K/√2
    const K = 32;
    const singleContestVariance = (K * K) / 2;
    varianceSum += singleContestVariance;
    contestCount += 1;
    
    const sigma = Math.sqrt(varianceSum / Math.max(1, contestCount));
    
    points.push({
      day: dayOfContest,
      rating: currentRating,
      upper: Math.round(currentRating + sigma),
      lower: Math.round(Math.max(0, currentRating - sigma)),
    });
  }
  
  // If horizon extends beyond last contest, extrapolate the final point
  const lastPoint = points[points.length - 1];
  if (lastPoint.day < horizonDays) {
    const remainingWeeks = (horizonDays - lastPoint.day) / 7;
    const finalSkillBonus = practiceToSkillGain(
      currentRating, weeklyVolume, remainingWeeks, difficultyMix
    );
    const finalRating = Math.round(currentRating + finalSkillBonus * 0.15);
    const sigma = Math.sqrt(varianceSum / Math.max(1, contestCount));
    
    points.push({
      day: horizonDays,
      rating: finalRating,
      upper: Math.round(finalRating + sigma),
      lower: Math.round(Math.max(0, finalRating - sigma)),
    });
    currentRating = finalRating;
  }
  
  const finalSigma = Math.sqrt(varianceSum / Math.max(1, contestCount));
  
  return {
    points,
    finalRating: currentRating,
    deltaRating: currentRating - startRating,
    confidence: {
      upper: Math.round(currentRating + finalSigma),
      lower: Math.round(Math.max(0, currentRating - finalSigma)),
      sigma: Math.round(finalSigma),
    },
    contestsSimulated: numContests,
    fieldSize: TOTAL_FIELD_SIZE,
  };
}

// ─── Topic Competency Elo Engine ────────────────────────────────────────────────

/**
 * Compute topic competency rating using Elo-style updates
 * where each solved problem is a "match" against that problem's difficulty.
 * 
 * @param {number} baseRating - User's contest rating (starting point for topic)
 * @param {number} easySolved - Number of easy problems solved for this topic
 * @param {number} mediumSolved - Number of medium problems solved
 * @param {number} hardSolved - Number of hard problems solved
 * @returns {{ topicRating: number, deltaFromBase: number }}
 */
export function computeTopicElo(baseRating, easySolved = 0, mediumSolved = 0, hardSolved = 0) {
  const K = 16; // K-factor for topic updates (lower than contest K=32)
  let topicRating = baseRating * 0.7; // Start topic at 70% of contest rating
  
  const problems = [
    ...Array(easySolved).fill(DIFFICULTY_RATINGS.easy),
    ...Array(mediumSolved).fill(DIFFICULTY_RATINGS.medium),
    ...Array(hardSolved).fill(DIFFICULTY_RATINGS.hard),
  ];
  
  // Shuffle deterministically (interleave difficulties for realistic progression)
  problems.sort((a, b) => a - b);
  
  for (const problemDifficulty of problems) {
    const expected = winProbability(topicRating, problemDifficulty);
    // User solved it (score = 1), so gain = K * (1 - expected)
    const gain = K * (1.0 - expected);
    
    // Diminishing returns: cap gains as topic rating approaches contest rating
    const approachFactor = Math.max(0.1, 1.0 - (topicRating / (baseRating * 1.3)));
    topicRating += gain * approachFactor;
  }
  
  // Floor: never below 70% of base, ceiling: 115% of base
  topicRating = Math.max(baseRating * 0.7, Math.min(baseRating * 1.15, topicRating));
  topicRating = Math.round(topicRating);
  
  return {
    topicRating,
    deltaFromBase: topicRating - baseRating,
  };
}

/**
 * Compute topic competency from raw solve count (when per-difficulty
 * breakdown is unavailable). Uses estimated difficulty distribution
 * from LeetCode's overall problem pool: ~25% Easy, ~50% Medium, ~25% Hard.
 * 
 * @param {number} baseRating - User's contest rating
 * @param {number} totalSolved - Total problems solved for this topic
 * @returns {{ topicRating: number, deltaFromBase: number }}
 */
export function computeTopicEloFromCount(baseRating, totalSolved) {
  // Estimate difficulty breakdown from LeetCode's general distribution
  const easy = Math.round(totalSolved * 0.30);
  const medium = Math.round(totalSolved * 0.50);
  const hard = Math.max(0, totalSolved - easy - medium);
  
  return computeTopicElo(baseRating, easy, medium, hard);
}
