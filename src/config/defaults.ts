import type { CalculatorConfig } from '@/types/calculator';

// Admin password - change this in production
export const ADMIN_PASSWORD = 'CHANGE_ME';

// Config storage version for migrations
export const CONFIG_VERSION = 'v1';

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
  
  // Recommended ranges for warnings
  RECOMMENDED_ONBOARDING_MONTHS_MIN: 1,
  RECOMMENDED_ONBOARDING_MONTHS_MAX: 12,
  RECOMMENDED_PRODUCTIVITY_PCT_MIN: 20,
  RECOMMENDED_PRODUCTIVITY_PCT_MAX: 80,
  RECOMMENDED_VACANCY_DAYS_MAX: 90,
  RECOMMENDED_HR_HOURS_MAX: 40,
  RECOMMENDED_MANAGER_HOURS_MAX: 30,
  RECOMMENDED_TEAM_HOURS_MAX: 20,
  RECOMMENDED_INTERVIEW_HOURS_MAX: 50,
  
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
