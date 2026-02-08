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
  const { inputs, results, updateInput, updateNestedInput, hasCalculated } = useAppStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  // Helper to find warning for a specific field
  const getWarningForField = (fieldName: string) => {
    const warning = results.rangeWarnings.find(w => w.field === fieldName);
    if (warning) {
      return { message: warning.message, severity: warning.severity };
    }
    return undefined;
  };

  // Helper to get range hint for a specific field
  const getRangeHintForField = (fieldName: string) => {
    const hint = results.rangeHints.find(h => h.field === fieldName);
    if (hint) {
      return { min: hint.min, max: hint.max, unit: hint.unit };
    }
    return undefined;
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
        infoKey="position"
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
        infoKey="strategy"
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.strategyPrep.hrHours}
          onChange={(v) => updateNestedInput('strategyPrep', 'hrHours', v)}
          suffix="h"
          warning={getWarningForField('strategyPrep.hrHours')}
          rangeHint={getRangeHintForField('strategyPrep.hrHours')}
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.strategyPrep.managerHours}
          onChange={(v) => updateNestedInput('strategyPrep', 'managerHours', v)}
          suffix="h"
          warning={getWarningForField('strategyPrep.managerHours')}
          rangeHint={getRangeHintForField('strategyPrep.managerHours')}
        />
        <NumberInput
          label="Tiimi tunnid"
          value={inputs.strategyPrep.teamHours}
          onChange={(v) => updateNestedInput('strategyPrep', 'teamHours', v)}
          suffix="h"
          warning={getWarningForField('strategyPrep.teamHours')}
          rangeHint={getRangeHintForField('strategyPrep.teamHours')}
        />
      </CalculatorSection>

      {/* Ads & Branding */}
      <CalculatorSection
        id="ads"
        title="Kuulutused ja bränding"
        subtitle="Töökuulutused, tööandja brändi materjalid"
        icon={<Megaphone className="w-5 h-5" />}
        subtotal={results.blockCosts.adsBranding.total}
        infoKey="ads"
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.adsBranding.hrHours}
          onChange={(v) => updateNestedInput('adsBranding', 'hrHours', v)}
          suffix="h"
          warning={getWarningForField('adsBranding.hrHours')}
          rangeHint={getRangeHintForField('adsBranding.hrHours')}
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.adsBranding.managerHours}
          onChange={(v) => updateNestedInput('adsBranding', 'managerHours', v)}
          suffix="h"
          warning={getWarningForField('adsBranding.managerHours')}
          rangeHint={getRangeHintForField('adsBranding.managerHours')}
        />
        <NumberInput
          label="Kuulutuste ja brändingu kulud"
          value={inputs.adsBranding.directCosts}
          onChange={(v) => updateNestedInput('adsBranding', 'directCosts', v)}
          suffix="€"
          hint="CV-Online, LinkedIn, materjalid"
          warning={getWarningForField('adsBranding.directCosts')}
          rangeHint={getRangeHintForField('adsBranding.directCosts')}
        />
      </CalculatorSection>

      {/* Candidate Management */}
      <CalculatorSection
        id="candidate"
        title="Kandidaatide haldus ja testid"
        subtitle="CV-de läbivaatus, testid, suhtlus"
        icon={<UserCheck className="w-5 h-5" />}
        subtotal={results.blockCosts.candidateMgmt.total}
        infoKey="candidate"
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.candidateMgmt.hrHours}
          onChange={(v) => updateNestedInput('candidateMgmt', 'hrHours', v)}
          suffix="h"
          warning={getWarningForField('candidateMgmt.hrHours')}
          rangeHint={getRangeHintForField('candidateMgmt.hrHours')}
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.candidateMgmt.managerHours}
          onChange={(v) => updateNestedInput('candidateMgmt', 'managerHours', v)}
          suffix="h"
          warning={getWarningForField('candidateMgmt.managerHours')}
          rangeHint={getRangeHintForField('candidateMgmt.managerHours')}
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
        infoKey="interviews"
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.interviews.hrHours}
          onChange={(v) => updateNestedInput('interviews', 'hrHours', v)}
          suffix="h"
          warning={getWarningForField('interviews.hrHours')}
          rangeHint={getRangeHintForField('interviews.hrHours')}
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.interviews.managerHours}
          onChange={(v) => updateNestedInput('interviews', 'managerHours', v)}
          suffix="h"
          warning={getWarningForField('interviews.managerHours')}
          rangeHint={getRangeHintForField('interviews.managerHours')}
        />
        <NumberInput
          label="Tiimi tunnid"
          value={inputs.interviews.teamHours}
          onChange={(v) => updateNestedInput('interviews', 'teamHours', v)}
          suffix="h"
          hint="Tiimikaaslaste kaasamine intervjuudele"
          warning={getWarningForField('interviews.teamHours')}
          rangeHint={getRangeHintForField('interviews.teamHours')}
        />
        <NumberInput
          label="Otsesed kulud"
          value={inputs.interviews.directCosts}
          onChange={(v) => updateNestedInput('interviews', 'directCosts', v)}
          suffix="€"
          hint="Reisikulud, ruumid"
          warning={getWarningForField('interviews.directCosts')}
          rangeHint={getRangeHintForField('interviews.directCosts')}
        />
      </CalculatorSection>

      {/* Background & Offer */}
      <CalculatorSection
        id="background"
        title="Taustakontroll ja pakkumine"
        subtitle="Taustakontroll, lepingu koostamine"
        icon={<Package className="w-5 h-5" />}
        subtotal={results.blockCosts.backgroundOffer.total}
        infoKey="background"
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.backgroundOffer.hrHours}
          onChange={(v) => updateNestedInput('backgroundOffer', 'hrHours', v)}
          suffix="h"
          warning={getWarningForField('backgroundOffer.hrHours')}
          rangeHint={getRangeHintForField('backgroundOffer.hrHours')}
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.backgroundOffer.managerHours}
          onChange={(v) => updateNestedInput('backgroundOffer', 'managerHours', v)}
          suffix="h"
          warning={getWarningForField('backgroundOffer.managerHours')}
          rangeHint={getRangeHintForField('backgroundOffer.managerHours')}
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
        infoKey="preboarding"
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
          hint="Kontode loomine, tarkvara paigaldus"
        />
        <NumberInput
          label="HR ettevalmistuse tunnid"
          value={inputs.preboarding.prepHours}
          onChange={(v) => updateNestedInput('preboarding', 'prepHours', v)}
          suffix="h"
          hint="Dokumentide ettevalmistus"
        />
      </CalculatorSection>

      {/* Onboarding */}
      <CalculatorSection
        id="onboarding"
        title="Sisseelamine"
        subtitle="Tootlikkuse kadu uue töötaja sisseelamisel"
        icon={<GraduationCap className="w-5 h-5" />}
        subtotal={results.blockCosts.onboarding.total}
        infoKey="onboarding"
      >
        <NumberInput
          label="Sisseelamisperiood"
          value={inputs.onboarding.onboardingMonths}
          onChange={(v) => updateNestedInput('onboarding', 'onboardingMonths', v)}
          suffix="kuud"
          min={0}
          max={24}
          warning={getWarningForField('onboarding.onboardingMonths')}
          rangeHint={getRangeHintForField('onboarding.onboardingMonths')}
        />
        <NumberInput
          label="Keskmine tootlikkus"
          value={inputs.onboarding.productivityPct}
          onChange={(v) => updateNestedInput('onboarding', 'productivityPct', v)}
          suffix="%"
          min={0}
          max={100}
          hint="Protsent täistootlikkusest"
          warning={getWarningForField('onboarding.productivityPct')}
          rangeHint={getRangeHintForField('onboarding.productivityPct')}
        />
        <NumberInput
          label="Lisakulud"
          value={inputs.onboarding.extraCosts}
          onChange={(v) => updateNestedInput('onboarding', 'extraCosts', v)}
          suffix="€"
          hint="Koolitused, sertifikaadid"
        />
      </CalculatorSection>

      {/* Vacancy Cost */}
      <CalculatorSection
        id="vacancy"
        title="Vaba ametikoha kulu"
        subtitle="Kaotatud tootlikkus täitmata positsiooni tõttu"
        icon={<TrendingDown className="w-5 h-5" />}
        subtotal={results.blockCosts.vacancy.total}
        infoKey="vacancy"
      >
        <NumberInput
          label="Vakantsi kestus"
          value={inputs.vacancy.vacancyDays}
          onChange={(v) => updateNestedInput('vacancy', 'vacancyDays', v)}
          suffix="päeva"
          min={0}
          warning={getWarningForField('vacancy.vacancyDays')}
          rangeHint={getRangeHintForField('vacancy.vacancyDays')}
        />
        <NumberInput
          label="Päevakulu"
          value={inputs.vacancy.dailyCost}
          onChange={(v) => updateNestedInput('vacancy', 'dailyCost', v)}
          suffix="€/päev"
          hint="Kaotatud tulu või tootlikkus päevas"
        />
      </CalculatorSection>

      {/* Indirect Costs */}
      <CalculatorSection
        id="indirect"
        title="Kaudsed kulud"
        subtitle="Fookuse kadu ja lisatöö, mis ei kajastu otsestes arvetes"
        icon={<Users className="w-5 h-5" />}
        subtotal={results.blockCosts.indirectCosts.total}
        infoKey="indirect"
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={inputs.indirectCosts.hrHours}
          onChange={(v) => updateNestedInput('indirectCosts', 'hrHours', v)}
          suffix="h"
          hint="Koordineerimine, aruandlus"
          warning={getWarningForField('indirectCosts.hrHours')}
          rangeHint={getRangeHintForField('indirectCosts.hrHours')}
        />
        <NumberInput
          label="Juhi tunnid"
          value={inputs.indirectCosts.managerHours}
          onChange={(v) => updateNestedInput('indirectCosts', 'managerHours', v)}
          suffix="h"
          hint="Prioriteetide ümberjagamine"
          warning={getWarningForField('indirectCosts.managerHours')}
          rangeHint={getRangeHintForField('indirectCosts.managerHours')}
        />
        <NumberInput
          label="Tiimi tunnid"
          value={inputs.indirectCosts.teamHours}
          onChange={(v) => updateNestedInput('indirectCosts', 'teamHours', v)}
          suffix="h"
          hint="Ülekoormus, ülesannete jagamine"
          warning={getWarningForField('indirectCosts.teamHours')}
          rangeHint={getRangeHintForField('indirectCosts.teamHours')}
        />
      </CalculatorSection>

      {/* Risk Summary Section */}
      <RiskSummarySection />
    </div>
    </AccordionControllerProvider>
  );
}
