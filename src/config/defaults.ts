import type { ConfigConstants, UserInputs } from '@/types/calculator';

export const DEFAULT_CONFIG: ConfigConstants = {
  HOURS_PER_MONTH: 168,
  EST_AVG_GROSS_WAGE: 2075,
  
  // Tax rates (Estonia 2024)
  SOCIAL_TAX_RATE: 0.33,
  EMPLOYER_UI_RATE: 0.008,
  EMPLOYEE_UI_RATE: 0.016,
  INCOME_TAX_RATE: 0.22,
  PILLAR_II_RATE: 0.02,
  TAX_FREE_ALLOWANCE: 700,
  
  // Risk parameters
  BAD_HIRE_RISK: 0.15,
  BAD_HIRE_MONTHS: 2,
  
  // Text snippets
  disclaimerText: 'See kalkulaator annab ligikaudse hinnangu värbamisprotsessi kogukulule. Tegelikud kulud võivad varieeruda sõltuvalt konkreetsetest asjaoludest.',
  riskExplanationText: 'Halva värbamisotsuse risk arvestab statistilist tõenäosust, et töötaja lahkub katseajal või osutub sobimatuks. Keskmine risk on 15% ning kulud hõlmavad kahe kuu palgakulusid.',
  privacyNotice: 'Sisestatud infot ei salvestata. Lehelt lahkudes kõik kustub.',
};

export const DEFAULT_USER_INPUTS: UserInputs = {
  positionTitle: '',
  grossSalary: 2500,
  
  hrHoursSpent: 20,
  hrHourlyRate: 0,
  managerHoursSpent: 15,
  managerHourlyRate: 0,
  otherStaffHoursSpent: 10,
  otherStaffHourlyRate: 0,
  
  jobAdsCost: 500,
  recruitmentAgencyFee: 0,
  backgroundCheckCost: 0,
  assessmentToolsCost: 0,
  travelCost: 0,
  otherExternalCosts: 0,
  
  trainingCost: 0,
  equipmentCost: 500,
  onboardingHours: 40,
  mentorHoursSpent: 20,
  mentorHourlyRate: 0,
  
  monthsToFullProductivity: 3,
  productivityDuringRampUp: 50,
};

export const STORAGE_KEYS = {
  CONFIG: 'recruitment-calc-config',
} as const;
