import { useAppStore } from '@/store/appStore';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function SummarySidebar() {
  const { computedResults, userInputs, warnings, config } = useAppStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const costBreakdown = [
    { label: 'Sisemised ajakulud', value: computedResults.totalInternalTimeCost },
    { label: 'Välised kulud', value: computedResults.totalExternalCosts },
    { label: 'Sisseelamise kulud', value: computedResults.totalOnboardingCost },
    { label: 'Tootlikkuse kadu', value: computedResults.productivityLossCost },
    { label: 'Halva värbamise risk', value: computedResults.badHireRiskCost },
  ];

  const hasWarnings = Object.values(warnings).some(Boolean);

  return (
    <aside className="w-80 bg-summary text-summary-foreground rounded-xl shadow-summary p-6 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto summary-scrollbar">
      {/* Position title */}
      <div className="mb-6">
        <p className="text-summary-muted text-sm uppercase tracking-wider mb-1">Ametikoht</p>
        <h3 className="text-xl font-semibold">
          {userInputs.positionTitle || 'Määramata'}
        </h3>
      </div>

      {/* Monthly salary context */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <p className="text-summary-muted text-sm mb-1">Igakuine tööjõukulu</p>
        <p className="text-2xl font-bold">{formatCurrency(computedResults.totalEmployerCost)}</p>
        <p className="text-sm text-summary-muted mt-1">
          (brutopalk {formatCurrency(userInputs.grossSalary)} + maksud)
        </p>
      </div>

      {/* Grand total */}
      <div className="mb-6 p-5 bg-gradient-to-br from-summary-accent/20 to-summary-accent/5 rounded-lg border border-summary-accent/20">
        <p className="text-summary-muted text-sm uppercase tracking-wider mb-2">Värbamise kogukulu</p>
        <p className="text-4xl font-bold text-summary-accent animate-pulse-subtle">
          {formatCurrency(computedResults.grandTotal)}
        </p>
        <div className="mt-3 pt-3 border-t border-summary-accent/20 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-summary-accent" />
          <span className="text-sm">
            {computedResults.monthsOfSalaryEquivalent.toFixed(1)}× kuupalk
          </span>
        </div>
      </div>

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
          <span>{formatCurrency(computedResults.grandTotal)}</span>
        </div>
      </div>

      {/* Insights */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-summary-muted" />
          <p className="text-summary-muted text-sm font-medium">Sissevaade</p>
        </div>
        <p className="text-sm">
          Värbamise kogukulu moodustab{' '}
          <span className="font-semibold text-summary-accent">
            {computedResults.costAsPercentOfAnnualSalary.toFixed(0)}%
          </span>{' '}
          töötaja aasta brutopalgast.
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
            {warnings.lowSalary && <li>• Palk on turu keskmisest oluliselt madalam</li>}
            {warnings.highProductivityLoss && <li>• Väga madal tootlikkus sisseelamisperioodil</li>}
            {warnings.noExternalCosts && <li>• Välised kulud pole märgitud</li>}
            {warnings.longRampUp && <li>• Pikk sisseelamisperiood suurendab kulusid</li>}
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
}
