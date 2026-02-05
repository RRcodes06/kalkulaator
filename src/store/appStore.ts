import { create } from 'zustand';
import type { AppState, UserInputs, ComputedResults, ConfigConstants, Warnings, DefaultsUsed } from '@/types/calculator';
import { DEFAULT_CONFIG, DEFAULT_USER_INPUTS, STORAGE_KEYS } from '@/config/defaults';

const loadConfigFromStorage = (): ConfigConstants => {
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

const saveConfigToStorage = (config: ConfigConstants): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save config to localStorage:', e);
  }
};

const calculateHourlyRate = (grossSalary: number, hoursPerMonth: number): number => {
  return grossSalary / hoursPerMonth;
};

const computeResults = (inputs: UserInputs, config: ConfigConstants): ComputedResults => {
  // Calculate hourly rates if not provided
  const defaultHourlyRate = calculateHourlyRate(config.EST_AVG_GROSS_WAGE, config.HOURS_PER_MONTH);
  
  const hrRate = inputs.hrHourlyRate || defaultHourlyRate;
  const managerRate = inputs.managerHourlyRate || (defaultHourlyRate * 1.5);
  const mentorRate = inputs.mentorHourlyRate || defaultHourlyRate;
  const otherRate = inputs.otherStaffHourlyRate || defaultHourlyRate;
  
  // Salary costs (employer perspective)
  const employerSocialTax = inputs.grossSalary * config.SOCIAL_TAX_RATE;
  const employerUiTax = inputs.grossSalary * config.EMPLOYER_UI_RATE;
  const totalEmployerCost = inputs.grossSalary + employerSocialTax + employerUiTax;
  
  // Internal time costs
  const hrTimeCost = inputs.hrHoursSpent * hrRate;
  const managerTimeCost = inputs.managerHoursSpent * managerRate;
  const otherStaffTimeCost = inputs.otherStaffHoursSpent * otherRate;
  const totalInternalTimeCost = hrTimeCost + managerTimeCost + otherStaffTimeCost;
  
  // External costs
  const totalExternalCosts = 
    inputs.jobAdsCost +
    inputs.recruitmentAgencyFee +
    inputs.backgroundCheckCost +
    inputs.assessmentToolsCost +
    inputs.travelCost +
    inputs.otherExternalCosts;
  
  // Onboarding costs
  const onboardingTimeCost = inputs.onboardingHours * defaultHourlyRate;
  const mentorTimeCost = inputs.mentorHoursSpent * mentorRate;
  const totalOnboardingCost = 
    inputs.trainingCost +
    inputs.equipmentCost +
    onboardingTimeCost +
    mentorTimeCost;
  
  // Productivity loss during ramp-up
  const monthlyEmployerCost = totalEmployerCost;
  const productivityLossRate = (100 - inputs.productivityDuringRampUp) / 100;
  const productivityLossCost = monthlyEmployerCost * inputs.monthsToFullProductivity * productivityLossRate;
  
  // Bad hire risk cost
  const badHireRiskCost = totalEmployerCost * config.BAD_HIRE_MONTHS * config.BAD_HIRE_RISK;
  
  // Totals
  const totalDirectCosts = totalInternalTimeCost + totalExternalCosts + totalOnboardingCost;
  const totalIndirectCosts = productivityLossCost + badHireRiskCost;
  const grandTotal = totalDirectCosts + totalIndirectCosts;
  
  // Insights
  const annualSalary = inputs.grossSalary * 12;
  const costAsPercentOfAnnualSalary = (grandTotal / annualSalary) * 100;
  const monthsOfSalaryEquivalent = grandTotal / inputs.grossSalary;
  
  return {
    employerSocialTax,
    employerUiTax,
    totalEmployerCost,
    hrTimeCost,
    managerTimeCost,
    otherStaffTimeCost,
    totalInternalTimeCost,
    totalExternalCosts,
    onboardingTimeCost,
    mentorTimeCost,
    totalOnboardingCost,
    productivityLossCost,
    badHireRiskCost,
    totalDirectCosts,
    totalIndirectCosts,
    grandTotal,
    costAsPercentOfAnnualSalary,
    monthsOfSalaryEquivalent,
  };
};

const computeWarnings = (inputs: UserInputs, config: ConfigConstants): Warnings => {
  return {
    lowSalary: inputs.grossSalary < config.EST_AVG_GROSS_WAGE * 0.5,
    highProductivityLoss: inputs.productivityDuringRampUp < 30,
    noExternalCosts: (
      inputs.jobAdsCost === 0 &&
      inputs.recruitmentAgencyFee === 0 &&
      inputs.backgroundCheckCost === 0
    ),
    longRampUp: inputs.monthsToFullProductivity > 6,
  };
};

const computeDefaultsUsed = (inputs: UserInputs): DefaultsUsed => {
  return {
    hrHourlyRate: inputs.hrHourlyRate === 0,
    managerHourlyRate: inputs.managerHourlyRate === 0,
    mentorHourlyRate: inputs.mentorHourlyRate === 0,
  };
};

export const useAppStore = create<AppState>((set, get) => {
  const initialConfig = loadConfigFromStorage();
  const initialInputs = DEFAULT_USER_INPUTS;
  
  return {
    userInputs: initialInputs,
    computedResults: computeResults(initialInputs, initialConfig),
    config: initialConfig,
    warnings: computeWarnings(initialInputs, initialConfig),
    defaultsUsed: computeDefaultsUsed(initialInputs),
    
    updateUserInput: (key, value) => {
      set((state) => {
        const newInputs = { ...state.userInputs, [key]: value };
        return {
          userInputs: newInputs,
          computedResults: computeResults(newInputs, state.config),
          warnings: computeWarnings(newInputs, state.config),
          defaultsUsed: computeDefaultsUsed(newInputs),
        };
      });
    },
    
    resetInputs: () => {
      const { config } = get();
      set({
        userInputs: DEFAULT_USER_INPUTS,
        computedResults: computeResults(DEFAULT_USER_INPUTS, config),
        warnings: computeWarnings(DEFAULT_USER_INPUTS, config),
        defaultsUsed: computeDefaultsUsed(DEFAULT_USER_INPUTS),
      });
    },
    
    updateConfig: (key, value) => {
      set((state) => {
        const newConfig = { ...state.config, [key]: value };
        saveConfigToStorage(newConfig);
        return {
          config: newConfig,
          computedResults: computeResults(state.userInputs, newConfig),
          warnings: computeWarnings(state.userInputs, newConfig),
        };
      });
    },
    
    resetConfig: () => {
      localStorage.removeItem(STORAGE_KEYS.CONFIG);
      set((state) => ({
        config: DEFAULT_CONFIG,
        computedResults: computeResults(state.userInputs, DEFAULT_CONFIG),
        warnings: computeWarnings(state.userInputs, DEFAULT_CONFIG),
      }));
    },
  };
});
