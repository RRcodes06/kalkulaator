import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PRINT_SNAPSHOT_KEY } from './Index';
import type { CalculatorInputs, ComputedResult, BlockName } from '@/types/calculator';
import type { Language, TranslationKey } from '@/i18n/translations';
import { translations } from '@/i18n/translations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import manpowerLogo from '@/assets/manpower-logo.png';

// ============================================================================
// TYPES
// ============================================================================

interface PrintConfig {
  disclaimerText: string;
  riskExplanationText: string;
  indirectExplanationText: string;
  finalQuestionText: string;
  ctaPlaceholderText: string;
  BAD_HIRE_RISK_RATE: number;
  BAD_HIRE_PAY_MONTHS: number;
  HOURS_PER_MONTH: number;
  EST_AVG_GROSS_WAGE: number;
}

interface PrintSnapshot {
  inputs: CalculatorInputs;
  results: ComputedResult;
  config: PrintConfig;
  language?: Language;
  generatedAt: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function createT(lang: Language) {
  return (key: TranslationKey, replacements?: Record<string, string | number>): string => {
    let text: string = (translations[lang] as Record<string, string>)[key] ?? (translations.est as Record<string, string>)[key] ?? key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };
}

const BLOCK_LABEL_KEYS: Record<string, TranslationKey> = {
  strategyPrep: 'blockStrategyPrep',
  adsBranding: 'blockAdsBranding',
  candidateMgmt: 'blockCandidateMgmt',
  interviews: 'blockInterviews',
  backgroundOffer: 'blockBackgroundOffer',
  otherServices: 'blockOtherServices',
  preboarding: 'blockPreboarding',
  onboarding: 'blockOnboarding',
  vacantImpact: 'blockVacantImpact',
  expectedRisk: 'blockExpectedRisk',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('et-EE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
};

const CHART_COLORS = [
  'hsl(217, 91%, 30%)',
  'hsl(217, 91%, 40%)',
  'hsl(217, 91%, 50%)',
  'hsl(217, 71%, 53%)',
  'hsl(210, 60%, 60%)',
  'hsl(200, 50%, 65%)',
  'hsl(190, 45%, 70%)',
  'hsl(180, 40%, 75%)',
  'hsl(170, 35%, 80%)',
  'hsl(160, 30%, 85%)',
  'hsl(150, 25%, 88%)',
];

// ============================================================================
// PRINT CHART
// ============================================================================

const RADIAN = Math.PI / 180;

interface PrintLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
  fill: string;
}

function renderPrintLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  fill,
}: PrintLabelProps) {
  if (percent < 0.03) return null;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;

  const mx = cx + (outerRadius + 14) * cos;
  const my = cy + (outerRadius + 14) * sin;

  const ex = mx + (cos >= 0 ? 1 : -1) * 18;
  const ey = my;

  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        strokeWidth={1}
        fill="none"
        opacity={0.6}
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} />
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={8}
        dominantBaseline="central"
      >
        {name}
      </text>
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey + 10}
        textAnchor={textAnchor}
        fill="#888"
        fontSize={7}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
}

