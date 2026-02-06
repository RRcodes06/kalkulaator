import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

export interface NumberInputWarning {
  message: string;
  severity: 'info' | 'warning' | 'error';
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
  showDefaultIndicator,
  className,
}: NumberInputProps) {
  // Local display state - allows empty string while editing
  const [displayValue, setDisplayValue] = useState<string>(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display value when external value changes (but not during editing)
  useEffect(() => {
    // Only update if the input is not focused
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(value === 0 ? '' : value.toString());
    }
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // If value is 0, select all so typing replaces it
    if (value === 0) {
      e.target.select();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    
    // Parse and propagate to parent - empty string becomes 0
    const numericValue = rawValue === '' ? 0 : parseFloat(rawValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showDefaultIndicator) && (
        <div className="flex items-center justify-between">
          {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
          {showDefaultIndicator && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              vaikeväärtus
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
          type="number"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          min={min}
          max={max}
          step={step}
          className={cn(
            'h-10 text-right pr-3 bg-card',
            prefix && 'pl-8',
            suffix && 'pr-12',
            warning && warning.severity === 'warning' && 'border-warning focus-visible:ring-warning',
            warning && warning.severity === 'info' && 'border-muted-foreground/50'
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
      {hint && !warning && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {warning && (
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
      )}
    </div>
  );
}
