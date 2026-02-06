import type { CalculatorConfig, RecommendedRanges } from '@/types/calculator';

// Admin password - change this in production
export const ADMIN_PASSWORD = 'CHANGE_ME';

// Config storage version for migrations
export const CONFIG_VERSION = 'v2';

// ============================================================================
// DEFAULT RECOMMENDED RANGES
// Keys map to input fields; labels shown in Admin UI
// ============================================================================

export const DEFAULT_RECOMMENDED_RANGES: RecommendedRanges = {
  // Strategy & Prep
  'strategyPrep.hrHours': { min: 2, max: 8, unit: 'h' },
  'strategyPrep.managerHours': { min: 1, max: 6, unit: 'h' },
  'strategyPrep.teamHours': { min: 0, max: 4, unit: 'h' },
  
  // Ads & Branding
  'adsBranding.hrHours': { min: 2, max: 8, unit: 'h' },
  'adsBranding.managerHours': { min: 0, max: 4, unit: 'h' },
  'adsBranding.directCosts': { min: 100, max: 2000, unit: '€' },
  
  // Candidate Management
  'candidateMgmt.hrHours': { min: 4, max: 25, unit: 'h' },
  'candidateMgmt.managerHours': { min: 1, max: 10, unit: 'h' },
  
  // Interviews
  'interviews.hrHours': { min: 3, max: 15, unit: 'h' },
  'interviews.managerHours': { min: 3, max: 20, unit: 'h' },
  'interviews.teamHours': { min: 0, max: 12, unit: 'h' },
  'interviews.directCosts': { min: 0, max: 500, unit: '€' },
  
  // Background & Offer
  'backgroundOffer.hrHours': { min: 1, max: 6, unit: 'h' },
  'backgroundOffer.managerHours': { min: 0, max: 4, unit: 'h' },
  
  // Indirect Costs
  'indirectCosts.hrHours': { min: 2, max: 12, unit: 'h' },
  'indirectCosts.managerHours': { min: 1, max: 10, unit: 'h' },
  'indirectCosts.teamHours': { min: 0, max: 8, unit: 'h' },
  
  // Onboarding
  'onboarding.onboardingMonths': { min: 1, max: 12, unit: 'kuud' },
  'onboarding.productivityPct': { min: 20, max: 80, unit: '%' },
  
  // Vacancy
  'vacancy.vacancyDays': { min: 10, max: 90, unit: 'päeva' },
};

// Labels for recommended ranges (shown in Admin UI)
export const RANGE_LABELS: Record<string, string> = {
  'strategyPrep.hrHours': 'Strateegia: HR tunnid',
  'strategyPrep.managerHours': 'Strateegia: Juhi tunnid',
  'strategyPrep.teamHours': 'Strateegia: Tiimi tunnid',
  'adsBranding.hrHours': 'Kuulutused: HR tunnid',
  'adsBranding.managerHours': 'Kuulutused: Juhi tunnid',
  'adsBranding.directCosts': 'Kuulutuste kulud',
  'candidateMgmt.hrHours': 'Kandidaadid: HR tunnid',
  'candidateMgmt.managerHours': 'Kandidaadid: Juhi tunnid',
  'interviews.hrHours': 'Intervjuud: HR tunnid',
  'interviews.managerHours': 'Intervjuud: Juhi tunnid',
  'interviews.teamHours': 'Intervjuud: Tiimi tunnid',
  'interviews.directCosts': 'Intervjuude kulud',
  'backgroundOffer.hrHours': 'Taustakontroll: HR tunnid',
  'backgroundOffer.managerHours': 'Taustakontroll: Juhi tunnid',
  'indirectCosts.hrHours': 'Kaudsed: HR tunnid',
  'indirectCosts.managerHours': 'Kaudsed: Juhi tunnid',
  'indirectCosts.teamHours': 'Kaudsed: Tiimi tunnid',
  'onboarding.onboardingMonths': 'Sisseelamisperiood',
  'onboarding.productivityPct': 'Keskmine tootlikkus',
  'vacancy.vacancyDays': 'Vakantsi kestus',
};

export const DEFAULT_CONFIG: CalculatorConfig = {
  HOURS_PER_MONTH: 168,
  EST_AVG_GROSS_WAGE: 2075,
  
  // Employer taxes (Estonia 2024)
  SOCIAL_TAX_RATE: 0.33,
  EMPLOYER_UI_RATE: 0.008,
  
  // Employee taxes (for future net/gross support)
  EMPLOYEE_UI_RATE: 0.016,
  INCOME_TAX_RATE: 0.20,
  PILLAR_II_RATE: 0.02,
  TAX_FREE_ALLOWANCE: 654,
  
  // Risk parameters
  BAD_HIRE_RISK_RATE: 0.15,
  BAD_HIRE_PAY_MONTHS: 2,
  
  // Recommended ranges - single source of truth
  recommendedRanges: DEFAULT_RECOMMENDED_RANGES,
  
  // Text snippets
  disclaimerText: 'See kalkulaator annab ligikaudse hinnangu värbamisprotsessi kogukulule. Tegelikud kulud võivad varieeruda sõltuvalt konkreetsetest asjaoludest.',
  riskExplanationText: 'Halva värbamisotsuse risk arvestab statistilist tõenäosust, et töötaja lahkub katseajal või osutub sobimatuks. Keskmine risk on 15% ning kulud hõlmavad kahe kuu palgakulusid.',
  indirectExplanationText: 'Kaudsed kulud hõlmavad aega, mille kolleegid pühendavad uue töötaja abistamisele, koosolekutele ja muudele tegevustele, mis ei ole otseselt värbamisprotsess.',
  finalQuestionText: 'Kas see number üllatas sind?',
  ctaPlaceholderText: 'Võta meiega ühendust, et arutada, kuidas värbamiskulusid optimeerida.',
  resetConfirmText: 'Kas oled kindel, et soovid kõik andmed lähtestada?',
  defaultUsedText: 'Kasutasime vaikeväärtust',
  privacyNotice: 'Sisestatud infot ei salvestata. Lehelt lahkudes kõik kustub.',
};

export const STORAGE_KEYS = {
  CONFIG: `recruitment-calc-config-${CONFIG_VERSION}`,
} as const;

export const BLOCK_LABELS: Record<string, string> = {
  strategyPrep: 'Strateegia ja ettevalmistus',
  adsBranding: 'Kuulutused ja bränding',
  candidateMgmt: 'Kandidaatide haldus ja testid',
  interviews: 'Intervjuud',
  backgroundOffer: 'Taustakontroll ja pakkumine',
  otherServices: 'Muud teenused',
  preboarding: 'Ettevalmistus enne alustamist',
  onboarding: 'Sisseelamine',
  vacancy: 'Vaba ametikoha kulu',
  indirectCosts: 'Kaudsed kulud',
  expectedRisk: 'Oodatav riskikulu',
};
