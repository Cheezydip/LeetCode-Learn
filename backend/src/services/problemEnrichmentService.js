/**
 * Problem Enrichment Service
 * 
 * Fetches ALL free problems per topic from LeetCode's GraphQL API,
 * auto-sorts them into difficulty tiers (Easy → Medium → Hard),
 * and caches the enriched catalog locally.
 * 
 * Lifecycle:
 *   1. On server start → enrichAll()
 *   2. Every 24 hours  → re-enrich via setInterval
 *   3. If LeetCode unreachable → serve stale cache
 */

const fs = require('fs');
const path = require('path');
const { queryGraphQL } = require('./leetcodeService');

const TOPIC_LIST_PATH = path.join(__dirname, '..', 'data', 'topicList.json');
const CACHE_DIR = path.join(__dirname, '..', 'data', 'cache');
const CACHE_PATH = path.join(CACHE_DIR, 'enrichedCatalog.json');
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const BATCH_SIZE = 100;
const DELAY_BETWEEN_REQUESTS_MS = 500; // Delay between pagination batches
const DELAY_BETWEEN_TOPICS_MS = 800;   // Delay between topic fetches

// GraphQL query to fetch problems filtered by tag
const PROBLEM_LIST_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        questionFrontendId
        title
        titleSlug
        difficulty
        acRate
        isPaidOnly
        topicTags {
          name
          slug
        }
      }
    }
  }
`;

/**
 * Sleep utility for rate limiting
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load the topic list definition
 */
function loadTopicList() {
  const raw = fs.readFileSync(TOPIC_LIST_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Sort problems into a learning progression:
 * Easy (highest acRate first) → Medium (highest acRate first) → Hard (highest acRate first)
 */
function sortByDifficultyProgression(problems) {
  const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
  return problems.sort((a, b) => {
    const diffA = difficultyOrder[a.difficulty] ?? 1;
    const diffB = difficultyOrder[b.difficulty] ?? 1;
    if (diffA !== diffB) return diffA - diffB;
    return (b.acRate || 0) - (a.acRate || 0); // Higher acceptance rate first within same difficulty
  });
}

/**
 * Fetch ALL free problems for a single topic tag from LeetCode's GraphQL API
 */
async function fetchTopicProblems(tagSlug, region = 'global') {
  const allProblems = [];
  let skip = 0;
  let totalExpected = null;

  while (true) {
    try {
      const data = await queryGraphQL(PROBLEM_LIST_QUERY, {
        categorySlug: 'algorithms',
        limit: BATCH_SIZE,
        skip,
        filters: { tags: [tagSlug] },
      }, region);

      const result = data?.problemsetQuestionList;
      if (!result || !result.questions) break;

      if (totalExpected === null) {
        totalExpected = result.total;
      }

      // Filter out premium problems
      const freeProblems = result.questions
        .filter((p) => !p.isPaidOnly)
        .map((p) => ({
          questionId: p.questionFrontendId,
          title: p.title,
          titleSlug: p.titleSlug,
          difficulty: p.difficulty,
          acRate: Math.round((p.acRate || 0) * 10) / 10,
          url: `https://leetcode.com/problems/${p.titleSlug}/`,
          tags: (p.topicTags || []).map((t) => t.name),
        }));

      allProblems.push(...freeProblems);

      // If we got fewer than BATCH_SIZE, we've fetched everything
      if (result.questions.length < BATCH_SIZE) break;

      skip += BATCH_SIZE;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    } catch (err) {
      console.error(`[Enrichment] Error fetching tag "${tagSlug}" at skip=${skip}:`, err.message);
      break;
    }
  }

  return sortByDifficultyProgression(allProblems);
}

/**
 * Enrich all topics and build the full catalog
 */
async function enrichAll() {
  const topics = loadTopicList();
  const enrichedTopics = [];

  console.log(`[Enrichment] Starting enrichment for ${topics.length} topics...`);

  for (const topic of topics) {
    try {
      console.log(`[Enrichment] Fetching: ${topic.name} (${topic.tagSlug})...`);
      const problems = await fetchTopicProblems(topic.tagSlug);

      const difficultyCounts = {
        Easy: problems.filter((p) => p.difficulty === 'Easy').length,
        Medium: problems.filter((p) => p.difficulty === 'Medium').length,
        Hard: problems.filter((p) => p.difficulty === 'Hard').length,
      };

      enrichedTopics.push({
        key: topic.key,
        name: topic.name,
        tagSlug: topic.tagSlug,
        description: topic.description,
        totalProblems: problems.length,
        difficultyCounts,
        problems,
      });

      console.log(`[Enrichment] ✓ ${topic.name}: ${problems.length} free problems (${difficultyCounts.Easy}E / ${difficultyCounts.Medium}M / ${difficultyCounts.Hard}H)`);

      // Rate limit between topics
      await sleep(DELAY_BETWEEN_TOPICS_MS);
    } catch (err) {
      console.error(`[Enrichment] ✗ Failed to enrich "${topic.name}":`, err.message);
      // Push topic with empty problems so it still appears in the catalog
      enrichedTopics.push({
        key: topic.key,
        name: topic.name,
        tagSlug: topic.tagSlug,
        description: topic.description,
        totalProblems: 0,
        difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
        problems: [],
      });
    }
  }

  // Write cache
  const catalog = {
    generatedAt: new Date().toISOString(),
    topicCount: enrichedTopics.length,
    totalProblems: enrichedTopics.reduce((sum, t) => sum + t.totalProblems, 0),
    topics: enrichedTopics,
  };

  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
    console.log(`[Enrichment] ✓ Cache written: ${catalog.topicCount} topics, ${catalog.totalProblems} total problems`);
  } catch (err) {
    console.error('[Enrichment] ✗ Failed to write cache:', err.message);
  }

  return catalog;
}

