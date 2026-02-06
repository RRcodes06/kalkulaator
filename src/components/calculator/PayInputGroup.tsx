import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumberInput } from './NumberInput';
import { Label } from '@/components/ui/label';
import type { PayType, PayInput, NormalizedPay } from '@/types/calculator';

interface PayInputGroupProps {
  label: string;
  value: PayInput;
  onChange: (value: PayInput) => void;
  normalizedPay?: NormalizedPay;
  showCostBreakdown?: boolean;
  isDefaultUsed?: boolean;
  compact?: boolean;
}

export function PayInputGroup({
  label,
  value,
  onChange,
  normalizedPay,
  showCostBreakdown = false,
  isDefaultUsed = false,
  compact = false,
}: PayInputGroupProps) {
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
      hoursPerMonth: payType === 'hourly' ? (value.hoursPerMonth ?? 168) : undefined,
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
      <div className="space-y-3">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={value.payType} onValueChange={handlePayTypeChange}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Vaikimisi</SelectItem>
              <SelectItem value="monthly">Kuupalk</SelectItem>
              <SelectItem value="hourly">Tunnipalk</SelectItem>
            </SelectContent>
          </Select>

          {value.payType !== 'unset' && (
            <NumberInput
              value={value.payAmount}
              onChange={handlePayAmountChange}
              suffix={value.payType === 'monthly' ? '€/kuu' : '€/h'}
              min={0}
              step={value.payType === 'monthly' ? 100 : 1}
            />
          )}
        </div>

        {value.payType === 'hourly' && (
          <NumberInput
            label="Töötunde kuus"
            value={value.hoursPerMonth ?? 168}
            onChange={handleHoursChange}
            suffix="h/kuu"
            min={1}
          />
        )}

        {isDefaultUsed && (
          <p className="text-xs text-warning">⚠ Kasutatakse vaikimisi väärtust</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{label} - Palga tüüp</Label>
        <Select value={value.payType} onValueChange={handlePayTypeChange}>
          <SelectTrigger className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unset">Määramata (kasuta keskmist)</SelectItem>
            <SelectItem value="monthly">Kuupalk</SelectItem>
            <SelectItem value="hourly">Tunnipalk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.payType !== 'unset' && (
        <NumberInput
          label={value.payType === 'monthly' ? 'Brutopalk' : 'Tunnipalk'}
          value={value.payAmount}
          onChange={handlePayAmountChange}
          suffix={value.payType === 'monthly' ? '€/kuu' : '€/h'}
          min={0}
          step={value.payType === 'monthly' ? 100 : 1}
        />
      )}

      {value.payType === 'hourly' && (
        <NumberInput
          label="Töötunde kuus"
          value={value.hoursPerMonth ?? 168}
          onChange={handleHoursChange}
          suffix="h/kuu"
          min={1}
        />
      )}

      {showCostBreakdown && normalizedPay && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Tööandja kulud</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Brutopalk</span>
              <span className="font-medium">{formatCurrency(normalizedPay.monthlyGross)} €</span>
            </div>
            <div className="flex justify-between">
              <span>+ maksud (33.8%)</span>
              <span className="font-medium">
                {formatCurrency(normalizedPay.employerMonthlyCost - normalizedPay.monthlyGross)} €
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-border">
              <span>Kokku tööjõukulu</span>
              <span>{formatCurrency(normalizedPay.employerMonthlyCost)} €/kuu</span>
            </div>
          </div>
          {isDefaultUsed && (
            <p className="text-xs text-warning mt-2">⚠ Kasutatakse Eesti keskmist palka</p>
          )}
        </div>
      )}
    </div>
  );
}
