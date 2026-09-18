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
