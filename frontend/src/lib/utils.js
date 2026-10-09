import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize external URLs to prevent javascript: or data: XSS attacks
 */
export function safeUrl(url, fallback = '#') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|#)/i.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

