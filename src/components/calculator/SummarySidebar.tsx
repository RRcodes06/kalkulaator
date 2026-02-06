import { forwardRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CostBreakdownChart } from './CostBreakdownChart';
import { BLOCK_LABELS } from '@/config/defaults';
import { cn } from '@/lib/utils';

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
    { label: BLOCK_LABELS.expectedRisk, value: results.expectedRiskCost },
  ].filter(item => item.value > 0);

  const warningsCount = results.rangeWarnings.length + results.missingPayWarnings.length;
  const hasWarnings = warningsCount > 0;

  return (
    // @ts-ignore - ref forwarding
    <aside ref={ref} className="w-80 bg-summary text-summary-foreground rounded-xl shadow-summary p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto summary-scrollbar">
      {/* Position title */}
      <div className="mb-6">
        <p className="text-summary-muted text-sm uppercase tracking-wider mb-1">Ametikoht</p>
        <h3 className="text-xl font-semibold">
          {inputs.positionTitle || 'Määramata'}
        </h3>
      </div>

      {/* Monthly salary context */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <p className="text-summary-muted text-sm mb-1">Igakuine tööjõukulu</p>
        <p className="text-2xl font-bold">{formatCurrency(results.normalizedHirePay.employerMonthlyCost)}</p>
        <p className="text-sm text-summary-muted mt-1">
          (brutopalk {formatCurrency(results.normalizedHirePay.monthlyGross)} + maksud)
        </p>
        {results.defaultsUsed.hirePay && (
          <p className="text-xs text-summary-accent mt-2">⚠ Kasutab Eesti keskmist</p>
        )}
      </div>

      {/* Grand total */}
      <div className="mb-6 p-5 bg-gradient-to-br from-summary-accent/20 to-summary-accent/5 rounded-lg border border-summary-accent/20">
        <p className="text-summary-muted text-sm uppercase tracking-wider mb-2">Värbamise kogukulu</p>
        <p className="text-4xl font-bold text-summary-accent animate-pulse-subtle">
          {formatCurrency(results.totalCost)}
        </p>
        <div className="mt-3 pt-3 border-t border-summary-accent/20 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-summary-accent" />
          <span className="text-sm">
            {results.normalizedHirePay.monthlyGross > 0 
              ? `${(results.totalCost / results.normalizedHirePay.monthlyGross).toFixed(1)}× kuupalk`
              : '—'
            }
          </span>
        </div>
      </div>

      {/* Top drivers */}
      {results.topDrivers.length > 0 && (
        <div className="mb-6">
          <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">Suurimad kuluallikad</p>
          <div className="space-y-2">
            {results.topDrivers.map((driver, idx) => (
              <div key={driver.block} className="flex justify-between text-sm">
                <span className="text-summary-muted">
                  {idx + 1}. {driver.label}
                </span>
                <span className="font-medium">{formatCurrency(driver.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mb-6">
        <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">Kulude jaotus</p>
        <CostBreakdownChart blockCosts={results.blockCosts} totalCost={results.totalCost} />
      </div>

      {/* Cost breakdown table */}
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

      {/* Bad hire scenario */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-summary-muted" />
          <p className="text-summary-muted text-sm font-medium">Halva värbamise stsenaarium</p>
        </div>
        <p className="text-sm">
          Kui värbamine ebaõnnestub, on lisakulu{' '}
          <span className="font-semibold text-summary-accent">
            {formatCurrency(results.badHireExtraIfHappens)}
          </span>
        </p>
        <p className="text-xs text-summary-muted mt-1">
          Tõenäosus: {(config.BAD_HIRE_RISK_RATE * 100).toFixed(0)}%
        </p>
      </div>

      {/* Warnings Section with Counter */}
      {hasWarnings && (
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
                <span className="font-medium text-summary-foreground">{w.field === 'hirePay' ? 'Värbatava palk' : w.field}:</span>{' '}
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

      {/* Risk explanation tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="mt-4 text-xs text-summary-muted hover:text-summary-foreground transition-colors underline decoration-dotted cursor-help">
            Kuidas arvutatakse halva värbamise riski?
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs bg-popover text-popover-foreground">
          <p>{config.riskExplanationText}</p>
        </TooltipContent>
      </Tooltip>
    </aside>
  );
});
