import { create } from 'zustand';
import { fetchLeetCodeSync, generateBioToken, verifyBioToken } from '../lib/api.js';
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

  chartMode: 'elo',
  volume: 8,
  horizon: 60,
  selectedTopic: 'sliding-window',

  syncModalOpen: false,
  syncStatus: 'idle',
  syncError: null,
  cooldownRemainingSeconds: 0,
  cooldownEndTime: null,

  verificationToken: null,
  verificationInstructions: null,
  verificationMessage: null,
  isGeneratingToken: false,
  isVerifyingToken: false,

  setHandle: (handle) => set({ handle }),
  setRegion: (region) => set({ region }),
  setSyncModalOpen: (open) => set({ syncModalOpen: open }),
  setChartMode: (chartMode) => set({ chartMode }),
  setVolume: (volume) => set({ volume }),
  setHorizon: (horizon) => set({ horizon }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),

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
      verificationToken: null,
      verificationInstructions: null,
      verificationMessage: null,
    });
  },
}));

// Automatically upgrade legacy profile cache to full 56-topic dataset on startup
if (typeof window !== 'undefined' && savedAuth?.handle) {
  const needsUpgrade = !savedAuth.topicMetrics || Object.keys(savedAuth.topicMetrics).length <= 8;
  if (needsUpgrade) {
    setTimeout(() => {
      useProfileStore.getState().syncLeetCode(savedAuth.handle, savedAuth.region || 'global', true);
    }, 150);
  }
}

