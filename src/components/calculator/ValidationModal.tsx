import { AlertTriangle, ChevronRight, Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

export interface EmptyField {
  sectionId: string;
  fieldName: string;
  label: string;
}

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  emptyFields: EmptyField[];
  onReview: () => void;
  onCalculateAnyway: () => void;
}

export function ValidationModal({
  isOpen,
  onClose,
  emptyFields,
  onReview,
  onCalculateAnyway,
}: ValidationModalProps) {
  const { t } = useLanguage();
  const fieldLabels = emptyFields.map(f => f.label);
  const displayList = fieldLabels.slice(0, 5);
  const remaining = fieldLabels.length - 5;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning-text">
            <AlertTriangle className="w-5 h-5" />
            {t('validationTitle')}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {t('validationDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {displayList.map((label, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-warning-text flex-shrink-0" />
                <span>{label}</span>
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-muted-foreground pl-5">
                {t('validationMore', { count: remaining })}
              </li>
            )}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onReview}
            className="w-full sm:w-auto"
          >
            {t('validationReview')}
          </Button>
          <Button
            onClick={onCalculateAnyway}
            className="w-full sm:w-auto gap-2"
          >
            <Calculator className="w-4 h-4" />
            {t('validationCalculateAnyway')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