function PrintChart({ results, t }: { results: ComputedResult; t: ReturnType<typeof createT> }) {
  const blockOrder: BlockName[] = [
    'strategyPrep', 'adsBranding', 'candidateMgmt', 'interviews',
    'backgroundOffer', 'otherServices', 'preboarding', 'onboarding',
    'vacantImpact', 'expectedRisk'
  ];

  const chartData = blockOrder
    .filter(key => results.blockCosts[key].total > 0)
    .map((key, index) => ({
      name: t(BLOCK_LABEL_KEYS[key] || 'blockStrategyPrep'),
      value: results.blockCosts[key].total,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="w-full" style={{ height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={70}
            dataKey="value"
            stroke="none"
            label={(props) => renderPrintLabel(props as PrintLabelProps)}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// MISSING SNAPSHOT VIEW
// ============================================================================

function MissingSnapshot({ t }: { t: ReturnType<typeof createT> }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">{t('printMissingSnapshot')}</h1>
        <p className="text-gray-600 mb-6">{t('printMissingDesc')}</p>
        <Link to="/" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90">
          {t('printBackToCalc')}
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PRINT COMPONENT
// ============================================================================

const Print = () => {
  const [snapshot, setSnapshot] = useState<PrintSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(PRINT_SNAPSHOT_KEY);
    if (stored) {
      try {
        setSnapshot(JSON.parse(stored));
      } catch {
        setSnapshot(null);
      }
    }
    setLoading(false);
  }, []);

  const lang: Language = snapshot?.language || 'est';
  const t = createT(lang);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(lang === 'eng' ? 'en-GB' : 'et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPayTypeLabel = (payType: string) => {
    switch (payType) {
      case 'monthly': return t('payTypeMonthly');
      case 'hourly': return t('payTypeHourly');
      default: return t('printNotSet');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('printLoading')}</div>;
  }

  if (!snapshot) {
    return <MissingSnapshot t={t} />;
  }

  const { inputs, results, config, generatedAt } = snapshot;

  const blockCostLines = (Object.keys(BLOCK_LABEL_KEYS) as string[])
    .filter(key => key !== 'expectedRisk' && results.blockCosts[key as BlockName]?.total > 0)
    .map(key => ({
      key,
      label: t(BLOCK_LABEL_KEYS[key]),
      value: results.blockCosts[key as BlockName].total,
    }));

  const repeatedServices = inputs.otherServices.filter(s => s.repeatOnBadHire);
  const riskPct = (config.BAD_HIRE_RISK_RATE * 100).toFixed(0);

  return (
    <div className="print-page min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="print-header px-8 pt-8 pb-4 border-b-2 border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={manpowerLogo} alt="Manpower" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold">{t('printTitle')}</h1>
              <p className="text-sm text-gray-600">{t('printGenerated')} {formatDate(generatedAt)}</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{t('printPosition')} <strong>{inputs.positionTitle || t('printNotSet')}</strong></p>
          </div>
        </div>
      </header>

      {/* SUMMARY */}
      <section className="print-section px-8 py-6 page-break-inside-avoid">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">{t('printSummary')}</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">{t('printTotalCost')}</p>
          <p className="text-4xl font-bold text-primary">{formatCurrency(results.totalCost)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('printRiskSeparate')}</p>
        </div>

        {results.emptyFields && results.emptyFields.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-sm text-yellow-800 mb-2">{t('printEmptyFieldsTitle')}</h3>
            <p className="text-xs text-yellow-700 mb-2">{t('printEmptyFieldsDesc')}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {results.emptyFields.slice(0, 10).map((field, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-yellow-600">•</span>
                  <span className="text-gray-700">{t(field.label as TranslationKey)}</span>
                </div>
              ))}
              {results.emptyFields.length > 10 && (
                <div className="col-span-2 text-gray-500 italic">
                  {t('printAndMore', { count: results.emptyFields.length - 10 })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Breakdown Table */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-2 text-sm text-gray-600">{t('printCostBreakdown')}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-medium">{t('printCategory')}</th>
                  <th className="text-right py-1 font-medium">€</th>
                  <th className="text-right py-1 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {blockCostLines.map((line) => (
                  <tr key={line.key} className="border-b border-gray-100">
                    <td className="py-1">{line.label}</td>
                    <td className="py-1 text-right">{formatCurrency(line.value)}</td>
                    <td className="py-1 text-right text-gray-500">
                      {results.percentages[line.key as BlockName]?.toFixed(0) || 0}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-black font-bold text-lg">
                  <td className="py-2">{t('printTotal')}</td>
                  <td className="py-2 text-right">{formatCurrency(results.totalCost)}</td>
                  <td className="py-2 text-right">100%</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2 italic">{t('printRiskNotIncluded')}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-sm text-gray-600">{t('printVisualBreakdown')}</h3>
            <PrintChart results={results} t={t} />
          </div>
        </div>

        {/* Top Drivers */}
        {results.topDrivers.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-sm text-gray-600">{t('printTopDrivers')}</h3>
            <ol className="list-decimal list-inside space-y-1">
              {results.topDrivers.map((driver, idx) => (
                <li key={idx} className="text-sm">
                  <strong>{t(BLOCK_LABEL_KEYS[driver.block] || 'blockStrategyPrep')}</strong>
                  <span className="text-gray-600"> — {formatCurrency(driver.amount)} ({driver.percentage.toFixed(0)}%)</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* INPUTS */}
      <section className="print-section px-8 py-6 page-break-before">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">{t('printInputData')}</h2>

        {/* Position & Hire Pay */}
        <div className="mb-6 page-break-inside-avoid">
          <h3 className="font-medium text-sm text-gray-600 mb-2">{t('printHiredEmployee')}</h3>
          <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded">
            <div>
              <p className="text-gray-500">{t('positionTitle')}</p>
              <p className="font-medium">{inputs.positionTitle || t('printNotSet')}</p>
            </div>
            <div>
              <p className="text-gray-500">{t('printPayType')}</p>
              <p className="font-medium">{getPayTypeLabel(inputs.hirePay.payType)}</p>
            </div>
            <div>
              <p className="text-gray-500">{t('grossSalary')}</p>
              <p className="font-medium">
                {inputs.hirePay.payType === 'hourly'
                  ? `${inputs.hirePay.payAmount} €/h × ${inputs.hirePay.hoursPerMonth || config.HOURS_PER_MONTH}h`
                  : `${formatCurrency(results.normalizedHirePay.monthlyGross)}${t('printPerMonth')}`
                }
                {results.defaultsUsed.hirePay && <span className="text-orange-600 ml-1">*</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-500">{t('printEmployerTotal')}</p>
              <p className="font-medium">{formatCurrency(results.normalizedHirePay.employerMonthlyCost)}{t('printPerMonth')}</p>
            </div>
          </div>
          {results.defaultsUsed.hirePay && (
            <p className="text-xs text-orange-600 mt-1">* {t('printUsedAverage', { amount: config.EST_AVG_GROSS_WAGE })}</p>
          )}
        </div>

        {/* Roles */}
        <div className="mb-6 page-break-inside-avoid">
          <h3 className="font-medium text-sm text-gray-600 mb-2">{t('printParticipants')}</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {(['hr', 'manager', 'team'] as const).map((role) => {
              const roleData = inputs.roles[role];
              const normalized = results.normalizedRoles[role];
              if (!roleData.enabled) return null;
              const roleLabel = role === 'hr' ? t('printHr') : role === 'manager' ? t('printManager') : t('printTeam');
              return (
                <div key={role} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium capitalize mb-1">{roleLabel}</p>
                  <p className="text-gray-600">{formatCurrency(normalized.employerHourlyRate)}/h ({t('printEmployerCostPerHour')})</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Block Inputs */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{t('blockStrategyPrep')}</h4>
            <p>{t('printHr')}: {inputs.strategyPrep.hrHours}h, {t('printManager')}: {inputs.strategyPrep.managerHours}h, {t('printTeam')}: {inputs.strategyPrep.teamHours}h</p>
          </div>

          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{t('blockAdsBranding')}</h4>
            <p>{t('printDirectCost')} {formatCurrency(inputs.adsBranding.directCosts)}</p>
            <p>{t('printHr')}: {inputs.adsBranding.hrHours}h, {t('printManager')}: {inputs.adsBranding.managerHours}h</p>
          </div>

          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{t('blockCandidateMgmt')}</h4>
            <p>{t('printTests')} {formatCurrency(inputs.candidateMgmt.testsCost)}</p>
            <p>{t('printHr')}: {inputs.candidateMgmt.hrHours}h, {t('printManager')}: {inputs.candidateMgmt.managerHours}h</p>
          </div>

          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{t('blockInterviews')}</h4>
            <p>{t('printDirectCost')} {formatCurrency(inputs.interviews.directCosts)}</p>
            <p>{t('printHr')}: {inputs.interviews.hrHours}h, {t('printManager')}: {inputs.interviews.managerHours}h, {t('printTeam')}: {inputs.interviews.teamHours}h</p>
          </div>

          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{t('blockBackgroundOffer')}</h4>
            <p>{t('printDirectCost')} {formatCurrency(inputs.backgroundOffer.directCosts)}</p>
            <p>{t('printHr')}: {inputs.backgroundOffer.hrHours}h, {t('printManager')}: {inputs.backgroundOffer.managerHours}h</p>
          </div>

          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{t('blockPreboarding')}</h4>
            <p>{t('printDevices')} {formatCurrency(inputs.preboarding.devicesCost)}</p>
            <p>{t('printItSetup')} {inputs.preboarding.itSetupHours}h, {t('printPrep')} {inputs.preboarding.prepHours}h</p>
          </div>

          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{t('blockOnboarding')}</h4>
            <p>{t('printDuration')} {inputs.onboarding.onboardingMonths} {t('unitMonths')} @ {inputs.onboarding.productivityPct}% {t('printProductivity')}</p>
            <p>{t('printAdditionalCosts')} {formatCurrency(inputs.onboarding.extraCosts)}</p>
          </div>

          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded col-span-2">
            <h4 className="font-medium mb-2">{t('blockVacantImpact')}</h4>
            {inputs.vacantPositionImpact.mode === 'uncovered' ? (
              <p>{inputs.vacantPositionImpact.percentageUndone}% × {formatCurrency(inputs.vacantPositionImpact.monthlyPositionValue)}</p>
            ) : (
              <p>{inputs.vacantPositionImpact.additionalHours}h × {formatCurrency(inputs.vacantPositionImpact.avgHourlyCost)} × {inputs.vacantPositionImpact.overtimeMultiplier}x</p>
            )}
          </div>
        </div>

        {/* Other Services */}
        {inputs.otherServices.length > 0 && (
          <div className="mt-6 page-break-inside-avoid">
            <h3 className="font-medium text-sm text-gray-600 mb-2">{t('blockOtherServices')}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-1">{t('printService')}</th>
                  <th className="py-1">{t('printType')}</th>
                  <th className="py-1 text-right">{t('printPriceInfo')}</th>
                  <th className="py-1 text-right">{t('printHours')}</th>
                  <th className="py-1 text-center">{t('printRepeats')}</th>
                </tr>
              </thead>
              <tbody>
                {inputs.otherServices.map((service) => (
                  <tr key={service.id} className="border-b border-gray-100">
                    <td className="py-1">{service.name || t('printUnnamed')}</td>
                    <td className="py-1">
                      {service.details.serviceType === 'inhouse' ? t('printInhouse') : t('printExternal')}
                    </td>
                    <td className="py-1 text-right">
                      {service.details.serviceType === 'outsourced'
                        ? `${formatCurrency(service.details.price)} (${service.details.billingType})`
                        : `${service.details.payAmount} €/${service.details.payType === 'hourly' ? 'h' : t('printPerMonth').replace('/', '')}`
                      }
                    </td>
                    <td className="py-1 text-right">{service.serviceHours}h</td>
                    <td className="py-1 text-center">{service.repeatOnBadHire ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RISK SECTION */}
      <section className="print-section px-8 py-6 page-break-before">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">{t('printRiskAnalysis')}</h2>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-4">{t('configRiskExplanation')}</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">{t('printRiskRate')}</p>
              <p className="text-2xl font-bold">{riskPct}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('printBadHireCostMonths')}</p>
              <p className="text-2xl font-bold">{config.BAD_HIRE_PAY_MONTHS} {t('unitMonths')}</p>
            </div>
          </div>
        </div>

        {repeatedServices.length > 0 && (
          <div className="mb-4 page-break-inside-avoid">
            <h3 className="font-medium text-sm mb-2">{t('printRepeatedServices')}</h3>
            <ul className="list-disc list-inside text-sm">
              {repeatedServices.map((s) => (
                <li key={s.id}>{s.name || t('printUnnamedService')}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t('printRiskScenario')}</p>
            <p className="text-sm text-gray-500 mb-2">{t('printRiskProbAdds', { pct: riskPct })}</p>
            <p className="text-2xl font-bold text-orange-700">+{formatCurrency(results.badHireExtraIfHappens)}</p>
            <p className="text-xs text-gray-500 mt-2">{t('printNotInTotal')}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t('printStatProbability')}</p>
            <p className="text-3xl font-bold text-gray-700">{riskPct}%</p>
            <p className="text-xs text-gray-500 mt-2">{t('printHiringFails')}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="print-section px-8 py-6 page-break-inside-avoid">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-3">{t('configFinalQuestion')}</h2>
          <p className="text-gray-600 mb-4">{t('configCtaPlaceholder')}</p>
          <a
            href="https://www.manpower.ee/et/vaerbamisteenused"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t('printContactButton')}
          </a>
          <p className="text-xs text-gray-500 mt-2">manpower.ee/et/vaerbamisteenused</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="print-footer px-8 py-4 border-t border-gray-200 text-xs text-gray-500">
        <p>{t('configDisclaimer')}</p>
        <p className="mt-2">{t('printReportGenerated')} {formatDate(generatedAt)}</p>
      </footer>

      {/* PRINT BUTTON */}
      <div className="no-print fixed bottom-6 right-6 flex gap-3">
        <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
          {t('printBack')}
        </Link>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          {t('printSavePdf')}
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-page { padding: 0; margin: 0; }
          .print-section { break-inside: avoid; }
          .page-break-before { break-before: page; }
          .page-break-inside-avoid { break-inside: avoid; }
          table tr { break-inside: avoid; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-orange-50 { background-color: #fff7ed !important; }
          .bg-red-50 { background-color: #fef2f2 !important; }
          .bg-yellow-50 { background-color: #fefce8 !important; }
          .print-header { position: running(header); }
          @page { margin: 1.5cm; @top-center { content: element(header); } }
        }
        @media screen {
          .print-page { max-width: 800px; margin: 0 auto; padding-bottom: 100px; }
        }
      `}</style>
    </div>
  );
};

export default Print;
