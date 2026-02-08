/**
 * Recruitment Cost Calculation Engine
 * 
 * Pure functions with strong typing for calculating recruitment costs.
 * All functions are deterministic and side-effect free.
 * 
 * IMPORTANT: Do not round inside engine; round at UI display only.
 */

import type {
  PayType,
  PayInput,
  NormalizedPay,
  RolePayInput,
  ServiceRow,
  InhouseServiceDetails,
  OutsourcedServiceDetails,
  BlockHoursInput,
  CalculatorInputs,
  CalculatorConfig,
  BlockCost,
  BlockCostsMap,
  BlockName,
  ServicesCostResult,
  BadHireScenarioResult,
  TopDriver,
  DefaultsUsed,
  MissingPayWarning,
  RangeWarning,
  RangeHint,
  ComputedResult,
  EmptyFieldInfo,
} from '@/types/calculator';
import { BLOCK_LABELS } from '@/config/defaults';

// ============================================================================
// CORE PAY CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate monthly gross base from pay input.
 * If hourly, multiplies by hours per month.
 */
export function monthlyGrossBase(
  payType: PayType,
  payAmount: number,
  hoursPerMonth: number,
  defaultMonthlyHours: number
): number {
  if (payType === 'unset' || payAmount <= 0) {
    return 0;
  }
  
  if (payType === 'monthly') {
    return payAmount;
  }
  
  // hourly
  const hours = hoursPerMonth > 0 ? hoursPerMonth : defaultMonthlyHours;
  return payAmount * hours;
}

/**
 * Calculate employer cost from monthly gross.
 * Adds social tax and employer UI tax.
 */
export function employerCostFromMonthlyGross(
  monthlyGross: number,
  socialTaxRate: number,
  employerUiRate: number
): number {
  const socialTax = monthlyGross * socialTaxRate;
  const employerUi = monthlyGross * employerUiRate;
  return monthlyGross + socialTax + employerUi;
}

/**
 * Calculate employer hourly rate (includes employer taxes).
 */
export function employerHourlyRate(
  payType: PayType,
  payAmount: number,
  hoursPerMonth: number,
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): number {
  const monthlyGross = monthlyGrossBase(payType, payAmount, hoursPerMonth, config.HOURS_PER_MONTH);
  if (monthlyGross <= 0) return 0;
  
  const employerCost = employerCostFromMonthlyGross(
    monthlyGross,
    config.SOCIAL_TAX_RATE,
    config.EMPLOYER_UI_RATE
  );
  
  const hours = hoursPerMonth > 0 ? hoursPerMonth : config.HOURS_PER_MONTH;
  return employerCost / hours;
}

/**
 * Calculate gross hourly rate (without employer taxes).
 * Used for indirect cost calculations.
 */
export function grossHourlyRate(
  payType: PayType,
  payAmount: number,
  hoursPerMonth: number,
  defaultMonthlyHours: number
): number {
  if (payType === 'hourly' && payAmount > 0) {
    return payAmount;
  }
  
  const monthlyGross = monthlyGrossBase(payType, payAmount, hoursPerMonth, defaultMonthlyHours);
  if (monthlyGross <= 0) return 0;
  
  const hours = hoursPerMonth > 0 ? hoursPerMonth : defaultMonthlyHours;
  return monthlyGross / hours;
}

/**
 * Normalize hire pay input, falling back to EST_AVG_GROSS_WAGE if unset or missing.
 */
