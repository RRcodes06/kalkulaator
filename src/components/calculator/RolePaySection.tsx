import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { PayInputGroup } from './PayInputGroup';
import { Switch } from '@/components/ui/switch';
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
      title="Kaasatud rollide palgad"
      subtitle="Määra värbamisega seotud töötajate palgad"
      icon={<Users className="w-5 h-5" />}
      infoKey="roles"
    >
      {/* HR Role */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Personalitöötaja (HR)</Label>
          <Switch
            checked={inputs.roles.hr.enabled}
            onCheckedChange={(checked) => updateRole('hr', { enabled: checked })}
          />
        </div>
        {inputs.roles.hr.enabled && (
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
            defaultSalaryHint={`Kasutab ${ROLE_SALARY_LABELS.hr}: ${ROLE_DEFAULT_SALARIES.hr} €`}
            compact
          />
        )}
      </div>

      {/* Manager Role */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Värbav juht</Label>
          <Switch
            checked={inputs.roles.manager.enabled}
            onCheckedChange={(checked) => updateRole('manager', { enabled: checked })}
          />
        </div>
        {inputs.roles.manager.enabled && (
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
            defaultSalaryHint={`Kasutab ${ROLE_SALARY_LABELS.manager}: ${ROLE_DEFAULT_SALARIES.manager} €`}
            compact
          />
        )}
      </div>

      {/* Team Role */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Tiimiliikmed</Label>
          <Switch
            checked={inputs.roles.team.enabled}
            onCheckedChange={(checked) => updateRole('team', { enabled: checked })}
          />
        </div>
        {inputs.roles.team.enabled && (
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
            defaultSalaryHint={`Kasutab ${ROLE_SALARY_LABELS.team}: ${ROLE_DEFAULT_SALARIES.team} €`}
            compact
          />
        )}
      </div>

      <div className="md:col-span-3 p-4 bg-muted rounded-lg space-y-2">
        <p className="text-xs text-muted-foreground">
          ℹ Tööandja kulud sisaldavad sotsiaalmaksu (33%) ja töötuskindlustusmakset (0.8%).
        </p>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Vaikimisi kasutatavad palgad:</p>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            <li>Tiimiliige: {ROLE_DEFAULT_SALARIES.team} € ({ROLE_SALARY_LABELS.team})</li>
            <li>HR: {ROLE_DEFAULT_SALARIES.hr} € ({ROLE_SALARY_LABELS.hr})</li>
            <li>Värbav juht: {ROLE_DEFAULT_SALARIES.manager} € ({ROLE_SALARY_LABELS.manager})</li>
          </ul>
        </div>
      </div>
    </CalculatorSection>
  );
}
