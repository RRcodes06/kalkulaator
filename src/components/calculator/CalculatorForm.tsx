import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { NumberInput } from './NumberInput';
import { PayInputGroup } from './PayInputGroup';
import { RolePaySection } from './RolePaySection';
import { OtherServicesSection } from './OtherServicesSection';
import { RiskSummarySection } from './RiskSummarySection';
import { VacantPositionImpactSection } from './VacantPositionImpactSection';
import { AccordionControllerProvider } from '@/hooks/useAccordionController';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  Briefcase, 
  Users, 
  Megaphone, 
  GraduationCap, 
  UserCheck,
  Clock,
  Package,
  Wrench
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CalculatorForm() {
  const { inputs, results, updateInput, updateNestedInput, hasCalculated } = useAppStore();
  const { t } = useLanguage();

  const getWarningForField = (fieldName: string) => {
    const warning = results.rangeWarnings.find(w => w.field === fieldName);
    if (warning) return { message: warning.message, severity: warning.severity };
    return undefined;
  };

  const getRangeHintForField = (fieldName: string) => {
    const hint = results.rangeHints.find(h => h.field === fieldName);
    if (hint) return { min: hint.min, max: hint.max, unit: hint.unit };
    return undefined;
  };

  return (
    <AccordionControllerProvider defaultOpenSection="position">
    <div className="space-y-4">
      {/* Position & Hire Pay */}
      <CalculatorSection
        id="position"
        title={t('sectionPosition')}
        icon={<Briefcase className="w-5 h-5" />}
        subtotal={results.normalizedHirePay.employerMonthlyCost}
        infoKey="position"
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{t('positionTitle')}</Label>
          <Input
            value={inputs.positionTitle}
            onChange={(e) => updateInput('positionTitle', e.target.value)}
            placeholder={t('positionTitlePlaceholder')}
            className="bg-card"
          />
        </div>
        <div className="md:col-span-2">
          <PayInputGroup
            label={t('hirePay')}
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
        title={t('sectionStrategy')}
        icon={<Users className="w-5 h-5" />}
        subtotal={results.blockCosts.strategyPrep.total}
        infoKey="strategy"
      >
        <NumberInput label={t('hrHours')} value={inputs.strategyPrep.hrHours} onChange={(v) => updateNestedInput('strategyPrep', 'hrHours', v)} suffix="h" warning={getWarningForField('strategyPrep.hrHours')} rangeHint={getRangeHintForField('strategyPrep.hrHours')} />
        <NumberInput label={t('managerHours')} value={inputs.strategyPrep.managerHours} onChange={(v) => updateNestedInput('strategyPrep', 'managerHours', v)} suffix="h" warning={getWarningForField('strategyPrep.managerHours')} rangeHint={getRangeHintForField('strategyPrep.managerHours')} />
        <NumberInput label={t('teamHours')} value={inputs.strategyPrep.teamHours} onChange={(v) => updateNestedInput('strategyPrep', 'teamHours', v)} suffix="h" warning={getWarningForField('strategyPrep.teamHours')} rangeHint={getRangeHintForField('strategyPrep.teamHours')} />
      </CalculatorSection>

      {/* Ads & Branding */}
      <CalculatorSection id="ads" title={t('sectionAds')} icon={<Megaphone className="w-5 h-5" />} subtotal={results.blockCosts.adsBranding.total} infoKey="ads">
        <NumberInput label={t('hrHours')} value={inputs.adsBranding.hrHours} onChange={(v) => updateNestedInput('adsBranding', 'hrHours', v)} suffix="h" warning={getWarningForField('adsBranding.hrHours')} rangeHint={getRangeHintForField('adsBranding.hrHours')} />
        <NumberInput label={t('managerHours')} value={inputs.adsBranding.managerHours} onChange={(v) => updateNestedInput('adsBranding', 'managerHours', v)} suffix="h" warning={getWarningForField('adsBranding.managerHours')} rangeHint={getRangeHintForField('adsBranding.managerHours')} />
        <NumberInput label={t('adsCosts')} value={inputs.adsBranding.directCosts} onChange={(v) => updateNestedInput('adsBranding', 'directCosts', v)} suffix="€" hint={t('adsCostsHint')} warning={getWarningForField('adsBranding.directCosts')} rangeHint={getRangeHintForField('adsBranding.directCosts')} />
      </CalculatorSection>

      {/* Candidate Management */}
      <CalculatorSection id="candidate" title={t('sectionCandidate')} icon={<UserCheck className="w-5 h-5" />} subtotal={results.blockCosts.candidateMgmt.total} infoKey="candidate">
        <NumberInput label={t('hrHours')} value={inputs.candidateMgmt.hrHours} onChange={(v) => updateNestedInput('candidateMgmt', 'hrHours', v)} suffix="h" warning={getWarningForField('candidateMgmt.hrHours')} rangeHint={getRangeHintForField('candidateMgmt.hrHours')} />
        <NumberInput label={t('managerHours')} value={inputs.candidateMgmt.managerHours} onChange={(v) => updateNestedInput('candidateMgmt', 'managerHours', v)} suffix="h" warning={getWarningForField('candidateMgmt.managerHours')} rangeHint={getRangeHintForField('candidateMgmt.managerHours')} />
        <NumberInput label={t('testsCost')} value={inputs.candidateMgmt.testsCost} onChange={(v) => updateNestedInput('candidateMgmt', 'testsCost', v)} suffix="€" hint={t('testsCostHint')} />
      </CalculatorSection>

      {/* Interviews */}
      <CalculatorSection id="interviews" title={t('sectionInterviews')} icon={<Clock className="w-5 h-5" />} subtotal={results.blockCosts.interviews.total} infoKey="interviews">
        <NumberInput label={t('hrHours')} value={inputs.interviews.hrHours} onChange={(v) => updateNestedInput('interviews', 'hrHours', v)} suffix="h" warning={getWarningForField('interviews.hrHours')} rangeHint={getRangeHintForField('interviews.hrHours')} />
        <NumberInput label={t('managerHours')} value={inputs.interviews.managerHours} onChange={(v) => updateNestedInput('interviews', 'managerHours', v)} suffix="h" warning={getWarningForField('interviews.managerHours')} rangeHint={getRangeHintForField('interviews.managerHours')} />
        <NumberInput label={t('teamHours')} value={inputs.interviews.teamHours} onChange={(v) => updateNestedInput('interviews', 'teamHours', v)} suffix="h" hint={t('teamHoursHint')} warning={getWarningForField('interviews.teamHours')} rangeHint={getRangeHintForField('interviews.teamHours')} />
        <NumberInput label={t('directCosts')} value={inputs.interviews.directCosts} onChange={(v) => updateNestedInput('interviews', 'directCosts', v)} suffix="€" hint={t('interviewDirectCostsHint')} tooltip={t('interviewDirectCostsTooltip')} warning={getWarningForField('interviews.directCosts')} rangeHint={getRangeHintForField('interviews.directCosts')} />
      </CalculatorSection>

      {/* Background & Offer */}
      <CalculatorSection id="background" title={t('sectionBackground')} icon={<Package className="w-5 h-5" />} subtotal={results.blockCosts.backgroundOffer.total} infoKey="background">
        <NumberInput label={t('hrHours')} value={inputs.backgroundOffer.hrHours} onChange={(v) => updateNestedInput('backgroundOffer', 'hrHours', v)} suffix="h" warning={getWarningForField('backgroundOffer.hrHours')} rangeHint={getRangeHintForField('backgroundOffer.hrHours')} />
        <NumberInput label={t('managerHours')} value={inputs.backgroundOffer.managerHours} onChange={(v) => updateNestedInput('backgroundOffer', 'managerHours', v)} suffix="h" warning={getWarningForField('backgroundOffer.managerHours')} rangeHint={getRangeHintForField('backgroundOffer.managerHours')} />
        <NumberInput label={t('backgroundDirectCosts')} value={inputs.backgroundOffer.directCosts} onChange={(v) => updateNestedInput('backgroundOffer', 'directCosts', v)} suffix="€" hint={t('backgroundDirectCostsHint')} />
      </CalculatorSection>

      {/* Other Services */}
      <OtherServicesSection />

      {/* Preboarding */}
      <CalculatorSection id="preboarding" title={t('sectionPreboarding')} icon={<Wrench className="w-5 h-5" />} subtotal={results.blockCosts.preboarding.total} infoKey="preboarding">
        <NumberInput label={t('devicesCost')} value={inputs.preboarding.devicesCost} onChange={(v) => updateNestedInput('preboarding', 'devicesCost', v)} suffix="€" hint={t('devicesCostHint')} />
        <NumberInput label={t('itSetupHours')} value={inputs.preboarding.itSetupHours} onChange={(v) => updateNestedInput('preboarding', 'itSetupHours', v)} suffix="h" hint={t('itSetupHoursHint')} />
        <NumberInput label={t('itHourlyRate')} value={inputs.preboarding.itHourlyRate} onChange={(v) => updateNestedInput('preboarding', 'itHourlyRate', v)} suffix="€/h" hint={t('itHourlyRateHint')} />
        <NumberInput label={t('prepHours')} value={inputs.preboarding.prepHours} onChange={(v) => updateNestedInput('preboarding', 'prepHours', v)} suffix="h" hint={t('prepHoursHint')} />
      </CalculatorSection>

      {/* Onboarding */}
      <CalculatorSection id="onboarding" title={t('sectionOnboarding')} icon={<GraduationCap className="w-5 h-5" />} subtotal={results.blockCosts.onboarding.total} infoKey="onboarding">
        <NumberInput label={t('onboardingMonths')} value={inputs.onboarding.onboardingMonths} onChange={(v) => updateNestedInput('onboarding', 'onboardingMonths', v)} suffix={t('onboardingMonthsSuffix')} min={0} max={24} warning={getWarningForField('onboarding.onboardingMonths')} rangeHint={getRangeHintForField('onboarding.onboardingMonths')} />
        <NumberInput label={t('productivityPct')} value={inputs.onboarding.productivityPct} onChange={(v) => updateNestedInput('onboarding', 'productivityPct', v)} suffix="%" min={0} max={100} hint={t('productivityPctHint')} warning={getWarningForField('onboarding.productivityPct')} rangeHint={getRangeHintForField('onboarding.productivityPct')} />
        <NumberInput label={t('extraCosts')} value={inputs.onboarding.extraCosts} onChange={(v) => updateNestedInput('onboarding', 'extraCosts', v)} suffix="€" hint={t('extraCostsHint')} />
      </CalculatorSection>

      {/* Vacant Position Impact (replaces old Vacancy + Indirect Costs) */}
      <VacantPositionImpactSection />

      {/* Risk Summary Section */}
      <RiskSummarySection />
    </div>
    </AccordionControllerProvider>
  );
}
