import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Format number with space as thousand separator (e.g. 15000 → "15 000")
 * When showZero is true, 0 renders as "0" instead of "".
 */
function formatWithSeparators(value: number, showZero = false): string {
  if (value === 0) return showZero ? '0' : '';
  return value.toLocaleString('et-EE', { maximumFractionDigits: 10, useGrouping: true }).replace(/\u00A0/g, ' ');
}

/**
 * Strip formatting to get raw numeric string
 */
function stripFormatting(str: string): string {
  return str.replace(/\s/g, '').replace(/,/g, '.');
}

/**
 * Hook for Excel-like input behavior:
 * - On focus, select all content and show raw number for editing
 * - On blur, format with thousand separators
 * - First keystroke replaces entire value
 * - Empty string during editing = 0 for calculations
 * - If user explicitly types 0, it stays visible after blur
 */
export function useExcelInputBehavior(externalValue: number) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const userHasTyped = useRef(false);
  const [displayValue, setDisplayValue] = useState<string>(
    formatWithSeparators(externalValue, false)
  );

  // Sync display value when external value changes (but not during editing)
  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(formatWithSeparators(externalValue, userHasTyped.current));
    }
  }, [externalValue, isEditing]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(true);
    // Show raw number for editing
    const raw = stripFormatting(e.target.value);
    setDisplayValue(raw === '0' && !userHasTyped.current ? '' : raw);
    // Select all after state update
    requestAnimationFrame(() => {
      e.target.select();
    });
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Re-format on blur
    const numeric = stripFormatting(displayValue);
    if (numeric === '') {
      // User cleared the field — treat as untouched empty
      userHasTyped.current = false;
      setDisplayValue('');
    } else {
      const val = parseFloat(numeric);
      if (!isNaN(val)) {
        userHasTyped.current = true;
        setDisplayValue(formatWithSeparators(val, true));
      }
    }
  }, [displayValue]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: number) => void
  ) => {
    const rawValue = e.target.value;
    // Allow digits, dots, commas, minus, and spaces
    const cleaned = rawValue.replace(/[^0-9.,\-\s]/g, '');
    setDisplayValue(cleaned);

    // Parse and propagate to parent - empty string becomes 0
    const stripped = stripFormatting(cleaned);
    const numericValue = stripped === '' ? 0 : parseFloat(stripped);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  }, []);

  return {
    inputRef,
    displayValue,
    handleFocus,
    handleBlur,
    handleChange,
    setDisplayValue,
  };
}
