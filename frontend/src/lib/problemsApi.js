/**
 * Problems API Client
 * 
 * Communicates with the backend's /api/problems endpoints
 * to fetch the enriched problem catalog.
 */

const API_BASE = 'http://localhost:5000/api/problems';

/**
 * Fetch all topic summaries (lightweight — no individual problems)
 * @returns {{ topicCount: number, topics: Array }}
 */
export async function fetchTopics() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error(`Failed to fetch topics: ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data;
}

/**
 * Fetch all problems for a single topic
 * @param {string} topicKey - The topic key (e.g., "array", "dynamic-programming")
 * @param {string|null} difficulty - Optional difficulty filter: "Easy", "Medium", "Hard"
 * @returns {{ key, name, description, totalProblems, problems: Array }}
 */
export async function fetchTopicProblems(topicKey, difficulty = null) {
  let url = `${API_BASE}/${topicKey}`;
  if (difficulty) url += `?difficulty=${difficulty}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch topic "${topicKey}": ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data;
}

/**
 * Fetch the full catalog (all topics + all problems — large response)
 * @returns {{ topicCount, totalProblems, topics: Array }}
 */
export async function fetchFullCatalog() {
  const response = await fetch(`${API_BASE}/all`);
  if (!response.ok) throw new Error(`Failed to fetch full catalog: ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data;
}
