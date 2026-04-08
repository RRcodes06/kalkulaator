/**
 * App-level constants (admin password, storage keys).
 * Calculator config lives in calculator-config.ts.
 */
import type { CalculatorConfig } from '@/types/calculator';
import { CALCULATOR_CONFIG } from '@/config/calculator-config';

// Admin password — change this in production
export const ADMIN_PASSWORD = 'CHANGE_ME';

// Config storage version — bump when CalculatorConfig shape changes
export const CONFIG_VERSION = 'v5';

export const STORAGE_KEYS = {
  CONFIG: `recruitment-calc-config-${CONFIG_VERSION}`,
} as const;

// Re-export for convenience
export const DEFAULT_CONFIG: CalculatorConfig = CALCULATOR_CONFIG;
