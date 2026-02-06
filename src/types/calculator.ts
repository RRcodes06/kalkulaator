// ============================================================================
// PAY INPUT TYPES
// ============================================================================

export type PayType = 'monthly' | 'hourly' | 'unset';

export interface PayInput {
  payType: PayType;
  payAmount: number;
  hoursPerMonth?: number; // only required if hourly
}

export interface NormalizedPay {
  monthlyGross: number;
  grossHourlyRate: number;
  employerHourlyRate: number;
  employerMonthlyCost: number;
  isDefault: boolean;
}

// ============================================================================
// ROLE INPUTS
// ============================================================================

export interface RolePayInput extends PayInput {
  enabled: boolean;
}

export interface RolesInput {
  hr: RolePayInput;
  manager: RolePayInput;
  team: RolePayInput;
}

// ============================================================================
// SERVICE ROW TYPES ("Muud teenused")
// ============================================================================

export type ServiceType = 'inhouse' | 'outsourced';
export type BillingType = 'monthly' | 'hourly' | 'oneOff';

export interface InhouseServiceDetails {
  serviceType: 'inhouse';
  payType: PayType;
  payAmount: number;
  hoursPerMonth?: number; // only if hourly
}

export interface OutsourcedServiceDetails {
  serviceType: 'outsourced';
  billingType: BillingType;
  price: number;
}

export type ServiceDetails = InhouseServiceDetails | OutsourcedServiceDetails;

export interface ServiceRow {
  id: string;
  name: string;
  details: ServiceDetails;
  serviceHours: number;
  repeatOnBadHire: boolean;
}

// ============================================================================
// BLOCK INPUTS
// ============================================================================

export interface BlockHoursInput {
  hrHours: number;
  managerHours: number;
  teamHours: number;
}

export interface StrategyPrepInput extends BlockHoursInput {}

export interface AdsBrandingInput extends BlockHoursInput {
  directCosts: number; // job ads, employer branding materials
}

export interface CandidateMgmtInput extends BlockHoursInput {
  testsCost: number; // assessment tools, tests
}

export interface InterviewsInput extends BlockHoursInput {
  directCosts: number; // travel, facilities
}

export interface BackgroundOfferInput extends BlockHoursInput {
  directCosts: number; // background checks, legal fees
}

export interface PreboardingInput {
  devicesCost: number;
  itSetupHours: number;
  prepHours: number; // HR prep hours
}

export interface OnboardingInput {
  onboardingMonths: number;
  productivityPct: number; // 0-100, percentage of full productivity during ramp-up
  extraCosts: number; // training materials, courses
}

export interface VacancyInput {
  vacancyDays: number;
  dailyCost: number; // estimated daily cost of unfilled position
}

export interface IndirectCostsInput extends BlockHoursInput {
  // These are calculated using gross hourly rates (no employer taxes)
}

// ============================================================================
// ALL INPUTS COMBINED
// ============================================================================

export interface CalculatorInputs {
  // Position
  positionTitle: string;
  
  // Hire pay
  hirePay: PayInput;
  
  // Role pay rates
  roles: RolesInput;
  
  // Block inputs
  strategyPrep: StrategyPrepInput;
  adsBranding: AdsBrandingInput;
  candidateMgmt: CandidateMgmtInput;
  interviews: InterviewsInput;
  backgroundOffer: BackgroundOfferInput;
  otherServices: ServiceRow[];
  preboarding: PreboardingInput;
  onboarding: OnboardingInput;
  vacancy: VacancyInput;
  indirectCosts: IndirectCostsInput;
}

// ============================================================================
// CONFIG TYPES
// ============================================================================

export interface CalculatorConfig {
  HOURS_PER_MONTH: number;
  EST_AVG_GROSS_WAGE: number;
  
  // Employer taxes
  SOCIAL_TAX_RATE: number;
  EMPLOYER_UI_RATE: number;
  
  // Employee taxes (for future net/gross support)
  EMPLOYEE_UI_RATE: number;
  INCOME_TAX_RATE: number;
  PILLAR_II_RATE: number;
  TAX_FREE_ALLOWANCE: number;
  
  // Risk parameters
  BAD_HIRE_RISK_RATE: number;
  BAD_HIRE_PAY_MONTHS: number;
  
  // Recommended ranges for warnings
  RECOMMENDED_ONBOARDING_MONTHS_MIN: number;
  RECOMMENDED_ONBOARDING_MONTHS_MAX: number;
  RECOMMENDED_PRODUCTIVITY_PCT_MIN: number;
  RECOMMENDED_PRODUCTIVITY_PCT_MAX: number;
  RECOMMENDED_VACANCY_DAYS_MAX: number;
  RECOMMENDED_HR_HOURS_MAX: number;
  RECOMMENDED_MANAGER_HOURS_MAX: number;
  RECOMMENDED_TEAM_HOURS_MAX: number;
  RECOMMENDED_INTERVIEW_HOURS_MAX: number;
  
  // Text snippets
  disclaimerText: string;
  riskExplanationText: string;
  indirectExplanationText: string;
  finalQuestionText: string;
  ctaPlaceholderText: string;
  resetConfirmText: string;
  defaultUsedText: string;
  privacyNotice: string;
}

// ============================================================================
// BLOCK COST RESULT
// ============================================================================

export interface BlockCost {
  timeCost: number;
  directCost: number;
  total: number;
}

export interface BlockCostsMap {
  strategyPrep: BlockCost;
  adsBranding: BlockCost;
  candidateMgmt: BlockCost;
  interviews: BlockCost;
  backgroundOffer: BlockCost;
  otherServices: BlockCost;
  preboarding: BlockCost;
  onboarding: BlockCost;
  vacancy: BlockCost;
  indirectCosts: BlockCost;
  expectedRisk: BlockCost;
}

export type BlockName = keyof BlockCostsMap;

// ============================================================================
// COMPUTED RESULTS
// ============================================================================

export interface ServicesCostResult {
  totalServicesCost: number;
  repeatedServicesCost: number; // cost of services that repeat on bad hire
}

export interface BadHireScenarioResult {
  badHireSalaryCost: number; // N months of employer cost
  badHireExtraIfHappens: number; // services that repeat + salary cost
  expectedRiskCost: number; // probability-weighted expected cost
}

export interface TopDriver {
  block: BlockName;
  label: string;
  amount: number;
  percentage: number;
}

export interface DefaultsUsed {
  hirePay: boolean;
  hrPay: boolean;
  managerPay: boolean;
  teamPay: boolean;
}

export interface MissingPayWarning {
  field: string;
  message: string;
}

export interface RangeWarning {
  field: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface ComputedResult {
  // Normalized pay rates
  normalizedHirePay: NormalizedPay;
  normalizedRoles: {
    hr: NormalizedPay;
    manager: NormalizedPay;
    team: NormalizedPay;
  };
  
  // Block costs breakdown
  blockCosts: BlockCostsMap;
  
  // Totals
  baseCost: number; // sum of all blocks except risk
  expectedRiskCost: number;
  totalCost: number; // baseCost + expectedRiskCost
  
  // Bad hire scenario details
  badHireSalaryCost: number;
  badHireExtraIfHappens: number;
  
  // Top 3 cost drivers
  topDrivers: TopDriver[];
  
  // Percentages breakdown
  percentages: Record<BlockName, number>;
  
  // Flags
  defaultsUsed: DefaultsUsed;
  missingPayWarnings: MissingPayWarning[];
  rangeWarnings: RangeWarning[];
}