export function normalizeHirePay(
  hireInput: PayInput,
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'EST_AVG_GROSS_WAGE' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): NormalizedPay {
  const isDefault = hireInput.payType === 'unset' || hireInput.payAmount <= 0;
  
  let effectivePayType: PayType;
  let effectivePayAmount: number;
  let effectiveHoursPerMonth: number;
  
  if (isDefault) {
    effectivePayType = 'monthly';
    effectivePayAmount = config.EST_AVG_GROSS_WAGE;
    effectiveHoursPerMonth = config.HOURS_PER_MONTH;
  } else {
    effectivePayType = hireInput.payType;
    effectivePayAmount = hireInput.payAmount;
    effectiveHoursPerMonth = hireInput.hoursPerMonth ?? config.HOURS_PER_MONTH;
  }
  
  const monthlyGross = monthlyGrossBase(
    effectivePayType,
    effectivePayAmount,
    effectiveHoursPerMonth,
    config.HOURS_PER_MONTH
  );
  
  const employerMonthlyCost = employerCostFromMonthlyGross(
    monthlyGross,
    config.SOCIAL_TAX_RATE,
    config.EMPLOYER_UI_RATE
  );
  
  const hours = effectiveHoursPerMonth > 0 ? effectiveHoursPerMonth : config.HOURS_PER_MONTH;
  
  return {
    monthlyGross,
    grossHourlyRate: monthlyGross / hours,
    employerHourlyRate: employerMonthlyCost / hours,
    employerMonthlyCost,
    isDefault,
  };
}

/**
 * Normalize role pay input, falling back to role-specific Estonian averages.
 */
export function normalizeRolePay(
  roleInput: RolePayInput,
  roleType: 'hr' | 'manager' | 'team',
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'EST_AVG_GROSS_WAGE' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>,
  roleDefaults?: { team: number; hr: number; manager: number }
): NormalizedPay {
  if (!roleInput.enabled) {
    return {
      monthlyGross: 0,
      grossHourlyRate: 0,
      employerHourlyRate: 0,
      employerMonthlyCost: 0,
      isDefault: true,
    };
  }
  
  const isDefault = roleInput.payType === 'unset' || roleInput.payAmount <= 0;
  
  // Role-specific default salaries (Estonian averages)
  const defaultSalaries = roleDefaults ?? {
    team: 2075,      // Estonian average gross salary
    hr: 2860,        // Estonian recruiter average
    manager: 3566,   // Estonian HR manager average
  };
  
  let effectivePayType: PayType;
  let effectivePayAmount: number;
  let effectiveHoursPerMonth: number;
  
  if (isDefault) {
    effectivePayType = 'monthly';
    effectivePayAmount = defaultSalaries[roleType];
    effectiveHoursPerMonth = config.HOURS_PER_MONTH;
  } else {
    effectivePayType = roleInput.payType;
    effectivePayAmount = roleInput.payAmount;
    effectiveHoursPerMonth = roleInput.hoursPerMonth ?? config.HOURS_PER_MONTH;
  }
  
  const monthlyGross = monthlyGrossBase(
    effectivePayType,
    effectivePayAmount,
    effectiveHoursPerMonth,
    config.HOURS_PER_MONTH
  );
  
  const employerMonthlyCost = employerCostFromMonthlyGross(
    monthlyGross,
    config.SOCIAL_TAX_RATE,
    config.EMPLOYER_UI_RATE
  );
  
  const hours = effectiveHoursPerMonth > 0 ? effectiveHoursPerMonth : config.HOURS_PER_MONTH;
  
  return {
    monthlyGross,
    grossHourlyRate: monthlyGross / hours,
    employerHourlyRate: employerMonthlyCost / hours,
    employerMonthlyCost,
    isDefault,
  };
}

// ============================================================================
// SPECIALIZED COST FUNCTIONS
// ============================================================================

/**
 * Calculate onboarding productivity loss cost.
 * Cost = hireEmployerHourlyRate * HOURS_PER_MONTH * months * (100 - productivityPct) / 100
 */
export function onboardingProductivityLossCost(
  hireEmployerMonthlyCost: number,
  onboardingMonths: number,
  productivityPct: number
): number {
  if (onboardingMonths <= 0 || productivityPct >= 100) {
    return 0;
  }
  
  const lossRate = (100 - Math.max(0, Math.min(100, productivityPct))) / 100;
  return hireEmployerMonthlyCost * onboardingMonths * lossRate;
}

