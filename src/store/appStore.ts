import { create } from 'zustand';
import type { CalculatorInputs, CalculatorConfig, ComputedResult, ServiceRow } from '@/types/calculator';
import { DEFAULT_CONFIG } from '@/config/defaults';
import { computeTotals, createDefaultInputs, createServiceRow } from '@/engine/calculationEngine';

// ============================================================================
// STORE STATE TYPE
// ============================================================================

interface AppState {
  inputs: CalculatorInputs;
  config: CalculatorConfig;
  results: ComputedResult;
  hasCalculated: boolean;

  autoFillEnabled: boolean;
  autoFilledFields: Set<string>;

  updateInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  updateNestedInput: <
    K extends keyof CalculatorInputs,
    NK extends keyof NonNullable<CalculatorInputs[K]>
  >(key: K, nestedKey: NK, value: NonNullable<CalculatorInputs[K]>[NK]) => void;
  resetInputs: () => void;
  toggleAutoFill: (enabled: boolean) => void;

  addServiceRow: (prefilledName?: string) => void;
  fillSectionWithAverages: (sectionId: string) => void;
  updateServiceRow: (id: string, updates: Partial<ServiceRow>) => void;
  removeServiceRow: (id: string) => void;

  updateConfig: <K extends keyof CalculatorConfig>(key: K, value: CalculatorConfig[K]) => void;
  resetConfig: () => void;
  setConfig: (config: CalculatorConfig) => void;

  triggerCalculation: () => void;
  recompute: () => void;
}

// ============================================================================
// PERSISTENCE
// ============================================================================

// Admin edits are session-only — the config file is always the source of truth.
// localStorage is no longer read at startup or used to persist config.

// ============================================================================
// AUTO-FILL HELPERS
// ============================================================================

function roundByUnit(value: number, unit: string): number {
  if (unit === 'h') return Math.round(value * 2) / 2;
  return Math.round(value);
}

function buildAutoFillValues(config: CalculatorConfig): Record<string, number> {
  const vals: Record<string, number> = {};
  const ranges = config.recommendedRanges;
  for (const [key, range] of Object.entries(ranges)) {
    if (!range) continue;
    const mid = (range.min + range.max) / 2;
    vals[key] = roundByUnit(mid, range.unit);
  }
  vals['roles.hr.payAmount'] = config.roleDefaultSalaries.hr;
  vals['roles.manager.payAmount'] = config.roleDefaultSalaries.manager;
  vals['roles.team.payAmount'] = config.roleDefaultSalaries.team;
  vals['hirePay.payAmount'] = config.roleDefaultSalaries.team;
  return vals;
}

function isFieldEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value === 'number' && value === 0) return true;
  return false;
}

