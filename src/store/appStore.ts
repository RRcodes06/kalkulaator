import { create } from 'zustand';
import type { CalculatorInputs, CalculatorConfig, ComputedResult, ServiceRow } from '@/types/calculator';
import { DEFAULT_CONFIG, STORAGE_KEYS } from '@/config/defaults';
import { computeTotals, createDefaultInputs, createServiceRow } from '@/engine/calculationEngine';

// ============================================================================
// STORE STATE TYPE
// ============================================================================

interface AppState {
  inputs: CalculatorInputs;
  config: CalculatorConfig;
  results: ComputedResult;
  
  // Input actions
  updateInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  updateNestedInput: <
    K extends keyof CalculatorInputs,
    NK extends keyof NonNullable<CalculatorInputs[K]>
  >(key: K, nestedKey: NK, value: NonNullable<CalculatorInputs[K]>[NK]) => void;
  resetInputs: () => void;
  
  // Service row actions
  addServiceRow: () => void;
  updateServiceRow: (id: string, updates: Partial<ServiceRow>) => void;
  removeServiceRow: (id: string) => void;
  
  // Config actions
  updateConfig: <K extends keyof CalculatorConfig>(key: K, value: CalculatorConfig[K]) => void;
  resetConfig: () => void;
  
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
      });
    },
    
    addServiceRow: () => {
      set((state) => {
        const newRow = createServiceRow(`service-${++serviceRowCounter}`);
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
    
    recompute: () => {
      const { inputs, config } = get();
      set({ results: computeTotals(inputs, config) });
    },
  };
});
