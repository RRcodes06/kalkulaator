import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { NumberInput } from './NumberInput';
import { PayInputGroup } from './PayInputGroup';
import { RolePaySection } from './RolePaySection';
import { OtherServicesSection } from './OtherServicesSection';
import { RiskSummarySection } from './RiskSummarySection';
import { AccordionControllerProvider } from '@/hooks/useAccordionController';
import { 
  Briefcase, 
  Users, 
  Megaphone, 
  GraduationCap, 
  TrendingDown,
  UserCheck,
  Clock,
  Package,
  Wrench
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CalculatorForm() {
  const { inputs, results, updateInput, updateNestedInput } = useAppStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  return (
    <AccordionControllerProvider defaultOpenSection="position">
    <div className="space-y-4">
      {/* Position & Hire Pay */}
      <CalculatorSection
        id="position"
        title="Ametikoht ja palk"
        subtitle="Värbatava positsiooni põhiandmed"
        icon={<Briefcase className="w-5 h-5" />}
        subtotal={results.normalizedHirePay.employerMonthlyCost}
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Ametikoha nimetus</Label>
          <Input
            value={inputs.positionTitle}
            onChange={(e) => updateInput('positionTitle', e.target.value)}
            placeholder="nt. Tarkvaraarendaja"
            className="bg-card"
          />
        </div>
        
        <div className="md:col-span-2">
          <PayInputGroup
            label="Värbatava töötaja palk"
            value={inputs.hirePay}
            onChange={(pay) => updateInput('hirePay', pay)}
            normalizedPay={results.normalizedHirePay}
            showCostBreakdown
            isDefaultUsed={results.defaultsUsed.hirePay}
          />
        </div>
      </CalculatorSection>

      {/* Role Pay Rates */}
      <RolePaySection />

      {/* Strategy & Prep */}
      <CalculatorSection
        id="strategy"
        title="Strateegia ja ettevalmistus"
        subtitle="Ametiprofiili koostamine, nõuete määramine"
        icon={<Users className="w-5 h-5" />}
        subtotal={results.blockCosts.strategyPrep.total}
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.strategyPrep.hrHours}
          onChange={(v) => updateNestedInput('strategyPrep', 'hrHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.strategyPrep.managerHours}
          onChange={(v) => updateNestedInput('strategyPrep', 'managerHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Tiimi tunnid"
          value={inputs.strategyPrep.teamHours}
          onChange={(v) => updateNestedInput('strategyPrep', 'teamHours', v)}
          suffix="h"
        />
      </CalculatorSection>

      {/* Ads & Branding */}
      <CalculatorSection
        id="ads"
        title="Kuulutused ja bränding"
        subtitle="Töökuulutused, tööandja brändi materjalid"
        icon={<Megaphone className="w-5 h-5" />}
        subtotal={results.blockCosts.adsBranding.total}
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.adsBranding.hrHours}
          onChange={(v) => updateNestedInput('adsBranding', 'hrHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.adsBranding.managerHours}
          onChange={(v) => updateNestedInput('adsBranding', 'managerHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Kuulutuste ja brändingu kulud"
          value={inputs.adsBranding.directCosts}
          onChange={(v) => updateNestedInput('adsBranding', 'directCosts', v)}
          suffix="€"
          hint="CV-Online, LinkedIn, materjalid"
        />
      </CalculatorSection>

      {/* Candidate Management */}
      <CalculatorSection
        id="candidate"
        title="Kandidaatide haldus ja testid"
        subtitle="CV-de läbivaatus, testid, suhtlus"
        icon={<UserCheck className="w-5 h-5" />}
        subtotal={results.blockCosts.candidateMgmt.total}
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.candidateMgmt.hrHours}
          onChange={(v) => updateNestedInput('candidateMgmt', 'hrHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.candidateMgmt.managerHours}
          onChange={(v) => updateNestedInput('candidateMgmt', 'managerHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Hindamistestide kulud"
          value={inputs.candidateMgmt.testsCost}
          onChange={(v) => updateNestedInput('candidateMgmt', 'testsCost', v)}
          suffix="€"
          hint="Psühholoogilised testid, oskuste hindamine"
        />
      </CalculatorSection>

      {/* Interviews */}
      <CalculatorSection
        id="interviews"
        title="Intervjuud"
        subtitle="Intervjuude läbiviimine ja koordineerimine"
        icon={<Clock className="w-5 h-5" />}
        subtotal={results.blockCosts.interviews.total}
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.interviews.hrHours}
          onChange={(v) => updateNestedInput('interviews', 'hrHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.interviews.managerHours}
          onChange={(v) => updateNestedInput('interviews', 'managerHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Tiimi tunnid"
          value={inputs.interviews.teamHours}
          onChange={(v) => updateNestedInput('interviews', 'teamHours', v)}
          suffix="h"
          hint="Tiimikaaslaste kaasamine intervjuudele"
        />
        <NumberInput
          label="Otsesed kulud"
          value={inputs.interviews.directCosts}
          onChange={(v) => updateNestedInput('interviews', 'directCosts', v)}
          suffix="€"
          hint="Reisikulud, ruumid"
        />
      </CalculatorSection>

      {/* Background & Offer */}
      <CalculatorSection
        id="background"
        title="Taustakontroll ja pakkumine"
        subtitle="Taustakontroll, lepingu koostamine"
        icon={<Package className="w-5 h-5" />}
        subtotal={results.blockCosts.backgroundOffer.total}
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.backgroundOffer.hrHours}
          onChange={(v) => updateNestedInput('backgroundOffer', 'hrHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.backgroundOffer.managerHours}
          onChange={(v) => updateNestedInput('backgroundOffer', 'managerHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Otsesed kulud"
          value={inputs.backgroundOffer.directCosts}
          onChange={(v) => updateNestedInput('backgroundOffer', 'directCosts', v)}
          suffix="€"
          hint="Taustakontroll, juriidilised tasud"
        />
      </CalculatorSection>

      {/* Other Services */}
      <OtherServicesSection />

      {/* Preboarding */}
      <CalculatorSection
        id="preboarding"
        title="Ettevalmistus enne alustamist"
        subtitle="Töökoha ettevalmistus, varustus"
        icon={<Wrench className="w-5 h-5" />}
        subtotal={results.blockCosts.preboarding.total}
      >
        <NumberInput
          label="Seadmete kulu"
          value={inputs.preboarding.devicesCost}
          onChange={(v) => updateNestedInput('preboarding', 'devicesCost', v)}
          suffix="€"
          hint="Arvuti, telefon, monitor"
        />
        <NumberInput
          label="IT seadistamise tunnid"
          value={inputs.preboarding.itSetupHours}
          onChange={(v) => updateNestedInput('preboarding', 'itSetupHours', v)}
          suffix="h"
        />
        <NumberInput
          label="HR ettevalmistuse tunnid"
          value={inputs.preboarding.prepHours}
          onChange={(v) => updateNestedInput('preboarding', 'prepHours', v)}
          suffix="h"
        />
      </CalculatorSection>

      {/* Onboarding */}
      <CalculatorSection
        id="onboarding"
        title="Sisseelamine"
        subtitle="Tootlikkuse kadu uue töötaja sisseelamisel"
        icon={<GraduationCap className="w-5 h-5" />}
        subtotal={results.blockCosts.onboarding.total}
      >
        <NumberInput
          label="Sisseelamisperiood"
          value={inputs.onboarding.onboardingMonths}
          onChange={(v) => updateNestedInput('onboarding', 'onboardingMonths', v)}
          suffix="kuud"
          min={0}
          max={24}
          hint="Aeg täistootlikkuse saavutamiseks"
        />
        <NumberInput
          label="Keskmine tootlikkus"
          value={inputs.onboarding.productivityPct}
          onChange={(v) => updateNestedInput('onboarding', 'productivityPct', v)}
          suffix="%"
          min={0}
          max={100}
          hint="Protsent täistootlikkusest sisseelamisel"
        />
        <NumberInput
          label="Lisakulud"
          value={inputs.onboarding.extraCosts}
          onChange={(v) => updateNestedInput('onboarding', 'extraCosts', v)}
          suffix="€"
          hint="Koolitused, sertifikaadid"
        />
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Tootlikkuse kadu</p>
          <p className="text-sm">
            {inputs.onboarding.onboardingMonths} kuud × {formatCurrency(results.normalizedHirePay.employerMonthlyCost)} € × {100 - inputs.onboarding.productivityPct}% kadu
          </p>
          <p className="font-semibold mt-2">
            = {formatCurrency(results.blockCosts.onboarding.total - inputs.onboarding.extraCosts)} €
          </p>
        </div>
      </CalculatorSection>

      {/* Vacancy Cost */}
      <CalculatorSection
        id="vacancy"
        title="Vaba ametikoha kulu"
        subtitle="Kaotatud tootlikkus täitmata positsiooni tõttu"
        icon={<TrendingDown className="w-5 h-5" />}
        subtotal={results.blockCosts.vacancy.total}
      >
        <NumberInput
          label="Vakantsi kestus"
          value={inputs.vacancy.vacancyDays}
          onChange={(v) => updateNestedInput('vacancy', 'vacancyDays', v)}
          suffix="päeva"
          min={0}
          hint="Päevi, mil positsioon on täitmata"
        />
        <NumberInput
          label="Päevakulu"
          value={inputs.vacancy.dailyCost}
          onChange={(v) => updateNestedInput('vacancy', 'dailyCost', v)}
          suffix="€/päev"
          hint="Hinnanguline kaotatud tulu või tootlikkus"
        />
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Vakantsi kogukulu</p>
          <p className="font-semibold">
            {inputs.vacancy.vacancyDays} päeva × {inputs.vacancy.dailyCost} €/päev = {formatCurrency(results.blockCosts.vacancy.total)} €
          </p>
        </div>
      </CalculatorSection>

      {/* Indirect Costs */}
      <CalculatorSection
        id="indirect"
        title="Kaudsed kulud"
        subtitle="Administratiivne aeg (ilma tööandja maksudeta)"
        icon={<Users className="w-5 h-5" />}
        subtotal={results.blockCosts.indirectCosts.total}
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.indirectCosts.hrHours}
          onChange={(v) => updateNestedInput('indirectCosts', 'hrHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.indirectCosts.managerHours}
          onChange={(v) => updateNestedInput('indirectCosts', 'managerHours', v)}
          suffix="h"
        />
        <NumberInput
          label="Tiimi tunnid"
          value={inputs.indirectCosts.teamHours}
          onChange={(v) => updateNestedInput('indirectCosts', 'teamHours', v)}
          suffix="h"
        />
        <div className="p-4 bg-muted rounded-lg md:col-span-3">
          <p className="text-xs text-muted-foreground">
            ℹ Kaudsete kulude puhul arvestatakse ainult brutotunnipalka, ilma tööandja maksudeta.
          </p>
        </div>
      </CalculatorSection>

      {/* Risk Summary Section */}
      <RiskSummarySection />
    </div>
    </AccordionControllerProvider>
  );
}
