import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { NumberInput } from './NumberInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Trash2, Scale, Monitor, Palette } from 'lucide-react';
import type { ServiceType, BillingType, PayType, ServiceDetails } from '@/types/calculator';

interface QuickAddPreset {
  name: string;
  label: string;
  icon: React.ReactNode;
}

const QUICK_ADD_PRESETS: QuickAddPreset[] = [
  { name: 'Jurist', label: 'Lisa jurist', icon: <Scale className="w-4 h-4" /> },
  { name: 'IT tugi', label: 'Lisa IT', icon: <Monitor className="w-4 h-4" /> },
  { name: 'Turundus/bränding', label: 'Lisa turundus', icon: <Palette className="w-4 h-4" /> },
  { name: '', label: 'Lisa muu', icon: <Plus className="w-4 h-4" /> },
];

export function OtherServicesSection() {
  const { inputs, results, addServiceRow, updateServiceRow, removeServiceRow } = useAppStore();

  const handleQuickAdd = (preset: QuickAddPreset) => {
    addServiceRow(preset.name);
  };

  return (
    <CalculatorSection
      id="other-services"
      title="Värbamisagentuurid, peatöövõtjad, konsultandid"
      icon={<Briefcase className="w-5 h-5" />}
      subtotal={results.blockCosts.otherServices.total}
      infoKey="other"
    >
      <div className="md:col-span-3 space-y-4">
        {/* Quick-add buttons */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(preset)}
              className="gap-2"
            >
              {preset.icon}
              {preset.label}
            </Button>
          ))}
        </div>

        {inputs.otherServices.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Muud teenused puuduvad. Lisa teenus ülalolevate nuppudega.
          </p>
        )}

        {inputs.otherServices.map((row) => (
          <ServiceRowCard
            key={row.id}
            row={row}
            onUpdate={(updates) => updateServiceRow(row.id, updates)}
            onRemove={() => removeServiceRow(row.id)}
          />
        ))}
      </div>
    </CalculatorSection>
  );
}

interface ServiceRowData {
  id: string;
  name: string;
  details: ServiceDetails;
  serviceHours: number;
  repeatOnBadHire: boolean;
}

interface ServiceRowCardProps {
  row: ServiceRowData;
  onUpdate: (updates: Partial<ServiceRowData>) => void;
  onRemove: () => void;
}

function ServiceRowCard({ row, onUpdate, onRemove }: ServiceRowCardProps) {
  const isInhouse = row.details.serviceType === 'inhouse';

  const handleServiceTypeChange = (type: ServiceType) => {
    if (type === 'inhouse') {
      onUpdate({
        details: {
          serviceType: 'inhouse',
          payType: 'monthly',
          payAmount: 0,
          hoursPerMonth: 168,
        },
      });
    } else {
      onUpdate({
        details: {
          serviceType: 'outsourced',
          billingType: 'oneOff',
          price: 0,
        },
      });
    }
  };

  return (
    <div className="p-5 bg-muted/50 rounded-lg border border-border space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <Label className="text-sm text-muted-foreground mb-1.5 block">Teenuse nimetus</Label>
          <Input
            value={row.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="nt. Värbamisagentuur"
            className="bg-card h-11 text-base"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Service type */}
        <div className="space-y-2">
          <Label className="text-sm">Teenuse tüüp</Label>
          <Select
            value={row.details.serviceType}
            onValueChange={(v) => handleServiceTypeChange(v as ServiceType)}
          >
            <SelectTrigger className="bg-card h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inhouse">Sisene töötaja</SelectItem>
              <SelectItem value="outsourced">Väline teenus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inhouse pricing */}
        {isInhouse && row.details.serviceType === 'inhouse' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">Palga tüüp</Label>
              <Select
                value={row.details.payType}
                onValueChange={(v) =>
                  onUpdate({
                    details: {
                      ...row.details,
                      payType: v as PayType,
                      hoursPerMonth: v === 'hourly' ? 168 : undefined,
                    } as ServiceDetails,
                  })
                }
              >
                <SelectTrigger className="bg-card h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">Vaikimisi</SelectItem>
                  <SelectItem value="monthly">Kuupalk</SelectItem>
                  <SelectItem value="hourly">Tunnipalk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {row.details.payType !== 'unset' && (
              <NumberInput
                label={row.details.payType === 'monthly' ? 'Brutopalk' : 'Tunnipalk'}
                value={row.details.payAmount}
                onChange={(v) =>
                  onUpdate({
                    details: { ...row.details, payAmount: v } as ServiceDetails,
                  })
                }
                suffix={row.details.payType === 'monthly' ? '€/kuu' : '€/h'}
                min={0}
              />
            )}
            {row.details.payType === 'hourly' && (
              <NumberInput
                label="Töötunde kuus"
                value={row.details.hoursPerMonth ?? 168}
                onChange={(v) =>
                  onUpdate({
                    details: { ...row.details, hoursPerMonth: v } as ServiceDetails,
                  })
                }
                suffix="h/kuu"
                min={1}
              />
            )}
          </>
        )}

        {/* Outsourced pricing */}
        {!isInhouse && row.details.serviceType === 'outsourced' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">Arvelduse tüüp</Label>
              <Select
                value={row.details.billingType}
                onValueChange={(v) =>
                  onUpdate({
                    details: { ...row.details, billingType: v as BillingType } as ServiceDetails,
                  })
                }
              >
                <SelectTrigger className="bg-card h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oneOff">Ühekordne tasu</SelectItem>
                  <SelectItem value="monthly">Kuutasu</SelectItem>
                  <SelectItem value="hourly">Tunnihind</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <NumberInput
              label={
                row.details.billingType === 'monthly'
                  ? 'Kuutasu'
                  : row.details.billingType === 'hourly'
                  ? 'Tunnihind'
                  : 'Kogusumma'
              }
              value={row.details.price}
              onChange={(v) =>
                onUpdate({
                  details: { ...row.details, price: v } as ServiceDetails,
                })
              }
              suffix={
                row.details.billingType === 'monthly'
                  ? '€/kuu'
                  : row.details.billingType === 'hourly'
                  ? '€/h'
                  : '€'
              }
              min={0}
            />
          </>
        )}

        {/* Service hours - only show for hourly billing types */}
        {((isInhouse && row.details.serviceType === 'inhouse' && row.details.payType === 'hourly') ||
          (!isInhouse && row.details.serviceType === 'outsourced' && row.details.billingType === 'hourly')) && (
          <NumberInput
            label="Teenuse tunnid"
            value={row.serviceHours}
            onChange={(v) => onUpdate({ serviceHours: v })}
            suffix="h"
            min={0}
            hint="Aeg, mis see teenus võtab"
          />
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Checkbox
          id={`repeat-${row.id}`}
          checked={row.repeatOnBadHire}
          onCheckedChange={(checked) => onUpdate({ repeatOnBadHire: !!checked })}
          className="h-5 w-5"
        />
        <Label htmlFor={`repeat-${row.id}`} className="text-sm cursor-pointer">
          Korduv kulu halva värbamise korral
        </Label>
      </div>
    </div>
  );
}
