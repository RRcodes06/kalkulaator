// User input types
export interface UserInputs {
  // Position details
  positionTitle: string;
  grossSalary: number;
  
  // Internal recruitment costs
  hrHoursSpent: number;
  hrHourlyRate: number;
  managerHoursSpent: number;
  managerHourlyRate: number;
  otherStaffHoursSpent: number;
  otherStaffHourlyRate: number;
  
  // External costs
  jobAdsCost: number;
  recruitmentAgencyFee: number;
  backgroundCheckCost: number;
  assessmentToolsCost: number;
  travelCost: number;
  otherExternalCosts: number;
  
  // Onboarding costs
  trainingCost: number;
  equipmentCost: number;
  onboardingHours: number;
  mentorHoursSpent: number;
  mentorHourlyRate: number;
  
  // Time to productivity
  monthsToFullProductivity: number;
  productivityDuringRampUp: number; // percentage 0-100
}

export interface ComputedResults {
  // Salary costs
  employerSocialTax: number;
  employerUiTax: number;
  totalEmployerCost: number;
  
  // Internal time costs
  hrTimeCost: number;
  managerTimeCost: number;
  otherStaffTimeCost: number;
  totalInternalTimeCost: number;
  
  // External costs total
  totalExternalCosts: number;
  
  // Onboarding costs
  onboardingTimeCost: number;
  mentorTimeCost: number;
  totalOnboardingCost: number;
  
  // Productivity loss
  productivityLossCost: number;
  
  // Risk costs
  badHireRiskCost: number;
  
  // Totals
  totalDirectCosts: number;
  totalIndirectCosts: number;
  grandTotal: number;
  
  // Insights
  costAsPercentOfAnnualSalary: number;
  monthsOfSalaryEquivalent: number;
}

export interface ConfigConstants {
  HOURS_PER_MONTH: number;
  EST_AVG_GROSS_WAGE: number;
  
  // Tax rates
  SOCIAL_TAX_RATE: number;
  EMPLOYER_UI_RATE: number;
  EMPLOYEE_UI_RATE: number;
  INCOME_TAX_RATE: number;
  PILLAR_II_RATE: number;
  TAX_FREE_ALLOWANCE: number;
  
  // Risk parameters
  BAD_HIRE_RISK: number;
  BAD_HIRE_MONTHS: number;
  
  // Text snippets
  disclaimerText: string;
  riskExplanationText: string;
  privacyNotice: string;
}

export interface Warnings {
  lowSalary: boolean;
  highProductivityLoss: boolean;
  noExternalCosts: boolean;
  longRampUp: boolean;
}

export interface DefaultsUsed {
  hrHourlyRate: boolean;
  managerHourlyRate: boolean;
  mentorHourlyRate: boolean;
}

export interface AppState {
  userInputs: UserInputs;
  computedResults: ComputedResults;
  config: ConfigConstants;
  warnings: Warnings;
  defaultsUsed: DefaultsUsed;
  
  // Actions
  updateUserInput: <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => void;
  resetInputs: () => void;
  updateConfig: <K extends keyof ConfigConstants>(key: K, value: ConfigConstants[K]) => void;
  resetConfig: () => void;
}
