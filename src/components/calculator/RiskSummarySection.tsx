import { useAppStore } from '@/store/appStore';
import { AlertTriangle, Info, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RiskSummarySection() {
  const { results, config } = useAppStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  const riskPercentage = (config.BAD_HIRE_RISK_RATE * 100).toFixed(0);

  return (
    <div className="mt-8 space-y-6">
      {/* Risk Explanation */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Halva värbamise riskikulu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Final Summary */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Värbamise kogukulu</h2>
            </div>
            
            <p className="text-5xl font-bold text-primary animate-pulse-subtle">
              {formatCurrency(results.totalCost)}
            </p>
            
            <p className="text-muted-foreground max-w-lg mx-auto">
              See on hinnanguline kogukulu ühe töötaja värbamiseks, arvestades nii otseseid 
              kulusid, ajakulu kui ka oodatavat riskikulu.
            </p>

            <div className="pt-4 border-t border-border inline-block">
              <p className="text-lg font-medium text-primary">
                Kas see number üllatas sind?
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                {config.disclaimerText}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
