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
  
  // ============================================
  // RECOMMENDED RANGES - only for benchmarkable fields
  // ============================================
  
  // Strategy & Prep (typical: HR 2-6h, Mgr 1-4h, Team 0-2h)
  RECOMMENDED_STRATEGY_HR_HOURS_MIN: 2,
  RECOMMENDED_STRATEGY_HR_HOURS_MAX: 8,
  RECOMMENDED_STRATEGY_MGR_HOURS_MIN: 1,
  RECOMMENDED_STRATEGY_MGR_HOURS_MAX: 6,
  RECOMMENDED_STRATEGY_TEAM_HOURS_MIN: 0,
  RECOMMENDED_STRATEGY_TEAM_HOURS_MAX: 4,
  
  // Ads & Branding (typical: HR 2-6h, Mgr 1-3h, €200-1500)
  RECOMMENDED_ADS_HR_HOURS_MIN: 2,
  RECOMMENDED_ADS_HR_HOURS_MAX: 8,
  RECOMMENDED_ADS_MGR_HOURS_MIN: 0,
  RECOMMENDED_ADS_MGR_HOURS_MAX: 4,
  RECOMMENDED_ADS_DIRECT_COST_MIN: 100,
  RECOMMENDED_ADS_DIRECT_COST_MAX: 2000,
  
  // Candidate Management (typical: HR 5-20h, Mgr 2-8h)
  RECOMMENDED_CANDIDATE_HR_HOURS_MIN: 4,
  RECOMMENDED_CANDIDATE_HR_HOURS_MAX: 25,
  RECOMMENDED_CANDIDATE_MGR_HOURS_MIN: 1,
  RECOMMENDED_CANDIDATE_MGR_HOURS_MAX: 10,
  
  // Interviews (typical: HR 4-12h, Mgr 4-16h, Team 2-8h, €0-500)
  RECOMMENDED_INTERVIEW_HR_HOURS_MIN: 3,
  RECOMMENDED_INTERVIEW_HR_HOURS_MAX: 15,
  RECOMMENDED_INTERVIEW_MGR_HOURS_MIN: 3,
  RECOMMENDED_INTERVIEW_MGR_HOURS_MAX: 20,
  RECOMMENDED_INTERVIEW_TEAM_HOURS_MIN: 0,
  RECOMMENDED_INTERVIEW_TEAM_HOURS_MAX: 12,
  RECOMMENDED_INTERVIEW_DIRECT_COST_MIN: 0,
  RECOMMENDED_INTERVIEW_DIRECT_COST_MAX: 500,
  
  // Background & Offer (typical: HR 2-5h, Mgr 1-3h)
  RECOMMENDED_BACKGROUND_HR_HOURS_MIN: 1,
  RECOMMENDED_BACKGROUND_HR_HOURS_MAX: 6,
  RECOMMENDED_BACKGROUND_MGR_HOURS_MIN: 0,
  RECOMMENDED_BACKGROUND_MGR_HOURS_MAX: 4,
  
  // Indirect Costs (typical: HR 2-10h, Mgr 2-8h, Team 1-5h)
  RECOMMENDED_INDIRECT_HR_HOURS_MIN: 2,
  RECOMMENDED_INDIRECT_HR_HOURS_MAX: 12,
  RECOMMENDED_INDIRECT_MGR_HOURS_MIN: 1,
  RECOMMENDED_INDIRECT_MGR_HOURS_MAX: 10,
  RECOMMENDED_INDIRECT_TEAM_HOURS_MIN: 0,
  RECOMMENDED_INDIRECT_TEAM_HOURS_MAX: 8,
  
  // Onboarding (typical: 1-12 months, 20-80% productivity)
  RECOMMENDED_ONBOARDING_MONTHS_MIN: 1,
  RECOMMENDED_ONBOARDING_MONTHS_MAX: 12,
  RECOMMENDED_PRODUCTIVITY_PCT_MIN: 20,
  RECOMMENDED_PRODUCTIVITY_PCT_MAX: 80,
  
  // Vacancy (typical: 10-90 days)
  RECOMMENDED_VACANCY_DAYS_MIN: 10,
  RECOMMENDED_VACANCY_DAYS_MAX: 90,
  
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
