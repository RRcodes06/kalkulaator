import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { PayInputGroup } from './PayInputGroup';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { ROLE_DEFAULT_SALARIES } from '@/config/defaults';
import { useLanguage } from '@/i18n/LanguageContext';

export function RolePaySection() {
  const { inputs, results, updateInput } = useAppStore();
  const { t } = useLanguage();

  const updateRole = (
    role: 'hr' | 'manager' | 'team',
    updates: Partial<typeof inputs.roles.hr>
  ) => {
    updateInput('roles', {
      ...inputs.roles,
      [role]: { ...inputs.roles[role], ...updates },
    });
  };

  return (
    <CalculatorSection
      id="roles"
      title={t('sectionRoles')}
      icon={<Users className="w-5 h-5" />}
      hideInfoButton
    >
      {/* HR Role */}
      <div className="min-w-0 space-y-5 rounded-lg bg-muted/30 p-5">
        <Label className="text-base font-medium">{t('hrRole')}</Label>
        <PayInputGroup
          label={t('hrPayLabel')}
          value={{
            payType: inputs.roles.hr.payType,
            payAmount: inputs.roles.hr.payAmount,
            hoursPerMonth: inputs.roles.hr.hoursPerMonth,
          }}
          onChange={(pay) =>
            updateRole('hr', {
              payType: pay.payType,
              payAmount: pay.payAmount,
              hoursPerMonth: pay.hoursPerMonth,
            })
          }
          normalizedPay={results.normalizedRoles.hr}
          isDefaultUsed={results.defaultsUsed.hrPay}
          defaultSalaryHint={`${t('roleSalaryLabelHr')}: ${ROLE_DEFAULT_SALARIES.hr} €`}
          compact
        />
      </div>

      {/* Manager Role */}
      <div className="min-w-0 space-y-5 rounded-lg bg-muted/30 p-5">
        <Label className="text-base font-medium">{t('managerRole')}</Label>
        <PayInputGroup
          label={t('managerPayLabel')}
          value={{
            payType: inputs.roles.manager.payType,
            payAmount: inputs.roles.manager.payAmount,
            hoursPerMonth: inputs.roles.manager.hoursPerMonth,
          }}
          onChange={(pay) =>
            updateRole('manager', {
              payType: pay.payType,
              payAmount: pay.payAmount,
              hoursPerMonth: pay.hoursPerMonth,
            })
          }
          normalizedPay={results.normalizedRoles.manager}
          isDefaultUsed={results.defaultsUsed.managerPay}
          defaultSalaryHint={`${t('roleSalaryLabelManager')}: ${ROLE_DEFAULT_SALARIES.manager} €`}
          compact
        />
      </div>

      {/* Team Role */}
      <div className="min-w-0 space-y-5 rounded-lg bg-muted/30 p-5">
        <Label className="text-base font-medium">{t('teamRole')}</Label>
        <p className="-mt-2 text-sm text-muted-foreground">
          {t('teamRoleDescription')}
        </p>
        <PayInputGroup
          label={t('teamPayLabel')}
          value={{
            payType: inputs.roles.team.payType,
            payAmount: inputs.roles.team.payAmount,
            hoursPerMonth: inputs.roles.team.hoursPerMonth,
          }}
          onChange={(pay) =>
            updateRole('team', {
              payType: pay.payType,
              payAmount: pay.payAmount,
              hoursPerMonth: pay.hoursPerMonth,
            })
          }
          normalizedPay={results.normalizedRoles.team}
          isDefaultUsed={results.defaultsUsed.teamPay}
          defaultSalaryHint={`${t('roleSalaryLabelTeam')}: ${ROLE_DEFAULT_SALARIES.team} €`}
          compact
        />
      </div>
    </CalculatorSection>
  );
}
