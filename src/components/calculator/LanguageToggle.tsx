import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card overflow-hidden text-sm">
      <button
        onClick={() => setLanguage('est')}
        className={cn(
          'px-3 py-1.5 font-medium transition-colors',
          language === 'est'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        EST
      </button>
      <button
        onClick={() => setLanguage('eng')}
        className={cn(
          'px-3 py-1.5 font-medium transition-colors',
          language === 'eng'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        ENG
      </button>
    </div>
  );
}
