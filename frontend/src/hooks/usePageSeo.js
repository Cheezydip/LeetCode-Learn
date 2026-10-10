import { useEffect } from 'react';

const SITE_NAME = 'LeetCode-Learn';
const DEFAULT_DESC =
  'Master Data Structures and Algorithms with curated problem roadmaps, pattern intuition ladders, spaced-repetition vault, and contest rating predictor.';

/**
 * Custom React hook to dynamically manage document head metadata per route.
 * Ensures Googlebot, headless crawlers, and browser history reflect accurate page identity.
 *
 * @param {Object} options
 * @param {string} options.title - Page-specific title
 * @param {string} [options.description] - Page meta description
 * @param {string} [options.canonicalPath] - Route path (e.g. '/paths', '/topics')
 */
export function usePageSeo({ title, description = DEFAULT_DESC, canonicalPath = '/' }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    }

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // 3. Update Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      const baseUrl = window.location.origin || 'https://leetcode-learn.antideploy.app';
      const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
      linkCanonical.setAttribute('href', `${baseUrl}${normalizedPath}`);
    }

    // 4. Update Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
      ogTitle.setAttribute('content', `${title} — ${SITE_NAME}`);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) {
      ogDesc.setAttribute('content', description);
    }
  }, [title, description, canonicalPath]);
}
