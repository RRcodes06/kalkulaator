import { Link } from 'react-router-dom';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { SummarySidebar } from '@/components/calculator/SummarySidebar';
import { ResetModal } from '@/components/calculator/ResetModal';
import { PrivacyNotice } from '@/components/calculator/PrivacyNotice';
import { Button } from '@/components/ui/button';
import { Printer, Settings } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { AccordionControllerProvider } from '@/hooks/useAccordionController';

const PRINT_SNAPSHOT_KEY = 'recruitment-calc-print-snapshot';

const Index = () => {
  const disclaimer = useAppStore((s) => s.config.disclaimerText);
  const inputs = useAppStore((s) => s.inputs);
  const results = useAppStore((s) => s.results);
  const config = useAppStore((s) => s.config);

  const handlePrint = () => {
    // Serialize snapshot to sessionStorage
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
      generatedAt: new Date().toISOString(),
    };
    
    sessionStorage.setItem(PRINT_SNAPSHOT_KEY, JSON.stringify(snapshot));
    window.open('/print', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Värbamisprotsessi tegeliku kogukulu kalkulaator
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {disclaimer}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Prindi aruanne (PDF)
              </Button>
              <ResetModal />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-6 py-8">
        <AccordionControllerProvider>
          <div className="flex gap-8">
            {/* Calculator Form */}
            <div className="flex-1 min-w-0">
              <PrivacyNotice />
              <div className="mt-6">
                <CalculatorForm />
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="hidden lg:block flex-shrink-0">
              <SummarySidebar />
            </div>
          </div>

          {/* Mobile Summary (shown below on smaller screens) */}
          <div className="lg:hidden mt-8">
            <SummarySidebar />
          </div>
        </AccordionControllerProvider>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-6 mt-12">
        <div className="container max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Värbamiskulude kalkulaator. Andmed põhinevad Eesti 2024. aasta maksumääradel.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

export { PRINT_SNAPSHOT_KEY };
