import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { config, updateConfig, resetConfig } = useAppStore();

  const handleResetConfig = () => {
    resetConfig();
    toast.success('Seaded lähtestatud vaikeväärtustele');
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
            <Button variant="outline" size="sm" onClick={handleResetConfig} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Lähtesta vaikeväärtused
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Constants */}
        <Card>
          <CardHeader>
            <CardTitle>Põhikonstantid</CardTitle>
            <CardDescription>Arvutuste aluseks olevad väärtused</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Töötunde kuus</Label>
              <Input
                type="number"
                value={config.HOURS_PER_MONTH}
                onChange={(e) => updateConfig('HOURS_PER_MONTH', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Eesti keskmine brutopalk (€)</Label>
              <Input
                type="number"
                value={config.EST_AVG_GROSS_WAGE}
                onChange={(e) => updateConfig('EST_AVG_GROSS_WAGE', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Maksumäärad</CardTitle>
            <CardDescription>Eesti kehtivad maksumäärad (osakaal)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sotsiaalmaks</Label>
              <Input
                type="number"
                step="0.001"
                value={config.SOCIAL_TAX_RATE}
                onChange={(e) => updateConfig('SOCIAL_TAX_RATE', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tööandja töötuskindlustus</Label>
              <Input
                type="number"
                step="0.001"
                value={config.EMPLOYER_UI_RATE}
                onChange={(e) => updateConfig('EMPLOYER_UI_RATE', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Töötaja töötuskindlustus</Label>
              <Input
                type="number"
                step="0.001"
                value={config.EMPLOYEE_UI_RATE}
                onChange={(e) => updateConfig('EMPLOYEE_UI_RATE', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tulumaks</Label>
              <Input
                type="number"
                step="0.01"
                value={config.INCOME_TAX_RATE}
                onChange={(e) => updateConfig('INCOME_TAX_RATE', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>II sammas</Label>
              <Input
                type="number"
                step="0.01"
                value={config.PILLAR_II_RATE}
                onChange={(e) => updateConfig('PILLAR_II_RATE', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Maksuvaba tulu (€/kuu)</Label>
              <Input
                type="number"
                value={config.TAX_FREE_ALLOWANCE}
                onChange={(e) => updateConfig('TAX_FREE_ALLOWANCE', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Riskiparameetrid</CardTitle>
            <CardDescription>Halva värbamisotsuse riski hindamiseks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Halva värbamise risk (osakaal)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.BAD_HIRE_RISK}
                onChange={(e) => updateConfig('BAD_HIRE_RISK', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Tõenäosus, et värbamine ebaõnnestub (nt 0.15 = 15%)</p>
            </div>
            <div className="space-y-2">
              <Label>Halva värbamise kulu (kuudes)</Label>
              <Input
                type="number"
                value={config.BAD_HIRE_MONTHS}
                onChange={(e) => updateConfig('BAD_HIRE_MONTHS', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Mitu kuupalka läheb halva värbamise korral kaotsi</p>
            </div>
          </CardContent>
        </Card>

        {/* Text Snippets */}
        <Card>
          <CardHeader>
            <CardTitle>Tekstid</CardTitle>
            <CardDescription>Kalkulaatoris kuvatavad tekstid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vastutusest loobumine</Label>
              <Textarea
                value={config.disclaimerText}
                onChange={(e) => updateConfig('disclaimerText', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Riski selgitus</Label>
              <Textarea
                value={config.riskExplanationText}
                onChange={(e) => updateConfig('riskExplanationText', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Privaatsusteade</Label>
              <Textarea
                value={config.privacyNotice}
                onChange={(e) => updateConfig('privacyNotice', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <p className="text-sm text-muted-foreground">
            Muudatused salvestatakse automaatselt brauseri mällu
          </p>
        </div>
      </main>
    </div>
  );
};

export default Admin;
