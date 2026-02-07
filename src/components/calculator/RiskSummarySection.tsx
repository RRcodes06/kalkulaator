import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { AlertTriangle, Info, TrendingDown, HelpCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SECTION_INFO } from '@/config/sectionInfo';
import { cn } from '@/lib/utils';

export function RiskSummarySection() {
  const { results, config } = useAppStore();
  const [showInfo, setShowInfo] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  const riskPercentage = (config.BAD_HIRE_RISK_RATE * 100).toFixed(0);
  const riskInfo = SECTION_INFO['risk'];

  return (
    <div className="mt-8 space-y-6">
      {/* Risk Explanation */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Halva värbamise riskikulu
            {riskInfo && (
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={cn(
                  "p-0.5 rounded-full transition-colors ml-1",
                  showInfo 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                aria-label="Näita infot"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showInfo && riskInfo && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border animate-fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-foreground">{riskInfo.description}</p>
                  <p className="text-xs text-muted-foreground">{riskInfo.guidance}</p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
                  aria-label="Sulge info"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {config.riskExplanationText}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Riski tõenäosus</p>
              <p className="text-2xl font-bold text-warning">{riskPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                statistiline tõenäosus
              </p>
            </div>
            
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Lisakulu kui juhtub</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(results.badHireExtraIfHappens)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {config.BAD_HIRE_PAY_MONTHS} kuu palk + korduvad kulud
              </p>
            </div>
            
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Oodatav riskikulu</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(results.expectedRiskCost)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {riskPercentage}% × lisakulu
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Mida see tähendab?</p>
              <p className="text-muted-foreground">
                Kui {riskPercentage}% tõenäosusega värbamine ebaõnnestub, kaotate veel{' '}
                <span className="font-semibold text-foreground">
                  {formatCurrency(results.badHireExtraIfHappens)}
                </span>{' '}
                lisaks juba tehtud kuludele. Seetõttu lisame lõppsummale oodatava riskikulu{' '}
                <span className="font-semibold text-foreground">
                  {formatCurrency(results.expectedRiskCost)}
                </span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Summary - PRIMARY VISUAL ELEMENT */}
      <Card className="border-2 border-[hsl(var(--total-highlight))] bg-gradient-to-br from-[hsl(var(--total-highlight)/0.12)] via-[hsl(var(--total-highlight)/0.06)] to-background shadow-[0_0_40px_-8px_hsl(var(--total-glow)/0.35)]">
        <CardContent className="py-10">
          <div className="text-center space-y-5">
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="w-7 h-7 text-[hsl(var(--total-highlight))]" />
              <h2 className="text-2xl font-bold text-[hsl(var(--total-highlight))]">Värbamise kogukulu</h2>
            </div>
            
            <p className="text-6xl font-bold text-[hsl(var(--total-highlight))] animate-pulse-subtle tracking-tight">
              {formatCurrency(results.totalCost)}
            </p>
            
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              See on hinnanguline kogukulu ühe töötaja värbamiseks, arvestades nii otseseid 
              kulusid, ajakulu kui ka oodatavat riskikulu.
            </p>

            <div className="pt-6 mt-2 border-t-2 border-[hsl(var(--total-highlight)/0.3)] max-w-md mx-auto space-y-4">
              <p className="text-xl font-semibold text-foreground">
                Kas see number üllatas sind?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Võta meiega ühendust, et arutada, kuidas värbamiskulusid optimeerida.
              </p>
              <a
                href="https://www.manpower.ee/et/vaerbamisteenused"
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[hsl(var(--total-highlight))] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[hsl(var(--total-highlight)/0.9)] transition-colors"
              >
                Võta ühendust →
              </a>
              <p className="text-xs text-muted-foreground/70">
                Kontaktvorm asub lehe lõpus.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
