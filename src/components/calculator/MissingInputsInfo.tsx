import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_DEFAULT_SALARIES } from '@/config/defaults';

export interface MissingInputInfo {
  label: string;
  fieldType: 'salary' | 'hours' | 'cost' | 'months' | 'percentage' | 'days' | 'rate';
  typicalValue?: string;
}

interface MissingInputsInfoProps {
  missingInputs: MissingInputInfo[];
}

const TYPICAL_GUIDANCE: Record<string, string> = {
  // Salaries
  'Värvatava töötaja palk': `Tavaliselt ${ROLE_DEFAULT_SALARIES.team.toLocaleString('et-EE')} – 4000 € kuus`,
  'Personalitöötaja palk': `Tavaliselt ${ROLE_DEFAULT_SALARIES.hr.toLocaleString('et-EE')} € kuus`,
  'Juhi palk': `Tavaliselt ${ROLE_DEFAULT_SALARIES.manager.toLocaleString('et-EE')} € kuus`,
  'Tiimi palk': `Tavaliselt ${ROLE_DEFAULT_SALARIES.team.toLocaleString('et-EE')} € kuus`,
  
  // Hours
  'Personalitöötaja tunnid': 'Tavaliselt 2–15 tundi',
  'Juhi tunnid': 'Tavaliselt 1–10 tundi',
  'Tiimi tunnid': 'Tavaliselt 0–8 tundi',
  
  // Onboarding
  'Sisseelamisperiood': 'Tavaliselt 1–6 kuud',
  'Keskmine tootlikkus': 'Tavaliselt 40–70%',
  
  // Vacancy
  'Vakantsi kestus': 'Tavaliselt 20–60 päeva',
  'Päevakulu': 'Sõltub ametikohast',
  
  // Devices
  'Seadmete kulu': 'Tavaliselt 500–2000 €',
  'IT spetsialisti tunnipalk': 'Tavaliselt 20–35 €/h',
};

export function MissingInputsInfo({ missingInputs }: MissingInputsInfoProps) {
  if (missingInputs.length === 0) return null;

  return (
    <Card className="border-muted bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-primary">
          <Info className="w-4 h-4" />
          Täitmata väljad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Järgmised väljad jäeti tühjaks või nulliks. Arvutus kasutab neid nullina.
          Siin on tüüpilised väärtused teadmiseks:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {missingInputs.slice(0, 8).map((item, idx) => {
            const guidance = TYPICAL_GUIDANCE[item.label] || item.typicalValue;
            return (
              <div key={idx} className="text-sm p-2 bg-background/50 rounded border border-border/50">
                <p className="font-medium text-foreground">{item.label}</p>
                {guidance && (
                  <p className="text-xs text-muted-foreground mt-0.5">{guidance}</p>
                )}
              </div>
            );
          })}
        </div>
        {missingInputs.length > 8 && (
          <p className="text-xs text-muted-foreground mt-3">
            ...ja veel {missingInputs.length - 8} täitmata välja
          </p>
        )}
      </CardContent>
    </Card>
  );
}
