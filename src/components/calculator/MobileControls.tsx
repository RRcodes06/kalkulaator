import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { ResetModal } from './ResetModal';
import { useLanguage } from '@/i18n/LanguageContext';

interface MobileControlsProps {
  onPrint: () => void;
}

export function MobileControls({ onPrint }: MobileControlsProps) {
  const { t } = useLanguage();
  return (
    <div className="flex md:hidden flex-wrap items-center justify-center gap-2 w-full">
      <LanguageToggle />
      <Button variant="outline" size="sm" onClick={onPrint} className="gap-1.5">
        <Printer className="h-4 w-4" />
        {t('printReport')}
      </Button>
      <ResetModal />
    </div>
  );
}