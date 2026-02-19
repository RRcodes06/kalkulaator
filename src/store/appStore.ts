import { create } from 'zustand';
import type { CalculatorInputs, CalculatorConfig, ComputedResult, ServiceRow } from '@/types/calculator';
import { DEFAULT_CONFIG, STORAGE_KEYS, ROLE_DEFAULT_SALARIES } from '@/config/defaults';
import { computeTotals, createDefaultInputs, createServiceRow } from '@/engine/calculationEngine';

// ============================================================================
// STORE STATE TYPE
// ============================================================================

interface AppState {
  inputs: CalculatorInputs;
  config: CalculatorConfig;
  results: ComputedResult;
  hasCalculated: boolean;

  // Auto-fill toggle state
  autoFillEnabled: boolean;
  autoFilledFields: Set<string>; // field paths still owned by auto-fill

  // Input actions
  updateInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  updateNestedInput: <
    K extends keyof CalculatorInputs,
    NK extends keyof NonNullable<CalculatorInputs[K]>
  >(key: K, nestedKey: NK, value: NonNullable<CalculatorInputs[K]>[NK]) => void;
  resetInputs: () => void;
  toggleAutoFill: (enabled: boolean) => void;

  // Service row actions
  addServiceRow: (prefilledName?: string) => void;
  updateServiceRow: (id: string, updates: Partial<ServiceRow>) => void;
  removeServiceRow: (id: string) => void;

  // Config actions
  updateConfig: <K extends keyof CalculatorConfig>(key: K, value: CalculatorConfig[K]) => void;
  resetConfig: () => void;

  // Calculation trigger
  triggerCalculation: () => void;

  // Recompute results
  recompute: () => void;
}

// ============================================================================
// PERSISTENCE
// ============================================================================

const loadConfigFromStorage = (): CalculatorConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load config from localStorage:', e);
  }
  return DEFAULT_CONFIG;
};

const saveConfigToStorage = (config: CalculatorConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save config to localStorage:', e);
  }
};

// ============================================================================
// AUTO-FILL HELPERS
// ============================================================================

/** Round by unit: hours → nearest 0.5, everything else → nearest integer */
function roundByUnit(value: number, unit: string): number {
  if (unit === 'h') return Math.round(value * 2) / 2;
  return Math.round(value);
}

/**
 * Build a map of field-path → midpoint value from recommended ranges.
 * Also includes salary defaults for role fields.
 */
function buildAutoFillValues(config: CalculatorConfig): Record<string, number> {
  const vals: Record<string, number> = {};
  const ranges = config.recommendedRanges;

  for (const [key, range] of Object.entries(ranges)) {
    if (!range) continue;
    const mid = (range.min + range.max) / 2;
    vals[key] = roundByUnit(mid, range.unit);
  }

  // Role salary defaults (fill when salary fields are empty)
  vals['roles.hr.payAmount'] = ROLE_DEFAULT_SALARIES.hr;
  vals['roles.manager.payAmount'] = ROLE_DEFAULT_SALARIES.manager;
  vals['roles.team.payAmount'] = ROLE_DEFAULT_SALARIES.team;
  vals['hirePay.payAmount'] = ROLE_DEFAULT_SALARIES.team;

  return vals;
}

/** Check if a numeric field is "empty" (undefined, null, NaN, or blank string coerced). */
function isFieldEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  // We do NOT treat 0 as empty – user may have typed 0 intentionally
  return false;
}

/**
 * Given current inputs, apply auto-fill values only to empty fields.
 * Returns { newInputs, filledPaths }.
 */
