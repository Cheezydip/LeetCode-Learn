/**
 * LeetCode Topic Normalizer Service
 * 
 * Separates every topic into an individual, first-class competency dimension
 * (e.g. Sliding Window is separate, Two Pointers is separate, Prefix Sum is separate,
 * Linked List is separate, Stack is separate, Queue is separate, etc.).
 * 
 * Algorithm: Z-Score Relative Deficit Detection across all evaluated topics:
 * - Computes mean and standard deviation of solve counts across all topics
 * - Topics with z-score < -1.0 (>1σ below user's own average) are flagged as relative deficits
 * - Topics with < 5 problems solved are flagged as "undertrained"
 * - Topic Elo is computed relative to base contest Elo based on solve volume
 */

const fs = require('fs');
const path = require('path');

const TOPIC_LIST_PATH = path.join(__dirname, '..', 'data', 'topicList.json');

// Category mapping helper
const CATEGORY_MAP = {
  // Algorithms
  'dynamic-programming': 'Algorithms',
  'binary-search': 'Algorithms',
  'greedy': 'Algorithms',
  'backtracking': 'Algorithms',
  'divide-and-conquer': 'Algorithms',
  'recursion': 'Algorithms',
  'sorting': 'Algorithms',
  'quickselect': 'Algorithms',

  // Data Structures
  'array': 'Data Structures',
  'string': 'Data Structures',
  'hash-table': 'Data Structures',
  'linked-list': 'Data Structures',
  'doubly-linked-list': 'Data Structures',
  'stack': 'Data Structures',
  'queue': 'Data Structures',
  'monotonic-stack': 'Data Structures',
  'monotonic-queue': 'Data Structures',
  'tree': 'Data Structures',
  'binary-tree': 'Data Structures',
  'binary-search-tree': 'Data Structures',
  'trie': 'Data Structures',
  'heap-priority-queue': 'Data Structures',
  'segment-tree': 'Data Structures',
  'binary-indexed-tree': 'Data Structures',
  'union-find': 'Data Structures',
  'ordered-set': 'Data Structures',
  'data-stream': 'Data Structures',

  // Techniques
  'sliding-window': 'Techniques',
  'two-pointers': 'Techniques',
  'prefix-sum': 'Techniques',
  'bit-manipulation': 'Techniques',
  'bitmask': 'Techniques',
  'memoization': 'Techniques',
  'rolling-hash': 'Techniques',
  'simulation': 'Techniques',
  'counting': 'Techniques',
  'enumeration': 'Techniques',
  'string-matching': 'Techniques',
  'hash-function': 'Techniques',
  'randomized': 'Techniques',
  'brainteaser': 'Techniques',
  'design': 'Techniques',

  // Graphs
  'graph': 'Graphs',
  'breadth-first-search': 'Graphs',
  'depth-first-search': 'Graphs',
  'topological-sort': 'Graphs',
  'shortest-path': 'Graphs',
  'minimum-spanning-tree': 'Graphs',
  'eulerian-circuit': 'Graphs',

  // Math & Analysis
  'math': 'Math',
  'number-theory': 'Math',
  'combinatorics': 'Math',
  'geometry': 'Math',
  'game-theory': 'Math',
};

// Known tag aliases for LeetCode slug variations
const TAG_ALIASES = {
  'heap': 'heap-priority-queue',
  'priority-queue': 'heap-priority-queue',
  'heaps': 'heap-priority-queue',
  'sweep-line': 'line-sweep',
  'line-sweep': 'line-sweep',
  'bipartite': 'graph',
  'trees': 'tree',
  'graphs': 'graph',
  'dp': 'dynamic-programming',
  'binsearch': 'binary-search',
  'window': 'sliding-window',
  'monostack': 'monotonic-stack',
};

/**
 * Load all topics from topicList.json
 */
function getTopicRegistry() {
  try {
    const raw = fs.readFileSync(TOPIC_LIST_PATH, 'utf-8');
    const list = JSON.parse(raw);
    const registry = {};

    for (const item of list) {
      registry[item.key] = {
        key: item.key,
        label: item.name,
        tagSlug: item.tagSlug,
        catalogKey: item.key,
        category: CATEGORY_MAP[item.key] || 'General',
        description: item.description,
      };
    }

    return registry;
  } catch (err) {
    console.error('[Normalizer] Error loading topicList.json:', err.message);
    return {};
  }
}

const UNDERTRAINED_THRESHOLD = 5;  // Under 5 problems solved is undertrained
const DEFICIT_Z_THRESHOLD = -1.0;  // >1σ below user's own average

/**
 * Normalizes raw tag problem counters into separate topic metrics for all topics
 * using Z-score relative deficit detection and Elo-style difficulty-weighted
 * competency rating.
 * 
 * Topic Competency Algorithm:
 * - Each solved problem is a "match" against a problem of known difficulty
 * - Uses Elo win probability: E = 1 / (1 + 10^((Rd - Ru) / 400))
 * - Rating update: topicRating += K * (1 - E) per solved problem
 * - Difficulty ratings: Easy ≈ 1200, Medium ≈ 1500, Hard ≈ 2100
 * 
 * @param {Array} rawTags Array of { tagName, tagSlug, problemsSolved }
 * @param {number} baseElo The user's contest Elo rating (default 1500)
 */
