/**
 * ============================================================================
 * CALCULATOR CONFIGURATION — Single source of truth
 * ============================================================================
 *
 * All editable values live here. To connect to Joomla or a backend API,
 * replace or merge this object at runtime (e.g. fetch from endpoint and
 * call `useAppStore.getState().resetConfig()` with the fetched data).
 *
 * Groups:
 *   general       – working hours, base salary
 *   roleSalaries  – role-specific default gross salaries
 *   employerTax   – employer-side tax rates
 *   employeeTax   – employee-side tax rates & allowances
 *   risk          – bad-hire probability & cost assumptions
 *   ranges        – recommended min/max for each calculator field
 *   urls          – external links (help, CTA)
 *   texts         – all UI copy that admins may change
 *   labels        – UI labels for blocks & range fields (admin panel)
 */

import type { CalculatorConfig, RecommendedRanges } from '@/types/calculator';

// ── General ─────────────────────────────────────────────────────────────────
const general = {
  hoursPerMonth: 168,
  estoniaAverageGrossSalary: 2115,
} as const;

// ── Role salaries ───────────────────────────────────────────────────────────
const roleSalaries = {
  team: 2115,       // Estonian average gross salary
  hr: 2980,         // Recruiter average gross salary
  manager: 3642,    // HR manager average gross salary
} as const;

// ── Employer taxes ──────────────────────────────────────────────────────────
const employerTax = {
  socialTaxRate: 0.33,
  employerUnemploymentInsuranceRate: 0.008,
} as const;

// ── Employee taxes ──────────────────────────────────────────────────────────
const employeeTax = {
  employeeUnemploymentInsuranceRate: 0.016,
  incomeTaxRate: 0.22,
  pillarIIRate: 0.02,
  taxFreeAllowance: 700,
} as const;

// ── Risk parameters ─────────────────────────────────────────────────────────
const risk = {
  badHireRiskRate: 0.15,
  badHirePayMonths: 2,
} as const;

// ── Recommended ranges ──────────────────────────────────────────────────────
const ranges: RecommendedRanges = {
  'strategyPrep.hrHours':       { min: 2,  max: 8,   unit: 'h' },
  'strategyPrep.managerHours':  { min: 1,  max: 6,   unit: 'h' },
  'strategyPrep.teamHours':     { min: 0,  max: 2,   unit: 'h' },
  'adsBranding.hrHours':        { min: 2,  max: 8,   unit: 'h' },
  'adsBranding.managerHours':   { min: 0,  max: 1,   unit: 'h' },
  'adsBranding.teamHours':      { min: 0,  max: 4,   unit: 'h' },
  'adsBranding.directCosts':    { min: 100, max: 2000, unit: '€' },
  'adsBranding.databaseLicenseFee': { min: 0, max: 500, unit: '€' },
  'candidateMgmt.hrHours':      { min: 4,  max: 25,  unit: 'h' },
  'candidateMgmt.managerHours': { min: 1,  max: 10,  unit: 'h' },
  'interviews.hrHours':         { min: 3,  max: 15,  unit: 'h' },
  'interviews.managerHours':    { min: 3,  max: 20,  unit: 'h' },
  'interviews.teamHours':       { min: 0,  max: 12,  unit: 'h' },
  'interviews.directCosts':     { min: 0,  max: 500,  unit: '€' },
  'backgroundOffer.hrHours':    { min: 1,  max: 6,   unit: 'h' },
  'backgroundOffer.managerHours': { min: 0, max: 4,   unit: 'h' },
  'onboarding.onboardingMonths':  { min: 1,  max: 12, unit: 'months' },
  'onboarding.productivityPct':   { min: 20, max: 80, unit: '%' },
  'vacantPositionImpact.percentageUndone':     { min: 20,  max: 80,   unit: '%' },
  'vacantPositionImpact.monthlyPositionValue':  { min: 2000, max: 8000, unit: '€' },
  'vacantPositionImpact.additionalHours':   { min: 10, max: 60, unit: 'h' },
  'vacantPositionImpact.avgHourlyCost':     { min: 10, max: 35, unit: '€' },
  'vacantPositionImpact.overtimeMultiplier': { min: 1,  max: 2,  unit: 'x' },
};

