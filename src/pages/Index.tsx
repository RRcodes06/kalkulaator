import { Link } from 'react-router-dom';
import manpowerLogo from '@/assets/manpower-logo.png';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { SummarySidebar } from '@/components/calculator/SummarySidebar';
import { ResetModal } from '@/components/calculator/ResetModal';
import { PrivacyNotice } from '@/components/calculator/PrivacyNotice';
import { LanguageToggle } from '@/components/calculator/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Settings, Eraser, HelpCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { AccordionControllerProvider } from '@/hooks/useAccordionController';
import { useLanguage } from '@/i18n/LanguageContext';

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
      },
      language,
      generatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(PRINT_SNAPSHOT_KEY, JSON.stringify(snapshot));
    window.open('/print', '_blank');
  };

  const LogoBlock = ({ className = 'h-16 w-auto object-contain' }: { className?: string }) => (
    <img src={manpowerLogo} alt="Manpower" className={className} />
  );

  const HelpBox = ({
    className = '',
    fullWidthButton = true,
  }: {
    className?: string;
    fullWidthButton?: boolean;
  }) => (
    <div className={`flex items-start gap-5 rounded-xl border border-border bg-card p-6 ${className}`}>
      <HelpCircle className="h-7 w-7 text-primary mt-0.5 flex-shrink-0" />
      <div className="space-y-3">
        <h4 className="text-base font-semibold text-foreground">{t('helpTitle')}</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">{t('helpText')}</p>
        <a
          href="https://www.manpower.ee/et/vaerbamisteenused"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="default" className={fullWidthButton ? 'mt-1 w-full' : 'mt-1'}>
            {t('helpCta')}
          </Button>
        </a>
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <LanguageToggle />
      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
        <Printer className="h-4 w-4" />
        <span className="hidden laptop-3col:inline">{t('printReport')}</span>
      </Button>
      <ResetModal />
      <Link to="/admin">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Settings className="h-4 w-4" />
          <span className="hidden laptop-3col:inline">{t('admin')}</span>
        </Button>
      </Link>
    </div>
  );

  const CalculatorContent = ({ toggleId }: { toggleId: string }) => (
    <>
      <PrivacyNotice />
      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
          <div className="flex-1 space-y-2">
            <p className="text-sm text-foreground">{t('fillAveragesPromo')}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch id={toggleId} checked={autoFillEnabled} onCheckedChange={toggleAutoFill} />
                <Label htmlFor={toggleId} className="cursor-pointer text-sm font-semibold">
                  {t('fillAverages')}
                </Label>
              </div>
              <Button variant="ghost" size="sm" onClick={resetInputs} className="gap-2 text-muted-foreground">
                <Eraser className="h-4 w-4" />
                {t('clearFields')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <CalculatorForm />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden laptop-3col:block">
        <main className="px-4 py-6">
          <div className="laptop-shell">
            <aside className="laptop-left-column">
              <div className="space-y-6">
                <LogoBlock />
                <div className="laptop-help-sticky">
                  <HelpBox className="w-full shadow-lg" />
                </div>
              </div>
            </aside>

            <section className="min-w-0 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
              </div>

              <AccordionControllerProvider>
                <CalculatorContent toggleId="auto-fill-toggle-laptop" />
              </AccordionControllerProvider>
            </section>

            <aside className="laptop-right-column">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <ActionButtons />
                </div>
                <SummarySidebar />
              </div>
            </aside>
          </div>
        </main>

        <footer className="mt-8 border-t border-border bg-card/30 py-6">
          <div className="laptop-shell-footer text-center text-sm text-muted-foreground">
            <p>{t('footer')}</p>
          </div>
        </footer>
      </div>

      <div className="laptop-3col:hidden">
        <header className="border-b border-border bg-card/50">
          <div className="relative mx-auto max-w-7xl px-6 py-4">
            <LogoBlock className="absolute right-full top-1/2 mr-4 hidden h-16 w-auto -translate-y-1/2 object-contain md:h-20 xl:block" />
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <LogoBlock className="h-16 w-auto object-contain md:h-20 xl:hidden" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  {t('printReport')}
                </Button>
                <ResetModal />
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    {t('admin')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-7xl px-6 py-8">
          <AccordionControllerProvider>
            <div className="flex gap-8">
              <div className="min-w-0 flex-1">
                <CalculatorContent toggleId="auto-fill-toggle" />
              </div>

              <div className="hidden flex-shrink-0 lg:block">
                <SummarySidebar />
              </div>
            </div>

            <div className="mt-8 lg:hidden">
              <SummarySidebar />
            </div>
          </AccordionControllerProvider>
        </main>

        <div className="fixed bottom-6 left-6 z-40 hidden md:block">
          <HelpBox className="w-80 max-w-sm shadow-lg" />
        </div>

        <div className="container mx-auto mt-10 max-w-7xl px-6 md:hidden">
          <HelpBox className="shadow-sm" fullWidthButton={false} />
        </div>

        <footer className="mt-12 border-t border-border bg-card/30 py-6">
          <div className="container mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
            <p>{t('footer')}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;

export { PRINT_SNAPSHOT_KEY };
