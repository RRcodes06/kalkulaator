import { useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { AlertTriangle, Info, TrendingDown, HelpCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SECTION_INFO } from '@/config/sectionInfo';
import { cn } from '@/lib/utils';
import { CalculatingOverlay } from './CalculatingOverlay';
import { ValidationModal, type EmptyField } from './ValidationModal';
import { MissingInputsInfo, type MissingInputInfo } from './MissingInputsInfo';
import { useAccordionController } from '@/hooks/useAccordionController';

// Field to section mapping for accordion expansion
const FIELD_SECTION_MAP: Record<string, string> = {
  'hirePay': 'position',
  'roles.hr': 'roles',
  'roles.manager': 'roles',
  'roles.team': 'roles',
  'strategyPrep': 'strategy',
  'adsBranding': 'ads',
  'candidateMgmt': 'candidate',
  'interviews': 'interviews',
  'backgroundOffer': 'background',
  'preboarding': 'preboarding',
  'onboarding': 'onboarding',
  'vacancy': 'vacancy',
  'indirectCosts': 'indirect',
};

export function RiskSummarySection() {
  const { results, config, hasCalculated, triggerCalculation, inputs } = useAppStore();
  const [showInfo, setShowInfo] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [pendingEmptyFields, setPendingEmptyFields] = useState<EmptyField[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const accordionController = useAccordionController();

  // Validate inputs and return empty fields
  const validateInputs = useCallback(() => {
    const emptyFields: EmptyField[] = [];
    
    // Check hire pay
    if (inputs.hirePay.payType === 'unset' || inputs.hirePay.payAmount === 0) {
      emptyFields.push({ sectionId: 'position', fieldName: 'hirePay', label: 'Värvatava töötaja palk' });
    }
    
    // Check role pays
    if (inputs.roles.hr.payType === 'unset' || inputs.roles.hr.payAmount === 0) {
      emptyFields.push({ sectionId: 'roles', fieldName: 'roles.hr', label: 'Personalitöötaja palk' });
    }
    if (inputs.roles.manager.payType === 'unset' || inputs.roles.manager.payAmount === 0) {
      emptyFields.push({ sectionId: 'roles', fieldName: 'roles.manager', label: 'Juhi palk' });
    }
    if (inputs.roles.team.payType === 'unset' || inputs.roles.team.payAmount === 0) {
      emptyFields.push({ sectionId: 'roles', fieldName: 'roles.team', label: 'Tiimi palk' });
    }
    
    // Check key block inputs (focus on important ones)
    const checks: Array<{ condition: boolean; sectionId: string; fieldName: string; label: string }> = [
      { condition: inputs.strategyPrep.hrHours === 0 && inputs.strategyPrep.managerHours === 0, sectionId: 'strategy', fieldName: 'strategyPrep', label: 'Strateegia tunnid' },
      { condition: inputs.adsBranding.hrHours === 0 && inputs.adsBranding.directCosts === 0, sectionId: 'ads', fieldName: 'adsBranding', label: 'Kuulutused' },
      { condition: inputs.candidateMgmt.hrHours === 0, sectionId: 'candidate', fieldName: 'candidateMgmt', label: 'Kandidaatide haldus' },
      { condition: inputs.interviews.hrHours === 0 && inputs.interviews.managerHours === 0, sectionId: 'interviews', fieldName: 'interviews', label: 'Intervjuud' },
      { condition: inputs.onboarding.onboardingMonths === 0, sectionId: 'onboarding', fieldName: 'onboarding', label: 'Sisseelamisperiood' },
      { condition: inputs.vacancy.vacancyDays === 0, sectionId: 'vacancy', fieldName: 'vacancy', label: 'Vakantsi kestus' },
    ];
    
    for (const check of checks) {
      if (check.condition) {
        emptyFields.push({ sectionId: check.sectionId, fieldName: check.fieldName, label: check.label });
      }
    }
    
    return emptyFields;
  }, [inputs]);

  const handleCalculate = useCallback(() => {
    const emptyFields = validateInputs();
    
    if (emptyFields.length > 0) {
      setPendingEmptyFields(emptyFields);
      setShowValidationModal(true);
    } else {
      // No empty fields, proceed with calculation
      setIsCalculating(true);
      triggerCalculation();
    }
  }, [validateInputs, triggerCalculation]);

  const handleReview = useCallback(() => {
    setShowValidationModal(false);
    // Expand the first section with empty fields
    if (pendingEmptyFields.length > 0) {
      const firstSection = pendingEmptyFields[0].sectionId;
      accordionController.setOpenSection(firstSection);
    }
  }, [pendingEmptyFields, accordionController]);

  const handleCalculateAnyway = useCallback(() => {
    setShowValidationModal(false);
    setIsCalculating(true);
    triggerCalculation();
  }, [triggerCalculation]);

  const handleCalculationComplete = useCallback(() => {
    setIsCalculating(false);
    // Scroll to results after overlay closes
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

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
  
  // Convert empty fields to missing input info for display
  const missingInputs: MissingInputInfo[] = results.emptyFields.map(f => ({
    label: f.label,
    fieldType: f.fieldType,
  }));

  return (
    <div className="mt-8 space-y-6">
      {/* Calculating Overlay */}
      <CalculatingOverlay 
        isVisible={isCalculating} 
        onComplete={handleCalculationComplete} 
      />
      
      {/* Validation Modal */}
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        emptyFields={pendingEmptyFields}
        onReview={handleReview}
        onCalculateAnyway={handleCalculateAnyway}
      />

      {/* ARVUTA Button - Always visible */}
      <div className="flex justify-center">
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="px-10 py-5 bg-primary text-primary-foreground font-bold text-xl rounded-xl shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ARVUTA
        </button>
      </div>

      {/* Pre-calculation state message */}
      {!hasCalculated && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <TrendingDown className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Sisesta andmed ja vajuta ARVUTA
                </h2>
                <p className="text-muted-foreground">
                  Näed kogukulu ja jaotust pärast arvutamist.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RESULTS - only show after calculation */}
      {hasCalculated && !isCalculating && (
        <div ref={resultsRef} className="space-y-6">
          
          {/* Missing Inputs Info - Transparency about what was empty */}
          {missingInputs.length > 0 && (
            <MissingInputsInfo missingInputs={missingInputs} />
          )}

          {/* Final Summary - PRIMARY VISUAL ELEMENT - MAIN COST (excluding risk) */}
          <Card className="border-2 border-[hsl(var(--total-highlight))] bg-gradient-to-br from-[hsl(var(--total-highlight)/0.12)] via-[hsl(var(--total-highlight)/0.06)] to-background shadow-[0_0_40px_-8px_hsl(var(--total-glow)/0.35)]">
            <CardContent className="py-12">
              <div className="text-center space-y-5">
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="w-7 h-7 text-[hsl(var(--total-highlight))]" />
                  <h2 className="text-2xl font-bold text-[hsl(var(--total-highlight))]">Värbamise kogukulu</h2>
                </div>
                
                <p className="text-6xl font-bold text-[hsl(var(--total-highlight))] animate-pulse-subtle tracking-tight">
                  {formatCurrency(results.totalCost)}
                </p>
                
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  See on hinnanguline kogukulu ühe töötaja värbamiseks, arvestades otseseid 
                  kulusid ja ajakulu. Riskikulu on näidatud eraldi allpool.
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

          {/* Risk Scenario - SEPARATE BLOCK (not included in main total) */}
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Lisariski stsenaarium
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
              
              {/* Key message - risk is POSSIBLE, not included */}
              <div className="p-5 bg-background rounded-lg border-2 border-warning/30">
                <p className="text-lg font-medium text-white mb-2">
                  On {riskPercentage}% tõenäosus, et lisandub veel:
                </p>
                <p className="text-4xl font-bold text-warning">
                  {formatCurrency(results.badHireExtraIfHappens)}
                </p>
                <p className="text-sm text-white mt-2">
                  See summa <strong>ei ole</strong> lisatud kogukulu hulka.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Statistiline tõenäosus</p>
                  <p className="text-2xl font-bold text-warning">{riskPercentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    et värbamine ebaõnnestub
                  </p>
                </div>
                
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Lisakulu koosseis</p>
                  <p className="text-base font-medium text-foreground">
                    {config.BAD_HIRE_PAY_MONTHS} kuu palk + korduvad kulud
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Palk: {formatCurrency(results.badHireSalaryCost)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Mida see tähendab?</p>
                  <p className="text-muted-foreground">
                    Kui värbamine ebaõnnestub ({riskPercentage}% tõenäosus), kaotate veel{' '}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(results.badHireExtraIfHappens)}
                    </span>{' '}
                    lisaks juba tehtud kuludele. See on võimalik lisakulu, mitte garanteeritud kulu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
