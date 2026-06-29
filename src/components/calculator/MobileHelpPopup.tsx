import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/store/appStore';
import { sanitizeHttpUrl } from '@/lib/utils';

const INTERVAL_MS = 5 * 60 * 1000;
const MOBILE_QUERY = '(max-width: 767px)';

export function MobileHelpPopup() {
  const { t } = useLanguage();
  const helpUrl = useAppStore((s) => s.config.helpUrl);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(MOBILE_QUERY);
    let timer: number | undefined;

    const schedule = () => {
      window.clearTimeout(timer);
      if (mql.matches) {
        timer = window.setTimeout(() => setOpen(true), INTERVAL_MS);
      }
    };

    schedule();
    const onChange = () => schedule();
    mql.addEventListener('change', onChange);
    return () => {
      window.clearTimeout(timer);
      mql.removeEventListener('change', onChange);
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && typeof window !== 'undefined') {
      // Reschedule for another interval after dismissal
      window.setTimeout(() => {
        if (window.matchMedia(MOBILE_QUERY).matches) setOpen(true);
      }, INTERVAL_MS);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <DialogTitle>{t('helpTitle')}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-foreground/80">
            {t('helpText')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <a
            href={sanitizeHttpUrl(helpUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            <Button className="w-full">{t('helpCta')}</Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}