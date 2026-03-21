import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';
import { useExcelInputBehavior } from '@/hooks/useExcelInputBehavior';
import { useLanguage } from '@/i18n/LanguageContext';

export interface NumberInputWarning {
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface NumberInputRangeHint {
  min: number;
  max: number;
  unit: string;
}

export interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  warning?: NumberInputWarning;
  rangeHint?: NumberInputRangeHint;
  showDefaultIndicator?: boolean;
  className?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  suffix,
  prefix,
  min = 0,
  max,
  step = 1,
  hint,
  warning,
  rangeHint,
  showDefaultIndicator,
  className,
}: NumberInputProps) {
  const { inputRef, displayValue, handleFocus, handleBlur, handleChange } = useExcelInputBehavior(value);
  const { t } = useLanguage();

  const translateUnit = (unit: string) => {
    if (unit === 'months') return t('unitMonths');
    if (unit === 'days') return t('unitDays');
    if (unit === 'h') return t('unitHours');
    return unit;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showDefaultIndicator) && (
        <div className="flex items-center justify-between">
          {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
          {showDefaultIndicator && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {t('defaultValue')}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={(e) => handleChange(e, onChange)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'h-11 text-base text-right pr-4 bg-card [appearance:textfield]',
            prefix && 'pl-10',
            suffix && 'pr-14',
            warning && warning.severity === 'warning' && 'border-warning focus-visible:ring-warning',
            warning && warning.severity === 'info' && 'border-muted-foreground/50'
          )}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
      {warning ? (
        <div className={cn(
          "flex items-start gap-1.5 text-xs",
          warning.severity === 'warning' && "text-warning",
          warning.severity === 'info' && "text-muted-foreground",
          warning.severity === 'error' && "text-destructive"
        )}>
          {warning.severity === 'warning' ? (
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          ) : (
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          )}
          <span>{warning.message}</span>
        </div>
      ) : rangeHint ? (
        <p className="text-xs text-muted-foreground">
          {t('typicalRange', { min: rangeHint.min, max: rangeHint.max, unit: translateUnit(rangeHint.unit) })}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
