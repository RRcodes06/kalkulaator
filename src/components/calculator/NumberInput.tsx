import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
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
  showDefaultIndicator,
  className,
}: NumberInputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {showDefaultIndicator && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            vaikeväärtus
          </span>
        )}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className={cn(
            'h-10 text-right pr-3 bg-card',
            prefix && 'pl-8',
            suffix && 'pr-12'
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
