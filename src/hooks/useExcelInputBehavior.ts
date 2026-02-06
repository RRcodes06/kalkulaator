import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Hook for Excel-like input behavior:
 * - On focus, select all content
 * - First keystroke replaces entire value
 * - Empty string during editing = 0 for calculations
 */
export function useExcelInputBehavior(externalValue: number) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState<string>(
    externalValue === 0 ? '' : externalValue.toString()
  );

  // Sync display value when external value changes (but not during editing)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(externalValue === 0 ? '' : externalValue.toString());
    }
  }, [externalValue]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Always select all on focus - Excel-like behavior
    // First keystroke will replace the entire value
    e.target.select();
  }, []);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: number) => void
  ) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    
    // Parse and propagate to parent - empty string becomes 0
    const numericValue = rawValue === '' ? 0 : parseFloat(rawValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  }, []);

  return {
    inputRef,
    displayValue,
    handleFocus,
    handleChange,
    setDisplayValue,
  };
}
