import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * Euro input that distinguishes between empty (null) and explicit zero.
 * - null  → field is unfilled, input shows blank
 * - 0     → field is explicitly zero, input shows "0"
 * - n>0   → formatted with thousand separators
 * Empty input string emits null. Any parsed number (including 0) emits that number.
 */

function format(value: number): string {
  return value.toLocaleString('et-EE', { maximumFractionDigits: 10, useGrouping: true }).replace(/\u00A0/g, ' ');
}

function strip(s: string): string {
  return s.replace(/\s/g, '').replace(/,/g, '.');
}

export interface NullableEuroInputWarning {
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface NullableEuroInputProps {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  hint?: string;
  suffix?: string;
  className?: string;
  warning?: NullableEuroInputWarning;
}

export function NullableEuroInput({
  label,
  value,
  onChange,
  hint,
  suffix = '€',
  className,
  warning,
}: NullableEuroInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [display, setDisplay] = useState<string>(value === null ? '' : format(value));

  useEffect(() => {
    if (!isEditing) {
      setDisplay(value === null ? '' : format(value));
    }
  }, [value, isEditing]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(true);
    const raw = strip(e.target.value);
    setDisplay(raw);
    requestAnimationFrame(() => e.target.select());
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numeric = strip(display);
    if (numeric === '') {
      setDisplay('');
      onChange(null);
    } else {
      const v = parseFloat(numeric);
      if (!isNaN(v)) {
        setDisplay(format(v));
        onChange(v);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9.,\-\s]/g, '');
    setDisplay(cleaned);
    const stripped = strip(cleaned);
    if (stripped === '') {
      onChange(null);
    } else {
      const v = parseFloat(stripped);
      if (!isNaN(v)) onChange(v);
    }
  };

  return (
    <div className={cn('min-w-0 flex-1 space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <div className="relative min-w-0">
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'h-11 w-full min-w-0 overflow-x-hidden bg-card pr-3 text-right text-base [text-overflow:clip] [appearance:textfield]',
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
            warning.severity === 'warning' && 'text-warning-text',
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
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}