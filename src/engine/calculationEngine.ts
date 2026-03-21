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

export function monthlyGrossBase(
  payType: PayType,
  payAmount: number,
  hoursPerMonth: number,
  defaultMonthlyHours: number
): number {
  if (payType === 'unset' || payAmount <= 0) return 0;
  if (payType === 'monthly') return payAmount;
  const hours = hoursPerMonth > 0 ? hoursPerMonth : defaultMonthlyHours;
  return payAmount * hours;
}

export function employerCostFromMonthlyGross(
  monthlyGross: number,
  socialTaxRate: number,
  employerUiRate: number
): number {
  return monthlyGross * (1 + socialTaxRate + employerUiRate);
}

export function employerHourlyRate(
  payType: PayType,
  payAmount: number,
  hoursPerMonth: number,
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): number {
  const monthlyGross = monthlyGrossBase(payType, payAmount, hoursPerMonth, config.HOURS_PER_MONTH);
  if (monthlyGross <= 0) return 0;
  const employerCost = employerCostFromMonthlyGross(monthlyGross, config.SOCIAL_TAX_RATE, config.EMPLOYER_UI_RATE);
  const hours = hoursPerMonth > 0 ? hoursPerMonth : config.HOURS_PER_MONTH;
  return employerCost / hours;
}

export function grossHourlyRate(
  payType: PayType,
  payAmount: number,
  hoursPerMonth: number,
  defaultMonthlyHours: number
): number {
  if (payType === 'hourly' && payAmount > 0) return payAmount;
  const monthlyGross = monthlyGrossBase(payType, payAmount, hoursPerMonth, defaultMonthlyHours);
  if (monthlyGross <= 0) return 0;
  const hours = hoursPerMonth > 0 ? hoursPerMonth : defaultMonthlyHours;
  return monthlyGross / hours;
}

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
  
  const monthlyGross = monthlyGrossBase(effectivePayType, effectivePayAmount, effectiveHoursPerMonth, config.HOURS_PER_MONTH);
  const employerMonthlyCost = employerCostFromMonthlyGross(monthlyGross, config.SOCIAL_TAX_RATE, config.EMPLOYER_UI_RATE);
  const hours = effectiveHoursPerMonth > 0 ? effectiveHoursPerMonth : config.HOURS_PER_MONTH;
  
  return {
    monthlyGross,
    grossHourlyRate: monthlyGross / hours,
    employerHourlyRate: employerMonthlyCost / hours,
    employerMonthlyCost,
    isDefault,
  };
}

