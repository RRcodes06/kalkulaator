import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the URL only if it uses an http(s) scheme. Otherwise returns the
 * provided fallback. Protects against javascript:, data:, vbscript: URLs that
 * would execute arbitrary code when used as an anchor href.
 */
export function sanitizeHttpUrl(url: unknown, fallback = '#'): string {
  if (typeof url !== 'string' || url.trim() === '') return fallback;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? url
      : fallback;
  } catch {
    return fallback;
  }
}
