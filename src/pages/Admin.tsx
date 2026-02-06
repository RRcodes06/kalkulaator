import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { DEFAULT_CONFIG, STORAGE_KEYS } from '@/config/defaults';
import type { CalculatorConfig } from '@/types/calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, RotateCcw, Save, Download, Upload, LogOut, Lock } from 'lucide-react';
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
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
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
    if (window.confirm('Kas oled kindel, et soovid taastada vaikeväärtused?')) {
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
        };

        // Validate numeric fields
        const numericKeys: (keyof CalculatorConfig)[] = [
          'HOURS_PER_MONTH', 'EST_AVG_GROSS_WAGE', 'SOCIAL_TAX_RATE', 'EMPLOYER_UI_RATE',
          'EMPLOYEE_UI_RATE', 'INCOME_TAX_RATE', 'PILLAR_II_RATE', 'TAX_FREE_ALLOWANCE',
          'BAD_HIRE_RISK_RATE', 'BAD_HIRE_PAY_MONTHS',
          'RECOMMENDED_ONBOARDING_MONTHS_MIN', 'RECOMMENDED_ONBOARDING_MONTHS_MAX',
          'RECOMMENDED_PRODUCTIVITY_PCT_MIN', 'RECOMMENDED_PRODUCTIVITY_PCT_MAX',
          'RECOMMENDED_VACANCY_DAYS_MAX', 'RECOMMENDED_HR_HOURS_MAX',
          'RECOMMENDED_MANAGER_HOURS_MAX', 'RECOMMENDED_TEAM_HOURS_MAX',
          'RECOMMENDED_INTERVIEW_HOURS_MAX',
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-6 py-4">
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
      <main className="container max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvesta
          </Button>
          <Button variant="outline" onClick={handleResetConfig} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Taasta vaikeväärtused
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

        {/* Recommended Ranges */}
        <Card>
          <CardHeader>
            <CardTitle>Soovituslikud vahemikud</CardTitle>
            <CardDescription>Hoiatuste kuvamiseks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConfigNumberInput
              label="Min sisseelamisperiood (kuud)"
              value={config.RECOMMENDED_ONBOARDING_MONTHS_MIN}
              onChange={(v) => updateConfig('RECOMMENDED_ONBOARDING_MONTHS_MIN', v)}
            />
            <ConfigNumberInput
              label="Max sisseelamisperiood (kuud)"
              value={config.RECOMMENDED_ONBOARDING_MONTHS_MAX}
              onChange={(v) => updateConfig('RECOMMENDED_ONBOARDING_MONTHS_MAX', v)}
            />
            <ConfigNumberInput
              label="Min tootlikkus sisseelamisel (%)"
              value={config.RECOMMENDED_PRODUCTIVITY_PCT_MIN}
              onChange={(v) => updateConfig('RECOMMENDED_PRODUCTIVITY_PCT_MIN', v)}
            />
            <ConfigNumberInput
              label="Max tootlikkus sisseelamisel (%)"
              value={config.RECOMMENDED_PRODUCTIVITY_PCT_MAX}
              onChange={(v) => updateConfig('RECOMMENDED_PRODUCTIVITY_PCT_MAX', v)}
            />
            <ConfigNumberInput
              label="Max vakantsi päevi"
              value={config.RECOMMENDED_VACANCY_DAYS_MAX}
              onChange={(v) => updateConfig('RECOMMENDED_VACANCY_DAYS_MAX', v)}
            />
            <ConfigNumberInput
              label="Max HR tunnid kokku"
              value={config.RECOMMENDED_HR_HOURS_MAX}
              onChange={(v) => updateConfig('RECOMMENDED_HR_HOURS_MAX', v)}
              hint="Hoiatus, kui HR-i kogutunnid ületavad"
            />
            <ConfigNumberInput
              label="Max juhi tunnid kokku"
              value={config.RECOMMENDED_MANAGER_HOURS_MAX}
              onChange={(v) => updateConfig('RECOMMENDED_MANAGER_HOURS_MAX', v)}
              hint="Hoiatus, kui juhi kogutunnid ületavad"
            />
            <ConfigNumberInput
              label="Max tiimi tunnid kokku"
              value={config.RECOMMENDED_TEAM_HOURS_MAX}
              onChange={(v) => updateConfig('RECOMMENDED_TEAM_HOURS_MAX', v)}
              hint="Hoiatus, kui tiimi kogutunnid ületavad"
            />
            <ConfigNumberInput
              label="Max intervjuude tunnid"
              value={config.RECOMMENDED_INTERVIEW_HOURS_MAX}
              onChange={(v) => updateConfig('RECOMMENDED_INTERVIEW_HOURS_MAX', v)}
              hint="Hoiatus, kui intervjuude tunnid ületavad"
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
