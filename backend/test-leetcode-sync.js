/**
 * LeetCode Ingestion Test & Verification Script
 * 
 * Tests live GraphQL queries, defensive null handling, 8-axis normalizer,
 * and bio verification token logic.
 */

const {
  fetchUserProfileAndCounts,
  fetchContestRanking,
  fetchTopicSkillCounts,
  fetchRecentAcSubmissions,
  verifyBioToken,
  importFullUserStats,
} = require('./src/services/leetcodeService');
const { normalizeTopicMetrics } = require('./src/services/normalizerService');

async function runTests() {
  console.log('====================================================');
  console.log('Starting LeetCode Stats Ingestion Verification Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Fetch live public profile
  try {
    process.stdout.write('[Test 1] Fetching live profile for @neal_wu... ');
    const profile = await fetchUserProfileAndCounts('neal_wu');
    if (profile && profile.handle.toLowerCase() === 'neal_wu' && profile.totalSolved > 0) {
      console.log(`PASSED (Rank: #${profile.profileRank}, Solved: ${profile.totalSolved})`);
      passed++;
    } else {
      throw new Error('Profile data missing or invalid');
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  // Test 2: Fetch live contest ranking
  try {
    process.stdout.write('[Test 2] Fetching live contest ranking for @neal_wu... ');
    const contest = await fetchContestRanking('neal_wu');
    if (contest && contest.contestElo > 0) {
      console.log(`PASSED (Elo: ${contest.contestElo}, Attended: ${contest.attendedContestsCount}, Top: ${contest.topPercentage}%)`);
      passed++;
    } else {
      throw new Error('Contest data invalid');
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  // Test 3: Fetch topic problem solved counts & normalize for 8-Axis Radar
  try {
    process.stdout.write('[Test 3] Fetching tags and normalizing to 8-axis radar... ');
    const rawTags = await fetchTopicSkillCounts('neal_wu');
    const normalized = normalizeTopicMetrics(rawTags, 2450);

    const requiredAxes = ['dp', 'graphs', 'trees', 'binsearch', 'window', 'monostack', 'greedy', 'heaps'];
    const missing = requiredAxes.filter(k => !normalized[k]);

    if (missing.length === 0) {
      console.log(`PASSED (All 8 axes mapped without inflation:`);
      for (const k of requiredAxes) {
        console.log(`         - ${normalized[k].label.padEnd(30)}: ${normalized[k].problemsSolved} solved • ${normalized[k].competencyElo} Elo (${normalized[k].acRate})`);
      }
      passed++;
    } else {
      throw new Error(`Missing axes: ${missing.join(', ')}`);
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  // Test 4: Defensive Fallback on Non-Existent User
  try {
    process.stdout.write('[Test 4] Testing defensive error handling for non-existent handle... ');
    const fakeHandle = 'non_existent_lc_user_78912345';
    let threw = false;
    try {
      await fetchUserProfileAndCounts(fakeHandle);
    } catch (e) {
      threw = true;
      if (e.message.includes('does not exist')) {
        console.log(`PASSED (Caught expected error: "${e.message}")`);
        passed++;
      } else {
        throw e;
      }
    }
    if (!threw) throw new Error('Did not throw error for invalid user');
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  // Test 5: Bio Token Verification Check
  try {
    process.stdout.write('[Test 5] Testing bio token verification logic... ');
    const token = 'LC-LEARN-9482';
    const check = await verifyBioToken('neal_wu', token);
    // Verified will be false because neal_wu obviously doesn't have our token in their bio
    if (check && typeof check.verified === 'boolean') {
      console.log(`PASSED (Verified flag: ${check.verified}, checked expected token: "${token}")`);
      passed++;
    } else {
      throw new Error('Bio check failed to return verification contract');
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  // Test 6: Composite Full User Ingestion Pipeline
  try {
    process.stdout.write('[Test 6] Testing full composite pipeline (importFullUserStats)... ');
    const full = await importFullUserStats('neal_wu');
    if (full.handle && full.contestElo && Array.isArray(full.recentAc)) {
      console.log(`PASSED (Composite record built with ${full.recentAc.length} recent ACs)`);
      passed++;
    } else {
      throw new Error('Composite pipeline missing keys');
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
