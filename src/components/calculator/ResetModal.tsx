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

export function ResetModal() {
  const resetInputs = useAppStore((s) => s.resetInputs);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Lähtesta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Lähtesta kalkulaator?</AlertDialogTitle>
          <AlertDialogDescription>
            Kõik sisestatud andmed kustutatakse ja väljad taastatakse vaikeväärtustele. Seda toimingut ei saa tagasi võtta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Tühista</AlertDialogCancel>
          <AlertDialogAction onClick={resetInputs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Lähtesta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
