/**
 * defaults.ts — Re-exports from the centralized calculator-config
 * and defines app-level constants (admin password, storage keys, labels).
 */
import type { CalculatorConfig, RecommendedRanges } from '@/types/calculator';
import { CALCULATOR_CONFIG, roleSalaries, ranges } from '@/config/calculator-config';

// Admin password - change this in production
export const ADMIN_PASSWORD = 'CHANGE_ME';

// Config storage version for migrations
export const CONFIG_VERSION = 'v5';

// Re-export for backward compatibility
export const ROLE_DEFAULT_SALARIES = roleSalaries;
export const DEFAULT_RECOMMENDED_RANGES: RecommendedRanges = ranges;
export const DEFAULT_CONFIG: CalculatorConfig = CALCULATOR_CONFIG;

export const ROLE_SALARY_LABELS = {
  team: 'Eesti Statistikaameti andmetel keskmine brutopalk',
  hr: 'Eesti Statistikaameti andmetel värbamisspetsialisti keskmine brutopalk',
  manager: 'Eesti Statistikaameti andmetel personalijuhi keskmine brutopalk',
} as const;

// Labels for recommended ranges (shown in Admin UI)
export const RANGE_LABELS: Record<string, string> = {
  'strategyPrep.hrHours': 'HR tunnid',
  'strategyPrep.managerHours': 'Juhi tunnid',
  'strategyPrep.teamHours': 'Tiimi tunnid',
  'adsBranding.hrHours': 'HR tunnid',
  'adsBranding.managerHours': 'Juhi tunnid',
  'adsBranding.teamHours': 'Tiimi tunnid',
  'adsBranding.directCosts': 'Otsesed kulud',
  'candidateMgmt.hrHours': 'HR tunnid',
  'candidateMgmt.managerHours': 'Juhi tunnid',
  'interviews.hrHours': 'HR tunnid',
  'interviews.managerHours': 'Juhi tunnid',
  'interviews.teamHours': 'Tiimi tunnid',
  'interviews.directCosts': 'Otsesed kulud',
  'backgroundOffer.hrHours': 'HR tunnid',
  'backgroundOffer.managerHours': 'Juhi tunnid',
  'onboarding.onboardingMonths': 'Sisseelamisperiood (kuud)',
  'onboarding.productivityPct': 'Keskmine tootlikkus (%)',
  'vacantPositionImpact.percentageUndone': 'Täitmata töö osakaal',
  'vacantPositionImpact.monthlyPositionValue': 'Positsiooni kuine väärtus',
  'vacantPositionImpact.additionalHours': 'Lisatunnid kuus',
  'vacantPositionImpact.avgHourlyCost': 'Keskmine tunnikulu',
  'vacantPositionImpact.overtimeMultiplier': 'Ületunni koefitsient',
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
  vacantImpact: 'Täitmata positsiooni mõju',
  expectedRisk: 'Oodatav riskikulu',
};
