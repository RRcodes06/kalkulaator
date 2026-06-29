import { forwardRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { CostBreakdownChart } from './CostBreakdownChart';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import type { BlockName } from '@/types/calculator';
import type { TranslationKey } from '@/i18n/translations';

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

const INSIGHT_KEYS: Record<string, TranslationKey> = {
  timeOnly: 'insightTimeOnly',
  costOnly: 'insightCostOnly',
  timeCost: 'insightTimeCost',
  onboarding: 'insightOnboarding',
  vacantImpact: 'insightVacantImpact',
  expectedRisk: 'insightRisk',
};

const BLOCK_META: Record<string, { isTimeBased: boolean; isCostBased: boolean }> = {
  strategyPrep: { isTimeBased: true, isCostBased: false },
  adsBranding: { isTimeBased: true, isCostBased: true },
  candidateMgmt: { isTimeBased: true, isCostBased: true },
  interviews: { isTimeBased: true, isCostBased: true },
  backgroundOffer: { isTimeBased: true, isCostBased: true },
  otherServices: { isTimeBased: false, isCostBased: true },
  preboarding: { isTimeBased: true, isCostBased: true },
  onboarding: { isTimeBased: false, isCostBased: false },
  vacantImpact: { isTimeBased: false, isCostBased: true },
  expectedRisk: { isTimeBased: false, isCostBased: false },
};

export const SummarySidebar = forwardRef<HTMLElement>(function SummarySidebar(_, ref) {
  const { results, inputs, config } = useAppStore();
  const { t } = useLanguage();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  const getBlockLabel = (key: string) => t(BLOCK_LABEL_KEYS[key] || 'blockStrategyPrep');

  const getDriverInsightTranslated = (blockKey: string) => {
    const base = t('insightBase');
    const meta = BLOCK_META[blockKey];
    if (!meta) return base;
    if (meta.isTimeBased && !meta.isCostBased) return `${base} ${t('insightTimeOnly')}`;
    if (meta.isCostBased && !meta.isTimeBased) return `${base} ${t('insightCostOnly')}`;
    if (meta.isTimeBased && meta.isCostBased) return `${base} ${t('insightTimeCost')}`;
    if (blockKey === 'onboarding') return `${base} ${t('insightOnboarding')}`;
    if (blockKey === 'vacantImpact') return `${base} ${t('insightVacantImpact')}`;
    if (blockKey === 'expectedRisk') return `${base} ${t('insightRisk')}`;
    return base;
  };

  const costBreakdown = [
    { label: getBlockLabel('strategyPrep'), value: results.blockCosts.strategyPrep.total },
    { label: getBlockLabel('adsBranding'), value: results.blockCosts.adsBranding.total },
    { label: getBlockLabel('candidateMgmt'), value: results.blockCosts.candidateMgmt.total },
    { label: getBlockLabel('interviews'), value: results.blockCosts.interviews.total },
    { label: getBlockLabel('backgroundOffer'), value: results.blockCosts.backgroundOffer.total },
    { label: getBlockLabel('otherServices'), value: results.blockCosts.otherServices.total },
    { label: getBlockLabel('preboarding'), value: results.blockCosts.preboarding.total },
    { label: getBlockLabel('onboarding'), value: results.blockCosts.onboarding.total },
    { label: getBlockLabel('vacantImpact'), value: results.blockCosts.vacantImpact.total },
  ].filter(item => item.value > 0);

  const warningsCount = results.rangeWarnings.length + results.missingPayWarnings.length;
  const hasWarnings = warningsCount > 0;
  const hasCalculated = useAppStore((state) => state.hasCalculated);

  return (
    // @ts-ignore - ref forwarding
    <aside ref={ref} className="w-full md:w-80 bg-summary text-summary-foreground rounded-xl shadow-summary p-4 md:p-6 md:sticky md:top-24 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto summary-scrollbar laptop-compact-sidebar">
      {!hasCalculated && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-summary-muted" />
          </div>
          <div>
            <p className="text-lg font-semibold text-summary-foreground mb-2">
              {t('enterDataAndCalculate')}
            </p>
            <p className="text-sm text-summary-muted">
              {t('seeResultsAfterCalculation')}
            </p>
          </div>
        </div>
      )}

      {hasCalculated && (
        <div className="mb-6 p-6 rounded-xl border-2 border-[hsl(var(--total-highlight))] bg-gradient-to-br from-[hsl(var(--total-highlight)/0.15)] via-[hsl(var(--total-highlight)/0.08)] to-transparent shadow-[0_0_30px_-5px_hsl(var(--total-glow)/0.4)]">
          <p className="text-summary-muted text-xs uppercase tracking-widest mb-3 font-medium">{t('totalRecruitmentCost')}</p>
          <p className="text-5xl font-bold text-[hsl(var(--total-highlight))] animate-pulse-subtle tracking-tight">
            {formatCurrency(results.totalCost)}
          </p>
          <div className="mt-4 pt-4 border-t border-[hsl(var(--total-highlight)/0.3)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--total-highlight))]" />
            <span className="text-sm font-medium">
              {results.normalizedHirePay.monthlyGross > 0 
                ? `${(results.totalCost / results.normalizedHirePay.monthlyGross).toFixed(1)}${t('monthlySalaryMultiplier')}`
                : '—'
              }
            </span>
          </div>
        </div>
      )}

      <div className="mb-5">
        <p className="text-summary-muted text-xs uppercase tracking-wider mb-1">{t('position')}</p>
        <h3 className="text-lg font-semibold">
          {inputs.positionTitle || t('positionNotSet')}
        </h3>
      </div>

      {hasCalculated && (
        <div className="mb-5 p-3 bg-white/5 rounded-lg">
          <p className="text-summary-muted text-xs mb-1">{t('monthlyLabourCost')}</p>
          <p className="text-xl font-bold">{formatCurrency(results.normalizedHirePay.employerMonthlyCost)}</p>
          <p className="text-xs text-summary-muted mt-1">
            ({t('grossSalaryLabel')} {formatCurrency(results.normalizedHirePay.monthlyGross)} + {t('taxes')})
          </p>
          {results.defaultsUsed.hirePay && (
            <p className="text-xs text-summary-accent mt-2">{t('usesEstAverage')}</p>
          )}
        </div>
      )}

      {hasCalculated && results.topDrivers.length > 0 && (
        <div className="mb-6">
          <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">{t('topCostDrivers')}</p>
          <div className="space-y-3">
            {results.topDrivers.map((driver, idx) => {
              const insight = getDriverInsightTranslated(driver.block);
              return (
                <div key={driver.block} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-summary-foreground font-medium">
                      {idx + 1}. {getBlockLabel(driver.block)}
                    </span>
                    <span className="font-semibold text-summary-accent">{formatCurrency(driver.amount)}</span>
                  </div>
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <Lightbulb className="w-3 h-3 text-summary-muted flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-summary-muted leading-relaxed">{insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasCalculated && (
        <div className="mb-6">
          <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">{t('costDistribution')}</p>
          <CostBreakdownChart blockCosts={results.blockCosts} totalCost={results.totalCost} />
        </div>
      )}

      {hasCalculated && (
        <div className="mb-6">
          <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">{t('detailedBreakdown')}</p>
          <div className="space-y-2">
            {costBreakdown.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-summary-muted truncate mr-2">{item.label}</span>
                <span className="font-medium flex-shrink-0">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-semibold">
            <span>{t('total')}</span>
            <span>{formatCurrency(results.totalCost)}</span>
          </div>
        </div>
      )}

      {hasCalculated && (
        <div className="mb-5 p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-warning text-sm font-semibold">{t('additionalRiskScenario')}</p>
          </div>
          <p className="text-sm text-white mb-1">
            {t('riskProbability', { pct: (config.BAD_HIRE_RISK_RATE * 100).toFixed(0) })}
          </p>
          <p className="text-2xl font-bold text-warning">
            {formatCurrency(results.badHireExtraIfHappens)}
          </p>
          <p className="text-xs text-white/75 mt-2">
            {t('notIncludedInTotal')}
          </p>
        </div>
      )}

      {hasCalculated && hasWarnings && (
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-warning text-sm font-medium">{t('warnings')}</p>
            </div>
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              "bg-warning/20 text-warning"
            )}>
              {warningsCount}
            </span>
          </div>
          <ul className="text-sm space-y-2">
            {results.missingPayWarnings.map((w, i) => (
              <li key={`missing-${i}`} className="text-summary-muted">
                <span className="font-medium text-summary-foreground">{w.field === 'hirePay' ? t('hirePayWarningLabel') : w.field}:</span>{' '}
                {w.message}
              </li>
            ))}
            {results.rangeWarnings.map((w, i) => (
              <li key={`range-${i}`} className={cn(
                "flex flex-col",
                w.severity === 'warning' && "text-warning/90",
                w.severity === 'info' && "text-summary-muted"
              )}>
                <span className="font-medium text-summary-foreground">{w.label}</span>
                <span className="text-xs">
                  {w.currentValue !== undefined && w.currentValue > 0 && (
                    <>{t('currently')} {w.currentValue} {w.unit} · </>
                  )}
                  {w.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
});