// ── URLs ────────────────────────────────────────────────────────────────────
const urls = {
  helpUrl: 'https://www.manpower.ee/et/vaerbamisteenused',
} as const;

// ── UI texts ────────────────────────────────────────────────────────────────
// NOTE: Live UI copy is sourced from src/i18n/translations.ts (est/eng).
// These strings are kept ONLY for legacy admin import/export compatibility
// and as a snapshot of the canonical Estonian wording shown in the calculator.
// If you change the wording in the calculator, mirror it here.
const texts = {
  // Live page H1 — read by Index.tsx (per language). Editable in admin.
  pageTitle: {
    est: 'Värbamisprotsessi tegeliku kogukulu kalkulaator',
    eng: 'True Cost of Recruitment Calculator',
  },
  // Live under-title intro paragraph — read by Index.tsx (per language).
  pageSubtitle: {
    est: 'See kalkulaator annab ligikaudse hinnangu värbamisprotsessi kogukulule. Tegelikud kulud võivad varieeruda sõltuvalt konkreetsetest asjaoludest ja sisestatud andmetest. Kalkulaator hõlmab kõiki värbamisprotsessiga seotud otseseid, kaudseid ja varjatud kulusid. Kõik kulud on arvestatud proportsioonis kuu kogukuluga. Kui täpsed andmed puuduvad, kasuta soovituslikke vahemikke või funktsiooni „Täida keskmistega".',
    eng: 'This calculator provides an approximate estimate of the total cost of the recruitment process. Actual costs may vary depending on specific circumstances and the data entered. The calculator covers all direct, indirect, and hidden costs associated with the recruitment process. All costs are calculated in proportion to total monthly cost. If precise data is unavailable, use the recommended ranges or the "Fill with averages" function.',
  },
  // Mirrors translations.subtitle (Estonian) — page intro / disclaimer
  disclaimerText:
    'See kalkulaator annab ligikaudse hinnangu värbamisprotsessi kogukulule. Tegelikud kulud võivad varieeruda sõltuvalt konkreetsetest asjaoludest ja sisestatud andmetest. Kalkulaator hõlmab kõiki värbamisprotsessiga seotud otseseid, kaudseid ja varjatud kulusid. Kõik kulud on arvestatud proportsioonis kuu kogukuluga. Kui täpsed andmed puuduvad, kasuta soovituslikke vahemikke või funktsiooni „Täida keskmistega".',
  // Mirrors translations.riskExplanation template (with placeholders left in)
  riskExplanationText:
    'Kui värbamine ebaõnnestub ({pct}% tõenäosus), kaotate veel {amount} lisaks juba tehtud kuludele. See on võimalik lisakulu, mitte garanteeritud kulu.',
  // Mirrors translations.sectionInfoVacantImpact + guidance — replaces the
  // legacy "indirect costs" concept which no longer exists in the calculator.
  indirectExplanationText:
    'Täitmata positsiooni mõju äri tulemuslikkusele. Vali, kas töö jääb tegemata või kaetakse tiimi poolt. Mõlemat korraga ei arvestata.',
  // Mirrors translations.didThisSurpriseYou
  finalQuestionText:
    'Kas see number üllatas sind?',
  // Mirrors translations.contactUs
  ctaPlaceholderText:
    'Võta meiega ühendust, et arutada, kuidas värbamiskulusid optimeerida.',
  // Mirrors translations.resetDescription
  resetConfirmText:
    'Kõik sisestatud andmed kustutatakse ja väljad taastatakse vaikeväärtustele. Seda toimingut ei saa tagasi võtta.',
  // Mirrors translations.usesEstonianAverage (without the leading icon)
  defaultUsedText:
    'Kasutatakse Eesti keskmist palka',
  // Mirrors translations.privacyNotice
  privacyNotice:
    'Sisestatud infot ei salvestata. Lehelt lahkudes kõik kustub.',
} as const;

// ── Labels (admin panel & engine) ───────────────────────────────────────────

/**
 * Short human-readable names for each cost block. Used in results breakdown,
 * admin panel and as fallback for the engine's topDrivers.label.
 * Must mirror the `block*` keys in src/i18n/translations.ts (Estonian).
 */
