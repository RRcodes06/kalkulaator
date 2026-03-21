import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { CalculatorSection } from './CalculatorSection';
import { NumberInput } from './NumberInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TrendingDown } from 'lucide-react';
import type { VacantImpactMode } from '@/types/calculator';

export function VacantPositionImpactSection() {
  const { inputs, results, updateNestedInput } = useAppStore();
  const { t } = useLanguage();
  const vpi = inputs.vacantPositionImpact;

  const getWarningForField = (fieldName: string) => {
    const warning = results.rangeWarnings.find(w => w.field === fieldName);
    if (warning) return { message: warning.message, severity: warning.severity };
    return undefined;
  };

  const getRangeHintForField = (fieldName: string) => {
    const hint = results.rangeHints.find(h => h.field === fieldName);
    if (hint) return { min: hint.min, max: hint.max, unit: hint.unit };
    return undefined;
  };

  const handleModeChange = (value: string) => {
    updateNestedInput('vacantPositionImpact', 'mode', value as VacantImpactMode);
  };

  return (
    <CalculatorSection
      id="vacantImpact"
      title={t('sectionVacantImpact')}
      icon={<TrendingDown className="w-5 h-5" />}
      subtotal={results.blockCosts.vacantImpact.total}
      infoKey="vacantImpact"
    >
      <div className="col-span-full">
        <p className="text-sm text-muted-foreground mb-4">
          {t('vacantImpactDescription')}
        </p>

        <RadioGroup
          value={vpi.mode}
          onValueChange={handleModeChange}
          className="space-y-2 mb-6"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="uncovered" id="mode-uncovered" />
            <Label htmlFor="mode-uncovered" className="cursor-pointer font-medium flex-1">
              {t('vacantModeUncovered')}
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="teamCoverage" id="mode-teamCoverage" />
            <Label htmlFor="mode-teamCoverage" className="cursor-pointer font-medium flex-1">
              {t('vacantModeTeamCoverage')}
            </Label>
          </div>
        </RadioGroup>
      </div>

      {vpi.mode === 'uncovered' && (
        <>
          <NumberInput
            label={t('vacantPercentageUndone')}
            value={vpi.percentageUndone}
            onChange={(v) => updateNestedInput('vacantPositionImpact', 'percentageUndone', v)}
            suffix="%"
            min={0}
            max={100}
            warning={getWarningForField('vacantPositionImpact.percentageUndone')}
            rangeHint={getRangeHintForField('vacantPositionImpact.percentageUndone')}
          />
          <NumberInput
            label={t('vacantMonthlyPositionValue')}
            value={vpi.monthlyPositionValue}
            onChange={(v) => updateNestedInput('vacantPositionImpact', 'monthlyPositionValue', v)}
            suffix="€"
            min={0}
            warning={getWarningForField('vacantPositionImpact.monthlyPositionValue')}
            rangeHint={getRangeHintForField('vacantPositionImpact.monthlyPositionValue')}
          />
        </>
      )}

      {vpi.mode === 'teamCoverage' && (
        <>
          <NumberInput
            label={t('vacantAdditionalHours')}
            value={vpi.additionalHours}
            onChange={(v) => updateNestedInput('vacantPositionImpact', 'additionalHours', v)}
            suffix="h"
            min={0}
            warning={getWarningForField('vacantPositionImpact.additionalHours')}
            rangeHint={getRangeHintForField('vacantPositionImpact.additionalHours')}
          />
          <NumberInput
            label={t('vacantAvgHourlyCost')}
            value={vpi.avgHourlyCost}
            onChange={(v) => updateNestedInput('vacantPositionImpact', 'avgHourlyCost', v)}
            suffix="€/h"
            min={0}
            warning={getWarningForField('vacantPositionImpact.avgHourlyCost')}
            rangeHint={getRangeHintForField('vacantPositionImpact.avgHourlyCost')}
          />
          <NumberInput
            label={t('vacantOvertimeMultiplier')}
            value={vpi.overtimeMultiplier}
            onChange={(v) => updateNestedInput('vacantPositionImpact', 'overtimeMultiplier', v)}
            suffix="x"
            min={1}
            step={0.1}
            warning={getWarningForField('vacantPositionImpact.overtimeMultiplier')}
            rangeHint={getRangeHintForField('vacantPositionImpact.overtimeMultiplier')}
          />
        </>
      )}
    </CalculatorSection>
  );
}
