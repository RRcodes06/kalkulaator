import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_DEFAULT_SALARIES } from '@/config/defaults';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

export interface MissingInputInfo {
  label: string;
  fieldType: 'salary' | 'hours' | 'cost' | 'months' | 'percentage' | 'days' | 'rate';
  typicalValue?: string;
}

interface MissingInputsInfoProps {
  missingInputs: MissingInputInfo[];
}

export function MissingInputsInfo({ missingInputs }: MissingInputsInfoProps) {
  const { t } = useLanguage();

  if (missingInputs.length === 0) return null;

  // Build guidance map using translation keys
  const TYPICAL_GUIDANCE: Record<string, string> = {
    [t('fieldHirePay')]: t('guidanceHirePay', { min: ROLE_DEFAULT_SALARIES.team.toLocaleString('et-EE') }),
    [t('fieldHrPay')]: t('guidanceHrPay', { amount: ROLE_DEFAULT_SALARIES.hr.toLocaleString('et-EE') }),
    [t('fieldManagerPay')]: t('guidanceManagerPay', { amount: ROLE_DEFAULT_SALARIES.manager.toLocaleString('et-EE') }),
    [t('fieldTeamPay')]: t('guidanceTeamPay', { amount: ROLE_DEFAULT_SALARIES.team.toLocaleString('et-EE') }),
    [t('hrHours')]: t('guidanceHrHours'),
    [t('managerHours')]: t('guidanceManagerHours'),
    [t('teamHours')]: t('guidanceTeamHours'),
    [t('onboardingMonths')]: t('guidanceOnboardingMonths'),
    [t('productivityPct')]: t('guidanceProductivity'),
    [t('vacancyDays')]: t('guidanceVacancyDays'),
    [t('dailyCost')]: t('guidanceDailyCost'),
    [t('devicesCost')]: t('guidanceDevicesCost'),
    [t('itHourlyRate')]: t('guidanceItRate'),
  };

  return (
    <Card className="border-muted bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-primary">
          <Info className="w-4 h-4" />
          {t('missingFieldsTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t('missingFieldsDescription')}
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
            {t('andMoreFields', { count: missingInputs.length - 8 })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
