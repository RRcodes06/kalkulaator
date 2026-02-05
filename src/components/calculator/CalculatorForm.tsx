import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { NumberInput } from './NumberInput';
import { 
  Briefcase, 
  Users, 
  Megaphone, 
  GraduationCap, 
  TrendingDown 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CalculatorForm() {
  const { userInputs, computedResults, defaultsUsed, updateUserInput } = useAppStore();

  return (
    <div className="space-y-4">
      {/* Position & Salary */}
      <CalculatorSection
        id="position"
        title="Ametikoht ja palk"
        subtitle="Põhiandmed värbatava positsiooni kohta"
        icon={<Briefcase className="w-5 h-5" />}
        subtotal={computedResults.totalEmployerCost}
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Ametikoha nimetus</Label>
          <Input
            value={userInputs.positionTitle}
            onChange={(e) => updateUserInput('positionTitle', e.target.value)}
            placeholder="nt. Tarkvaraarendaja"
            className="bg-card"
          />
        </div>
        <NumberInput
          label="Brutopalk"
          value={userInputs.grossSalary}
          onChange={(v) => updateUserInput('grossSalary', v)}
          suffix="€/kuu"
          min={0}
          step={100}
          hint="Igakuine brutopalk enne makse"
        />
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Tööandja kulud</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Sotsiaalmaks (33%)</span>
              <span className="font-medium">{computedResults.employerSocialTax.toFixed(0)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Töötuskindlustusmakse (0.8%)</span>
              <span className="font-medium">{computedResults.employerUiTax.toFixed(0)} €</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-border">
              <span>Kokku tööjõukulu</span>
              <span>{computedResults.totalEmployerCost.toFixed(0)} €/kuu</span>
            </div>
          </div>
        </div>
      </CalculatorSection>

      {/* Internal Time Costs */}
      <CalculatorSection
        id="internal"
        title="Sisemised ajakulud"
        subtitle="Töötajate aeg, mis kulub värbamisprotsessile"
        icon={<Users className="w-5 h-5" />}
        subtotal={computedResults.totalInternalTimeCost}
      >
        <NumberInput
          label="Personalitöötaja tunnid"
          value={userInputs.hrHoursSpent}
          onChange={(v) => updateUserInput('hrHoursSpent', v)}
          suffix="h"
        />
        <NumberInput
          label="Personalitöötaja tunnihind"
          value={userInputs.hrHourlyRate}
          onChange={(v) => updateUserInput('hrHourlyRate', v)}
          suffix="€/h"
          showDefaultIndicator={defaultsUsed.hrHourlyRate}
          hint={defaultsUsed.hrHourlyRate ? 'Kasutab Eesti keskmist' : undefined}
        />
        <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Personalitöötaja kulu</span>
          <span className="font-semibold">{computedResults.hrTimeCost.toFixed(0)} €</span>
        </div>

        <NumberInput
          label="Juhi tunnid"
          value={userInputs.managerHoursSpent}
          onChange={(v) => updateUserInput('managerHoursSpent', v)}
          suffix="h"
        />
        <NumberInput
          label="Juhi tunnihind"
          value={userInputs.managerHourlyRate}
          onChange={(v) => updateUserInput('managerHourlyRate', v)}
          suffix="€/h"
          showDefaultIndicator={defaultsUsed.managerHourlyRate}
          hint={defaultsUsed.managerHourlyRate ? 'Kasutab 1.5× keskmist' : undefined}
        />
        <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Juhi kulu</span>
          <span className="font-semibold">{computedResults.managerTimeCost.toFixed(0)} €</span>
        </div>

        <NumberInput
          label="Teiste töötajate tunnid"
          value={userInputs.otherStaffHoursSpent}
          onChange={(v) => updateUserInput('otherStaffHoursSpent', v)}
          suffix="h"
          hint="nt. intervjueerijad, tiimikaaslased"
        />
        <NumberInput
          label="Teiste töötajate tunnihind"
          value={userInputs.otherStaffHourlyRate}
          onChange={(v) => updateUserInput('otherStaffHourlyRate', v)}
          suffix="€/h"
        />
        <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Teiste töötajate kulu</span>
          <span className="font-semibold">{computedResults.otherStaffTimeCost.toFixed(0)} €</span>
        </div>
      </CalculatorSection>

      {/* External Costs */}
      <CalculatorSection
        id="external"
        title="Välised kulud"
        subtitle="Teenused ja ostud väljastpoolt ettevõtet"
        icon={<Megaphone className="w-5 h-5" />}
        subtotal={computedResults.totalExternalCosts}
      >
        <NumberInput
          label="Töökuulutused"
          value={userInputs.jobAdsCost}
          onChange={(v) => updateUserInput('jobAdsCost', v)}
          suffix="€"
          hint="CV-Online, LinkedIn, jne."
        />
        <NumberInput
          label="Värbamisagentuuri tasu"
          value={userInputs.recruitmentAgencyFee}
          onChange={(v) => updateUserInput('recruitmentAgencyFee', v)}
          suffix="€"
          hint="Headhunteri või agentuuri teenustasu"
        />
        <NumberInput
          label="Taustakontroll"
          value={userInputs.backgroundCheckCost}
          onChange={(v) => updateUserInput('backgroundCheckCost', v)}
          suffix="€"
        />
        <NumberInput
          label="Hindamisvahendid"
          value={userInputs.assessmentToolsCost}
          onChange={(v) => updateUserInput('assessmentToolsCost', v)}
          suffix="€"
          hint="Testid, psühholoogilised hindamised"
        />
        <NumberInput
          label="Reisikulud"
          value={userInputs.travelCost}
          onChange={(v) => updateUserInput('travelCost', v)}
          suffix="€"
          hint="Kandidaatide sõidukulud intervjuudele"
        />
        <NumberInput
          label="Muud välised kulud"
          value={userInputs.otherExternalCosts}
          onChange={(v) => updateUserInput('otherExternalCosts', v)}
          suffix="€"
        />
      </CalculatorSection>

      {/* Onboarding Costs */}
      <CalculatorSection
        id="onboarding"
        title="Sisseelamise kulud"
        subtitle="Uue töötaja koolitamine ja varustamine"
        icon={<GraduationCap className="w-5 h-5" />}
        subtotal={computedResults.totalOnboardingCost}
      >
        <NumberInput
          label="Koolituskulud"
          value={userInputs.trainingCost}
          onChange={(v) => updateUserInput('trainingCost', v)}
          suffix="€"
          hint="Välised koolitused, sertifitseerimised"
        />
        <NumberInput
          label="Töövarustus"
          value={userInputs.equipmentCost}
          onChange={(v) => updateUserInput('equipmentCost', v)}
          suffix="€"
          hint="Arvuti, telefon, töökoht"
        />
        <NumberInput
          label="Sisseelamise tunnid"
          value={userInputs.onboardingHours}
          onChange={(v) => updateUserInput('onboardingHours', v)}
          suffix="h"
          hint="Uue töötaja orientatsioon"
        />
        <NumberInput
          label="Mentori tunnid"
          value={userInputs.mentorHoursSpent}
          onChange={(v) => updateUserInput('mentorHoursSpent', v)}
          suffix="h"
        />
        <NumberInput
          label="Mentori tunnihind"
          value={userInputs.mentorHourlyRate}
          onChange={(v) => updateUserInput('mentorHourlyRate', v)}
          suffix="€/h"
          showDefaultIndicator={defaultsUsed.mentorHourlyRate}
        />
      </CalculatorSection>

      {/* Productivity Loss */}
      <CalculatorSection
        id="productivity"
        title="Tootlikkuse kadu"
        subtitle="Sisseelamisperioodi vähenenud tootlikkus"
        icon={<TrendingDown className="w-5 h-5" />}
        subtotal={computedResults.productivityLossCost}
      >
        <NumberInput
          label="Kuud täistootlikkuseni"
          value={userInputs.monthsToFullProductivity}
          onChange={(v) => updateUserInput('monthsToFullProductivity', v)}
          suffix="kuud"
          min={1}
          max={24}
          hint="Kui kaua võtab aega 100% tootlikkuse saavutamine"
        />
        <NumberInput
          label="Keskmine tootlikkus sisseelamisel"
          value={userInputs.productivityDuringRampUp}
          onChange={(v) => updateUserInput('productivityDuringRampUp', v)}
          suffix="%"
          min={0}
          max={100}
          hint="Keskmine tootlikkuse tase võrreldes kogenud töötajaga"
        />
        <div className="p-4 bg-muted rounded-lg lg:col-span-1">
          <p className="text-sm text-muted-foreground mb-2">Arvutus</p>
          <p className="text-sm">
            {userInputs.monthsToFullProductivity} kuud × {computedResults.totalEmployerCost.toFixed(0)} € × {((100 - userInputs.productivityDuringRampUp) / 100 * 100).toFixed(0)}% kadu
          </p>
          <p className="font-semibold mt-2">= {computedResults.productivityLossCost.toFixed(0)} €</p>
        </div>
      </CalculatorSection>
    </div>
  );
}
