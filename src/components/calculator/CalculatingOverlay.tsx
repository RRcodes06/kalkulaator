import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface CalculatingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CalculatingOverlay({ isVisible, onComplete }: CalculatingOverlayProps) {
  const { t } = useLanguage();
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [t('calculating'), t('preparingSummary')];

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }

    const messageTimer = setTimeout(() => {
      setMessageIndex(1);
    }, 1500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl shadow-2xl border border-border">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-foreground">
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
}
