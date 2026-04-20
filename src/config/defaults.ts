/**
 * App-level constants (admin password, storage keys).
 * Calculator config lives in calculator-config.ts.
 * Access config via config-loader.ts (getCalculatorConfig / loadCalculatorConfig).
 */
import type { CalculatorConfig } from '@/types/calculator';
import { getCalculatorConfig } from '@/config/config-loader';

// Config storage version — bump when CalculatorConfig shape changes
export const CONFIG_VERSION = 'v5';

export const STORAGE_KEYS = {
  CONFIG: `recruitment-calc-config-${CONFIG_VERSION}`,
} as const;

// Re-export for convenience (uses the access layer)
export const DEFAULT_CONFIG: CalculatorConfig = getCalculatorConfig();
