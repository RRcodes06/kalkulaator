
import manpowerLogo from '@/assets/manpower-logo.svg';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { SummarySidebar } from '@/components/calculator/SummarySidebar';
import { ResetModal } from '@/components/calculator/ResetModal';
import { PrivacyNotice } from '@/components/calculator/PrivacyNotice';
import { LanguageToggle } from '@/components/calculator/LanguageToggle';
import { MobileHelpPopup } from '@/components/calculator/MobileHelpPopup';
import { MobileControls } from '@/components/calculator/MobileControls';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eraser, HelpCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { sanitizeHttpUrl } from '@/lib/utils';

const PRINT_SNAPSHOT_KEY = 'recruitment-calc-print-snapshot';

const Index = () => {
  const { t, language } = useLanguage();
  const inputs = useAppStore((s) => s.inputs);
  const results = useAppStore((s) => s.results);
  const config = useAppStore((s) => s.config);
  const autoFillEnabled = useAppStore((s) => s.autoFillEnabled);
  const toggleAutoFill = useAppStore((s) => s.toggleAutoFill);
  const resetInputs = useAppStore((s) => s.resetInputs);

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Recruitment Cost Calculator — Manpower</title>
        <meta name="description" content="Calculate the total cost of recruitment including direct expenses, labor hours, and the hidden costs of vacancies and bad hires." />
        <link rel="canonical" href="https://manpowerkalkulaator.lovable.app/" />
        <meta property="og:title" content="Recruitment Cost Calculator — Manpower" />
        <meta property="og:description" content="Estimate the total cost of recruitment — direct expenses, labor hours, and the hidden costs of vacancies and bad hires. By Manpower." />
        <meta property="og:url" content="https://manpowerkalkulaator.lovable.app/" />
      </Helmet>
      <main className="calc-shell-wrapper">
        <MobileControls onPrint={handlePrint} />
        <div className="calc-shell">
          {/* ── LEFT COLUMN: logo + help ── */}
          <aside className="calc-left-col self-start">
            <div className="space-y-6 laptop:space-y-4">
              <img
                src={manpowerLogo}
                alt={t('manpowerLogoAlt')}
                className="block w-full max-w-[160px] sm:max-w-[180px] laptop:max-w-[150px] h-auto object-contain shrink-0 rounded-none mx-auto md:ml-auto md:mr-0"
              />
              <div className="calc-help-sticky hidden md:block">
                <div className="flex items-start gap-5 laptop:gap-3 rounded-xl border border-border bg-card p-6 laptop:p-4 shadow-lg">
                  <HelpCircle className="h-7 w-7 laptop:h-5 laptop:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-3 laptop:space-y-2">
                    <h2 className="text-base laptop:text-sm font-semibold text-foreground">{t('helpTitle')}</h2>
                    <p className="text-sm laptop:text-xs leading-relaxed text-muted-foreground">{t('helpText')}</p>
                    <a
                      href={sanitizeHttpUrl(config.helpUrl)}
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
              <p className="mt-1 max-w-2xl text-sm laptop:text-xs text-foreground">
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
              <div className="hidden md:flex flex-wrap items-center justify-end gap-2 laptop:gap-1">
                <LanguageToggle />
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 laptop:text-xs laptop:h-7 laptop:px-2">
                  <Printer className="h-4 w-4 laptop:h-3 laptop:w-3" />
                  {t('printReport')}
                </Button>
                <ResetModal />
              </div>
              <SummarySidebar />
              <MobileControls onPrint={handlePrint} />
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-8 laptop:mt-6 border-t border-border bg-card/30 py-6 laptop:py-4">
        <div className="calc-shell-wrapper text-center text-sm laptop:text-xs text-muted-foreground">
          <p>{t('footer')}</p>
        </div>
      </footer>
      <MobileHelpPopup />
    </div>
  );
};

export default Index;

export { PRINT_SNAPSHOT_KEY };