/**
 * Load cached catalog from disk
 */
function loadCachedCatalog() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Enrichment] Could not read cache:', err.message);
  }
  return null;
}

/**
 * Get the enriched catalog — from cache if available, otherwise trigger enrichment
 */
async function getCatalog() {
  const cached = loadCachedCatalog();
  if (cached) return cached;

  // No cache exists, enrich now
  return await enrichAll();
}

const TOPIC_ALIASES = {
  'trees': 'tree',
  'graphs': 'graph',
  'heaps': 'heap-priority-queue',
  'heap': 'heap-priority-queue',
  'window': 'sliding-window',
  'monostack': 'monotonic-stack',
  'dp': 'dynamic-programming',
  'binsearch': 'binary-search',
};

/**
 * Get problems for a single topic, optionally filtered by difficulty
 */
async function getTopicProblems(topicKey, difficulty = null) {
  const catalog = await getCatalog();
  const cleanKey = (topicKey || '').toLowerCase();
  const targetKey = TOPIC_ALIASES[cleanKey] || cleanKey;

  const topic = catalog.topics.find((t) => 
    t.key === cleanKey || 
    t.key === targetKey || 
    t.tagSlug === cleanKey || 
    t.tagSlug === targetKey
  );
  if (!topic) return null;

  if (difficulty) {
    return {
      ...topic,
      problems: topic.problems.filter((p) => p.difficulty === difficulty),
      totalProblems: topic.problems.filter((p) => p.difficulty === difficulty).length,
    };
  }

  return topic;
}

/**
 * Get lightweight topic summary list (no individual problems)
 */
async function getTopicSummaries() {
  const catalog = await getCatalog();
  return catalog.topics.map((t) => ({
    key: t.key,
    name: t.name,
    tagSlug: t.tagSlug,
    description: t.description,
    totalProblems: t.totalProblems,
    difficultyCounts: t.difficultyCounts,
  }));
}

/**
 * In-memory inverted index of problemSlug -> problem info with all associated topics
 */
let problemIndexCache = null;

async function getProblemIndex() {
  if (problemIndexCache) return problemIndexCache;
  const catalog = await getCatalog();
  const index = new Map();

  for (const topic of catalog.topics) {
    for (const prob of topic.problems) {
      if (!index.has(prob.titleSlug)) {
        index.set(prob.titleSlug, {
          frontendQuestionId: prob.frontendQuestionId,
          title: prob.title,
          titleSlug: prob.titleSlug,
          difficulty: prob.difficulty,
          acRate: prob.acRate,
          topicSlugs: [topic.key],
          topics: [{ key: topic.key, name: topic.name }],
        });
      } else {
        const existing = index.get(prob.titleSlug);
        if (!existing.topicSlugs.includes(topic.key)) {
          existing.topicSlugs.push(topic.key);
          existing.topics.push({ key: topic.key, name: topic.name });
        }
      }
    }
  }

  problemIndexCache = index;
  return index;
}

/**
 * Lookup problem metadata by an array of slugs
 */
async function lookupProblems(slugs) {
  const index = await getProblemIndex();
  return slugs.map(slug => {
    if (index.has(slug)) {
      return index.get(slug);
    }
    return {
      titleSlug: slug,
      title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      difficulty: 'Medium',
      topicSlugs: [],
      topics: [],
    };
  });
}

/**
 * Initialize enrichment: run on startup + schedule 24hr refresh
 */
function initEnrichment() {
  // Run enrichment in background (don't block server startup)
  const cached = loadCachedCatalog();
  if (cached) {
    const cacheAge = Date.now() - new Date(cached.generatedAt).getTime();
    if (cacheAge < REFRESH_INTERVAL_MS) {
      console.log(`[Enrichment] Using cached catalog (${cached.topicCount} topics, ${cached.totalProblems} problems, age: ${Math.round(cacheAge / 60000)}m)`);
    } else {
      console.log('[Enrichment] Cache is stale, re-enriching in background...');
      enrichAll().catch((err) => console.error('[Enrichment] Background enrichment failed:', err.message));
    }
  } else {
    console.log('[Enrichment] No cache found, enriching in background...');
    enrichAll().catch((err) => console.error('[Enrichment] Initial enrichment failed:', err.message));
  }

  // Schedule periodic refresh
  setInterval(() => {
    console.log('[Enrichment] Scheduled 24hr refresh starting...');
    enrichAll().catch((err) => console.error('[Enrichment] Scheduled enrichment failed:', err.message));
  }, REFRESH_INTERVAL_MS);
}

module.exports = {
  enrichAll,
  getCatalog,
  getTopicProblems,
  getTopicSummaries,
  getProblemIndex,
  lookupProblems,
  initEnrichment,
  loadCachedCatalog,
};
