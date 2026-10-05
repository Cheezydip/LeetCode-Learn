/**
 * Problem Cache Service (IndexedDB + Cloud Sync)
 * 
 * Provides 100% offline-ready, 0ms instantaneous problem querying
 * by caching the cloud-hosted Supabase problem catalog directly
 * on the user's device via browser IndexedDB.
 */

const DB_NAME = 'LeetCodeLearnDB';
const DB_VERSION = 1;
const PROBLEMS_STORE = 'problems';
const METADATA_STORE = 'metadata';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Standardize problem schema across different endpoints (Supabase, local catalog, sheets)
 */
export function normalizeProblem(p) {
  if (!p) return null;
  const rawId = p.frontend_id ?? p.questionId ?? p.questionFrontendId ?? p.id ?? null;
  const numId = rawId != null ? parseInt(rawId, 10) : null;
  const validId = !isNaN(numId) && numId !== null ? numId : rawId;
  const slug = p.title_slug || p.titleSlug || p.slug || '';

  return {
    ...p,
    frontend_id: validId,
    questionId: validId,
    title_slug: slug,
    titleSlug: slug,
    title: p.title || slug,
    difficulty: p.difficulty || 'Medium',
    ac_rate: p.ac_rate ?? p.acRate ?? null,
    leetcode_url: p.leetcode_url || p.url || (slug ? `https://leetcode.com/problems/${slug}/` : ''),
    topic_tags: Array.isArray(p.topic_tags) ? p.topic_tags : (Array.isArray(p.tags) ? p.tags : []),
    sheet_tags: Array.isArray(p.sheet_tags) ? p.sheet_tags : [],
    company_tags: Array.isArray(p.company_tags) ? p.company_tags : [],
  };
}

/**
 * Open or initialize the IndexedDB database
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Problems Store
      if (!db.objectStoreNames.contains(PROBLEMS_STORE)) {
        const store = db.createObjectStore(PROBLEMS_STORE, { keyPath: 'title_slug' });
        store.createIndex('idx_difficulty', 'difficulty', { unique: false });
        store.createIndex('idx_frontend_id', 'frontend_id', { unique: false });
        store.createIndex('idx_sheet_tags', 'sheet_tags', { multiEntry: true, unique: false });
        store.createIndex('idx_company_tags', 'company_tags', { multiEntry: true, unique: false });
        store.createIndex('idx_topic_tags', 'topic_tags', { multiEntry: true, unique: false });
      }

      // 2. Metadata Store (version, sync date, count)
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a value from the metadata store
 */
