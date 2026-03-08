import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function PrivacyNotice() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg text-sm">
      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
      <span>{t('privacyNotice')}</span>
    </div>
  );
}
