import { useAppStore } from '@/store/appStore';
import { CalculatorSection } from './CalculatorSection';
import { NumberInput } from './NumberInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Trash2, Scale, Monitor, Building2 } from 'lucide-react';
import type { ServiceType, BillingType, PayType, ServiceDetails } from '@/types/calculator';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

export function OtherServicesSection() {
  const { inputs, results, addServiceRow, updateServiceRow, removeServiceRow } = useAppStore();
  const { t } = useLanguage();

  const QUICK_ADD_PRESETS = [
    { name: t('presetRecruitmentAgency'), label: t('addRecruitmentAgency'), icon: <Building2 className="w-4 h-4" /> },
    { name: t('presetLawyer'), label: t('addLawyer'), icon: <Scale className="w-4 h-4" /> },
    { name: t('presetIT'), label: t('addIT'), icon: <Monitor className="w-4 h-4" /> },
    { name: '', label: t('addOther'), icon: <Plus className="w-4 h-4" /> },
  ];

  return (
    <CalculatorSection
      id="other-services"
      title={t('sectionOtherServices')}
      icon={<Briefcase className="w-5 h-5" />}
      subtotal={results.blockCosts.otherServices.total}
      infoKey="other"
    >
      <div className="md:col-span-3 space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => addServiceRow(preset.name)}
              className="gap-2"
            >
              {preset.icon}
              {preset.label}
            </Button>
          ))}
        </div>

        {inputs.otherServices.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t('noServices')}
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
  const { t } = useLanguage();
  const defaultHours = useAppStore((s) => s.config.HOURS_PER_MONTH);
  const isInhouse = row.details.serviceType === 'inhouse';

  const handleServiceTypeChange = (type: ServiceType) => {
    if (type === 'inhouse') {
      onUpdate({
        details: {
          serviceType: 'inhouse',
          payType: 'monthly',
          payAmount: 0,
          hoursPerMonth: defaultHours,
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
          <Label className="text-sm text-muted-foreground mb-1.5 block">{t('serviceName')}</Label>
          <Input
            value={row.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder={t('serviceNamePlaceholder')}
            className="bg-card h-11 text-base"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
          aria-label={t('deleteService')}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="space-y-2">
          <Label className="text-sm">{t('serviceType')}</Label>
          <Select
            value={row.details.serviceType}
            onValueChange={(v) => handleServiceTypeChange(v as ServiceType)}
          >
            <SelectTrigger className="bg-card h-11" aria-label={t('serviceType')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inhouse">{t('serviceTypeInhouse')}</SelectItem>
              <SelectItem value="outsourced">{t('serviceTypeOutsourced')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isInhouse && row.details.serviceType === 'inhouse' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">{t('payTypeLabel')}</Label>
              <Select
                value={row.details.payType}
                onValueChange={(v) =>
                  onUpdate({
                    details: {
                      ...row.details,
                      payType: v as PayType,
                      hoursPerMonth: v === 'hourly' ? defaultHours : undefined,
                    } as ServiceDetails,
                  })
                }
              >
                <SelectTrigger className="bg-card h-11" aria-label={t('payTypeLabel')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">{t('payTypeUnset')}</SelectItem>
                  <SelectItem value="monthly">{t('payTypeMonthly')}</SelectItem>
                  <SelectItem value="hourly">{t('payTypeHourly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {row.details.payType !== 'unset' && (
              <NumberInput
                label={row.details.payType === 'monthly' ? t('grossSalary') : t('hourlyWage')}
                value={row.details.payAmount}
                onChange={(v) =>
                  onUpdate({
                    details: { ...row.details, payAmount: v } as ServiceDetails,
                  })
                }
                suffix={row.details.payType === 'monthly' ? t('monthlySuffix') : t('hourlySuffix')}
                min={0}
              />
            )}
            {row.details.payType === 'hourly' && (
              <NumberInput
                label={t('hoursPerMonth')}
                value={row.details.hoursPerMonth ?? defaultHours}
                onChange={(v) =>
                  onUpdate({
                    details: { ...row.details, hoursPerMonth: v } as ServiceDetails,
                  })
                }
                suffix={t('hoursPerMonthSuffix')}
                min={1}
              />
            )}
          </>
        )}

        {!isInhouse && row.details.serviceType === 'outsourced' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">{t('billingType')}</Label>
              <Select
                value={row.details.billingType}
                onValueChange={(v) =>
                  onUpdate({
                    details: { ...row.details, billingType: v as BillingType } as ServiceDetails,
                  })
                }
              >
                <SelectTrigger className="bg-card h-11" aria-label={t('billingType')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oneOff">{t('billingOneOff')}</SelectItem>
                  <SelectItem value="monthly">{t('billingMonthly')}</SelectItem>
                  <SelectItem value="hourly">{t('billingHourly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <NumberInput
              label={
                row.details.billingType === 'monthly'
                  ? t('billingMonthly')
                  : row.details.billingType === 'hourly'
                  ? t('billingHourly')
                  : t('totalAmount')
              }
              value={row.details.price}
              onChange={(v) =>
                onUpdate({
                  details: { ...row.details, price: v } as ServiceDetails,
                })
              }
              suffix={
                row.details.billingType === 'monthly'
                  ? t('monthlySuffix')
                  : row.details.billingType === 'hourly'
                  ? t('hourlySuffix')
                  : '€'
              }
              min={0}
            />
          </>
        )}

        {((isInhouse && row.details.serviceType === 'inhouse' && row.details.payType === 'hourly') ||
          (!isInhouse && row.details.serviceType === 'outsourced' && row.details.billingType === 'hourly')) && (
          <NumberInput
            label={t('serviceHours')}
            value={row.serviceHours}
            onChange={(v) => onUpdate({ serviceHours: v })}
            suffix="h"
            min={0}
            hint={t('serviceHoursHint')}
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
          {t('repeatOnBadHire')}
        </Label>
      </div>
    </div>
  );
}
