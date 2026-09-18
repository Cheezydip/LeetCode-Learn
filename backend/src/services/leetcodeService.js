/**
 * LeetCode Ingestion Service
 * 
 * Interacts with LeetCode's public GraphQL endpoint to fetch user profiles,
 * contest rating history, difficulty solve counts, topic-level skills, and recent ACs.
 * 
 * Defenses implemented:
 * - Cloudflare bot header spoofing (User-Agent, Referer, Origin)
 * - Isolated queries to prevent cascading failures
 * - Safe null-coalescing for unrated / private profiles
 * - Dual-region routing (Global: leetcode.com, China: leetcode.cn)
 * - Bio token ownership verification
 */

const ENDPOINTS = {
  global: 'https://leetcode.com/graphql',
  china: 'https://leetcode.cn/graphql',
};

const BROWSER_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://leetcode.com',
  'Origin': 'https://leetcode.com',
};

/**
 * Execute a GraphQL query against LeetCode with timeout and error boundary
 */
async function queryGraphQL(query, variables = {}, region = 'global', timeoutMs = 9000) {
  const url = ENDPOINTS[region] || ENDPOINTS.global;
  const headers = {
    ...BROWSER_HEADERS,
    Referer: region === 'china' ? 'https://leetcode.cn' : 'https://leetcode.com',
    Origin: region === 'china' ? 'https://leetcode.cn' : 'https://leetcode.com',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('LeetCode GraphQL blocked by Cloudflare WAF (403 Forbidden). Cooldown active.');
      }
      if (response.status === 429) {
        throw new Error('LeetCode rate limit reached (429 Too Many Requests). Please retry in 10 minutes.');
      }
      throw new Error(`LeetCode HTTP error: status ${response.status}`);
    }

    const data = await response.json();
    if (data.errors && data.errors.length > 0) {
      // Don't crash on minor field errors if partial data was returned
      if (!data.data) {
        throw new Error(data.errors[0].message || 'GraphQL Query execution failed');
      }
    }
    return data.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`LeetCode request timed out after ${timeoutMs}ms.`);
    }
    throw error;
  }
}

/**
 * Query 1: Public Profile and Difficulty Solve Counts
 */
async function fetchUserProfileAndCounts(username, region = 'global') {
  const query = `
    query getUserProfileAndCounts($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          userAvatar
          realName
          aboutMe
          school
          countryName
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const data = await queryGraphQL(query, { username }, region);
  if (!data?.matchedUser) {
    throw new Error(`User @${username} does not exist on LeetCode (${region}).`);
  }

  const user = data.matchedUser;
  const acList = user.submitStatsGlobal?.acSubmissionNum || [];

  const totalSolved = acList.find(d => d.difficulty === 'All')?.count ?? 0;
  const easySolved = acList.find(d => d.difficulty === 'Easy')?.count ?? 0;
  const mediumSolved = acList.find(d => d.difficulty === 'Medium')?.count ?? 0;
  const hardSolved = acList.find(d => d.difficulty === 'Hard')?.count ?? 0;

  return {
    handle: user.username,
    profileRank: user.profile?.ranking ?? null,
    avatar: user.profile?.userAvatar ?? null,
    realName: user.profile?.realName ?? '',
    aboutMe: user.profile?.aboutMe ?? '',
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
  };
}

/**
 * Query 2: Contest Rating, Global Contest Rank & Attended Count
 * Safe against null (unrated accounts)
 */
async function fetchContestRanking(username, region = 'global') {
  const query = `
    query getUserContestRanking($username: String!) {
      userContestRanking(username: $username) {
        rating
        globalRanking
        totalParticipants
        topPercentage
        attendedContestsCount
      }
    }
  `;

  try {
    const data = await queryGraphQL(query, { username }, region);
    const contest = data?.userContestRanking;

    if (!contest || contest.attendedContestsCount === 0) {
      return {
        contestElo: 1500, // LeetCode baseline starting rating
        contestRank: null,
        totalParticipants: contest?.totalParticipants ?? null,
        topPercentage: null,
        attendedContestsCount: 0,
        isUnrated: true,
      };
    }

    return {
      contestElo: Math.round(contest.rating),
      contestRank: contest.globalRanking,
      totalParticipants: contest.totalParticipants,
      topPercentage: contest.topPercentage,
      attendedContestsCount: contest.attendedContestsCount,
      isUnrated: false,
    };
  } catch (err) {
    // If contest query fails, fall back gracefully to unrated baseline
    return {
      contestElo: 1500,
      contestRank: null,
      topPercentage: null,
      attendedContestsCount: 0,
      isUnrated: true,
    };
  }
}

/**
 * Query 3: Topic Problem Solved Counters (for Radar)
 */
async function fetchTopicSkillCounts(username, region = 'global') {
  const query = `
    query getSkillStats($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }
    }
  `;

  try {
    const data = await queryGraphQL(query, { username }, region);
    const counters = data?.matchedUser?.tagProblemCounts;

    return [
      ...(counters?.fundamental || []),
      ...(counters?.intermediate || []),
      ...(counters?.advanced || []),
    ];
  } catch (err) {
    // If tags endpoint fails, return empty array rather than failing whole profile sync
    return [];
  }
}

/**
 * Query 4: Recent Accepted Submissions
 */
async function fetchRecentAcSubmissions(username, limit = 10, region = 'global') {
  const query = `
    query getRecentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const data = await queryGraphQL(query, { username, limit }, region);
    return data?.recentAcSubmissionList || [];
  } catch (err) {
    return [];
  }
}

/**
 * Bio Token Ownership Verification
 * Queries user bio and verifies the temporary code exists
 */
async function verifyBioToken(username, expectedToken, region = 'global') {
  const profile = await fetchUserProfileAndCounts(username, region);
  const bio = (profile.aboutMe || '').trim();
  const isMatch = bio.includes(expectedToken);

  return {
    verified: isMatch,
    handle: profile.handle,
    currentBio: bio,
    expectedToken,
  };
}

/**
 * Full Composite Ingestion Pipeline
 */
async function importFullUserStats(username, region = 'global') {
  const [profile, contest, rawTags, recentAc] = await Promise.all([
    fetchUserProfileAndCounts(username, region),
    fetchContestRanking(username, region),
    fetchTopicSkillCounts(username, region),
    fetchRecentAcSubmissions(username, 10, region),
  ]);

  return {
    ...profile,
    ...contest,
    rawTags,
    recentAc,
    region,
    syncedAt: new Date().toISOString(),
  };
}

module.exports = {
  queryGraphQL,
  fetchUserProfileAndCounts,
  fetchContestRanking,
  fetchTopicSkillCounts,
  fetchRecentAcSubmissions,
  verifyBioToken,
  importFullUserStats,
};
