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
  
  // Input actions
  updateInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  updateNestedInput: <
    K extends keyof CalculatorInputs,
    NK extends keyof NonNullable<CalculatorInputs[K]>
  >(key: K, nestedKey: NK, value: NonNullable<CalculatorInputs[K]>[NK]) => void;
  resetInputs: () => void;
  fillWithAverages: () => void;
  
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
    
    updateInput: (key, value) => {
      set((state) => {
        const newInputs = { ...state.inputs, [key]: value };
        return {
          inputs: newInputs,
          results: computeTotals(newInputs, state.config),
        };
      });
    },
    
    updateNestedInput: (key, nestedKey, value) => {
      set((state) => {
        const currentValue = state.inputs[key];
        if (typeof currentValue === 'object' && currentValue !== null) {
          const newNested = { ...currentValue, [nestedKey]: value };
          const newInputs = { ...state.inputs, [key]: newNested };
          return {
            inputs: newInputs,
            results: computeTotals(newInputs, state.config),
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
      });
    },
    
    fillWithAverages: () => {
      const { config } = get();
      const ranges = config.recommendedRanges;
      
      // Helper to get midpoint rounded by unit
      const mid = (key: string): number | undefined => {
        const r = ranges[key];
        if (!r) return undefined;
        const raw = (r.min + r.max) / 2;
        if (r.unit === 'h') return Math.round(raw);
        if (r.unit === '€') return Math.round(raw);
        if (r.unit === '%') return Math.round(raw);
        return Math.round(raw); // days, months
      };

      const filledInputs: CalculatorInputs = {
        positionTitle: '',
        hirePay: { payType: 'monthly', payAmount: ROLE_DEFAULT_SALARIES.team, hoursPerMonth: config.HOURS_PER_MONTH },
        roles: {
          hr: { enabled: true, payType: 'monthly', payAmount: ROLE_DEFAULT_SALARIES.hr },
          manager: { enabled: true, payType: 'monthly', payAmount: ROLE_DEFAULT_SALARIES.manager },
          team: { enabled: true, payType: 'monthly', payAmount: ROLE_DEFAULT_SALARIES.team },
        },
        strategyPrep: {
          hrHours: mid('strategyPrep.hrHours') ?? 0,
          managerHours: mid('strategyPrep.managerHours') ?? 0,
          teamHours: mid('strategyPrep.teamHours') ?? 0,
        },
        adsBranding: {
          hrHours: mid('adsBranding.hrHours') ?? 0,
          managerHours: mid('adsBranding.managerHours') ?? 0,
          teamHours: 0,
          directCosts: mid('adsBranding.directCosts') ?? 0,
        },
        candidateMgmt: {
          hrHours: mid('candidateMgmt.hrHours') ?? 0,
          managerHours: mid('candidateMgmt.managerHours') ?? 0,
          teamHours: 0,
          testsCost: 0, // no range, leave empty
        },
        interviews: {
          hrHours: mid('interviews.hrHours') ?? 0,
          managerHours: mid('interviews.managerHours') ?? 0,
          teamHours: mid('interviews.teamHours') ?? 0,
          directCosts: mid('interviews.directCosts') ?? 0,
        },
        backgroundOffer: {
          hrHours: mid('backgroundOffer.hrHours') ?? 0,
          managerHours: mid('backgroundOffer.managerHours') ?? 0,
          teamHours: 0,
          directCosts: 0, // no range
        },
        otherServices: [], // provider-dependent, leave empty
        preboarding: {
          devicesCost: 0, // no range
          itSetupHours: 0, // no range
          itHourlyRate: 0, // no range
          prepHours: 0, // no range
        },
        onboarding: {
          onboardingMonths: mid('onboarding.onboardingMonths') ?? 0,
          productivityPct: mid('onboarding.productivityPct') ?? 0,
          extraCosts: 0, // no range
        },
        vacancy: {
          vacancyDays: mid('vacancy.vacancyDays') ?? 0,
          dailyCost: 0, // no range
        },
        indirectCosts: {
          hrHours: mid('indirectCosts.hrHours') ?? 0,
          managerHours: mid('indirectCosts.managerHours') ?? 0,
          teamHours: mid('indirectCosts.teamHours') ?? 0,
        },
      };

      set({
        inputs: filledInputs,
        results: computeTotals(filledInputs, config),
      });
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
