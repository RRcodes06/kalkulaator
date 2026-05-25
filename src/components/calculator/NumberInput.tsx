import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';
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
  tooltip?: string;
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
  tooltip,
  className,
}: NumberInputProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { inputRef, displayValue, handleFocus, handleBlur, handleChange } = useExcelInputBehavior(value);
  const { t } = useLanguage();

  const translateUnit = (unit: string) => {
    if (unit === 'months') return t('unitMonths');
    if (unit === 'days') return t('unitDays');
    if (unit === 'h') return t('unitHours');
    return unit;
  };

  return (
    <div className={cn('min-w-0 flex-1 space-y-2', className)}>
      {(label || showDefaultIndicator) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium text-foreground">{label}</Label>
              {tooltip && (
                <button
                  type="button"
                  onClick={() => setShowTooltip(!showTooltip)}
                  className={cn(
                    'rounded-full p-0.5 transition-colors',
                    showTooltip
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  aria-label={t('showFieldInfo')}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          {showDefaultIndicator && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {t('defaultValue')}
            </span>
          )}
        </div>
      )}
      {showTooltip && tooltip && (
        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground animate-fade-in">
          {tooltip}
        </div>
      )}
      <div className="relative min-w-0">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-muted-foreground">
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
            'h-11 w-full min-w-0 overflow-x-hidden bg-card pr-3 text-right text-base [text-overflow:clip] [appearance:textfield]',
            prefix && 'pl-10',
            suffix && 'pr-16 sm:pr-20',
            warning && warning.severity === 'warning' && 'border-warning focus-visible:ring-warning',
            warning && warning.severity === 'info' && 'border-muted-foreground/50'
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {warning ? (
        <div
          className={cn(
            'flex items-start gap-1.5 text-xs',
            warning.severity === 'warning' && 'text-warning',
            warning.severity === 'info' && 'text-muted-foreground',
            warning.severity === 'error' && 'text-destructive'
          )}
        >
          {warning.severity === 'warning' ? (
            <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
          ) : (
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
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