/**
 * Calculate vacancy cost.
 */
export function vacancyCost(vacancyDaily: number, vacancyDays: number): number {
  return vacancyDaily * Math.max(0, vacancyDays);
}

/**
 * Calculate cost for a single service row.
 */
export function computeServiceRowCost(
  row: ServiceRow,
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): number {
  const details = row.details;
  
  if (details.serviceType === 'inhouse') {
    const inhouseDetails = details as InhouseServiceDetails;
    const hourlyRate = employerHourlyRate(
      inhouseDetails.payType,
      inhouseDetails.payAmount,
      inhouseDetails.hoursPerMonth ?? config.HOURS_PER_MONTH,
      config
    );
    return hourlyRate * row.serviceHours;
  } else {
    const outsourcedDetails = details as OutsourcedServiceDetails;
    switch (outsourcedDetails.billingType) {
      case 'hourly':
        return outsourcedDetails.price * row.serviceHours;
      case 'monthly':
        // For monthly billing, assume it covers the service period
        return outsourcedDetails.price;
      case 'oneOff':
        return outsourcedDetails.price;
      default:
        return 0;
    }
  }
}

/**
 * Compute total services cost and repeated services cost (for bad hire scenario).
 */
export function computeServicesCost(
  rows: ServiceRow[],
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): ServicesCostResult {
  let totalServicesCost = 0;
  let repeatedServicesCost = 0;
  
  for (const row of rows) {
    const cost = computeServiceRowCost(row, config);
    totalServicesCost += cost;
    if (row.repeatOnBadHire) {
      repeatedServicesCost += cost;
    }
  }
  
  return { totalServicesCost, repeatedServicesCost };
}

/**
 * Compute bad hire scenario costs.
 */
export function computeBadHireScenario(
  normalizedHireMonthlyGross: number,
  repeatedServicesCost: number,
  config: Pick<CalculatorConfig, 'BAD_HIRE_RISK_RATE' | 'BAD_HIRE_PAY_MONTHS' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): BadHireScenarioResult {
  const employerMonthlyCost = employerCostFromMonthlyGross(
    normalizedHireMonthlyGross,
    config.SOCIAL_TAX_RATE,
    config.EMPLOYER_UI_RATE
  );
  
  // Cost of paying the bad hire for N months before termination
  const badHireSalaryCost = employerMonthlyCost * config.BAD_HIRE_PAY_MONTHS;
  
  // Extra costs if bad hire happens (repeated services + salary)
  const badHireExtraIfHappens = badHireSalaryCost + repeatedServicesCost;
  
  // Expected (probability-weighted) risk cost
  const expectedRiskCost = badHireExtraIfHappens * config.BAD_HIRE_RISK_RATE;
  
  return {
    badHireSalaryCost,
    badHireExtraIfHappens,
    expectedRiskCost,
  };
}

// ============================================================================
// BLOCK COST CALCULATIONS
// ============================================================================

/**
 * Calculate time cost for a block based on role hours.
 */
export function computeBlockTimeCost(
  hours: BlockHoursInput,
  normalizedRoles: {
    hr: NormalizedPay;
    manager: NormalizedPay;
    team: NormalizedPay;
  }
): number {
  return (
    hours.hrHours * normalizedRoles.hr.employerHourlyRate +
    hours.managerHours * normalizedRoles.manager.employerHourlyRate +
    hours.teamHours * normalizedRoles.team.employerHourlyRate
  );
}

/**
 * Calculate indirect block time cost (uses gross rates, no employer taxes).
 */
export function computeIndirectBlockTimeCost(
  hours: BlockHoursInput,
  normalizedRoles: {
    hr: NormalizedPay;
    manager: NormalizedPay;
    team: NormalizedPay;
  }
): number {
  return (
    hours.hrHours * normalizedRoles.hr.grossHourlyRate +
    hours.managerHours * normalizedRoles.manager.grossHourlyRate +
    hours.teamHours * normalizedRoles.team.grossHourlyRate
  );
}

