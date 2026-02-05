import { forwardRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    { label: 'Strateegia ja ettevalmistus', value: results.blockCosts.strategyPrep.total },
    { label: 'Kuulutused ja bränding', value: results.blockCosts.adsBranding.total },
    { label: 'Kandidaatide haldus', value: results.blockCosts.candidateMgmt.total },
    { label: 'Intervjuud', value: results.blockCosts.interviews.total },
    { label: 'Taustakontroll ja pakkumine', value: results.blockCosts.backgroundOffer.total },
    { label: 'Muud teenused', value: results.blockCosts.otherServices.total },
    { label: 'Ettevalmistus', value: results.blockCosts.preboarding.total },
    { label: 'Sisseelamine', value: results.blockCosts.onboarding.total },
    { label: 'Vakantsi kulu', value: results.blockCosts.vacancy.total },
    { label: 'Kaudsed kulud', value: results.blockCosts.indirectCosts.total },
    { label: 'Oodatav riskikulu', value: results.expectedRiskCost },
  ].filter(item => item.value > 0);

  const hasWarnings = results.rangeWarnings.length > 0 || results.missingPayWarnings.length > 0;

  return (
    // @ts-ignore - ref forwarding
    <aside className="w-80 bg-summary text-summary-foreground rounded-xl shadow-summary p-6 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto summary-scrollbar">
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
            {(results.totalCost / results.normalizedHirePay.monthlyGross).toFixed(1)}× kuupalk
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

      {/* Cost breakdown */}
      <div className="mb-6">
        <p className="text-summary-muted text-xs uppercase tracking-wider mb-3">Kulude jaotus</p>
        <div className="space-y-2">
          {costBreakdown.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-summary-muted">{item.label}</span>
              <span className="font-medium">{formatCurrency(item.value)}</span>
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

      {/* Warnings */}
      {hasWarnings && (
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-warning text-sm font-medium">Tähelepanu</p>
          </div>
          <ul className="text-sm space-y-1 text-summary-muted">
            {results.missingPayWarnings.map((w, i) => (
              <li key={`missing-${i}`}>• {w.message}</li>
            ))}
            {results.rangeWarnings.map((w, i) => (
              <li key={`range-${i}`}>• {w.message}</li>
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
