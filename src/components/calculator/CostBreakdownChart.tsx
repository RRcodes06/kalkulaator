import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { BlockCostsMap, BlockName } from '@/types/calculator';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

interface CostBreakdownChartProps {
  blockCosts: BlockCostsMap;
  totalCost: number;
}

const CHART_COLORS = [
  'hsl(173, 58%, 39%)',
  'hsl(43, 74%, 66%)',
  'hsl(197, 37%, 24%)',
  'hsl(27, 87%, 67%)',
  'hsl(12, 76%, 61%)',
  'hsl(220, 70%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(160, 60%, 45%)',
  'hsl(200, 70%, 50%)',
  'hsl(45, 80%, 50%)',
];

const BLOCK_LABEL_KEYS: Record<string, TranslationKey> = {
  strategyPrep: 'blockStrategyPrep',
  adsBranding: 'blockAdsBranding',
  candidateMgmt: 'blockCandidateMgmt',
  interviews: 'blockInterviews',
  backgroundOffer: 'blockBackgroundOffer',
  otherServices: 'blockOtherServices',
  preboarding: 'blockPreboarding',
  onboarding: 'blockOnboarding',
  vacantImpact: 'blockVacantImpact',
  expectedRisk: 'blockExpectedRisk',
};

export function CostBreakdownChart({ blockCosts, totalCost }: CostBreakdownChartProps) {
  const { t } = useLanguage();

  const data = (Object.entries(blockCosts) as [BlockName, { total: number }][])
    .filter(([key, cost]) => key !== 'expectedRisk' && cost.total > 0)
    .map(([key, cost], index) => ({
      name: t(BLOCK_LABEL_KEYS[key] || 'blockStrategyPrep'),
      value: Math.round(cost.total),
      percentage: totalCost > 0 ? (cost.total / totalCost) * 100 : 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-summary-muted text-sm">
        {t('noData')}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              contentStyle={{
                backgroundColor: 'hsl(220, 30%, 18%)',
                border: '1px solid hsl(220, 20%, 30%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-summary-muted truncate">{item.name}</span>
            <span className="text-summary-foreground ml-auto font-medium">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
