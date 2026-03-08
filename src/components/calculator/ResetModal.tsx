import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/i18n/LanguageContext';

export function ResetModal() {
  const resetInputs = useAppStore((s) => s.resetInputs);
  const { t } = useLanguage();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          {t('reset')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('resetTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('resetDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('resetCancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={resetInputs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {t('resetConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