function normalizeTopicMetrics(rawTags = [], baseElo = 1500) {
  const registry = getTopicRegistry();
  const tagMap = new Map();

  // Populate map with user's solved counts
  for (const item of rawTags) {
    if (item.tagSlug) {
      const slug = item.tagSlug.toLowerCase();
      const count = item.problemsSolved || 0;
      tagMap.set(slug, count);

      // Also map through known aliases
      if (TAG_ALIASES[slug]) {
        tagMap.set(TAG_ALIASES[slug], count);
      }
    }
  }

  // Ensure any topic in rawTags not in registry is still included dynamically
  for (const item of rawTags) {
    const slug = (item.tagSlug || '').toLowerCase();
    const key = TAG_ALIASES[slug] || slug;
    if (key && !registry[key]) {
      registry[key] = {
        key,
        label: item.tagName || key,
        tagSlug: slug,
        catalogKey: key,
        category: CATEGORY_MAP[key] || 'General',
        description: `Problems and patterns related to ${item.tagName || key}.`,
      };
    }
  }

  const topicEntries = Object.entries(registry);
  const solveCounts = [];

  // Stage 1: Collect solve counts per topic
  for (const [, topic] of topicEntries) {
    const count = tagMap.get(topic.tagSlug.toLowerCase()) || 0;
    solveCounts.push(count);
  }

  // Stage 2: Compute mean and standard deviation across all topics
  const n = solveCounts.length || 1;
  const mean = solveCounts.reduce((sum, c) => sum + c, 0) / n;
  const variance = solveCounts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);

  // Stage 3: Score each topic with Z-score and Elo-style competency rating
  const normalized = {};

  topicEntries.forEach(([key, topic], i) => {
    const solvedCount = solveCounts[i];

    // Z-score: standard deviations relative to user's own mean
    const zScore = stddev > 0 ? (solvedCount - mean) / stddev : 0;

    // Deficit detection:
    // 1. Relative deficit: z-score < -1.0 (significantly below user's own average)
    // 2. Absolute undertrained: fewer than 5 problems solved
    const isRelativeDeficit = zScore < DEFICIT_Z_THRESHOLD;
    const isUndertrained = solvedCount < UNDERTRAINED_THRESHOLD;
    const isDeficit = isRelativeDeficit || isUndertrained;

    // Topic Competency Rating: Elo-style difficulty-weighted updates
    // Each solved problem is a "match" against a problem difficulty
    // Since we don't have per-topic difficulty breakdowns, we estimate
    // the distribution from LeetCode's general pool: ~30% Easy, 50% Medium, 20% Hard
    const topicElo = computeTopicCompetencyElo(baseElo, solvedCount);
    const deficitDelta = topicElo - baseElo;

    normalized[key] = {
      key,
      label: topic.label,
      catalogKey: topic.catalogKey,
      category: topic.category,
      description: topic.description,
      problemsSolved: solvedCount,
      competencyElo: topicElo,
      zScore: Math.round(zScore * 100) / 100,
      deficitDelta,
      isDeficit,
      isUndertrained,
    };
  });

  return normalized;
}

/**
 * Compute topic competency rating using Elo-style updates.
 * Each solved problem is treated as a "win" against a problem of
 * estimated difficulty, using the standard Elo expected-score formula.
 * 
 * Difficulty ratings (from Zerotrac's calibrated data):
 *   Easy   ≈ 1200
 *   Medium ≈ 1500
 *   Hard   ≈ 2100
 * 
 * @param {number} baseElo - User's contest rating (anchor point)
 * @param {number} totalSolved - Total problems solved for this topic
 * @returns {number} Topic competency Elo rating
 */
function computeTopicCompetencyElo(baseElo, totalSolved) {
  if (totalSolved === 0) {
    // No data → floor at 70% of contest rating
    return Math.round(baseElo * 0.70);
  }

  const DIFFICULTY_EASY = 1200;
  const DIFFICULTY_MEDIUM = 1500;
  const DIFFICULTY_HARD = 2100;
  const K = 16; // K-factor per solved problem (moderate learning rate)

  // Estimate difficulty distribution (LeetCode general pool)
  const easy = Math.round(totalSolved * 0.30);
  const medium = Math.round(totalSolved * 0.50);
  const hard = Math.max(0, totalSolved - easy - medium);

  // Start topic rating at 70% of contest rating
  let topicRating = baseElo * 0.70;

  // Build sorted problem list (easy → medium → hard progression)
  const problems = [
    ...Array(easy).fill(DIFFICULTY_EASY),
    ...Array(medium).fill(DIFFICULTY_MEDIUM),
    ...Array(hard).fill(DIFFICULTY_HARD),
  ];

  for (let i = 0; i < problems.length; i++) {
    const problemDifficulty = problems[i];

    // Elo expected score: probability user "beats" this problem
    const expected = 1.0 / (1.0 + Math.pow(10, (problemDifficulty - topicRating) / 400));

    // User solved it (actual score = 1), gain = K * (1 - expected)
    const gain = K * (1.0 - expected);

    // Diminishing returns: cap gains as topic rating approaches ceiling
    const approachFactor = Math.max(0.1, 1.0 - (topicRating / (baseElo * 1.3)));
    topicRating += gain * approachFactor;
  }

  // Floor: 70% of base, Ceiling: 115% of base
  topicRating = Math.max(baseElo * 0.70, Math.min(baseElo * 1.15, topicRating));

  return Math.round(topicRating);
}

module.exports = {
  CATEGORY_MAP,
  getTopicRegistry,
  normalizeTopicMetrics,
  // Alias for backward compatibility
  CANONICAL_AXES: getTopicRegistry(),
};
