import type { CalculatorConfig } from '@/types/calculator';

export const DEFAULT_CONFIG: CalculatorConfig = {
  HOURS_PER_MONTH: 168,
  EST_AVG_GROSS_WAGE: 2075,
  
  // Employer taxes (Estonia 2024)
  SOCIAL_TAX_RATE: 0.33,
  EMPLOYER_UI_RATE: 0.008,
  
  // Risk parameters
  BAD_HIRE_RISK_RATE: 0.15,
  BAD_HIRE_PAY_MONTHS: 2,
  
  // Recommended ranges for warnings
  RECOMMENDED_ONBOARDING_MONTHS_MIN: 1,
  RECOMMENDED_ONBOARDING_MONTHS_MAX: 12,
  RECOMMENDED_PRODUCTIVITY_PCT_MIN: 20,
  RECOMMENDED_PRODUCTIVITY_PCT_MAX: 80,
  RECOMMENDED_VACANCY_DAYS_MAX: 90,
  
  // Text snippets
  disclaimerText: 'See kalkulaator annab ligikaudse hinnangu värbamisprotsessi kogukulule. Tegelikud kulud võivad varieeruda sõltuvalt konkreetsetest asjaoludest.',
  riskExplanationText: 'Halva värbamisotsuse risk arvestab statistilist tõenäosust, et töötaja lahkub katseajal või osutub sobimatuks. Keskmine risk on 15% ning kulud hõlmavad kahe kuu palgakulusid.',
  privacyNotice: 'Sisestatud infot ei salvestata. Lehelt lahkudes kõik kustub.',
};

export const STORAGE_KEYS = {
  CONFIG: 'recruitment-calc-config',
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
