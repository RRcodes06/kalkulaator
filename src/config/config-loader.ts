/**
 * ============================================================================
 * CONFIG ACCESS LAYER
 * ============================================================================
 *
 * Abstraction over the config source. Currently reads from the local
 * calculator-config.ts file, but the two exported functions can be
 * re-pointed to any async source (API, Joomla endpoint, shared JSON)
 * without touching the rest of the codebase.
 *
 * Integration example (future):
 *
 *   export async function loadCalculatorConfig(): Promise<CalculatorConfig> {
 *     const res = await fetch('/api/calculator-config');
 *     return { ...CALCULATOR_CONFIG, ...await res.json() };
 *   }
 */

import type { CalculatorConfig } from '@/types/calculator';
import { CALCULATOR_CONFIG } from '@/config/calculator-config';

/**
 * Load the calculator config from its source.
 *
 * Currently synchronous (local file), but returns a Promise so that
 * callers are already prepared for an async source swap.
 */
export async function loadCalculatorConfig(): Promise<CalculatorConfig> {
  // Future: fetch('/api/calculator-config').then(r => r.json())
  return { ...CALCULATOR_CONFIG };
}

/**
 * Synchronous getter for the default config.
 * Use when an async call is not practical (e.g. Zustand initialiser).
 */
export function getCalculatorConfig(): CalculatorConfig {
  return { ...CALCULATOR_CONFIG };
}
