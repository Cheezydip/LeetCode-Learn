import { create } from 'zustand';
import { 
  fetchLeetCodeSync, 
  generateBioToken, 
  verifyBioToken, 
  importSolvedProblems, 
  importCookieSolved, 
  fetchUserSolved, 
  toggleProblemSolved 
} from '../lib/api.js';
import { eloToWorldwideRank } from '../lib/elo-math.js';

const STORAGE_KEY = 'leetcode_learn_auth';

const loadSavedAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // If the cached topicMetrics has 8 or fewer topics (legacy 8-axis format),
    // clear it so the app re-fetches the full 56 topics
    if (parsed.topicMetrics && Object.keys(parsed.topicMetrics).length <= 8) {
      delete parsed.topicMetrics;
    }
    return parsed;
  } catch {
    return null;
  }
};

const savedAuth = loadSavedAuth();

export const useProfileStore = create((set, get) => ({
  // Zero-Trust: If not previously verified in localStorage, boot in locked/unverified state
  handle: savedAuth?.handle || '',
  realName: savedAuth?.realName || '',
  region: savedAuth?.region || 'global',
  isVerified: !!savedAuth?.isVerified,

  contestElo: savedAuth?.contestElo || null,
  contestRank: savedAuth?.contestRank || null,
  topPercentage: savedAuth?.topPercentage || null,
  profileRank: savedAuth?.profileRank || null,
  totalSolved: savedAuth?.totalSolved || null,
  easySolved: savedAuth?.easySolved || null,
  mediumSolved: savedAuth?.mediumSolved || null,
  hardSolved: savedAuth?.hardSolved || null,
  lastSyncedAt: savedAuth?.lastSyncedAt || null,
  topicMetrics: savedAuth?.topicMetrics || null,
  recentSubmissions: savedAuth?.recentSubmissions || [],

  // Solved Problem Tracking (Past History + Ongoing Cockpit)
  solvedSlugs: savedAuth?.solvedSlugs || [],
  solvedByTopic: savedAuth?.solvedByTopic || {},
  isImportingSolved: false,
  solvedImportMessage: null,
  solvedImportError: null,

  chartMode: 'elo',
  volume: 8,
  horizon: 60,
  selectedTopic: 'sliding-window',

  syncModalOpen: false,
  syncModalTab: 'sync', // 'sync' | 'past' | 'verify'
  syncStatus: 'idle',
  syncError: null,
  cooldownRemainingSeconds: 0,
  cooldownEndTime: null,

  verificationToken: null,
  verificationInstructions: null,
  verificationMessage: null,
  isGeneratingToken: false,
  isVerifyingToken: false,

  setHandle: (handle) => {
    set({ handle });
    if (handle) {
      setTimeout(() => get().loadUserSolved(), 50);
    }
  },
  setRegion: (region) => set({ region }),
  setSyncModalOpen: (open, tab = 'sync') => {
    set({ syncModalOpen: open, syncModalTab: tab });
    if (open && tab === 'past') {
      get().loadUserSolved();
    }
  },
  setSyncModalTab: (tab) => {
    set({ syncModalTab: tab });
    if (tab === 'past') {
      get().loadUserSolved();
    }
  },
  setChartMode: (chartMode) => set({ chartMode }),
  setVolume: (volume) => set({ volume }),
  setHorizon: (horizon) => set({ horizon }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
  clearSolvedImportStatus: () => set({ solvedImportMessage: null, solvedImportError: null }),

  tickCooldown: () => {
    const { cooldownEndTime } = get();
    if (!cooldownEndTime) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((cooldownEndTime - now) / 1000));
    if (remaining <= 0) {
      set({ cooldownRemainingSeconds: 0, cooldownEndTime: null });
    } else {
      set({ cooldownRemainingSeconds: remaining });
    }
  },

  syncLeetCode: async (customHandle, customRegion, force = false) => {
    const activeHandle = (customHandle || get().handle).trim().replace(/^@/, '');
    const activeRegion = customRegion || get().region;
    if (!activeHandle) return;

    const currentMetrics = get().topicMetrics;
    const isLegacyMetrics = !currentMetrics || Object.keys(currentMetrics).length <= 8;
    const shouldForce = force || isLegacyMetrics;

    set({ syncStatus: 'syncing', syncError: null });

    try {
      const resp = await fetchLeetCodeSync(activeHandle, activeRegion, shouldForce);
      if (!resp.success) {
        throw new Error(resp.error || 'Failed to sync with LeetCode');
      }

      const d = resp.data;
      const elo = d.contest_elo || 1500;
      const rank = d.contest_rank || eloToWorldwideRank(elo);

      const remainingSecs = resp.cached && resp.cooldownRemainingSeconds ? resp.cooldownRemainingSeconds : 600;
      const endTime = Date.now() + remainingSecs * 1000;

      const profilePayload = {
        handle: d.leetcode_handle || activeHandle,
        realName: d.real_name || savedAuth?.realName || '',
        region: d.region || activeRegion,
        contestElo: elo,
        contestRank: rank,
        topPercentage: d.top_percentage || null,
        profileRank: d.profile_rank || 150000,
        totalSolved: d.total_solved || 0,
        easySolved: d.easy_solved || 0,
        mediumSolved: d.medium_solved || 0,
        hardSolved: d.hard_solved || 0,
        lastSyncedAt: d.last_synced_at,
        topicMetrics: d.topic_metrics || null,
        recentSubmissions: d.recent_submissions || [],
        isVerified: true,
      };

      // Persist verified session
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profilePayload));
      } catch (err) {
        console.warn('Could not save auth session to localStorage:', err);
      }

      set({
        ...profilePayload,
        syncStatus: resp.cached ? 'cached' : 'synced',
        cooldownRemainingSeconds: remainingSecs,
        cooldownEndTime: endTime,
        syncError: null,
      });

      // Refresh solved problem tracking
      get().loadUserSolved();
    } catch (err) {
      set({
        syncStatus: 'error',
        syncError: err.message || 'Unknown synchronization error',
      });
    }
  },

  generateTokenAction: async (customHandle) => {
    const activeHandle = (customHandle || get().handle).trim().replace(/^@/, '');
    const activeRegion = get().region;
    if (!activeHandle) return;

    set({ isGeneratingToken: true, verificationMessage: null });
    try {
      const resp = await generateBioToken(activeHandle, activeRegion);
      if (resp.success) {
        set({
          handle: activeHandle,
          verificationToken: resp.verificationToken,
          verificationInstructions: resp.instructions,
          isGeneratingToken: false,
        });
      } else {
        set({
          verificationMessage: resp.error || 'Failed to generate token',
          isGeneratingToken: false,
        });
      }
    } catch {
      set({
        verificationMessage: 'Network error generating token. Is backend server running?',
        isGeneratingToken: false,
      });
    }
  },

  verifyTokenAction: async (customToken) => {
    const activeHandle = get().handle.trim().replace(/^@/, '');
    const activeToken = customToken || get().verificationToken;
    const activeRegion = get().region;

    if (!activeHandle) {
      set({ verificationMessage: 'Please enter a valid LeetCode handle first.' });
      return;
    }
    if (!activeToken) {
      set({ verificationMessage: 'Please generate a verification token first.' });
      return;
    }

    set({ isVerifyingToken: true, verificationMessage: null });
    try {
      const resp = await verifyBioToken(activeHandle, activeToken, activeRegion);
      if (resp.success && resp.verified) {
        const d = resp.data;
        const elo = d?.contest_elo || 1500;
        const rank = d?.contest_rank || eloToWorldwideRank(elo);

        const profilePayload = {
          handle: activeHandle,
          realName: d?.real_name || savedAuth?.realName || '',
          region: activeRegion,
          contestElo: elo,
          contestRank: rank,
          topPercentage: d?.top_percentage || null,
          profileRank: d?.profile_rank || 150000,
          totalSolved: d?.total_solved || 0,
          easySolved: d?.easy_solved || 0,
          mediumSolved: d?.medium_solved || 0,
          hardSolved: d?.hard_solved || 0,
          lastSyncedAt: d?.last_synced_at || new Date().toISOString(),
          isVerified: true,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profilePayload));
        } catch (err) {
          console.warn('Could not save auth session:', err);
        }

        set({
          ...profilePayload,
          isVerifyingToken: false,
          verificationMessage: 'Account verified! Dashboard unlocked.',
        });
      } else {
        set({
          verificationMessage: resp.message || resp.error || 'Token not detected in profile bio yet.',
          isVerifyingToken: false,
        });
      }
    } catch {
      set({
        verificationMessage: 'Network error during verification. Please try again.',
        isVerifyingToken: false,
      });
    }
  },

  // Solved Problem Tracking Actions
  loadUserSolved: async () => {
    const handle = get().handle.trim().replace(/^@/, '');
    if (!handle) return;
    try {
      const resp = await fetchUserSolved(handle);
      if (resp.success && resp.data) {
        const { solvedSlugs, solvedByTopic, topicCounts } = resp.data;

        // Synchronize topicMetrics with actual solved counts
        let updatedTopicMetrics = get().topicMetrics;
        if (updatedTopicMetrics) {
          updatedTopicMetrics = { ...updatedTopicMetrics };
          Object.keys(updatedTopicMetrics).forEach((metricKey) => {
            const topic = updatedTopicMetrics[metricKey];
            const tKey = topic.catalogKey || topic.key || metricKey;
            const solvedList = (solvedByTopic && (solvedByTopic[tKey] || solvedByTopic[topic.key])) || [];
            const actualSolves = solvedList.length || (topicCounts && (topicCounts[tKey] || topicCounts[topic.key])) || 0;

            if (actualSolves === 0) {
              if (tKey === 'tree' || tKey === 'trees' || tKey === 'binary-tree' || topic.problemsSolved === 1) {
                updatedTopicMetrics[metricKey] = {
                  ...topic,
                  problemsSolved: 0,
                };
              }
            } else {
              updatedTopicMetrics[metricKey] = {
                ...topic,
                problemsSolved: Math.max(actualSolves, topic.problemsSolved || 0),
              };
            }
          });
        }

        set({
          solvedSlugs: solvedSlugs || [],
          solvedByTopic: solvedByTopic || {},
          ...(updatedTopicMetrics ? { topicMetrics: updatedTopicMetrics } : {}),
        });

        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.solvedSlugs = solvedSlugs;
            parsed.solvedByTopic = solvedByTopic;
            if (updatedTopicMetrics) parsed.topicMetrics = updatedTopicMetrics;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          console.warn('Could not persist solved problems to storage:', e);
        }
      }
    } catch (err) {
      console.warn('Could not fetch user solved problems:', err.message);
    }
  },

  importSolvedViaSnippet: async (solvedList) => {
    const handle = get().handle.trim().replace(/^@/, '');
    if (!handle) {
      set({ solvedImportError: 'Please enter a valid LeetCode handle first.' });
      return;
    }
    set({ isImportingSolved: true, solvedImportError: null, solvedImportMessage: null });
    try {
      const resp = await importSolvedProblems(handle, solvedList);
      if (resp.success && resp.data) {
        const { solvedSlugs, solvedByTopic, topicCounts, importedCount } = resp.data;

        let updatedTopicMetrics = get().topicMetrics;
        if (updatedTopicMetrics && topicCounts) {
          updatedTopicMetrics = { ...updatedTopicMetrics };
          Object.entries(topicCounts).forEach(([tKey, count]) => {
            const targetEntry = Object.entries(updatedTopicMetrics).find(
              ([k, v]) => k === tKey || v.catalogKey === tKey || v.key === tKey
            );
            if (targetEntry) {
              const [metricKey, metricVal] = targetEntry;
              updatedTopicMetrics[metricKey] = {
                ...metricVal,
                problemsSolved: Math.max(metricVal.problemsSolved || 0, count),
              };
            }
          });
        }

        set({
          solvedSlugs: solvedSlugs || [],
          solvedByTopic: solvedByTopic || {},
          ...(updatedTopicMetrics ? { topicMetrics: updatedTopicMetrics } : {}),
          isImportingSolved: false,
          solvedImportMessage: `Successfully imported ${importedCount} past solved problems!`,
        });

        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.solvedSlugs = solvedSlugs;
            parsed.solvedByTopic = solvedByTopic;
            if (updatedTopicMetrics) parsed.topicMetrics = updatedTopicMetrics;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          console.warn('Failed saving solved to storage:', e);
        }
      } else {
        set({ isImportingSolved: false, solvedImportError: resp.error || 'Import failed.' });
      }
    } catch (err) {
      set({ isImportingSolved: false, solvedImportError: err.message || 'Network error during import.' });
    }
  },

  importSolvedViaCookie: async (sessionCookie, customRegion) => {
    const handle = get().handle.trim().replace(/^@/, '');
    const region = customRegion || get().region || 'global';
    if (!handle) {
      set({ solvedImportError: 'Please enter a valid LeetCode handle first.' });
      return;
    }
    if (!sessionCookie || !sessionCookie.trim()) {
      set({ solvedImportError: 'Please enter a valid LEETCODE_SESSION cookie.' });
      return;
    }

    set({ isImportingSolved: true, solvedImportError: null, solvedImportMessage: null });
    try {
      const resp = await importCookieSolved(handle, sessionCookie, region);
      if (resp.success && resp.data) {
        const { solvedSlugs, solvedByTopic, topicCounts, importedCount } = resp.data;

        let updatedTopicMetrics = get().topicMetrics;
        if (updatedTopicMetrics && topicCounts) {
          updatedTopicMetrics = { ...updatedTopicMetrics };
          Object.entries(topicCounts).forEach(([tKey, count]) => {
            const targetEntry = Object.entries(updatedTopicMetrics).find(
              ([k, v]) => k === tKey || v.catalogKey === tKey || v.key === tKey
            );
            if (targetEntry) {
              const [metricKey, metricVal] = targetEntry;
              updatedTopicMetrics[metricKey] = {
                ...metricVal,
                problemsSolved: Math.max(metricVal.problemsSolved || 0, count),
              };
            }
          });
        }

        set({
          solvedSlugs: solvedSlugs || [],
          solvedByTopic: solvedByTopic || {},
          ...(updatedTopicMetrics ? { topicMetrics: updatedTopicMetrics } : {}),
          isImportingSolved: false,
          solvedImportMessage: `Verified & imported ${importedCount} lifetime solved problems! Session cookie was safely discarded.`,
        });

        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.solvedSlugs = solvedSlugs;
            parsed.solvedByTopic = solvedByTopic;
            if (updatedTopicMetrics) parsed.topicMetrics = updatedTopicMetrics;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          console.warn('Failed saving solved to storage:', e);
        }
      } else {
        set({ isImportingSolved: false, solvedImportError: resp.error || 'Cookie import failed. Please verify your cookie.' });
      }
    } catch (err) {
      set({ isImportingSolved: false, solvedImportError: err.message || 'Error connecting to LeetCode with session cookie.' });
    }
  },

  toggleProblemSolvedAction: async (titleSlug, topicKey = null, topicSlugs = [], difficulty = null) => {
    const handle = get().handle.trim().replace(/^@/, '');
    const currentSlugs = get().solvedSlugs || [];
    const cleanSlug = titleSlug.trim().toLowerCase();
    const isCurrentlySolved = currentSlugs.includes(cleanSlug);
    const newStatus = !isCurrentlySolved;

    // 1. Optimistic slugs update
    const newSlugs = newStatus
      ? Array.from(new Set([...currentSlugs, cleanSlug]))
      : currentSlugs.filter(s => s !== cleanSlug);

    // 2. Identify all affected topic keys (passed keys + any topic currently containing this slug)
    const currentSolvedByTopic = { ...(get().solvedByTopic || {}) };
    const affectedTopics = new Set();
    if (topicKey) affectedTopics.add(topicKey);
    if (Array.isArray(topicSlugs)) {
      topicSlugs.forEach(t => t && affectedTopics.add(t));
    }
    // Also scan existing solvedByTopic to find any topic that contained this problem
    Object.entries(currentSolvedByTopic).forEach(([tK, list]) => {
      if (Array.isArray(list) && list.some(item => (item.titleSlug || item) === cleanSlug)) {
        affectedTopics.add(tK);
      }
    });

    // Resolve difficulty (from arg, or lookup from existing solved list)
    let probDiff = difficulty;
    if (!probDiff) {
      for (const list of Object.values(currentSolvedByTopic)) {
        const found = (list || []).find(item => (item.titleSlug || item) === cleanSlug);
        if (found && found.difficulty) {
          probDiff = found.difficulty;
          break;
        }
      }
    }

    // 3. Optimistic solvedByTopic update
    affectedTopics.forEach(tKey => {
      const existing = currentSolvedByTopic[tKey] || [];
      if (newStatus) {
        if (!existing.some(item => (item.titleSlug || item) === cleanSlug)) {
          currentSolvedByTopic[tKey] = [...existing, { titleSlug: cleanSlug, difficulty: probDiff || 'Medium' }];
        }
      } else {
        currentSolvedByTopic[tKey] = existing.filter(item => (item.titleSlug || item) !== cleanSlug);
      }
    });

    // 4. Optimistic topicMetrics update: immediately increment / decrement problemsSolved
    let newTopicMetrics = get().topicMetrics;
    if (newTopicMetrics && affectedTopics.size > 0) {
      newTopicMetrics = { ...newTopicMetrics };
      affectedTopics.forEach(tKey => {
        const targetEntry = Object.entries(newTopicMetrics).find(([k, v]) => k === tKey || v.catalogKey === tKey || v.key === tKey);
        if (targetEntry) {
          const [metricKey, metricVal] = targetEntry;
          const currentCount = metricVal.problemsSolved || 0;
          const updatedCount = newStatus ? currentCount + 1 : Math.max(0, currentCount - 1);
          newTopicMetrics[metricKey] = {
            ...metricVal,
            problemsSolved: updatedCount,
          };
        }
      });
    }

    // 5. Total solved counter & difficulty breakdown live update
    const currentTotal = get().totalSolved || 0;
    const newTotal = newStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

    const normDiff = (probDiff || '').toLowerCase();
    const diffUpdates = {};
    if (normDiff === 'easy') {
      const cur = get().easySolved || 0;
      diffUpdates.easySolved = newStatus ? cur + 1 : Math.max(0, cur - 1);
    } else if (normDiff === 'medium') {
      const cur = get().mediumSolved || 0;
      diffUpdates.mediumSolved = newStatus ? cur + 1 : Math.max(0, cur - 1);
    } else if (normDiff === 'hard') {
      const cur = get().hardSolved || 0;
      diffUpdates.hardSolved = newStatus ? cur + 1 : Math.max(0, cur - 1);
    }

    const stateUpdate = {
      solvedSlugs: newSlugs,
      solvedByTopic: currentSolvedByTopic,
      topicMetrics: newTopicMetrics,
      totalSolved: newTotal,
      ...diffUpdates,
    };

    set(stateUpdate);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(parsed, stateUpdate);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    if (handle) {
      try {
        const resp = await toggleProblemSolved(handle, cleanSlug, newStatus);
        if (resp?.success) {
          const resultData = resp.data || resp;
          const backendSync = {};
          if (resultData?.solvedByTopic) backendSync.solvedByTopic = resultData.solvedByTopic;
          if (resultData?.solvedSlugs) backendSync.solvedSlugs = resultData.solvedSlugs;
          if (Object.keys(backendSync).length > 0) {
            set(backendSync);
          }
        }
      } catch (err) {
        console.warn('Could not sync toggle to backend:', err.message);
      }
    }
  },

  isProblemSolved: (titleSlug) => {
    if (!titleSlug) return false;
    const slugs = get().solvedSlugs || [];
    return slugs.includes(titleSlug.trim().toLowerCase());
  },

  unlinkAccount: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Could not clear auth session:', err);
    }

    set({
      handle: '',
      isVerified: false,
      contestElo: null,
      contestRank: null,
      profileRank: null,
      totalSolved: null,
      easySolved: null,
      mediumSolved: null,
      hardSolved: null,
      lastSyncedAt: null,
      solvedSlugs: [],
      solvedByTopic: {},
      verificationToken: null,
      verificationInstructions: null,
      verificationMessage: null,
    });
  },
}));

// Automatically fetch solved history & upgrade legacy cache on startup
if (typeof window !== 'undefined' && savedAuth?.handle) {
  const needsUpgrade = !savedAuth.topicMetrics || Object.keys(savedAuth.topicMetrics).length <= 8;
  if (needsUpgrade) {
    setTimeout(() => {
      useProfileStore.getState().syncLeetCode(savedAuth.handle, savedAuth.region || 'global', true);
    }, 150);
  }
  // Load solved problems in background
  setTimeout(() => {
    useProfileStore.getState().loadUserSolved();
  }, 300);
}

