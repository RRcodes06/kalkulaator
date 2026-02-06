import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { DEFAULT_CONFIG, STORAGE_KEYS, DEFAULT_RECOMMENDED_RANGES, RANGE_LABELS } from '@/config/defaults';
import type { CalculatorConfig, RecommendedRanges, RecommendedRange } from '@/types/calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, RotateCcw, Save, Download, Upload, LogOut, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// PASSWORD GATE COMPONENT
// ============================================================================

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAdminAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onSuccess();
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Sisesta parool, et jätkata</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Parool</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">Vale parool</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Sisene
            </Button>
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">
                ← Tagasi kalkulaatorisse
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// CONFIG INPUT COMPONENTS
// ============================================================================

import { useExcelInputBehavior } from '@/hooks/useExcelInputBehavior';

function ConfigNumberInput({
  label,
  value,
  onChange,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  hint?: string;
}) {
  const { inputRef, displayValue, handleFocus, handleChange } = useExcelInputBehavior(value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        ref={inputRef}
        type="number"
        step={step}
        value={displayValue}
        onChange={(e) => handleChange(e, onChange)}
        onFocus={handleFocus}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ConfigTextInput({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}

// ============================================================================
// RANGES TABLE COMPONENT
// ============================================================================

// Small input component for table cells with Excel-like behavior
function RangeTableInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { inputRef, displayValue, handleFocus, handleChange } = useExcelInputBehavior(value);

  return (
    <Input
      ref={inputRef}
      type="number"
      className="h-8 w-20"
      value={displayValue}
      onChange={(e) => handleChange(e, onChange)}
      onFocus={handleFocus}
    />
  );
}

interface RangeRowState {
  min: number;
  max: number;
  error: string | null;
}

function RecommendedRangesTable({
  ranges,
  onUpdate,
  onRestoreDefaults,
}: {
  ranges: RecommendedRanges;
  onUpdate: (key: string, range: RecommendedRange) => void;
  onRestoreDefaults: () => void;
}) {
  // Local state for editing (to enable validation before save)
  const [localRanges, setLocalRanges] = useState<Record<string, RangeRowState>>(() => {
    const initial: Record<string, RangeRowState> = {};
    for (const key of Object.keys(DEFAULT_RECOMMENDED_RANGES)) {
      const range = ranges[key] ?? DEFAULT_RECOMMENDED_RANGES[key];
      initial[key] = { min: range.min, max: range.max, error: null };
    }
    return initial;
  });

  // Validate a single row
  const validateRow = (min: number, max: number): string | null => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return 'Min ja max peavad olema numbrid';
    }
    if (max < min) {
      return 'Max peab olema >= min';
    }
    if (min < 0 || max < 0) {
      return 'Väärtused peavad olema >= 0';
    }
    return null;
  };

  // Check if any row has errors
  const hasErrors = useMemo(() => {
    return Object.values(localRanges).some(row => row.error !== null);
  }, [localRanges]);

  // Handle min/max change
  const handleChange = (key: string, field: 'min' | 'max', value: number) => {
    setLocalRanges(prev => {
      const newRow = { ...prev[key], [field]: value };
      newRow.error = validateRow(newRow.min, newRow.max);
      return { ...prev, [key]: newRow };
    });
  };

  // Save all changes
  const handleSave = () => {
    if (hasErrors) {
      toast.error('Paranda vead enne salvestamist');
      return;
    }
    
    for (const key of Object.keys(localRanges)) {
      const row = localRanges[key];
      const originalRange = ranges[key] ?? DEFAULT_RECOMMENDED_RANGES[key];
      if (row.min !== originalRange.min || row.max !== originalRange.max) {
        onUpdate(key, { ...originalRange, min: row.min, max: row.max });
      }
    }
    toast.success('Vahemikud salvestatud');
  };

  // Restore defaults
  const handleRestoreDefaults = () => {
    if (window.confirm('Kas oled kindel, et soovid taastada soovituslike vahemike vaikeväärtused?')) {
      const resetRanges: Record<string, RangeRowState> = {};
      for (const key of Object.keys(DEFAULT_RECOMMENDED_RANGES)) {
        const range = DEFAULT_RECOMMENDED_RANGES[key];
        resetRanges[key] = { min: range.min, max: range.max, error: null };
      }
      setLocalRanges(resetRanges);
      onRestoreDefaults();
      toast.success('Vahemikud lähtestatud');
    }
  };

  // Group ranges by section
  const sections = useMemo(() => {
    const groups: Record<string, string[]> = {
      'Strateegia & ettevalmistus': [],
      'Kuulutused & bränding': [],
      'Kandidaatide haldus': [],
      'Intervjuud': [],
      'Taustakontroll': [],
      'Kaudsed kulud': [],
      'Sisseelamine': [],
      'Vakants': [],
    };

    for (const key of Object.keys(DEFAULT_RECOMMENDED_RANGES)) {
      if (key.startsWith('strategyPrep')) groups['Strateegia & ettevalmistus'].push(key);
      else if (key.startsWith('adsBranding')) groups['Kuulutused & bränding'].push(key);
      else if (key.startsWith('candidateMgmt')) groups['Kandidaatide haldus'].push(key);
      else if (key.startsWith('interviews')) groups['Intervjuud'].push(key);
      else if (key.startsWith('backgroundOffer')) groups['Taustakontroll'].push(key);
      else if (key.startsWith('indirectCosts')) groups['Kaudsed kulud'].push(key);
      else if (key.startsWith('onboarding')) groups['Sisseelamine'].push(key);
      else if (key.startsWith('vacancy')) groups['Vakants'].push(key);
    }

    return groups;
  }, []);

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={hasErrors} className="gap-2">
          <Save className="w-4 h-4" />
          Salvesta vahemikud
        </Button>
        <Button variant="outline" onClick={handleRestoreDefaults} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Taasta vaikeväärtused
        </Button>
      </div>

      {hasErrors && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Paranda vead enne salvestamist</span>
        </div>
      )}

      {/* Compact table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Väli</TableHead>
              <TableHead className="w-[100px]">Min</TableHead>
              <TableHead className="w-[100px]">Max</TableHead>
              <TableHead className="w-[60px]">Ühik</TableHead>
              <TableHead className="w-[200px]">Viga</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(sections).map(([sectionName, keys]) => (
              keys.length > 0 && (
                <>
                  <TableRow key={sectionName} className="bg-muted/30">
                    <TableCell colSpan={5} className="font-medium text-sm py-2">
                      {sectionName}
                    </TableCell>
                  </TableRow>
                  {keys.map(key => {
                    const row = localRanges[key];
                    const range = DEFAULT_RECOMMENDED_RANGES[key];
                    const label = RANGE_LABELS[key] || key;
                    
                    return (
                      <TableRow key={key} className={row?.error ? 'bg-destructive/5' : ''}>
                        <TableCell className="py-1.5">
                          <span className="text-sm">{label}</span>
                          <span className="text-xs text-muted-foreground ml-2 hidden lg:inline">
                            ({key})
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <RangeTableInput
                            value={row?.min ?? range.min}
                            onChange={(v) => handleChange(key, 'min', v)}
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <RangeTableInput
                            value={row?.max ?? range.max}
                            onChange={(v) => handleChange(key, 'max', v)}
                          />
                        </TableCell>
                        <TableCell className="py-1.5 text-muted-foreground text-sm">
                          {range.unit}
                        </TableCell>
                        <TableCell className="py-1.5">
                          {row?.error && (
                            <span className="text-xs text-destructive">{row.error}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              )
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        ℹ Väljad nagu "Muud teenused" hinnad, taustakontrolli kulud jt ei oma soovituslikke vahemikke, 
        sest need sõltuvad teenusepakkujast.
      </p>
    </div>
  );
}

// ============================================================================
// ADMIN PANEL COMPONENT
// ============================================================================

function AdminPanel() {
  const { config, updateConfig, resetConfig } = useAppStore();
  const { logout } = useAdminAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    // Config is auto-saved via the store, but we show confirmation
    toast.success('Seaded salvestatud');
  };

  const handleResetConfig = () => {
    if (window.confirm('Kas oled kindel, et soovid taastada kõik vaikeväärtused?')) {
      resetConfig();
      toast.success('Seaded lähtestatud vaikeväärtustele');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculator-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Konfiguratsioon eksporditud');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        
        // Validate and merge with defaults for safety
        const validatedConfig: CalculatorConfig = {
          ...DEFAULT_CONFIG,
          ...imported,
          // Ensure recommendedRanges is properly merged
          recommendedRanges: {
            ...DEFAULT_RECOMMENDED_RANGES,
            ...(imported.recommendedRanges || {}),
          },
        };

        // Validate numeric fields
        const numericKeys: (keyof CalculatorConfig)[] = [
          'HOURS_PER_MONTH', 'EST_AVG_GROSS_WAGE', 'SOCIAL_TAX_RATE', 'EMPLOYER_UI_RATE',
          'EMPLOYEE_UI_RATE', 'INCOME_TAX_RATE', 'PILLAR_II_RATE', 'TAX_FREE_ALLOWANCE',
          'BAD_HIRE_RISK_RATE', 'BAD_HIRE_PAY_MONTHS',
        ];

        for (const key of numericKeys) {
          if (typeof validatedConfig[key] !== 'number' || isNaN(validatedConfig[key] as number)) {
            validatedConfig[key] = DEFAULT_CONFIG[key] as never;
          }
        }

        // Validate string fields
        const stringKeys: (keyof CalculatorConfig)[] = [
          'disclaimerText', 'riskExplanationText', 'indirectExplanationText',
          'finalQuestionText', 'ctaPlaceholderText', 'resetConfirmText',
          'defaultUsedText', 'privacyNotice',
        ];

        for (const key of stringKeys) {
          if (typeof validatedConfig[key] !== 'string') {
            validatedConfig[key] = DEFAULT_CONFIG[key] as never;
          }
        }

        // Apply all updates
        Object.entries(validatedConfig).forEach(([key, value]) => {
          updateConfig(key as keyof CalculatorConfig, value as never);
        });

        toast.success('Konfiguratsioon imporditud');
      } catch {
        toast.error('Vigane JSON fail');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Handle range updates
  const handleRangeUpdate = (key: string, range: RecommendedRange) => {
    const newRanges = {
      ...config.recommendedRanges,
      [key]: range,
    };
    updateConfig('recommendedRanges', newRanges);
  };

  // Handle restore defaults for ranges only
  const handleRestoreRangeDefaults = () => {
    updateConfig('recommendedRanges', DEFAULT_RECOMMENDED_RANGES);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Tagasi
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin seaded</h1>
                <p className="text-sm text-muted-foreground">Kalkulaatori vaikeväärtused ja tekstid</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logi välja
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvesta
          </Button>
          <Button variant="outline" onClick={handleResetConfig} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Taasta kõik vaikeväärtused
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Ekspordi JSON
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="w-4 h-4" />
            Impordi JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Base Constants */}
        <Card>
          <CardHeader>
            <CardTitle>Põhikonstantid</CardTitle>
            <CardDescription>Arvutuste aluseks olevad väärtused</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConfigNumberInput
              label="Eesti keskmine brutopalk (€)"
              value={config.EST_AVG_GROSS_WAGE}
              onChange={(v) => updateConfig('EST_AVG_GROSS_WAGE', v)}
              hint="Kasutatakse vaikeväärtusena, kui palk pole määratud"
            />
            <ConfigNumberInput
              label="Töötunde kuus"
              value={config.HOURS_PER_MONTH}
              onChange={(v) => updateConfig('HOURS_PER_MONTH', v)}
              hint="Täiskoormusega töötatud tunnid kuus"
            />
          </CardContent>
        </Card>

        {/* Employer Tax Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Tööandja maksumäärad</CardTitle>
            <CardDescription>Eesti kehtivad tööandja maksumäärad (osakaal)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConfigNumberInput
              label="Sotsiaalmaks"
              value={config.SOCIAL_TAX_RATE}
              onChange={(v) => updateConfig('SOCIAL_TAX_RATE', v)}
              step={0.001}
              hint="Praegu 33% (0.33)"
            />
            <ConfigNumberInput
              label="Tööandja töötuskindlustus"
              value={config.EMPLOYER_UI_RATE}
              onChange={(v) => updateConfig('EMPLOYER_UI_RATE', v)}
              step={0.001}
              hint="Praegu 0.8% (0.008)"
            />
          </CardContent>
        </Card>

        {/* Employee Tax Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Töötaja maksumäärad</CardTitle>
            <CardDescription>Tulevaste neto/bruto arvutuste jaoks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConfigNumberInput
              label="Töötaja töötuskindlustus"
              value={config.EMPLOYEE_UI_RATE}
              onChange={(v) => updateConfig('EMPLOYEE_UI_RATE', v)}
              step={0.001}
              hint="Praegu 1.6% (0.016)"
            />
            <ConfigNumberInput
              label="Tulumaks"
              value={config.INCOME_TAX_RATE}
              onChange={(v) => updateConfig('INCOME_TAX_RATE', v)}
              step={0.01}
              hint="Praegu 20% (0.20)"
            />
            <ConfigNumberInput
              label="II sammas"
              value={config.PILLAR_II_RATE}
              onChange={(v) => updateConfig('PILLAR_II_RATE', v)}
              step={0.001}
              hint="Praegu 2% (0.02)"
            />
            <ConfigNumberInput
              label="Maksuvaba tulu (€/kuu)"
              value={config.TAX_FREE_ALLOWANCE}
              onChange={(v) => updateConfig('TAX_FREE_ALLOWANCE', v)}
              hint="Kehtiv maksuvaba miinimum"
            />
          </CardContent>
        </Card>

        {/* Risk Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Riskiparameetrid</CardTitle>
            <CardDescription>Halva värbamisotsuse riski hindamiseks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConfigNumberInput
              label="Halva värbamise risk (osakaal)"
              value={config.BAD_HIRE_RISK_RATE}
              onChange={(v) => updateConfig('BAD_HIRE_RISK_RATE', v)}
              step={0.01}
              hint="Tõenäosus, et värbamine ebaõnnestub (nt 0.15 = 15%)"
            />
            <ConfigNumberInput
              label="Halva värbamise kulu (kuudes)"
              value={config.BAD_HIRE_PAY_MONTHS}
              onChange={(v) => updateConfig('BAD_HIRE_PAY_MONTHS', v)}
              hint="Mitu kuupalka läheb halva värbamise korral kaotsi"
            />
          </CardContent>
        </Card>

        {/* Recommended Ranges - New Compact Table */}
        <Card>
          <CardHeader>
            <CardTitle>Soovituslikud vahemikud</CardTitle>
            <CardDescription>
              Hoiatuste kuvamiseks kalkulaatoris. Mõlemad Min ja Max on muudetavad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecommendedRangesTable
              ranges={config.recommendedRanges || DEFAULT_RECOMMENDED_RANGES}
              onUpdate={handleRangeUpdate}
              onRestoreDefaults={handleRestoreRangeDefaults}
            />
          </CardContent>
        </Card>

        {/* Text Snippets */}
        <Card>
          <CardHeader>
            <CardTitle>Tekstid</CardTitle>
            <CardDescription>Kalkulaatoris kuvatavad tekstid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfigTextInput
              label="Vastutusest loobumine"
              value={config.disclaimerText}
              onChange={(v) => updateConfig('disclaimerText', v)}
            />
            <ConfigTextInput
              label="Riski selgitus"
              value={config.riskExplanationText}
              onChange={(v) => updateConfig('riskExplanationText', v)}
            />
            <ConfigTextInput
              label="Kaudsete kulude selgitus"
              value={config.indirectExplanationText}
              onChange={(v) => updateConfig('indirectExplanationText', v)}
            />
            <ConfigTextInput
              label="Lõppküsimus"
              value={config.finalQuestionText}
              onChange={(v) => updateConfig('finalQuestionText', v)}
              rows={2}
            />
            <ConfigTextInput
              label="CTA tekst"
              value={config.ctaPlaceholderText}
              onChange={(v) => updateConfig('ctaPlaceholderText', v)}
              rows={2}
            />
            <ConfigTextInput
              label="Lähtestamise kinnitustekst"
              value={config.resetConfirmText}
              onChange={(v) => updateConfig('resetConfirmText', v)}
              rows={2}
            />
            <ConfigTextInput
              label="Vaikeväärtuse märge"
              value={config.defaultUsedText}
              onChange={(v) => updateConfig('defaultUsedText', v)}
              rows={1}
            />
            <ConfigTextInput
              label="Privaatsusteade"
              value={config.privacyNotice}
              onChange={(v) => updateConfig('privacyNotice', v)}
              rows={2}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Muudatused salvestatakse automaatselt brauseri mällu
          </p>
          <p className="text-xs text-muted-foreground">
            Salvestusvõti: {STORAGE_KEYS.CONFIG}
          </p>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// MAIN ADMIN PAGE
// ============================================================================

const Admin = () => {
  const { isAuthenticated } = useAdminAuthStore();

  if (!isAuthenticated) {
    return <PasswordGate onSuccess={() => {}} />;
  }

  return <AdminPanel />;
};

export default Admin;
