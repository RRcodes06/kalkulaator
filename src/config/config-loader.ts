/**
 * ============================================================================
 * CONFIG ACCESS LAYER
 * ============================================================================
 *
 * Two-layer config:
 *   1. Built-in defaults from `calculator-config.ts` (always available).
 *   2. Optional runtime overrides from `/calculator-config.json` served
 *      from `public/`. This file can be edited by the Joomla developer
 *      (or any deployment) without rebuilding the app.
 *
 * On startup, `loadCalculatorConfig()` tries to fetch the JSON. If the
 * fetch succeeds and the body parses, the JSON is deep-merged OVER the
 * defaults. If anything fails (404, parse error, network error), the
 * defaults are returned unchanged.
 *
 * The TS file is the canonical fallback — the app NEVER depends solely
 * on the JSON file.
 */

import type { CalculatorConfig } from '@/types/calculator';
import { CALCULATOR_CONFIG } from '@/config/calculator-config';

/**
 * Use Vite's BASE_URL so the fetch works whether the app is served from
 * the domain root (Lovable preview/deploy) or a subfolder (e.g. embedded
 * inside a Joomla site at `/recruitment-calculator/`). BASE_URL always
 * has a trailing slash.
 */
const RUNTIME_CONFIG_URL = `${import.meta.env.BASE_URL ?? '/'}calculator-config.json`;

type Plain = Record<string, unknown>;

function isPlainObject(v: unknown): v is Plain {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const DEFAULT_HELP_URL = 'https://www.manpower.ee/et/vaerbamisteenused';

/**
 * Strictly accept http(s) URLs only. Anything else (e.g. javascript:, data:)
 * is replaced with the safe default to prevent XSS via href injection.
 */
function sanitizeHelpUrl(url: unknown): string {
  if (typeof url !== 'string' || url.trim() === '') return DEFAULT_HELP_URL;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? url
      : DEFAULT_HELP_URL;
  } catch {
    return DEFAULT_HELP_URL;
  }
}

/**
 * Recursive merge: `override` wins, but missing keys fall back to `base`.
 * Arrays and primitives are replaced wholesale (not merged element-wise).
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  if (!isPlainObject(base)) return override as T;
  const out: Plain = { ...base };
  for (const key of Object.keys(override)) {
    const bVal = (base as Plain)[key];
    const oVal = (override as Plain)[key];
    if (isPlainObject(bVal) && isPlainObject(oVal)) {
      out[key] = deepMerge(bVal, oVal);
    } else if (oVal !== undefined) {
      out[key] = oVal;
    }
  }
  return out as T;
}

/**
 * Synchronous getter for the built-in default config (used as Zustand
 * initial value before async runtime config has loaded).
 */
export function getCalculatorConfig(): CalculatorConfig {
  const cfg = { ...CALCULATOR_CONFIG };
  cfg.helpUrl = sanitizeHelpUrl(cfg.helpUrl);
  return cfg;
}

/**
 * Load the calculator config from `/calculator-config.json` (if present)
 * and merge it over the built-in defaults. Always resolves with a valid
 * `CalculatorConfig` — falls back to defaults on any error.
 */
export async function loadCalculatorConfig(): Promise<CalculatorConfig> {
  const defaults = getCalculatorConfig();
  try {
    const res = await fetch(RUNTIME_CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return defaults;
    const ct = res.headers.get('content-type') ?? '';
    // Vite dev server returns index.html for missing files — guard against it.
    if (!ct.includes('json') && !ct.includes('text/plain')) return defaults;
    const text = await res.text();
    const trimmed = text.trim();
    if (!trimmed.startsWith('{')) return defaults;
    const json = JSON.parse(trimmed) as unknown;
    if (!isPlainObject(json)) return defaults;
    const merged = deepMerge(defaults, json);
    merged.helpUrl = sanitizeHelpUrl(merged.helpUrl);
    return merged;
  } catch {
    return defaults;
  }
}