function applyAutoFill(
  currentInputs: CalculatorInputs,
  config: CalculatorConfig,
): { newInputs: CalculatorInputs; filledPaths: Set<string> } {
  const vals = buildAutoFillValues(config);
  const filledPaths = new Set<string>();

  // Deep-clone inputs
  const inp: CalculatorInputs = JSON.parse(JSON.stringify(currentInputs));

  // Helper to set nested value by dot-path if the current value is empty
  const maybeSet = (path: string, target: Record<string, unknown>, key: string) => {
    if (vals[path] === undefined) return;
    if (!isFieldEmpty(target[key])) return; // not empty → skip
    target[key] = vals[path];
    filledPaths.add(path);
  };

  // Salary fields – also need to set payType to 'monthly' when filling
  const salaryFields: Array<{ path: string; obj: Record<string, unknown>; key: string; payTypeKey: string }> = [
    { path: 'hirePay.payAmount', obj: inp.hirePay as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
    { path: 'roles.hr.payAmount', obj: inp.roles.hr as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
    { path: 'roles.manager.payAmount', obj: inp.roles.manager as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
    { path: 'roles.team.payAmount', obj: inp.roles.team as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
  ];

  for (const sf of salaryFields) {
    const currentPayType = sf.obj[sf.payTypeKey];
    const currentAmount = sf.obj[sf.key] as number;
    // "Empty" salary = payType is 'unset' OR payAmount is empty
    if (currentPayType === 'unset' && isFieldEmpty(currentAmount)) {
      sf.obj[sf.key] = vals[sf.path];
      sf.obj[sf.payTypeKey] = 'monthly';
      if (sf.path === 'hirePay.payAmount') {
        (inp.hirePay as unknown as Record<string, unknown>).hoursPerMonth = config.HOURS_PER_MONTH;
      }
      filledPaths.add(sf.path);
    }
  }

  // Block hour/cost fields mapped by dot-path
  const blockMappings: Array<{ section: string; obj: Record<string, unknown>; fields: string[] }> = [
    { section: 'strategyPrep', obj: inp.strategyPrep as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours'] },
    { section: 'adsBranding', obj: inp.adsBranding as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours', 'directCosts'] },
    { section: 'candidateMgmt', obj: inp.candidateMgmt as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours'] },
    { section: 'interviews', obj: inp.interviews as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours', 'directCosts'] },
    { section: 'backgroundOffer', obj: inp.backgroundOffer as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours'] },
    { section: 'indirectCosts', obj: inp.indirectCosts as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours'] },
    { section: 'onboarding', obj: inp.onboarding as unknown as Record<string, unknown>, fields: ['onboardingMonths', 'productivityPct'] },
    { section: 'vacancy', obj: inp.vacancy as unknown as Record<string, unknown>, fields: ['vacancyDays'] },
  ];

  for (const bm of blockMappings) {
    for (const field of bm.fields) {
      const path = `${bm.section}.${field}`;
      maybeSet(path, bm.obj, field);
    }
  }

  return { newInputs: inp, filledPaths };
}

/**
 * Remove auto-filled values: set them back to 0 (or 'unset' for salary fields).
 */
function removeAutoFill(
  currentInputs: CalculatorInputs,
  autoFilledFields: Set<string>,
  config: CalculatorConfig,
): CalculatorInputs {
  if (autoFilledFields.size === 0) return currentInputs;

  const inp: CalculatorInputs = JSON.parse(JSON.stringify(currentInputs));

  for (const path of autoFilledFields) {
    // Salary fields
    if (path === 'hirePay.payAmount') {
      (inp.hirePay as unknown as Record<string, unknown>).payAmount = 0;
      (inp.hirePay as unknown as Record<string, unknown>).payType = 'unset';
      continue;
    }
    const roleSalaryMatch = path.match(/^roles\.(\w+)\.payAmount$/);
    if (roleSalaryMatch) {
      const role = roleSalaryMatch[1] as 'hr' | 'manager' | 'team';
      (inp.roles[role] as unknown as Record<string, unknown>).payAmount = 0;
      (inp.roles[role] as unknown as Record<string, unknown>).payType = 'unset';
      continue;
    }
    // Regular nested fields (section.field)
    const parts = path.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const obj = (inp as unknown as Record<string, Record<string, unknown>>)[section];
      if (obj && field in obj) {
        obj[field] = 0;
      }
    }
  }

  return inp;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

let serviceRowCounter = 0;

export const useAppStore = create<AppState>((set, get) => {
  const initialConfig = loadConfigFromStorage();
  const initialInputs = createDefaultInputs();
  const initialResults = computeTotals(initialInputs, initialConfig);

  return {
    inputs: initialInputs,
    config: initialConfig,
    results: initialResults,
    hasCalculated: false,
    autoFillEnabled: false,
    autoFilledFields: new Set<string>(),

    updateInput: (key, value) => {
      set((state) => {
        const newInputs = { ...state.inputs, [key]: value };
        // Mark all nested fields of this key as user-owned
        const newAutoFilled = new Set(state.autoFilledFields);
        for (const path of state.autoFilledFields) {
          if (path.startsWith(`${String(key)}.`)) {
            newAutoFilled.delete(path);
          }
        }
        return {
          inputs: newInputs,
          results: computeTotals(newInputs, state.config),
          autoFilledFields: newAutoFilled,
        };
      });
    },

    updateNestedInput: (key, nestedKey, value) => {
      set((state) => {
        const currentValue = state.inputs[key];
        if (typeof currentValue === 'object' && currentValue !== null) {
          const newNested = { ...currentValue, [nestedKey]: value };
          const newInputs = { ...state.inputs, [key]: newNested };
          // Mark this specific field as user-owned
          const fieldPath = `${String(key)}.${String(nestedKey)}`;
          const newAutoFilled = new Set(state.autoFilledFields);
          newAutoFilled.delete(fieldPath);
          return {
            inputs: newInputs,
            results: computeTotals(newInputs, state.config),
            autoFilledFields: newAutoFilled,
          };
        }
        return state;
      });
    },

    resetInputs: () => {
      const { config } = get();
      const freshInputs = createDefaultInputs();
      set({
        inputs: freshInputs,
        results: computeTotals(freshInputs, config),
        hasCalculated: false,
        autoFillEnabled: false,
        autoFilledFields: new Set<string>(),
      });
    },

    toggleAutoFill: (enabled: boolean) => {
      const { inputs, config, autoFilledFields } = get();

      if (enabled) {
        // Toggle ON: fill only empty fields
        const { newInputs, filledPaths } = applyAutoFill(inputs, config);
        // Merge with any existing auto-filled paths (shouldn't happen but be safe)
        const merged = new Set([...autoFilledFields, ...filledPaths]);
        set({
          inputs: newInputs,
          results: computeTotals(newInputs, config),
          autoFillEnabled: true,
          autoFilledFields: merged,
        });
      } else {
        // Toggle OFF: remove only fields still marked as auto-filled
        const newInputs = removeAutoFill(inputs, autoFilledFields, config);
        set({
          inputs: newInputs,
          results: computeTotals(newInputs, config),
          autoFillEnabled: false,
          autoFilledFields: new Set<string>(),
        });
      }
    },

    addServiceRow: (prefilledName?: string) => {
      set((state) => {
        const newRow = createServiceRow(`service-${++serviceRowCounter}`, prefilledName);
        const newServices = [...state.inputs.otherServices, newRow];
        const newInputs = { ...state.inputs, otherServices: newServices };
        return {
          inputs: newInputs,
          results: computeTotals(newInputs, state.config),
        };
      });
    },

    updateServiceRow: (id, updates) => {
      set((state) => {
        const newServices = state.inputs.otherServices.map((row) =>
          row.id === id ? { ...row, ...updates } : row
        );
        const newInputs = { ...state.inputs, otherServices: newServices };
        return {
          inputs: newInputs,
          results: computeTotals(newInputs, state.config),
        };
      });
    },

    removeServiceRow: (id) => {
      set((state) => {
        const newServices = state.inputs.otherServices.filter((row) => row.id !== id);
        const newInputs = { ...state.inputs, otherServices: newServices };
        return {
          inputs: newInputs,
          results: computeTotals(newInputs, state.config),
        };
      });
    },

    updateConfig: (key, value) => {
      set((state) => {
        const newConfig = { ...state.config, [key]: value };
        saveConfigToStorage(newConfig);
        return {
          config: newConfig,
          results: computeTotals(state.inputs, newConfig),
        };
      });
    },

    resetConfig: () => {
      localStorage.removeItem(STORAGE_KEYS.CONFIG);
      set((state) => ({
        config: DEFAULT_CONFIG,
        results: computeTotals(state.inputs, DEFAULT_CONFIG),
      }));
    },

    triggerCalculation: () => {
      const { inputs, config } = get();
      set({
        results: computeTotals(inputs, config),
        hasCalculated: true,
      });
    },

    recompute: () => {
      const { inputs, config } = get();
      set({ results: computeTotals(inputs, config) });
    },
  };
});