// ============================================================================
// MAIN COMPUTATION FUNCTION
// ============================================================================

/**
 * Compute all costs and results from inputs and config.
 */
export function computeTotals(
  inputs: CalculatorInputs,
  config: CalculatorConfig
): ComputedResult {
  // Normalize pay rates
  const normalizedHirePay = normalizeHirePay(inputs.hirePay, config);
  const normalizedRoles = {
    hr: normalizeRolePay(inputs.roles.hr, 'hr', config),
    manager: normalizeRolePay(inputs.roles.manager, 'manager', config),
    team: normalizeRolePay(inputs.roles.team, 'team', config),
  };
  
  // Calculate services cost
  const { totalServicesCost, repeatedServicesCost } = computeServicesCost(
    inputs.otherServices,
    config
  );
  
  // Calculate bad hire scenario
  const badHireResult = computeBadHireScenario(
    normalizedHirePay.monthlyGross,
    repeatedServicesCost,
    config
  );
  
  // Calculate block costs
  const blockCosts: BlockCostsMap = {
    strategyPrep: {
      timeCost: computeBlockTimeCost(inputs.strategyPrep, normalizedRoles),
      directCost: 0,
      total: 0,
    },
    adsBranding: {
      timeCost: computeBlockTimeCost(inputs.adsBranding, normalizedRoles),
      directCost: inputs.adsBranding.directCosts,
      total: 0,
    },
    candidateMgmt: {
      timeCost: computeBlockTimeCost(inputs.candidateMgmt, normalizedRoles),
      directCost: inputs.candidateMgmt.testsCost,
      total: 0,
    },
    interviews: {
      timeCost: computeBlockTimeCost(inputs.interviews, normalizedRoles),
      directCost: inputs.interviews.directCosts,
      total: 0,
    },
    backgroundOffer: {
      timeCost: computeBlockTimeCost(inputs.backgroundOffer, normalizedRoles),
      directCost: inputs.backgroundOffer.directCosts,
      total: 0,
    },
    otherServices: {
      timeCost: 0,
      directCost: totalServicesCost,
      total: totalServicesCost,
    },
    preboarding: {
      timeCost: (
        inputs.preboarding.itSetupHours * inputs.preboarding.itHourlyRate * 1.338 + // Apply employer taxes
        inputs.preboarding.prepHours * normalizedRoles.hr.employerHourlyRate
      ),
      directCost: inputs.preboarding.devicesCost,
      total: 0,
    },
    onboarding: {
      timeCost: 0,
      directCost: onboardingProductivityLossCost(
        normalizedHirePay.employerMonthlyCost,
        inputs.onboarding.onboardingMonths,
        inputs.onboarding.productivityPct
      ) + inputs.onboarding.extraCosts,
      total: 0,
    },
    vacancy: {
      timeCost: 0,
      directCost: vacancyCost(inputs.vacancy.dailyCost, inputs.vacancy.vacancyDays),
      total: 0,
    },
    indirectCosts: {
      timeCost: computeIndirectBlockTimeCost(inputs.indirectCosts, normalizedRoles),
      directCost: 0,
      total: 0,
    },
    expectedRisk: {
      timeCost: 0,
      directCost: badHireResult.expectedRiskCost,
      total: badHireResult.expectedRiskCost,
    },
  };
  
  // Calculate totals for each block
  for (const key of Object.keys(blockCosts) as BlockName[]) {
    const block = blockCosts[key];
    block.total = block.timeCost + block.directCost;
  }
  
  // Calculate base cost (excluding risk)
  const baseCost = Object.entries(blockCosts)
    .filter(([key]) => key !== 'expectedRisk')
    .reduce((sum, [, block]) => sum + block.total, 0);
  
  // Total cost - NOW excludes risk (risk shown separately)
  const totalCost = baseCost; // Main display uses baseCost only
  const totalCostWithRisk = baseCost + badHireResult.expectedRiskCost; // For reference
  
  // Calculate percentages based on baseCost (excluding risk from main view)
  const percentages: Record<BlockName, number> = {} as Record<BlockName, number>;
  for (const key of Object.keys(blockCosts) as BlockName[]) {
    if (key === 'expectedRisk') {
      percentages[key] = 0; // Risk not shown in main breakdown
    } else {
      percentages[key] = baseCost > 0 ? (blockCosts[key].total / baseCost) * 100 : 0;
    }
  }
  
  // Find top 3 cost drivers
  const sortedBlocks = (Object.keys(blockCosts) as BlockName[])
    .map((key) => ({
      block: key,
      label: BLOCK_LABELS[key] || key,
      amount: blockCosts[key].total,
      percentage: percentages[key],
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  
  const topDrivers: TopDriver[] = sortedBlocks.slice(0, 3);
  
  // Defaults used flags
  const defaultsUsed: DefaultsUsed = {
    hirePay: normalizedHirePay.isDefault,
    hrPay: normalizedRoles.hr.isDefault,
    managerPay: normalizedRoles.manager.isDefault,
    teamPay: normalizedRoles.team.isDefault,
  };
  
  // Missing pay warnings
  const missingPayWarnings: MissingPayWarning[] = [];
  if (normalizedHirePay.isDefault) {
    missingPayWarnings.push({
      field: 'hirePay',
      message: 'Värvatava palk pole määratud. Kasutatakse Eesti keskmist.',
    });
  }
  
  // Range warnings
  const rangeWarnings: RangeWarning[] = [];
  
  // ============================================================================
  // HELPER: Generate warning for a single field using recommendedRanges
  // ============================================================================
  function addFieldWarning(
    field: string,
    label: string,
    value: number,
    sectionInUse: boolean
  ) {
    // Get range from config.recommendedRanges
    const range = config.recommendedRanges?.[field];
    
    // Skip if no range defined for this field
    if (!range) return;
    
    const { min, max, unit } = range;
    
    // Build range text helper
    const rangeText = `${min}–${max}`;
    
    // If value is 0/empty and section is in use, show advisory message
    if (value === 0 && sectionInUse) {
      rangeWarnings.push({
        field,
        label,
        message: `Tüüpiline vahemik: ${rangeText} ${unit}. Sisesta hinnang.`,
        severity: 'info',
        recommendedMin: min,
        recommendedMax: max,
        currentValue: 0,
        unit,
      });
      return;
    }
    
    // Skip further checks if value is 0
    if (value === 0) return;
    
    // Below min - advisory tone, not punitive
    if (value < min) {
      rangeWarnings.push({
        field,
        label,
        message: `See võib olla alahinnatud. Tüüpiline vahemik: ${rangeText} ${unit}.`,
        severity: 'info',
        recommendedMin: min,
        recommendedMax: max,
        currentValue: value,
        unit,
      });
      return;
    }
    
    // Above max - advisory tone suggesting optimization, not an error
    if (value > max) {
      rangeWarnings.push({
        field,
        label,
        message: `See on tavapärasest kõrgem. Kulude vähendamiseks võiks kaaluda, kas seda saab optimeerida. Tüüpiline vahemik: ${rangeText} ${unit}.`,
        severity: 'warning',
        recommendedMin: min,
        recommendedMax: max,
        currentValue: value,
        unit,
      });
    }
  }
  
  // ============================================================================
  // STRATEGY & PREP WARNINGS
  // ============================================================================
  const strategyInUse = inputs.strategyPrep.hrHours > 0 || 
                        inputs.strategyPrep.managerHours > 0 || 
                        inputs.strategyPrep.teamHours > 0;
  
  addFieldWarning('strategyPrep.hrHours', 'Strateegia: HR tunnid', inputs.strategyPrep.hrHours, strategyInUse);
  addFieldWarning('strategyPrep.managerHours', 'Strateegia: Juhi tunnid', inputs.strategyPrep.managerHours, strategyInUse);
  addFieldWarning('strategyPrep.teamHours', 'Strateegia: Tiimi tunnid', inputs.strategyPrep.teamHours, strategyInUse);
  
  // ============================================================================
  // ADS & BRANDING WARNINGS
  // ============================================================================
  const adsInUse = inputs.adsBranding.hrHours > 0 || 
                   inputs.adsBranding.managerHours > 0 || 
                   inputs.adsBranding.directCosts > 0;
  
  addFieldWarning('adsBranding.hrHours', 'Kuulutused: HR tunnid', inputs.adsBranding.hrHours, adsInUse);
  addFieldWarning('adsBranding.managerHours', 'Kuulutused: Juhi tunnid', inputs.adsBranding.managerHours, adsInUse);
  addFieldWarning('adsBranding.directCosts', 'Kuulutuste kulud', inputs.adsBranding.directCosts, adsInUse);
  
  // ============================================================================
  // CANDIDATE MANAGEMENT WARNINGS
  // ============================================================================
  const candidateInUse = inputs.candidateMgmt.hrHours > 0 || 
                         inputs.candidateMgmt.managerHours > 0 || 
                         inputs.candidateMgmt.testsCost > 0;
  
  addFieldWarning('candidateMgmt.hrHours', 'Kandidaadid: HR tunnid', inputs.candidateMgmt.hrHours, candidateInUse);
  addFieldWarning('candidateMgmt.managerHours', 'Kandidaadid: Juhi tunnid', inputs.candidateMgmt.managerHours, candidateInUse);
  // Note: testsCost has no recommended range (variable by vendor)
  
  // ============================================================================
  // INTERVIEWS WARNINGS
  // ============================================================================
  const interviewsInUse = inputs.interviews.hrHours > 0 || 
                          inputs.interviews.managerHours > 0 || 
                          inputs.interviews.teamHours > 0 ||
                          inputs.interviews.directCosts > 0;
  
  addFieldWarning('interviews.hrHours', 'Intervjuud: HR tunnid', inputs.interviews.hrHours, interviewsInUse);
  addFieldWarning('interviews.managerHours', 'Intervjuud: Juhi tunnid', inputs.interviews.managerHours, interviewsInUse);
  addFieldWarning('interviews.teamHours', 'Intervjuud: Tiimi tunnid', inputs.interviews.teamHours, interviewsInUse);
  addFieldWarning('interviews.directCosts', 'Intervjuude kulud', inputs.interviews.directCosts, interviewsInUse);
  
  // ============================================================================
  // BACKGROUND & OFFER WARNINGS
  // ============================================================================
  const backgroundInUse = inputs.backgroundOffer.hrHours > 0 || 
                          inputs.backgroundOffer.managerHours > 0 || 
                          inputs.backgroundOffer.directCosts > 0;
  
  addFieldWarning('backgroundOffer.hrHours', 'Taustakontroll: HR tunnid', inputs.backgroundOffer.hrHours, backgroundInUse);
  addFieldWarning('backgroundOffer.managerHours', 'Taustakontroll: Juhi tunnid', inputs.backgroundOffer.managerHours, backgroundInUse);
  // Note: backgroundOffer.directCosts has no recommended range (variable by service)
  
  // ============================================================================
  // INDIRECT COSTS WARNINGS
  // ============================================================================
  const indirectInUse = inputs.indirectCosts.hrHours > 0 || 
                        inputs.indirectCosts.managerHours > 0 || 
                        inputs.indirectCosts.teamHours > 0;
  
  addFieldWarning('indirectCosts.hrHours', 'Kaudsed: HR tunnid', inputs.indirectCosts.hrHours, indirectInUse);
  addFieldWarning('indirectCosts.managerHours', 'Kaudsed: Juhi tunnid', inputs.indirectCosts.managerHours, indirectInUse);
  addFieldWarning('indirectCosts.teamHours', 'Kaudsed: Tiimi tunnid', inputs.indirectCosts.teamHours, indirectInUse);
  
  // ============================================================================
  // ONBOARDING WARNINGS
  // ============================================================================
  const onboardingInUse = inputs.onboarding.onboardingMonths > 0 || 
                          inputs.onboarding.productivityPct > 0 || 
                          inputs.onboarding.extraCosts > 0;
  
  addFieldWarning('onboarding.onboardingMonths', 'Sisseelamisperiood', inputs.onboarding.onboardingMonths, onboardingInUse);
  addFieldWarning('onboarding.productivityPct', 'Keskmine tootlikkus', inputs.onboarding.productivityPct, onboardingInUse);
  // Note: extraCosts has no recommended range (variable)
  
  // ============================================================================
  // VACANCY WARNINGS
  // ============================================================================
  const vacancyInUse = inputs.vacancy.vacancyDays > 0 || inputs.vacancy.dailyCost > 0;
  
  addFieldWarning('vacancy.vacancyDays', 'Vakantsi kestus', inputs.vacancy.vacancyDays, vacancyInUse);
  // Note: dailyCost has no recommended range (depends on role/business)
  
  // Generate range hints for all fields that have recommended ranges
  const rangeHints: RangeHint[] = [];
  if (config.recommendedRanges) {
    for (const [field, range] of Object.entries(config.recommendedRanges)) {
      rangeHints.push({
        field,
        min: range.min,
        max: range.max,
        unit: range.unit,
      });
    }
  }
  
  // Track empty/zero fields for transparency in results
  const emptyFields: EmptyFieldInfo[] = [];
  
  // Check hire pay
  if (inputs.hirePay.payType === 'unset' || inputs.hirePay.payAmount === 0) {
    emptyFields.push({ sectionId: 'position', fieldKey: 'hirePay', label: 'Värvatava töötaja palk', fieldType: 'salary' });
  }
  
  // Check role pays
  if (inputs.roles.hr.payType === 'unset' || inputs.roles.hr.payAmount === 0) {
    emptyFields.push({ sectionId: 'roles', fieldKey: 'roles.hr', label: 'Personalitöötaja palk', fieldType: 'salary' });
  }
  if (inputs.roles.manager.payType === 'unset' || inputs.roles.manager.payAmount === 0) {
    emptyFields.push({ sectionId: 'roles', fieldKey: 'roles.manager', label: 'Juhi palk', fieldType: 'salary' });
  }
  if (inputs.roles.team.payType === 'unset' || inputs.roles.team.payAmount === 0) {
    emptyFields.push({ sectionId: 'roles', fieldKey: 'roles.team', label: 'Tiimi palk', fieldType: 'salary' });
  }
  
  // Check block inputs
  const blockFieldChecks: Array<{ sectionId: string; value: number; key: string; label: string; type: EmptyFieldInfo['fieldType'] }> = [
    { sectionId: 'strategy', value: inputs.strategyPrep.hrHours, key: 'strategyPrep.hrHours', label: 'Strateegia: HR tunnid', type: 'hours' },
    { sectionId: 'strategy', value: inputs.strategyPrep.managerHours, key: 'strategyPrep.managerHours', label: 'Strateegia: Juhi tunnid', type: 'hours' },
    { sectionId: 'ads', value: inputs.adsBranding.hrHours, key: 'adsBranding.hrHours', label: 'Kuulutused: HR tunnid', type: 'hours' },
    { sectionId: 'ads', value: inputs.adsBranding.directCosts, key: 'adsBranding.directCosts', label: 'Kuulutuste kulud', type: 'cost' },
    { sectionId: 'candidate', value: inputs.candidateMgmt.hrHours, key: 'candidateMgmt.hrHours', label: 'Kandidaadid: HR tunnid', type: 'hours' },
    { sectionId: 'interviews', value: inputs.interviews.hrHours, key: 'interviews.hrHours', label: 'Intervjuud: HR tunnid', type: 'hours' },
    { sectionId: 'interviews', value: inputs.interviews.managerHours, key: 'interviews.managerHours', label: 'Intervjuud: Juhi tunnid', type: 'hours' },
    { sectionId: 'preboarding', value: inputs.preboarding.devicesCost, key: 'preboarding.devicesCost', label: 'Seadmete kulu', type: 'cost' },
    { sectionId: 'onboarding', value: inputs.onboarding.onboardingMonths, key: 'onboarding.onboardingMonths', label: 'Sisseelamisperiood', type: 'months' },
    { sectionId: 'onboarding', value: inputs.onboarding.productivityPct, key: 'onboarding.productivityPct', label: 'Keskmine tootlikkus', type: 'percentage' },
    { sectionId: 'vacancy', value: inputs.vacancy.vacancyDays, key: 'vacancy.vacancyDays', label: 'Vakantsi kestus', type: 'days' },
    { sectionId: 'vacancy', value: inputs.vacancy.dailyCost, key: 'vacancy.dailyCost', label: 'Päevakulu', type: 'cost' },
  ];
  
  for (const check of blockFieldChecks) {
    if (check.value === 0) {
      emptyFields.push({ sectionId: check.sectionId, fieldKey: check.key, label: check.label, fieldType: check.type });
    }
  }
  
  return {
    normalizedHirePay,
    normalizedRoles,
    blockCosts,
    baseCost,
    expectedRiskCost: badHireResult.expectedRiskCost,
    totalCost,
    totalCostWithRisk,
    badHireSalaryCost: badHireResult.badHireSalaryCost,
    badHireExtraIfHappens: badHireResult.badHireExtraIfHappens,
    topDrivers,
    percentages,
    defaultsUsed,
    missingPayWarnings,
    rangeWarnings,
    rangeHints,
    emptyFields,
  };
}

// ============================================================================
// DEFAULT INPUTS FACTORY - ALL INPUTS START EMPTY
// ============================================================================

export function createDefaultInputs(): CalculatorInputs {
  return {
    positionTitle: '',
    hirePay: {
      payType: 'unset',
      payAmount: 0,
    },
    roles: {
      hr: { enabled: true, payType: 'unset', payAmount: 0 },
      manager: { enabled: true, payType: 'unset', payAmount: 0 },
      team: { enabled: true, payType: 'unset', payAmount: 0 },
    },
    // ALL hours and costs start at 0 - user must fill in
    strategyPrep: { hrHours: 0, managerHours: 0, teamHours: 0 },
    adsBranding: { hrHours: 0, managerHours: 0, teamHours: 0, directCosts: 0 },
    candidateMgmt: { hrHours: 0, managerHours: 0, teamHours: 0, testsCost: 0 },
    interviews: { hrHours: 0, managerHours: 0, teamHours: 0, directCosts: 0 },
    backgroundOffer: { hrHours: 0, managerHours: 0, teamHours: 0, directCosts: 0 },
    otherServices: [],
    preboarding: { devicesCost: 0, itSetupHours: 0, itHourlyRate: 0, prepHours: 0 },
    onboarding: { onboardingMonths: 0, productivityPct: 0, extraCosts: 0 },
    vacancy: { vacancyDays: 0, dailyCost: 0 },
    indirectCosts: { hrHours: 0, managerHours: 0, teamHours: 0 },
  };
}

/**
 * Create a new service row with default values.
 * @param id - Unique identifier for the row
 * @param name - Optional prefilled name for the service
 */
export function createServiceRow(id: string, name: string = ''): ServiceRow {
  return {
    id,
    name,
    details: {
      serviceType: 'outsourced',
      billingType: 'oneOff',
      price: 0,
    },
    serviceHours: 0,
    repeatOnBadHire: false,
  };
}
