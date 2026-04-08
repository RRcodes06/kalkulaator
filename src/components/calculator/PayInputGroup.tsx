import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumberInput } from './NumberInput';
import { Label } from '@/components/ui/label';
import type { PayType, PayInput, NormalizedPay } from '@/types/calculator';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/store/appStore';

interface PayInputGroupProps {
  label: string;
  value: PayInput;
  onChange: (value: PayInput) => void;
  normalizedPay?: NormalizedPay;
  showCostBreakdown?: boolean;
  isDefaultUsed?: boolean;
  compact?: boolean;
  defaultSalaryHint?: string;
}

export function PayInputGroup({
  label,
  value,
  onChange,
  normalizedPay,
  showCostBreakdown = false,
  isDefaultUsed = false,
  compact = false,
  defaultSalaryHint,
}: PayInputGroupProps) {
  const { t } = useLanguage();
  const defaultHours = useAppStore((s) => s.config.HOURS_PER_MONTH);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('et-EE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const handlePayTypeChange = (payType: PayType) => {
    onChange({
      ...value,
      payType,
      hoursPerMonth: payType === 'hourly' ? (value.hoursPerMonth ?? defaultHours) : undefined,
    });
  };

  const handlePayAmountChange = (amount: number) => {
    onChange({ ...value, payAmount: amount });
  };

  const handleHoursChange = (hours: number) => {
    onChange({ ...value, hoursPerMonth: hours });
  };

  if (compact) {
    return (
      <div className="min-w-0 space-y-4">
        <Label className="text-sm font-medium">{label}</Label>

        <div className="min-w-0 space-y-3">
          <Select value={value.payType} onValueChange={handlePayTypeChange}>
            <SelectTrigger className="h-11 w-full min-w-0 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">{t('payTypeUnset')}</SelectItem>
              <SelectItem value="monthly">{t('payTypeMonthly')}</SelectItem>
              <SelectItem value="hourly">{t('payTypeHourly')}</SelectItem>
            </SelectContent>
          </Select>

          {value.payType !== 'unset' && (
            <NumberInput
              value={value.payAmount}
              onChange={handlePayAmountChange}
              suffix={value.payType === 'monthly' ? t('monthlySuffix') : t('hourlySuffix')}
              min={0}
              step={value.payType === 'monthly' ? 100 : 1}
              className="min-w-0"
            />
          )}
        </div>

        {isDefaultUsed && defaultSalaryHint && (
          <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-4 py-3">
            <span className="shrink-0 text-warning">⚠</span>
            <p className="text-sm leading-relaxed text-warning">{defaultSalaryHint}</p>
          </div>
        )}

        {value.payType === 'hourly' && (
          <NumberInput
            label={t('hoursPerMonth')}
            value={value.hoursPerMonth ?? defaultHours}
            onChange={handleHoursChange}
            suffix={t('hoursPerMonthSuffix')}
            min={1}
            className="min-w-0"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label} - {t('payTypeLabel')}</Label>
        <Select value={value.payType} onValueChange={handlePayTypeChange}>
          <SelectTrigger className="bg-card h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unset">{t('payTypeUnsetFull')}</SelectItem>
            <SelectItem value="monthly">{t('payTypeMonthly')}</SelectItem>
            <SelectItem value="hourly">{t('payTypeHourly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.payType !== 'unset' && (
        <NumberInput
          label={value.payType === 'monthly' ? t('grossSalary') : t('hourlyWage')}
          value={value.payAmount}
          onChange={handlePayAmountChange}
          suffix={value.payType === 'monthly' ? t('monthlySuffix') : t('hourlySuffix')}
          min={0}
          step={value.payType === 'monthly' ? 100 : 1}
        />
      )}

      {value.payType === 'hourly' && (
        <NumberInput
          label={t('hoursPerMonth')}
          value={value.hoursPerMonth ?? defaultHours}
          onChange={handleHoursChange}
          suffix={t('hoursPerMonthSuffix')}
          min={1}
        />
      )}

      {showCostBreakdown && normalizedPay && (
        <div className="p-5 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">{t('employerCost')}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t('grossSalary')}</span>
              <span className="font-medium">{formatCurrency(normalizedPay.monthlyGross)} €</span>
            </div>
            <div className="flex justify-between">
              <span>{t('taxes')}</span>
              <span className="font-medium">
                {formatCurrency(normalizedPay.employerMonthlyCost - normalizedPay.monthlyGross)} €
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-border">
              <span>{t('totalLabourCost')}</span>
              <span>{formatCurrency(normalizedPay.employerMonthlyCost)} {t('monthlySuffix')}</span>
            </div>
          </div>
          {isDefaultUsed && (
            <p className="text-sm text-warning mt-3">{t('usesEstonianAverage')}</p>
          )}
        </div>
      )}
    </div>
  );
}
