import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { PayInputGroup } from './PayInputGroup';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { ROLE_DEFAULT_SALARIES, ROLE_SALARY_LABELS } from '@/config/defaults';

export function RolePaySection() {
  const { inputs, results, updateInput } = useAppStore();

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
      title="Määra värbamisega seotud töötajate palgad"
      icon={<Users className="w-5 h-5" />}
      hideInfoButton
    >
      {/* HR Role */}
      <div className="space-y-5 p-5 bg-muted/30 rounded-lg">
        <Label className="font-medium text-base">Värbamisspetsialist (HR)</Label>
        <PayInputGroup
          label="HR palk"
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
          defaultSalaryHint={`${ROLE_SALARY_LABELS.hr}: ${ROLE_DEFAULT_SALARIES.hr} €`}
          compact
        />
      </div>

      {/* Manager Role */}
      <div className="space-y-5 p-5 bg-muted/30 rounded-lg">
        <Label className="font-medium text-base">Värbamise eest vastutav juht</Label>
        <PayInputGroup
          label="Juhi palk"
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
          defaultSalaryHint={`${ROLE_SALARY_LABELS.manager}: ${ROLE_DEFAULT_SALARIES.manager} €`}
          compact
        />
      </div>

      {/* Team Role */}
      <div className="space-y-5 p-5 bg-muted/30 rounded-lg">
        <Label className="font-medium text-base">Tiimiliikmed</Label>
        <p className="text-sm text-muted-foreground -mt-2">
          Tiimi palka kasutatakse hiljem tiimi panustatud tundide arvutamiseks. Kui tiim panus on (0 h), kulu ei lisandu.
        </p>
        <PayInputGroup
          label="Tiimi palk"
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
          defaultSalaryHint={`${ROLE_SALARY_LABELS.team}: ${ROLE_DEFAULT_SALARIES.team} €`}
          compact
        />
      </div>
    </CalculatorSection>
  );
}
