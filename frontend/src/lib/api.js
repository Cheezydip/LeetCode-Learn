const API_BASE = ''; // Uses Vite dev server proxy or same-origin in production

export async function fetchLeetCodeSync(handle, region = 'global', force = false) {
  const cleanHandle = handle.trim().replace(/^@/, '');
  const url = `${API_BASE}/api/users/${encodeURIComponent(cleanHandle)}/sync${force ? '?force=true' : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region }),
  });
  const data = await res.json();
  if (!res.ok && !data.error) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return data;
}

export async function generateBioToken(handle, region = 'global') {
  const cleanHandle = handle.trim().replace(/^@/, '');
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(cleanHandle)}/generate-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region }),
  });
  const data = await res.json();
  return data;
}

export async function verifyBioToken(handle, token, region = 'global') {
  const cleanHandle = handle.trim().replace(/^@/, '');
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(cleanHandle)}/verify-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, region }),
  });
  const data = await res.json();
  return data;
}

/**
 * Fetch all problems for a single topic from the enriched catalog.
 * @param {string} topicKey - The topic key (e.g., 'monotonic-stack', 'dynamic-programming')
 * @param {string|null} difficulty - Optional filter: 'Easy', 'Medium', or 'Hard'
 */
export async function fetchTopicProblems(topicKey, difficulty = null) {
  let url = `${API_BASE}/api/problems/${encodeURIComponent(topicKey)}`;
  if (difficulty) {
    url += `?difficulty=${encodeURIComponent(difficulty)}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

/**
 * Fetch lightweight topic summaries (no individual problems) for all topics.
 */
export async function fetchTopicSummaries() {
  const res = await fetch(`${API_BASE}/api/problems`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

/**
 * Option 1: Import solved problems list from Browser Console snippet
 * @param {string} handle 
 * @param {Array<string|object>} solvedList 
 */
export async function importSolvedProblems(handle, solvedList) {
  const cleanHandle = handle.trim().replace(/^@/, '');
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(cleanHandle)}/import-solved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ solvedSlugs: solvedList, source: 'snippet' }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

/**
 * Option 2: Import solved problems via 1-time disposable session cookie
 * @param {string} handle 
 * @param {string} sessionCookie 
 * @param {string} region 
 */
export async function importCookieSolved(handle, sessionCookie, region = 'global') {
  const cleanHandle = handle.trim().replace(/^@/, '');
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(cleanHandle)}/import-cookie-solved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionCookie, region }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

/**
 * Fetch all solved problems and topic groupings for a user
 * @param {string} handle 
 */
export async function fetchUserSolved(handle) {
  const cleanHandle = handle.trim().replace(/^@/, '');
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(cleanHandle)}/solved`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

/**
 * Toggle a single problem solved / unsolved
 * @param {string} handle 
 * @param {string} titleSlug 
 * @param {boolean} isSolved 
 */
export async function toggleProblemSolved(handle, titleSlug, isSolved = true) {
  const cleanHandle = handle.trim().replace(/^@/, '');
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(cleanHandle)}/toggle-solved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titleSlug, isSolved }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