function applyAutoFill(
  currentInputs: CalculatorInputs,
  config: CalculatorConfig,
): { newInputs: CalculatorInputs; filledPaths: Set<string> } {
  const vals = buildAutoFillValues(config);
  const filledPaths = new Set<string>();
  const inp: CalculatorInputs = JSON.parse(JSON.stringify(currentInputs));

  const maybeSet = (path: string, target: Record<string, unknown>, key: string) => {
    if (vals[path] === undefined) return;
    const isNullable = path === 'adsBranding.databaseLicenseFee';
    const empty = isNullable
      ? target[key] === null || target[key] === undefined || target[key] === ''
      : isFieldEmpty(target[key]);
    if (!empty) return;
    target[key] = vals[path];
    filledPaths.add(path);
  };

  // Salary fields
  const salaryFields: Array<{ path: string; obj: Record<string, unknown>; key: string; payTypeKey: string }> = [
    { path: 'hirePay.payAmount', obj: inp.hirePay as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
    { path: 'roles.hr.payAmount', obj: inp.roles.hr as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
    { path: 'roles.manager.payAmount', obj: inp.roles.manager as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
    { path: 'roles.team.payAmount', obj: inp.roles.team as unknown as Record<string, unknown>, key: 'payAmount', payTypeKey: 'payType' },
  ];

  for (const sf of salaryFields) {
    const currentPayType = sf.obj[sf.payTypeKey];
    const currentAmount = sf.obj[sf.key] as number;
    if (currentPayType === 'unset' && isFieldEmpty(currentAmount)) {
      sf.obj[sf.key] = vals[sf.path];
      sf.obj[sf.payTypeKey] = 'monthly';
      if (sf.path === 'hirePay.payAmount') {
        (inp.hirePay as unknown as Record<string, unknown>).hoursPerMonth = config.HOURS_PER_MONTH;
      }
      filledPaths.add(sf.path);
    }
  }

  // Block hour/cost fields
  const blockMappings: Array<{ section: string; obj: Record<string, unknown>; fields: string[] }> = [
    { section: 'strategyPrep', obj: inp.strategyPrep as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours'] },
    // databaseLicenseFee is intentionally excluded — no average/default autofill.
    { section: 'adsBranding', obj: inp.adsBranding as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours', 'directCosts'] },
    { section: 'candidateMgmt', obj: inp.candidateMgmt as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours'] },
    { section: 'interviews', obj: inp.interviews as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours', 'directCosts'] },
    { section: 'backgroundOffer', obj: inp.backgroundOffer as unknown as Record<string, unknown>, fields: ['hrHours', 'managerHours', 'teamHours'] },
    { section: 'onboarding', obj: inp.onboarding as unknown as Record<string, unknown>, fields: ['onboardingMonths', 'productivityPct'] },
  ];

  for (const bm of blockMappings) {
    for (const field of bm.fields) {
      const path = `${bm.section}.${field}`;
      maybeSet(path, bm.obj, field);
    }
  }

  // Vacant position impact - only fill fields for the active mode
  const vpiObj = inp.vacantPositionImpact as unknown as Record<string, unknown>;
  const activeMode = inp.vacantPositionImpact.mode;
  
  if (activeMode === 'uncovered') {
    maybeSet('vacantPositionImpact.percentageUndone', vpiObj, 'percentageUndone');
    maybeSet('vacantPositionImpact.monthlyPositionValue', vpiObj, 'monthlyPositionValue');
  } else {
    maybeSet('vacantPositionImpact.additionalHours', vpiObj, 'additionalHours');
    maybeSet('vacantPositionImpact.avgHourlyCost', vpiObj, 'avgHourlyCost');
    // Don't auto-fill overtimeMultiplier if it already has a value (default 1.5)
    if (isFieldEmpty(vpiObj['overtimeMultiplier']) || vpiObj['overtimeMultiplier'] === 0) {
      maybeSet('vacantPositionImpact.overtimeMultiplier', vpiObj, 'overtimeMultiplier');
    }
  }

  return { newInputs: inp, filledPaths };
}

function removeAutoFill(
  currentInputs: CalculatorInputs,
  autoFilledFields: Set<string>,
  config: CalculatorConfig,
): CalculatorInputs {
  if (autoFilledFields.size === 0) return currentInputs;
  const inp: CalculatorInputs = JSON.parse(JSON.stringify(currentInputs));

  for (const path of autoFilledFields) {
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
    const parts = path.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const obj = (inp as unknown as Record<string, Record<string, unknown>>)[section];
      if (obj && field in obj) {
        // For overtimeMultiplier, reset to default 1.5 instead of 0
        if (field === 'overtimeMultiplier') {
          obj[field] = 1.5;
        } else if (path === 'adsBranding.databaseLicenseFee') {
          // Nullable field: reset to null (unfilled), not 0
          obj[field] = null;
        } else {
          obj[field] = 0;
        }
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
  const initialConfig = DEFAULT_CONFIG;
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
        const { newInputs, filledPaths } = applyAutoFill(inputs, config);
        const merged = new Set([...autoFilledFields, ...filledPaths]);
        set({
          inputs: newInputs,
          results: computeTotals(newInputs, config),
          autoFillEnabled: true,
          autoFilledFields: merged,
        });
      } else {
        const newInputs = removeAutoFill(inputs, autoFilledFields, config);
        set({
          inputs: newInputs,
          results: computeTotals(newInputs, config),
          autoFillEnabled: false,
          autoFilledFields: new Set<string>(),
        });
      }
    },

    fillSectionWithAverages: (sectionId: string) => {
      const SECTION_FIELD_MAP: Record<string, { inputKey: string; fields: string[] }> = {
        strategy: { inputKey: 'strategyPrep', fields: ['hrHours', 'managerHours', 'teamHours'] },
        // databaseLicenseFee is intentionally excluded from "fill with averages" — user must enter explicitly.
        ads: { inputKey: 'adsBranding', fields: ['hrHours', 'managerHours', 'teamHours', 'directCosts'] },
        candidate: { inputKey: 'candidateMgmt', fields: ['hrHours', 'managerHours'] },
        interviews: { inputKey: 'interviews', fields: ['hrHours', 'managerHours', 'teamHours', 'directCosts'] },
        background: { inputKey: 'backgroundOffer', fields: ['hrHours', 'managerHours'] },
        onboarding: { inputKey: 'onboarding', fields: ['onboardingMonths', 'productivityPct'] },
      };

      const { inputs, config } = get();
      const vals = buildAutoFillValues(config);
      const inp: CalculatorInputs = JSON.parse(JSON.stringify(inputs));

      if (sectionId === 'vacantImpact') {
        const vpiObj = inp.vacantPositionImpact as unknown as Record<string, unknown>;
        const mode = inp.vacantPositionImpact.mode;
        const paths = mode === 'uncovered'
          ? ['vacantPositionImpact.percentageUndone', 'vacantPositionImpact.monthlyPositionValue']
          : ['vacantPositionImpact.additionalHours', 'vacantPositionImpact.avgHourlyCost', 'vacantPositionImpact.overtimeMultiplier'];
        for (const path of paths) {
          const field = path.split('.')[1];
          if (vals[path] !== undefined && isFieldEmpty(vpiObj[field])) {
            vpiObj[field] = vals[path];
          }
        }
        set({ inputs: inp, results: computeTotals(inp, config) });
        return;
      }

      const mapping = SECTION_FIELD_MAP[sectionId];
      if (!mapping) return;

      const obj = (inp as unknown as Record<string, Record<string, unknown>>)[mapping.inputKey];
      if (!obj) return;

      for (const field of mapping.fields) {
        const path = `${mapping.inputKey}.${field}`;
        const isNullable = path === 'adsBranding.databaseLicenseFee';
        const empty = isNullable
          ? obj[field] === null || obj[field] === undefined || obj[field] === ''
          : isFieldEmpty(obj[field]);
        if (vals[path] !== undefined && empty) {
          obj[field] = vals[path];
        }
      }
      set({ inputs: inp, results: computeTotals(inp, config) });
    },

    addServiceRow: (prefilledName?: string) => {
      set((state) => {
        const newRow = createServiceRow(`service-${++serviceRowCounter}`, prefilledName);
        const newServices = [...state.inputs.otherServices, newRow];
        const newInputs = { ...state.inputs, otherServices: newServices };
        return { inputs: newInputs, results: computeTotals(newInputs, state.config) };
      });
    },

    updateServiceRow: (id, updates) => {
      set((state) => {
        const newServices = state.inputs.otherServices.map((row) =>
          row.id === id ? { ...row, ...updates } : row
        );
        const newInputs = { ...state.inputs, otherServices: newServices };
        return { inputs: newInputs, results: computeTotals(newInputs, state.config) };
      });
    },

    removeServiceRow: (id) => {
      set((state) => {
        const newServices = state.inputs.otherServices.filter((row) => row.id !== id);
        const newInputs = { ...state.inputs, otherServices: newServices };
        return { inputs: newInputs, results: computeTotals(newInputs, state.config) };
      });
    },

    // Admin edits are session-only — they affect the running app but are
    // never persisted to localStorage. Refreshing the page resets to config file defaults.
    updateConfig: (key, value) => {
      set((state) => {
        const newConfig = { ...state.config, [key]: value };
        return { config: newConfig, results: computeTotals(state.inputs, newConfig) };
      });
    },

    resetConfig: () => {
      set((state) => ({
        config: DEFAULT_CONFIG,
        results: computeTotals(state.inputs, DEFAULT_CONFIG),
      }));
    },

    // Replace the entire config (used for runtime JSON bootstrap).
    setConfig: (config: CalculatorConfig) => {
      set((state) => ({
        config,
        results: computeTotals(state.inputs, config),
      }));
    },

    triggerCalculation: () => {
      const { inputs, config } = get();
      set({ results: computeTotals(inputs, config), hasCalculated: true });
    },

    recompute: () => {
      const { inputs, config } = get();
      set({ results: computeTotals(inputs, config) });
    },
  };
});
