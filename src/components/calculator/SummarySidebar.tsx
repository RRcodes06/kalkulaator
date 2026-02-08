import { forwardRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CostBreakdownChart } from './CostBreakdownChart';
import { BLOCK_LABELS } from '@/config/defaults';
import { getDriverInsight } from '@/config/sectionInfo';
import { cn } from '@/lib/utils';
import type { BlockName } from '@/types/calculator';

export const SummarySidebar = forwardRef<HTMLElement>(function SummarySidebar(_, ref) {
  const { results, inputs, config } = useAppStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  // Cost breakdown - EXCLUDES risk (shown separately)
  const costBreakdown = [
    { label: BLOCK_LABELS.strategyPrep, value: results.blockCosts.strategyPrep.total },
    { label: BLOCK_LABELS.adsBranding, value: results.blockCosts.adsBranding.total },
    { label: BLOCK_LABELS.candidateMgmt, value: results.blockCosts.candidateMgmt.total },
    { label: BLOCK_LABELS.interviews, value: results.blockCosts.interviews.total },
    { label: BLOCK_LABELS.backgroundOffer, value: results.blockCosts.backgroundOffer.total },
    { label: BLOCK_LABELS.otherServices, value: results.blockCosts.otherServices.total },
    { label: BLOCK_LABELS.preboarding, value: results.blockCosts.preboarding.total },
    { label: BLOCK_LABELS.onboarding, value: results.blockCosts.onboarding.total },
    { label: BLOCK_LABELS.vacancy, value: results.blockCosts.vacancy.total },
    { label: BLOCK_LABELS.indirectCosts, value: results.blockCosts.indirectCosts.total },
    // Note: expectedRisk is shown separately, not in main breakdown
  ].filter(item => item.value > 0);

  const warningsCount = results.rangeWarnings.length + results.missingPayWarnings.length;
  const hasWarnings = warningsCount > 0;

  // Get block costs for insight generation
  const getBlockCosts = (blockKey: BlockName) => results.blockCosts[blockKey];

  const hasCalculated = useAppStore((state) => state.hasCalculated);

  // Placeholder for uncalculated state
  const placeholder = '—';

  return (
    // @ts-ignore - ref forwarding
    <aside ref={ref} className="w-80 bg-summary text-summary-foreground rounded-xl shadow-summary p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto summary-scrollbar">
      {/* PRE-CALCULATION STATE */}
      {!hasCalculated && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-summary-muted" />
          </div>
          <div>
            <p className="text-lg font-semibold text-summary-foreground mb-2">
              Sisesta andmed ja vajuta ARVUTA
            </p>
            <p className="text-sm text-summary-muted">
              Näed kogukulu ja jaotust pärast arvutamist.
            </p>
          </div>
        </div>
      )}

      {/* GRAND TOTAL - PRIMARY VISUAL ELEMENT */}
      {hasCalculated && (
        <div className="mb-6 p-6 rounded-xl border-2 border-[hsl(var(--total-highlight))] bg-gradient-to-br from-[hsl(var(--total-highlight)/0.15)] via-[hsl(var(--total-highlight)/0.08)] to-transparent shadow-[0_0_30px_-5px_hsl(var(--total-glow)/0.4)]">
          <p className="text-summary-muted text-xs uppercase tracking-widest mb-3 font-medium">Värbamise kogukulu</p>
          <p className="text-5xl font-bold text-[hsl(var(--total-highlight))] animate-pulse-subtle tracking-tight">
            {formatCurrency(results.totalCost)}
          </p>
          <div className="mt-4 pt-4 border-t border-[hsl(var(--total-highlight)/0.3)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--total-highlight))]" />
            <span className="text-sm font-medium">
              {results.normalizedHirePay.monthlyGross > 0 
                ? `${(results.totalCost / results.normalizedHirePay.monthlyGross).toFixed(1)}× kuupalk`
                : '—'
              }
            </span>
          </div>
        </div>
      )}

      {/* Position title */}
      <div className="mb-5">
        <p className="text-summary-muted text-xs uppercase tracking-wider mb-1">Ametikoht</p>
        <h3 className="text-lg font-semibold">
          {inputs.positionTitle || 'Määramata'}
        </h3>
      </div>

      {/* Monthly salary context */}
      {hasCalculated && (
        <div className="mb-5 p-3 bg-white/5 rounded-lg">
          <p className="text-summary-muted text-xs mb-1">Igakuine tööjõukulu</p>
          <p className="text-xl font-bold">{formatCurrency(results.normalizedHirePay.employerMonthlyCost)}</p>
          <p className="text-xs text-summary-muted mt-1">
            (brutopalk {formatCurrency(results.normalizedHirePay.monthlyGross)} + maksud)
          </p>
          {results.defaultsUsed.hirePay && (
            <p className="text-xs text-summary-accent mt-2">⚠ Kasutab Eesti keskmist</p>
          )}
        </div>
      )}

      {/* Top drivers with insights */}
      {hasCalculated && results.topDrivers.length > 0 && (
        <div className="mb-6">
          <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">Suurimad kuluallikad</p>
          <div className="space-y-3">
            {results.topDrivers.map((driver, idx) => {
              const blockCosts = getBlockCosts(driver.block);
              const insight = getDriverInsight(driver.block, blockCosts);
              
              return (
                <div key={driver.block} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-summary-foreground font-medium">
                      {idx + 1}. {driver.label}
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

      {/* Chart */}
      {hasCalculated && (
        <div className="mb-6">
          <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">Kulude jaotus</p>
          <CostBreakdownChart blockCosts={results.blockCosts} totalCost={results.totalCost} />
        </div>
      )}

      {/* Cost breakdown table */}
      {hasCalculated && (
        <div className="mb-6">
          <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">Detailne jaotus</p>
          <div className="space-y-2">
            {costBreakdown.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-summary-muted truncate mr-2">{item.label}</span>
                <span className="font-medium flex-shrink-0">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-semibold">
            <span>Kokku</span>
            <span>{formatCurrency(results.totalCost)}</span>
          </div>
        </div>
      )}

      {/* Bad hire scenario - SEPARATE from main total, clearly labeled */}
      {hasCalculated && (
        <div className="mb-5 p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-warning text-sm font-semibold">Lisariski stsenaarium</p>
          </div>
          <p className="text-sm text-white mb-1">
            On {(config.BAD_HIRE_RISK_RATE * 100).toFixed(0)}% tõenäosus, et lisandub:
          </p>
          <p className="text-2xl font-bold text-warning">
            {formatCurrency(results.badHireExtraIfHappens)}
          </p>
          <p className="text-xs text-white/75 mt-2">
            See summa <strong>ei ole</strong> lisatud kogukulu hulka.
          </p>
        </div>
      )}

      {/* Warnings Section with Counter */}
      {hasCalculated && hasWarnings && (
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-warning text-sm font-medium">Hoiatused</p>
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
                <span className="font-medium text-summary-foreground">{w.field === 'hirePay' ? 'Värvatava palk' : w.field}:</span>{' '}
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
                    <>Praegu: {w.currentValue} {w.unit} · </>
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
