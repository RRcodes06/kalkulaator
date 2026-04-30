
import manpowerLogo from '@/assets/manpower-logo.svg';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { SummarySidebar } from '@/components/calculator/SummarySidebar';
import { ResetModal } from '@/components/calculator/ResetModal';
import { PrivacyNotice } from '@/components/calculator/PrivacyNotice';
import { LanguageToggle } from '@/components/calculator/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eraser, HelpCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { useEffect, useState } from 'react';

const PRINT_SNAPSHOT_KEY = 'recruitment-calc-print-snapshot';

const MIN_CALC_WIDTH = 1150;

function useIsWideEnough(minWidth: number) {
  const [isWide, setIsWide] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= minWidth;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
    const onChange = () => setIsWide(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [minWidth]);

  return isWide;
}

const Index = () => {
  const { t, language } = useLanguage();
  const inputs = useAppStore((s) => s.inputs);
  const results = useAppStore((s) => s.results);
  const config = useAppStore((s) => s.config);
  const autoFillEnabled = useAppStore((s) => s.autoFillEnabled);
  const toggleAutoFill = useAppStore((s) => s.toggleAutoFill);
  const resetInputs = useAppStore((s) => s.resetInputs);
  const isWideEnough = useIsWideEnough(MIN_CALC_WIDTH);

  const handlePrint = () => {
    const snapshot = {
      inputs,
      results,
      config: {
        disclaimerText: config.disclaimerText,
        riskExplanationText: config.riskExplanationText,
        indirectExplanationText: config.indirectExplanationText,
        finalQuestionText: config.finalQuestionText,
        ctaPlaceholderText: config.ctaPlaceholderText,
        BAD_HIRE_RISK_RATE: config.BAD_HIRE_RISK_RATE,
        BAD_HIRE_PAY_MONTHS: config.BAD_HIRE_PAY_MONTHS,
        HOURS_PER_MONTH: config.HOURS_PER_MONTH,
        EST_AVG_GROSS_WAGE: config.EST_AVG_GROSS_WAGE,
        helpUrl: config.helpUrl,
      },
      language,
      generatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(PRINT_SNAPSHOT_KEY, JSON.stringify(snapshot));
    window.open('/print', '_blank');
  };

  if (!isWideEnough) {
    const browserLang =
      typeof navigator !== 'undefined'
        ? (navigator.languages && navigator.languages[0]) || navigator.language || ''
        : '';
    const isEt = browserLang.toLowerCase().startsWith('et');
    const guardTitle = isEt
      ? 'See kalkulaator on mõeldud kasutamiseks arvutis.'
      : 'This calculator is designed for desktop use.';
    const guardText = isEt
      ? 'Palun ava kalkulaator süle- või lauaarvutis, et näha täielikku arvutust ja tulemusi.'
      : 'Please open it on a laptop or desktop computer to view the full calculation and results.';
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 shadow-lg text-center space-y-4">
          <h1 className="text-xl font-bold text-foreground">
            {guardTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {guardText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="calc-shell-wrapper">
        <div className="calc-shell">
          {/* ── LEFT COLUMN: logo + help ── */}
          <aside className="calc-left-col self-start">
            <div className="space-y-6 laptop:space-y-4">
              <img
                src={manpowerLogo}
                alt="Manpower"
                className="block w-full max-w-[180px] laptop:max-w-[150px] h-auto object-contain shrink-0 rounded-none ml-auto"
              />
              <div className="calc-help-sticky">
                <div className="flex items-start gap-5 laptop:gap-3 rounded-xl border border-border bg-card p-6 laptop:p-4 shadow-lg">
                  <HelpCircle className="h-7 w-7 laptop:h-5 laptop:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-3 laptop:space-y-2">
                    <h4 className="text-base laptop:text-sm font-semibold text-foreground">{t('helpTitle')}</h4>
                    <p className="text-sm laptop:text-xs leading-relaxed text-muted-foreground">{t('helpText')}</p>
                    <a
                      href={config.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="default" className="mt-1 w-full laptop:text-xs laptop:h-8">
                        {t('helpCta')}
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── CENTER COLUMN: calculator ── */}
          <section className="min-w-0 space-y-6 laptop:space-y-4">
            <div>
              <h1 className="text-2xl laptop:text-xl font-bold text-foreground">
                {config.pageTitle?.[language] || t('title')}
              </h1>
              <p className="mt-1 max-w-2xl text-sm laptop:text-xs text-muted-foreground">
                {config.pageSubtitle?.[language] || t('subtitle')}
              </p>
            </div>

              <PrivacyNotice />
              <div className="mt-4 laptop:mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4 laptop:p-3">
                <div className="flex items-start gap-3 laptop:gap-2">
                  <Sparkles className="mt-0.5 h-5 w-5 laptop:h-4 laptop:w-4 flex-shrink-0 text-primary" />
                  <div className="flex-1 space-y-2 laptop:space-y-1">
                    <p className="text-sm laptop:text-xs text-foreground">{t('fillAveragesPromo')}</p>
                    <div className="flex items-center gap-3 laptop:gap-2">
                      <div className="flex items-center gap-2">
                        <Switch id="auto-fill-toggle" checked={autoFillEnabled} onCheckedChange={toggleAutoFill} />
                        <Label htmlFor="auto-fill-toggle" className="cursor-pointer text-sm laptop:text-xs font-semibold">
                          {t('fillAverages')}
                        </Label>
                      </div>
                      <Button variant="ghost" size="sm" onClick={resetInputs} className="gap-2 laptop:gap-1 text-muted-foreground laptop:text-xs laptop:h-7">
                        <Eraser className="h-4 w-4 laptop:h-3 laptop:w-3" />
                        {t('clearFields')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 laptop:mt-4">
                <CalculatorForm />
              </div>
          </section>

          {/* ── RIGHT COLUMN: actions + results ── */}
          <aside className="calc-right-col">
            <div className="space-y-4 laptop:space-y-3">
              <div className="flex flex-wrap items-center justify-end gap-2 laptop:gap-1">
                <LanguageToggle />
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 laptop:text-xs laptop:h-7 laptop:px-2">
                  <Printer className="h-4 w-4 laptop:h-3 laptop:w-3" />
                  {t('printReport')}
                </Button>
                <ResetModal />
              </div>
              <SummarySidebar />
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-8 laptop:mt-6 border-t border-border bg-card/30 py-6 laptop:py-4">
        <div className="calc-shell-wrapper text-center text-sm laptop:text-xs text-muted-foreground">
          <p>{t('footer')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

export { PRINT_SNAPSHOT_KEY };