export function normalizeRolePay(
  roleInput: RolePayInput,
  roleType: 'hr' | 'manager' | 'team',
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'EST_AVG_GROSS_WAGE' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>,
  roleDefaults?: { team: number; hr: number; manager: number }
): NormalizedPay {
  if (!roleInput.enabled) {
    return { monthlyGross: 0, grossHourlyRate: 0, employerHourlyRate: 0, employerMonthlyCost: 0, isDefault: true };
  }
  
  const isDefault = roleInput.payType === 'unset' || roleInput.payAmount <= 0;
  const defaultSalaries = roleDefaults ?? { team: 2075, hr: 2860, manager: 3566 };
  
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
  
  const monthlyGross = monthlyGrossBase(effectivePayType, effectivePayAmount, effectiveHoursPerMonth, config.HOURS_PER_MONTH);
  const employerMonthlyCost = employerCostFromMonthlyGross(monthlyGross, config.SOCIAL_TAX_RATE, config.EMPLOYER_UI_RATE);
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

export function onboardingProductivityLossCost(
  hireEmployerMonthlyCost: number,
  onboardingMonths: number,
  productivityPct: number
): number {
  if (onboardingMonths <= 0 || productivityPct >= 100) return 0;
  const lossRate = (100 - Math.max(0, Math.min(100, productivityPct))) / 100;
  return hireEmployerMonthlyCost * onboardingMonths * lossRate;
}

/**
 * Calculate vacant position impact cost based on selected mode.
 * Mode A (uncovered): (percentageUndone / 100) * monthlyPositionValue
 * Mode B (teamCoverage): additionalHours * avgHourlyCost * overtimeMultiplier
 */
export function computeVacantImpactCost(
  input: CalculatorInputs['vacantPositionImpact']
): number {
  if (input.mode === 'uncovered') {
    const pct = Math.max(0, Math.min(100, input.percentageUndone));
    return (pct / 100) * Math.max(0, input.monthlyPositionValue);
  } else {
    const hours = Math.max(0, input.additionalHours);
    const rate = Math.max(0, input.avgHourlyCost);
    const multiplier = Math.max(1, input.overtimeMultiplier);
    return hours * rate * multiplier;
  }
}

export function computeServiceRowCost(
  row: ServiceRow,
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): number {
  const details = row.details;
  if (details.serviceType === 'inhouse') {
    const inhouseDetails = details as InhouseServiceDetails;
    const rate = employerHourlyRate(
      inhouseDetails.payType, inhouseDetails.payAmount,
      inhouseDetails.hoursPerMonth ?? config.HOURS_PER_MONTH, config
    );
    return rate * row.serviceHours;
  } else {
    const outsourcedDetails = details as OutsourcedServiceDetails;
    switch (outsourcedDetails.billingType) {
      case 'hourly': return outsourcedDetails.price * row.serviceHours;
      case 'monthly': return outsourcedDetails.price;
      case 'oneOff': return outsourcedDetails.price;
      default: return 0;
    }
  }
}

export function computeServicesCost(
  rows: ServiceRow[],
  config: Pick<CalculatorConfig, 'HOURS_PER_MONTH' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): ServicesCostResult {
  let totalServicesCost = 0;
  let repeatedServicesCost = 0;
  for (const row of rows) {
    const cost = computeServiceRowCost(row, config);
    totalServicesCost += cost;
    if (row.repeatOnBadHire) repeatedServicesCost += cost;
  }
  return { totalServicesCost, repeatedServicesCost };
}

export function computeBadHireScenario(
  normalizedHireMonthlyGross: number,
  repeatedServicesCost: number,
  config: Pick<CalculatorConfig, 'BAD_HIRE_RISK_RATE' | 'BAD_HIRE_PAY_MONTHS' | 'SOCIAL_TAX_RATE' | 'EMPLOYER_UI_RATE'>
): BadHireScenarioResult {
  const employerMonthlyCost = employerCostFromMonthlyGross(normalizedHireMonthlyGross, config.SOCIAL_TAX_RATE, config.EMPLOYER_UI_RATE);
  const badHireSalaryCost = employerMonthlyCost * config.BAD_HIRE_PAY_MONTHS;
  const badHireExtraIfHappens = badHireSalaryCost + repeatedServicesCost;
  const expectedRiskCost = badHireExtraIfHappens * config.BAD_HIRE_RISK_RATE;
  return { badHireSalaryCost, badHireExtraIfHappens, expectedRiskCost };
}

// ============================================================================
// BLOCK COST CALCULATIONS
// ============================================================================

export function computeBlockTimeCost(
  hours: BlockHoursInput,
  normalizedRoles: { hr: NormalizedPay; manager: NormalizedPay; team: NormalizedPay }
): number {
  return (
    hours.hrHours * normalizedRoles.hr.employerHourlyRate +
    hours.managerHours * normalizedRoles.manager.employerHourlyRate +
    hours.teamHours * normalizedRoles.team.employerHourlyRate
  );
}

// ============================================================================
// MAIN COMPUTATION FUNCTION
// ============================================================================

export function computeTotals(
  inputs: CalculatorInputs,
  config: CalculatorConfig
): ComputedResult {
  const normalizedHirePay = normalizeHirePay(inputs.hirePay, config);
  const normalizedRoles = {
    hr: normalizeRolePay(inputs.roles.hr, 'hr', config),
    manager: normalizeRolePay(inputs.roles.manager, 'manager', config),
    team: normalizeRolePay(inputs.roles.team, 'team', config),
  };
  
  const { totalServicesCost, repeatedServicesCost } = computeServicesCost(inputs.otherServices, config);
  const badHireResult = computeBadHireScenario(normalizedHirePay.monthlyGross, repeatedServicesCost, config);
  
  // Calculate vacant position impact cost
  const vacantImpactCost = computeVacantImpactCost(inputs.vacantPositionImpact);
  
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
        inputs.preboarding.itSetupHours * inputs.preboarding.itHourlyRate * 1.338 +
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
    vacantImpact: {
      timeCost: 0,
      directCost: vacantImpactCost,
      total: vacantImpactCost,
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
    if (key !== 'otherServices' && key !== 'vacantImpact' && key !== 'expectedRisk') {
      block.total = block.timeCost + block.directCost;
    }
  }
  
  const baseCost = Object.entries(blockCosts)
    .filter(([key]) => key !== 'expectedRisk')
    .reduce((sum, [, block]) => sum + block.total, 0);
  
  const totalCost = baseCost;
  const totalCostWithRisk = baseCost + badHireResult.expectedRiskCost;
  
  const percentages: Record<BlockName, number> = {} as Record<BlockName, number>;
  for (const key of Object.keys(blockCosts) as BlockName[]) {
    if (key === 'expectedRisk') {
      percentages[key] = 0;
    } else {
      percentages[key] = baseCost > 0 ? (blockCosts[key].total / baseCost) * 100 : 0;
    }
  }
  
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
  
  const defaultsUsed: DefaultsUsed = {
    hirePay: normalizedHirePay.isDefault,
    hrPay: normalizedRoles.hr.isDefault,
    managerPay: normalizedRoles.manager.isDefault,
    teamPay: normalizedRoles.team.isDefault,
  };
  
  const missingPayWarnings: MissingPayWarning[] = [];
  if (normalizedHirePay.isDefault) {
    missingPayWarnings.push({
      field: 'hirePay',
      message: 'Värvatava palk pole määratud. Kasutatakse Eesti keskmist.',
    });
  }
  
  const rangeWarnings: RangeWarning[] = [];
  
  function addFieldWarning(field: string, label: string, value: number, sectionInUse: boolean) {
    const range = config.recommendedRanges?.[field];
    if (!range) return;
    const { min, max, unit } = range;
    const rangeText = `${min}–${max}`;
    
    if (value === 0 && sectionInUse) {
      rangeWarnings.push({ field, label, message: `Tüüpiline vahemik: ${rangeText} ${unit}. Sisesta hinnang.`, severity: 'info', recommendedMin: min, recommendedMax: max, currentValue: 0, unit });
      return;
    }
    if (value === 0) return;
    if (value < min) {
      rangeWarnings.push({ field, label, message: `See võib olla alahinnatud. Tüüpiline vahemik: ${rangeText} ${unit}.`, severity: 'info', recommendedMin: min, recommendedMax: max, currentValue: value, unit });
      return;
    }
    if (value > max) {
      rangeWarnings.push({ field, label, message: `See on tavapärasest kõrgem. Kulude vähendamiseks võiks kaaluda, kas seda saab optimeerida. Tüüpiline vahemik: ${rangeText} ${unit}.`, severity: 'warning', recommendedMin: min, recommendedMax: max, currentValue: value, unit });
    }
  }
  
  // Strategy & Prep
  const strategyInUse = inputs.strategyPrep.hrHours > 0 || inputs.strategyPrep.managerHours > 0 || inputs.strategyPrep.teamHours > 0;
  addFieldWarning('strategyPrep.hrHours', 'Strateegia: HR tunnid', inputs.strategyPrep.hrHours, strategyInUse);
  addFieldWarning('strategyPrep.managerHours', 'Strateegia: Juhi tunnid', inputs.strategyPrep.managerHours, strategyInUse);
  addFieldWarning('strategyPrep.teamHours', 'Strateegia: Tiimi tunnid', inputs.strategyPrep.teamHours, strategyInUse);
  
  // Ads & Branding
  const adsInUse = inputs.adsBranding.hrHours > 0 || inputs.adsBranding.managerHours > 0 || inputs.adsBranding.directCosts > 0;
  addFieldWarning('adsBranding.hrHours', 'Kuulutused: HR tunnid', inputs.adsBranding.hrHours, adsInUse);
  addFieldWarning('adsBranding.managerHours', 'Kuulutused: Juhi tunnid', inputs.adsBranding.managerHours, adsInUse);
  addFieldWarning('adsBranding.directCosts', 'Kuulutuste kulud', inputs.adsBranding.directCosts, adsInUse);
  
  // Candidate Management
  const candidateInUse = inputs.candidateMgmt.hrHours > 0 || inputs.candidateMgmt.managerHours > 0 || inputs.candidateMgmt.testsCost > 0;
  addFieldWarning('candidateMgmt.hrHours', 'Kandidaadid: HR tunnid', inputs.candidateMgmt.hrHours, candidateInUse);
  addFieldWarning('candidateMgmt.managerHours', 'Kandidaadid: Juhi tunnid', inputs.candidateMgmt.managerHours, candidateInUse);
  
  // Interviews
  const interviewsInUse = inputs.interviews.hrHours > 0 || inputs.interviews.managerHours > 0 || inputs.interviews.teamHours > 0 || inputs.interviews.directCosts > 0;
  addFieldWarning('interviews.hrHours', 'Intervjuud: HR tunnid', inputs.interviews.hrHours, interviewsInUse);
  addFieldWarning('interviews.managerHours', 'Intervjuud: Juhi tunnid', inputs.interviews.managerHours, interviewsInUse);
  addFieldWarning('interviews.teamHours', 'Intervjuud: Tiimi tunnid', inputs.interviews.teamHours, interviewsInUse);
  addFieldWarning('interviews.directCosts', 'Intervjuude kulud', inputs.interviews.directCosts, interviewsInUse);
  
  // Background & Offer
  const backgroundInUse = inputs.backgroundOffer.hrHours > 0 || inputs.backgroundOffer.managerHours > 0 || inputs.backgroundOffer.directCosts > 0;
  addFieldWarning('backgroundOffer.hrHours', 'Taustakontroll: HR tunnid', inputs.backgroundOffer.hrHours, backgroundInUse);
  addFieldWarning('backgroundOffer.managerHours', 'Taustakontroll: Juhi tunnid', inputs.backgroundOffer.managerHours, backgroundInUse);
  
  // Onboarding
  const onboardingInUse = inputs.onboarding.onboardingMonths > 0 || inputs.onboarding.productivityPct > 0 || inputs.onboarding.extraCosts > 0;
  addFieldWarning('onboarding.onboardingMonths', 'Sisseelamisperiood', inputs.onboarding.onboardingMonths, onboardingInUse);
  addFieldWarning('onboarding.productivityPct', 'Keskmine tootlikkus', inputs.onboarding.productivityPct, onboardingInUse);
  
  // Vacant Position Impact - only warn for active mode fields
  const vpi = inputs.vacantPositionImpact;
  if (vpi.mode === 'uncovered') {
    const uncoveredInUse = vpi.percentageUndone > 0 || vpi.monthlyPositionValue > 0;
    addFieldWarning('vacantPositionImpact.percentageUndone', 'Täitmata töö osakaal', vpi.percentageUndone, uncoveredInUse);
    addFieldWarning('vacantPositionImpact.monthlyPositionValue', 'Positsiooni kuine väärtus', vpi.monthlyPositionValue, uncoveredInUse);
  } else {
    const coverageInUse = vpi.additionalHours > 0 || vpi.avgHourlyCost > 0;
    addFieldWarning('vacantPositionImpact.additionalHours', 'Lisatunnid kuus', vpi.additionalHours, coverageInUse);
    addFieldWarning('vacantPositionImpact.avgHourlyCost', 'Keskmine tunnikulu', vpi.avgHourlyCost, coverageInUse);
    addFieldWarning('vacantPositionImpact.overtimeMultiplier', 'Ületunni koefitsient', vpi.overtimeMultiplier, coverageInUse);
  }
  
  // Generate range hints
  const rangeHints: RangeHint[] = [];
  if (config.recommendedRanges) {
    for (const [field, range] of Object.entries(config.recommendedRanges)) {
      rangeHints.push({ field, min: range.min, max: range.max, unit: range.unit });
    }
  }
  
  // Track empty/zero fields
  const emptyFields: EmptyFieldInfo[] = [];
  
  if (inputs.hirePay.payType === 'unset' || inputs.hirePay.payAmount === 0) {
    emptyFields.push({ sectionId: 'position', fieldKey: 'hirePay', label: 'emptyHirePay', fieldType: 'salary' });
  }
  if (inputs.roles.hr.payType === 'unset' || inputs.roles.hr.payAmount === 0) {
    emptyFields.push({ sectionId: 'roles', fieldKey: 'roles.hr', label: 'emptyHrPay', fieldType: 'salary' });
  }
  if (inputs.roles.manager.payType === 'unset' || inputs.roles.manager.payAmount === 0) {
    emptyFields.push({ sectionId: 'roles', fieldKey: 'roles.manager', label: 'emptyManagerPay', fieldType: 'salary' });
  }
  if (inputs.roles.team.payType === 'unset' || inputs.roles.team.payAmount === 0) {
    emptyFields.push({ sectionId: 'roles', fieldKey: 'roles.team', label: 'emptyTeamPay', fieldType: 'salary' });
  }
  
  const blockFieldChecks: Array<{ sectionId: string; value: number; key: string; label: string; type: EmptyFieldInfo['fieldType'] }> = [
    { sectionId: 'strategy', value: inputs.strategyPrep.hrHours, key: 'strategyPrep.hrHours', label: 'emptyStrategyHr', type: 'hours' },
    { sectionId: 'strategy', value: inputs.strategyPrep.managerHours, key: 'strategyPrep.managerHours', label: 'emptyStrategyManager', type: 'hours' },
    { sectionId: 'ads', value: inputs.adsBranding.hrHours, key: 'adsBranding.hrHours', label: 'emptyAdsHr', type: 'hours' },
    { sectionId: 'ads', value: inputs.adsBranding.directCosts, key: 'adsBranding.directCosts', label: 'emptyAdsCosts', type: 'cost' },
    { sectionId: 'candidate', value: inputs.candidateMgmt.hrHours, key: 'candidateMgmt.hrHours', label: 'emptyCandidateHr', type: 'hours' },
    { sectionId: 'interviews', value: inputs.interviews.hrHours, key: 'interviews.hrHours', label: 'emptyInterviewsHr', type: 'hours' },
    { sectionId: 'interviews', value: inputs.interviews.managerHours, key: 'interviews.managerHours', label: 'emptyInterviewsManager', type: 'hours' },
    { sectionId: 'preboarding', value: inputs.preboarding.devicesCost, key: 'preboarding.devicesCost', label: 'emptyDevicesCost', type: 'cost' },
    { sectionId: 'onboarding', value: inputs.onboarding.onboardingMonths, key: 'onboarding.onboardingMonths', label: 'emptyOnboardingMonths', type: 'months' },
    { sectionId: 'onboarding', value: inputs.onboarding.productivityPct, key: 'onboarding.productivityPct', label: 'emptyProductivity', type: 'percentage' },
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
// DEFAULT INPUTS FACTORY
// ============================================================================

export function createDefaultInputs(): CalculatorInputs {
  return {
    positionTitle: '',
    hirePay: { payType: 'unset', payAmount: 0 },
    roles: {
      hr: { enabled: true, payType: 'unset', payAmount: 0 },
      manager: { enabled: true, payType: 'unset', payAmount: 0 },
      team: { enabled: true, payType: 'unset', payAmount: 0 },
    },
    strategyPrep: { hrHours: 0, managerHours: 0, teamHours: 0 },
    adsBranding: { hrHours: 0, managerHours: 0, teamHours: 0, directCosts: 0 },
    candidateMgmt: { hrHours: 0, managerHours: 0, teamHours: 0, testsCost: 0 },
    interviews: { hrHours: 0, managerHours: 0, teamHours: 0, directCosts: 0 },
    backgroundOffer: { hrHours: 0, managerHours: 0, teamHours: 0, directCosts: 0 },
    otherServices: [],
    preboarding: { devicesCost: 0, itSetupHours: 0, itHourlyRate: 0, prepHours: 0 },
    onboarding: { onboardingMonths: 0, productivityPct: 0, extraCosts: 0 },
    vacantPositionImpact: {
      mode: 'uncovered',
      percentageUndone: 0,
      monthlyPositionValue: 0,
      additionalHours: 0,
      avgHourlyCost: 0,
      overtimeMultiplier: 1.5,
    },
  };
}

export function createServiceRow(id: string, name: string = ''): ServiceRow {
  return {
    id,
    name,
    details: { serviceType: 'outsourced', billingType: 'oneOff', price: 0 },
    serviceHours: 0,
    repeatOnBadHire: false,
  };
}
