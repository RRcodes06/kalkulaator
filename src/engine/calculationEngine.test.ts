/**
 * Calculation Engine Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  monthlyGrossBase,
  employerCostFromMonthlyGross,
  employerHourlyRate,
  grossHourlyRate,
  normalizeHirePay,
  onboardingProductivityLossCost,
  vacancyCost,
  computeServicesCost,
  computeBadHireScenario,
  computeTotals,
  createDefaultInputs,
} from '@/engine/calculationEngine';
import { DEFAULT_CONFIG } from '@/config/defaults';

describe('monthlyGrossBase', () => {
  it('returns 0 for unset pay type', () => {
    expect(monthlyGrossBase('unset', 2000, 168, 168)).toBe(0);
  });

  it('returns payAmount for monthly pay type', () => {
    expect(monthlyGrossBase('monthly', 2500, 168, 168)).toBe(2500);
  });

  it('calculates correctly for hourly pay type', () => {
    expect(monthlyGrossBase('hourly', 15, 160, 168)).toBe(15 * 160);
  });

  it('uses default hours if hoursPerMonth is 0', () => {
    expect(monthlyGrossBase('hourly', 15, 0, 168)).toBe(15 * 168);
  });

  it('returns 0 for zero or negative payAmount', () => {
    expect(monthlyGrossBase('monthly', 0, 168, 168)).toBe(0);
    expect(monthlyGrossBase('monthly', -100, 168, 168)).toBe(0);
  });
});

describe('employerCostFromMonthlyGross', () => {
  it('calculates employer cost with social tax and UI', () => {
    const monthlyGross = 2000;
    const socialTaxRate = 0.33;
    const employerUiRate = 0.008;
    
    const expected = monthlyGross * (1 + socialTaxRate + employerUiRate);
    expect(employerCostFromMonthlyGross(monthlyGross, socialTaxRate, employerUiRate)).toBe(expected);
  });

  it('returns 0 for zero gross', () => {
    expect(employerCostFromMonthlyGross(0, 0.33, 0.008)).toBe(0);
  });
});

describe('employerHourlyRate', () => {
  const config = {
    HOURS_PER_MONTH: 168,
    SOCIAL_TAX_RATE: 0.33,
    EMPLOYER_UI_RATE: 0.008,
  };

  it('calculates hourly rate including employer taxes', () => {
    const result = employerHourlyRate('monthly', 2000, 168, config);
    const expectedMonthly = 2000 * (1 + 0.33 + 0.008);
    expect(result).toBeCloseTo(expectedMonthly / 168, 4);
  });

  it('returns 0 for unset pay type', () => {
    expect(employerHourlyRate('unset', 2000, 168, config)).toBe(0);
  });
});

describe('grossHourlyRate', () => {
  it('returns payAmount for hourly pay type', () => {
    expect(grossHourlyRate('hourly', 20, 168, 168)).toBe(20);
  });

  it('calculates from monthly gross', () => {
    expect(grossHourlyRate('monthly', 1680, 168, 168)).toBeCloseTo(10, 4);
  });

  it('returns 0 for unset', () => {
    expect(grossHourlyRate('unset', 2000, 168, 168)).toBe(0);
  });
});

describe('normalizeHirePay', () => {
  const config = {
    HOURS_PER_MONTH: 168,
    EST_AVG_GROSS_WAGE: 2075,
    SOCIAL_TAX_RATE: 0.33,
    EMPLOYER_UI_RATE: 0.008,
  };

  it('returns default values for unset pay', () => {
    const result = normalizeHirePay({ payType: 'unset', payAmount: 0 }, config);
    expect(result.isDefault).toBe(true);
    expect(result.monthlyGross).toBe(2075);
  });

  it('uses provided values when set', () => {
    const result = normalizeHirePay({ payType: 'monthly', payAmount: 3000 }, config);
    expect(result.isDefault).toBe(false);
    expect(result.monthlyGross).toBe(3000);
  });

  it('calculates all rates correctly', () => {
    const result = normalizeHirePay({ payType: 'monthly', payAmount: 2000 }, config);
    expect(result.monthlyGross).toBe(2000);
    expect(result.grossHourlyRate).toBeCloseTo(2000 / 168, 4);
    expect(result.employerMonthlyCost).toBe(2000 * (1 + 0.33 + 0.008));
    expect(result.employerHourlyRate).toBeCloseTo(result.employerMonthlyCost / 168, 4);
  });
});

describe('onboardingProductivityLossCost', () => {
  it('calculates productivity loss correctly', () => {
    const employerMonthlyCost = 2676; // 2000 * 1.338
    const result = onboardingProductivityLossCost(employerMonthlyCost, 3, 50);
    // 3 months * 2676 * 50% loss
    expect(result).toBeCloseTo(2676 * 3 * 0.5, 4);
  });

  it('returns 0 for 100% productivity', () => {
    expect(onboardingProductivityLossCost(2676, 3, 100)).toBe(0);
  });

  it('returns 0 for 0 months', () => {
    expect(onboardingProductivityLossCost(2676, 0, 50)).toBe(0);
  });

  it('clamps productivity between 0 and 100', () => {
    const employerMonthlyCost = 2676;
    expect(onboardingProductivityLossCost(employerMonthlyCost, 3, 110)).toBe(0);
    expect(onboardingProductivityLossCost(employerMonthlyCost, 3, -10)).toBe(employerMonthlyCost * 3);
  });
});

describe('vacancyCost', () => {
  it('calculates correctly', () => {
    expect(vacancyCost(100, 30)).toBe(3000);
  });

  it('handles zero days', () => {
    expect(vacancyCost(100, 0)).toBe(0);
  });

  it('handles negative days as zero', () => {
    expect(vacancyCost(100, -5)).toBe(0);
  });
});

describe('computeServicesCost', () => {
  const config = {
    HOURS_PER_MONTH: 168,
    SOCIAL_TAX_RATE: 0.33,
    EMPLOYER_UI_RATE: 0.008,
  };

  it('sums outsourced one-off services', () => {
    const rows = [
      {
        id: '1',
        name: 'Agency Fee',
        details: { serviceType: 'outsourced' as const, billingType: 'oneOff' as const, price: 5000 },
        serviceHours: 0,
        repeatOnBadHire: false,
      },
      {
        id: '2',
        name: 'Background Check',
        details: { serviceType: 'outsourced' as const, billingType: 'oneOff' as const, price: 200 },
        serviceHours: 0,
        repeatOnBadHire: true,
      },
    ];

    const result = computeServicesCost(rows, config);
    expect(result.totalServicesCost).toBe(5200);
    expect(result.repeatedServicesCost).toBe(200);
  });

  it('handles empty array', () => {
    const result = computeServicesCost([], config);
    expect(result.totalServicesCost).toBe(0);
    expect(result.repeatedServicesCost).toBe(0);
  });
});

describe('computeBadHireScenario', () => {
  const config = {
    BAD_HIRE_RISK_RATE: 0.15,
    BAD_HIRE_PAY_MONTHS: 2,
    SOCIAL_TAX_RATE: 0.33,
    EMPLOYER_UI_RATE: 0.008,
  };

  it('calculates all components correctly', () => {
    const monthlyGross = 2000;
    const repeatedServicesCost = 500;
    
    const result = computeBadHireScenario(monthlyGross, repeatedServicesCost, config);
    
    const employerMonthlyCost = 2000 * 1.338;
    expect(result.badHireSalaryCost).toBeCloseTo(employerMonthlyCost * 2, 4);
    expect(result.badHireExtraIfHappens).toBeCloseTo(employerMonthlyCost * 2 + 500, 4);
    expect(result.expectedRiskCost).toBeCloseTo(result.badHireExtraIfHappens * 0.15, 4);
  });
});

describe('computeTotals', () => {
  it('produces a valid result structure', () => {
    const inputs = createDefaultInputs();
    const result = computeTotals(inputs, DEFAULT_CONFIG);

    expect(result).toHaveProperty('normalizedHirePay');
    expect(result).toHaveProperty('normalizedRoles');
    expect(result).toHaveProperty('blockCosts');
    expect(result).toHaveProperty('baseCost');
    expect(result).toHaveProperty('totalCost');
    expect(result).toHaveProperty('topDrivers');
    expect(result).toHaveProperty('percentages');
    expect(result).toHaveProperty('defaultsUsed');
    
    // totalCost now equals baseCost (risk is separate)
    expect(result.totalCost).toBe(result.baseCost);
    // totalCostWithRisk includes risk for reference
    expect(result.totalCostWithRisk).toBe(result.baseCost + result.expectedRiskCost);
    expect(result.topDrivers.length).toBeLessThanOrEqual(3);
  });

  it('uses defaults when hire pay is unset', () => {
    const inputs = createDefaultInputs();
    const result = computeTotals(inputs, DEFAULT_CONFIG);
    
    expect(result.defaultsUsed.hirePay).toBe(true);
    expect(result.normalizedHirePay.monthlyGross).toBe(DEFAULT_CONFIG.EST_AVG_GROSS_WAGE);
  });

  it('percentages sum to approximately 100 when there are costs', () => {
    const inputs = createDefaultInputs();
    // Add some values to ensure costs are generated
    inputs.strategyPrep.hrHours = 4;
    inputs.adsBranding.directCosts = 500;
    const result = computeTotals(inputs, DEFAULT_CONFIG);
    
    // Only non-risk percentages should sum to 100 when there are costs
    // Since all inputs start at 0, percentages will all be 0 if no costs
    if (result.baseCost > 0) {
      const total = Object.values(result.percentages).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(100, 0);
    } else {
      // With zero costs, all percentages are 0
      const total = Object.values(result.percentages).reduce((a, b) => a + b, 0);
      expect(total).toBe(0);
    }
  });
});
