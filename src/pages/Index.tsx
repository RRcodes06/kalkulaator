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

  /* ── Shared sub-components ── */

  const LogoBlock = () => (
    <img
      src={manpowerLogo}
      alt="Manpower"
      className="h-14 w-auto object-contain"
    />
  );

  const HelpBox = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-start gap-4 p-5 rounded-xl border border-border bg-card shadow-lg ${compact ? 'laptop-help-inline' : ''}`}>
      <HelpCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-foreground">{t('helpTitle')}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{t('helpText')}</p>
        <a
          href="https://www.manpower.ee/et/vaerbamisteenused"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" className="mt-1 w-full">{t('helpCta')}</Button>
        </a>
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex items-center gap-2 flex-shrink-0">
      <LanguageToggle />
      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
        <Printer className="w-4 h-4" />
        <span className="hidden laptop-3col:inline">{t('printReport')}</span>
      </Button>
      <ResetModal />
      <Link to="/admin">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Settings className="w-4 h-4" />
          <span className="hidden laptop-3col:inline">{t('admin')}</span>
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ════════════════════════════════════════════════════════
          LAPTOP 3-COLUMN LAYOUT (hidden below laptop breakpoint)
          Left: logo + help | Center: header + form | Right: buttons + sidebar
          ════════════════════════════════════════════════════════ */}
      <div className="hidden laptop-3col:block min-h-screen">
        {/* Header row — spans full width, uses same grid */}
        <header className="border-b border-border bg-card/50">
          <div className="laptop-grid px-3 py-2">
            {/* Left: Logo */}
            <div className="flex items-center justify-center">
              <LogoBlock />
            </div>
            {/* Center: Title + Subtitle */}
            <div className="flex items-center">
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle')}</p>
              </div>
            </div>
            {/* Right: Action buttons */}
            <div className="flex items-center justify-end">
              <ActionButtons />
            </div>
          </div>
        </header>

        {/* Main content — 3-column grid */}
        <main className="laptop-grid px-3 py-4 items-start">
          {/* LEFT COLUMN: Help box (sticky) */}
          <div className="sticky top-20 space-y-4">
            <HelpBox compact />
          </div>

          {/* CENTER COLUMN: Form */}
          <div>
            <AccordionControllerProvider>
              <PrivacyNotice />
              <div className="mt-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs text-foreground">{t('fillAveragesPromo')}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          id="auto-fill-toggle-laptop"
                          checked={autoFillEnabled}
                          onCheckedChange={toggleAutoFill}
                        />
                        <Label htmlFor="auto-fill-toggle-laptop" className="text-xs font-semibold cursor-pointer">
                          {t('fillAverages')}
                        </Label>
                      </div>
                      <Button variant="ghost" size="sm" onClick={resetInputs} className="gap-1.5 text-muted-foreground text-xs h-7">
                        <Eraser className="w-3.5 h-3.5" />
                        {t('clearFields')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <CalculatorForm />
              </div>
            </AccordionControllerProvider>
          </div>

          {/* RIGHT COLUMN: Summary sidebar */}
          <div className="sticky top-20">
            <SummarySidebar />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 py-4 mt-8">
          <div className="text-center text-xs text-muted-foreground px-3">
            <p>{t('footer')}</p>
          </div>
        </footer>
      </div>

      {/* ════════════════════════════════════════════════════════
          DEFAULT LAYOUT (mobile / tablet / large desktop)
          Shown when NOT in laptop-3col range
          ════════════════════════════════════════════════════════ */}
      <div className="laptop-3col:hidden">
        {/* Header */}
        <header className="border-b border-border bg-card/50">
          <div className="relative mx-auto max-w-7xl px-6 py-4">
            {/* Logo positioned to the left of the content area on XL+ */}
            <img
              src={manpowerLogo}
              alt="Manpower"
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 h-16 md:h-20 w-auto hidden xl:block"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={manpowerLogo} alt="Manpower" className="h-16 md:h-20 w-auto xl:hidden" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t('subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" />
                  {t('printReport')}
                </Button>
                <ResetModal />
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    {t('admin')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container max-w-7xl mx-auto px-6 py-8">
          <AccordionControllerProvider>
            <div className="flex gap-8">
              <div className="flex-1 min-w-0">
                <PrivacyNotice />
                <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-foreground">{t('fillAveragesPromo')}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="auto-fill-toggle"
                            checked={autoFillEnabled}
                            onCheckedChange={toggleAutoFill}
                          />
                          <Label htmlFor="auto-fill-toggle" className="text-sm font-semibold cursor-pointer">
                            {t('fillAverages')}
                          </Label>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetInputs} className="gap-2 text-muted-foreground">
                          <Eraser className="w-4 h-4" />
                          {t('clearFields')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <CalculatorForm />
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="hidden lg:block flex-shrink-0">
                <SummarySidebar />
              </div>
            </div>

            {/* Mobile Summary */}
            <div className="lg:hidden mt-8">
              <SummarySidebar />
            </div>
          </AccordionControllerProvider>
        </main>

        {/* Sticky Help Box (non-laptop) */}
        <div className="fixed bottom-6 left-6 z-40 hidden md:block">
          <div className="flex items-start gap-5 p-6 rounded-xl border border-border bg-card shadow-lg max-w-sm w-80">
            <HelpCircle className="w-7 h-7 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h4 className="font-semibold text-base text-foreground">{t('helpTitle')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('helpText')}</p>
              <a href="https://www.manpower.ee/et/vaerbamisteenused" target="_blank" rel="noopener noreferrer">
                <Button size="default" className="mt-1 w-full">{t('helpCta')}</Button>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Help Box */}
        <div className="md:hidden container max-w-7xl mx-auto px-6 mt-10">
          <div className="flex items-start gap-5 p-6 rounded-xl border border-border bg-card shadow-sm">
            <HelpCircle className="w-7 h-7 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h4 className="font-semibold text-base text-foreground">{t('helpTitle')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('helpText')}</p>
              <a href="https://www.manpower.ee/et/vaerbamisteenused" target="_blank" rel="noopener noreferrer">
                <Button size="default" className="mt-1">{t('helpCta')}</Button>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 py-6 mt-12">
          <div className="container max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
            <p>{t('footer')}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;

export { PRINT_SNAPSHOT_KEY };