export const BLOCK_LABELS: Record<string, string> = {
  strategyPrep:    'Strateegia ja ettevalmistus',
  adsBranding:     'Kuulutused ja bränding',
  candidateMgmt:   'Kandidaatide haldus ja testid',
  interviews:      'Intervjuud',
  backgroundOffer: 'Taustakontroll ja pakkumine',
  otherServices:   'Muud teenused',
  preboarding:     'Ettevalmistus enne alustamist',
  onboarding:      'Sisseelamine',
  vacantImpact:    'Täitmata positsiooni mõju',
  expectedRisk:    'Oodatav riskikulu',
};

/**
 * Field labels inside each range group (shown in admin ranges table).
 * Must contain an entry for every key in `ranges` above and use the same
 * Estonian wording the user sees in the calculator UI (translations.ts).
 */
export const RANGE_LABELS: Record<string, string> = {
  // Strategy & prep
  'strategyPrep.hrHours':                       'Personalitöötaja tunnid',
  'strategyPrep.managerHours':                  'Juhi tunnid',
  'strategyPrep.teamHours':                     'Tiimi tunnid',
  // Ads & branding
  'adsBranding.hrHours':                        'Personalitöötaja tunnid',
  'adsBranding.managerHours':                   'Juhi tunnid',
  'adsBranding.teamHours':                      'Tiimi tunnid',
  'adsBranding.directCosts':                    'Kuulutuste ja brändingu kulud',
  // Candidate management
  'candidateMgmt.hrHours':                      'Personalitöötaja tunnid',
  'candidateMgmt.managerHours':                 'Juhi tunnid',
  // Interviews
  'interviews.hrHours':                         'Personalitöötaja tunnid',
  'interviews.managerHours':                    'Juhi tunnid',
  'interviews.teamHours':                       'Tiimi tunnid',
  'interviews.directCosts':                     'Otsesed kulud',
  // Background & offer
  'backgroundOffer.hrHours':                    'Personalitöötaja tunnid',
  'backgroundOffer.managerHours':               'Juhi tunnid',
  // Onboarding
  'onboarding.onboardingMonths':                'Sisseelamisperiood (kuud)',
  'onboarding.productivityPct':                 'Keskmine tootlikkus (%)',
  // Vacant position impact
  'vacantPositionImpact.percentageUndone':      'Kui suur osa tööst jääb tegemata',
  'vacantPositionImpact.monthlyPositionValue':  'Positsiooni hinnanguline kuine väärtus',
  'vacantPositionImpact.additionalHours':       'Lisatunnid kuus',
  'vacantPositionImpact.avgHourlyCost':         'Keskmine tunnikulu',
  'vacantPositionImpact.overtimeMultiplier':    'Ületunni koefitsient',
};

// ============================================================================
// Assembled CalculatorConfig — used as the single DEFAULT_CONFIG everywhere
// ============================================================================

export const CALCULATOR_CONFIG: CalculatorConfig = {
  HOURS_PER_MONTH:      general.hoursPerMonth,
  EST_AVG_GROSS_WAGE:   general.estoniaAverageGrossSalary,

  SOCIAL_TAX_RATE:      employerTax.socialTaxRate,
  EMPLOYER_UI_RATE:     employerTax.employerUnemploymentInsuranceRate,

  EMPLOYEE_UI_RATE:     employeeTax.employeeUnemploymentInsuranceRate,
  INCOME_TAX_RATE:      employeeTax.incomeTaxRate,
  PILLAR_II_RATE:       employeeTax.pillarIIRate,
  TAX_FREE_ALLOWANCE:   employeeTax.taxFreeAllowance,

  BAD_HIRE_RISK_RATE:   risk.badHireRiskRate,
  BAD_HIRE_PAY_MONTHS:  risk.badHirePayMonths,

  roleDefaultSalaries:  { ...roleSalaries },
  recommendedRanges:    ranges,

  helpUrl:              urls.helpUrl,

  ...texts,
};

// Re-export sub-groups for direct access where convenient
export { general, roleSalaries, employerTax, employeeTax, risk, ranges, urls, texts };
