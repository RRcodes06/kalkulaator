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
  ComputedResult,
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
 * Normalize role pay input, falling back to default rates based on role.
 */
export function normalizeRolePay(
  roleInput: RolePayInput,
  roleType: 'hr' | 'manager' | 'team',
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'EST_AVG_GROSS_WAGE' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
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
  
  // Default multipliers for different roles
  const roleMultipliers: Record<string, number> = {
    hr: 1.0,
    manager: 1.5,
    team: 1.0,
  };
  
  let effectivePayType: PayType;
  let effectivePayAmount: number;
  let effectiveHoursPerMonth: number;
  
  if (isDefault) {
    effectivePayType = 'monthly';
    effectivePayAmount = config.EST_AVG_GROSS_WAGE * (roleMultipliers[roleType] || 1.0);
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
        inputs.preboarding.itSetupHours * normalizedRoles.team.employerHourlyRate +
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
  
  // Total cost
  const totalCost = baseCost + badHireResult.expectedRiskCost;
  
  // Calculate percentages
  const percentages: Record<BlockName, number> = {} as Record<BlockName, number>;
  for (const key of Object.keys(blockCosts) as BlockName[]) {
    percentages[key] = totalCost > 0 ? (blockCosts[key].total / totalCost) * 100 : 0;
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
      message: 'Värbatava palk pole määratud. Kasutatakse Eesti keskmist.',
    });
  }
  
  // Range warnings
  const rangeWarnings: RangeWarning[] = [];
  
  if (inputs.onboarding.onboardingMonths < config.RECOMMENDED_ONBOARDING_MONTHS_MIN) {
    rangeWarnings.push({
      field: 'onboardingMonths',
      message: 'Sisseelamisperiood on ebatavaliselt lühike.',
      severity: 'info',
    });
  }
  
  if (inputs.onboarding.onboardingMonths > config.RECOMMENDED_ONBOARDING_MONTHS_MAX) {
    rangeWarnings.push({
      field: 'onboardingMonths',
      message: 'Sisseelamisperiood on ebatavaliselt pikk.',
      severity: 'warning',
    });
  }
  
  if (inputs.onboarding.productivityPct < config.RECOMMENDED_PRODUCTIVITY_PCT_MIN) {
    rangeWarnings.push({
      field: 'productivityPct',
      message: 'Väga madal tootlikkus sisseelamisel suurendab kulusid oluliselt.',
      severity: 'warning',
    });
  }
  
  if (inputs.vacancy.vacancyDays > config.RECOMMENDED_VACANCY_DAYS_MAX) {
    rangeWarnings.push({
      field: 'vacancyDays',
      message: 'Pikk vakantsi periood suurendab oluliselt kogukulusid.',
      severity: 'warning',
    });
  }
  
  return {
    normalizedHirePay,
    normalizedRoles,
    blockCosts,
    baseCost,
    expectedRiskCost: badHireResult.expectedRiskCost,
    totalCost,
    badHireSalaryCost: badHireResult.badHireSalaryCost,
    badHireExtraIfHappens: badHireResult.badHireExtraIfHappens,
    topDrivers,
    percentages,
    defaultsUsed,
    missingPayWarnings,
    rangeWarnings,
  };
}

// ============================================================================
// DEFAULT INPUTS FACTORY
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
    strategyPrep: { hrHours: 4, managerHours: 2, teamHours: 0 },
    adsBranding: { hrHours: 3, managerHours: 1, teamHours: 0, directCosts: 500 },
    candidateMgmt: { hrHours: 10, managerHours: 2, teamHours: 0, testsCost: 0 },
    interviews: { hrHours: 6, managerHours: 8, teamHours: 4, directCosts: 0 },
    backgroundOffer: { hrHours: 3, managerHours: 1, teamHours: 0, directCosts: 0 },
    otherServices: [],
    preboarding: { devicesCost: 500, itSetupHours: 2, prepHours: 2 },
    onboarding: { onboardingMonths: 3, productivityPct: 50, extraCosts: 0 },
    vacancy: { vacancyDays: 30, dailyCost: 0 },
    indirectCosts: { hrHours: 5, managerHours: 3, teamHours: 2 },
  };
}

/**
 * Create a new service row with default values.
 */
export function createServiceRow(id: string): ServiceRow {
  return {
    id,
    name: '',
    details: {
      serviceType: 'outsourced',
      billingType: 'oneOff',
      price: 0,
    },
    serviceHours: 0,
    repeatOnBadHire: false,
  };
}