export async function getMetadata(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(METADATA_STORE, 'readonly');
    const store = tx.objectStore(METADATA_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save a value to the metadata store
 */
export async function setMetadata(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(METADATA_STORE, 'readwrite');
    const store = tx.objectStore(METADATA_STORE);
    const req = store.put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Return current status of local device cache
 */
export async function getCacheStatus() {
  try {
    const db = await openDB();
    const [version, lastSynced, totalCount] = await Promise.all([
      getMetadata('version'),
      getMetadata('lastSynced'),
      new Promise((resolve) => {
        const tx = db.transaction(PROBLEMS_STORE, 'readonly');
        const req = tx.objectStore(PROBLEMS_STORE).count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      }),
    ]);

    return {
      isCached: totalCount > 0,
      totalCount: totalCount || 0,
      version: version || null,
      lastSynced: lastSynced || null,
    };
  } catch (err) {
    return {
      isCached: false,
      totalCount: 0,
      version: null,
      lastSynced: null,
      error: err.message,
    };
  }
}

/**
 * Synchronize problems from Cloud to local device IndexedDB
 * Checks cloud version first; only downloads if version changed or force=true.
 */
export async function syncProblemsWithCloud({ onProgress, force = false } = {}) {
  try {
    // 1. Check Cloud Version
    let cloudMeta = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problems/version`);
      if (res.ok) {
        cloudMeta = await res.json();
      }
    } catch {
      // Offline fallback: continue with existing cache
      console.info('[ProblemCache] Offline mode: using device-cached problems.');
      return await getCacheStatus();
    }

    const currentVersion = cloudMeta?.version || 'v1-default';
    const localVersion = await getMetadata('version');
    const status = await getCacheStatus();

    // If already up-to-date and has items, skip download
    if (!force && localVersion === currentVersion && status.totalCount > 0) {
      return status;
    }

    if (onProgress) onProgress({ status: 'downloading', message: 'Downloading catalog...' });

    // 2. Fetch full catalog from cloud or fallback to local backend API
    let problems = [];
    try {
      const syncRes = await fetch(`${API_BASE_URL}/api/problems/cloud-sync`);
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        problems = syncData.problems || [];
      }
    } catch (err) {
      console.warn('[ProblemCache] Cloud-sync fetch failed, trying /api/problems/all fallback:', err);
    }

    // Fallback: If cloud-sync was empty or failed, fetch from /api/problems/all
    if (problems.length === 0) {
      try {
        const allRes = await fetch(`${API_BASE_URL}/api/problems/all`);
        if (allRes.ok) {
          const allData = await allRes.json();
          const seen = new Set();
          for (const topic of allData.topics || []) {
            for (const p of topic.problems || []) {
              const slug = p.titleSlug || p.title_slug;
              if (slug && !seen.has(slug)) {
                seen.add(slug);
                problems.push({
                  ...p,
                  topic_tags: [topic.name, ...(p.tags || [])],
                });
              }
            }
          }
        }
      } catch (fallbackErr) {
        console.warn('[ProblemCache] Fallback catalog fetch failed:', fallbackErr);
      }
    }

    if (problems.length === 0) {
      return await getCacheStatus();
    }

    if (onProgress) onProgress({ status: 'saving', message: `Saving ${problems.length} problems to device storage...` });

    // 3. Batch store normalized problems into IndexedDB
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([PROBLEMS_STORE, METADATA_STORE], 'readwrite');
      const pStore = tx.objectStore(PROBLEMS_STORE);
      const mStore = tx.objectStore(METADATA_STORE);

      for (const rawP of problems) {
        const p = normalizeProblem(rawP);
        if (p && p.title_slug) {
          pStore.put(p);
        }
      }

      mStore.put({ key: 'version', value: currentVersion });
      mStore.put({ key: 'lastSynced', value: new Date().toISOString() });
      mStore.put({ key: 'totalCount', value: problems.length });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    if (onProgress) onProgress({ status: 'complete', message: `Synced ${problems.length} problems!` });

    return {
      isCached: true,
      totalCount: problems.length,
      version: currentVersion,
      lastSynced: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[ProblemCache] Sync failed:', err);
    throw err;
  }
}

/**
 * Retrieve all cached problems from IndexedDB
 */
export async function getAllCachedProblems() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROBLEMS_STORE, 'readonly');
    const store = tx.objectStore(PROBLEMS_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get problems for a specific sheet (e.g. 'blind75', 'leetcode150', 'maang', 'master-dsa')
 */
export async function getCachedProblemsBySheet(sheetKey) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROBLEMS_STORE, 'readonly');
    const index = tx.objectStore(PROBLEMS_STORE).index('idx_sheet_tags');
    const req = index.getAll(sheetKey);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get problems asked by a company (e.g. 'google', 'amazon', 'meta')
 */
export async function getCachedProblemsByCompany(companySlug) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROBLEMS_STORE, 'readonly');
    const index = tx.objectStore(PROBLEMS_STORE).index('idx_company_tags');
    const req = index.getAll(companySlug.toLowerCase());
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get problems by topic tag (e.g. 'Dynamic Programming', 'Array')
 */
export async function getCachedProblemsByTopic(topicTag) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROBLEMS_STORE, 'readonly');
    const index = tx.objectStore(PROBLEMS_STORE).index('idx_topic_tags');
    const req = index.getAll(topicTag);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Search problems locally with instantaneous fuzzy match & tag/company matching
 */
export async function searchLocalProblems(query, { limit = 40 } = {}) {
  const rawQ = (query || '').trim();
  if (!rawQ) return [];

  const cleanQ = rawQ.toLowerCase();
  const cleanNoHash = cleanQ.startsWith('#') ? cleanQ.slice(1).trim() : cleanQ;
  const isNumeric = /^\d+$/.test(cleanNoHash);

  let all = await getAllCachedProblems();

  // If local cache is not populated yet, fetch directly from backend API
  if (!all || all.length === 0) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problems/all`);
      if (res.ok) {
        const data = await res.json();
        const extracted = [];
        const seen = new Set();
        for (const topic of data.topics || []) {
          for (const p of topic.problems || []) {
            const slug = p.titleSlug || p.title_slug;
            if (slug && !seen.has(slug)) {
              seen.add(slug);
              extracted.push(
                normalizeProblem({
                  ...p,
                  topic_tags: [topic.name, ...(p.tags || [])],
                })
              );
            }
          }
        }
        all = extracted;
      }
    } catch (err) {
      console.warn('[ProblemCache] Fallback search fetch failed:', err);
    }
  }

  if (!all || all.length === 0) return [];

  const exactIdMatches = [];
  const idStartsWithMatches = [];
  const startsWithMatches = [];
  const otherMatches = [];

  for (const rawP of all) {
    const p = normalizeProblem(rawP);
    const titleLower = (p.title || '').toLowerCase();
    const slugLower = (p.title_slug || '').toLowerCase();
    const id = p.frontend_id ?? p.questionId ?? p.id;
    const idStr = id != null ? String(id) : '';

    const hasTagMatch = Array.isArray(p.topic_tags) && p.topic_tags.some((t) => t.toLowerCase().includes(cleanQ));
    const hasCompanyMatch = Array.isArray(p.company_tags) && p.company_tags.some((c) => c.toLowerCase().includes(cleanQ));
    const hasSheetMatch = Array.isArray(p.sheet_tags) && p.sheet_tags.some((s) => s.toLowerCase().includes(cleanQ));
    const hasDiffMatch = (p.difficulty || '').toLowerCase() === cleanQ;

    if (isNumeric && idStr === cleanNoHash) {
      exactIdMatches.push(p);
    } else if (isNumeric && idStr.startsWith(cleanNoHash)) {
      idStartsWithMatches.push(p);
    } else if (titleLower.startsWith(cleanQ) || slugLower.startsWith(cleanQ)) {
      startsWithMatches.push(p);
    } else if (
      (isNumeric && idStr.includes(cleanNoHash)) ||
      titleLower.includes(cleanQ) ||
      slugLower.includes(cleanQ) ||
      hasTagMatch ||
      hasCompanyMatch ||
      hasSheetMatch ||
      hasDiffMatch
    ) {
      otherMatches.push(p);
    }

    if (exactIdMatches.length + idStartsWithMatches.length + startsWithMatches.length + otherMatches.length >= limit * 3) {
      break;
    }
  }

  // Sort idStartsWith numerically so #1, #10, #11, etc. appear in clean ascending order
  idStartsWithMatches.sort((a, b) => {
    const idA = parseInt(a.frontend_id || a.questionId || 0, 10);
    const idB = parseInt(b.frontend_id || b.questionId || 0, 10);
    return idA - idB;
  });

  return [...exactIdMatches, ...idStartsWithMatches, ...startsWithMatches, ...otherMatches].slice(0, limit);
}

