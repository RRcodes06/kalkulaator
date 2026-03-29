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

const SHORT_LABEL_KEYS: Record<string, TranslationKey> = {
  strategyPrep: 'chartStrategy',
  adsBranding: 'chartAds',
  candidateMgmt: 'chartCandidates',
  interviews: 'chartInterviews',
  backgroundOffer: 'chartBackground',
  otherServices: 'chartOtherServices',
  preboarding: 'chartPreboarding',
  onboarding: 'chartOnboarding',
  vacantImpact: 'chartVacantImpact',
  expectedRisk: 'chartRisk',
};

const RADIAN = Math.PI / 180;

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  shortName: string;
  color: string;
}

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  shortName,
  color,
}: CustomLabelProps) {
  // Skip very small slices
  if (percent < 0.03) return null;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  // Point on the outer edge of the pie
  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;

  // Elbow point
  const mx = cx + (outerRadius + 12) * cos;
  const my = cy + (outerRadius + 12) * sin;

  // End point for text
  const ex = mx + (cos >= 0 ? 1 : -1) * 16;
  const ey = my;

  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Leader line */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={color}
        strokeWidth={1}
        fill="none"
        opacity={0.6}
      />
      {/* Small dot at the end of leader line */}
      <circle cx={ex} cy={ey} r={2} fill={color} />
      {/* Label text */}
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey}
        textAnchor={textAnchor}
        fill="hsl(0, 0%, 85%)"
        fontSize={9}
        dominantBaseline="central"
      >
        {shortName}
      </text>
      {/* Percentage */}
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey + 11}
        textAnchor={textAnchor}
        fill="hsl(0, 0%, 60%)"
        fontSize={8}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
}

export function CostBreakdownChart({ blockCosts, totalCost }: CostBreakdownChartProps) {
  const { t } = useLanguage();

  const data = (Object.entries(blockCosts) as [BlockName, { total: number }][])
    .filter(([key, cost]) => key !== 'expectedRisk' && cost.total > 0)
    .map(([key, cost], index) => ({
      name: t(BLOCK_LABEL_KEYS[key] || 'blockStrategyPrep'),
      shortName: t(SHORT_LABEL_KEYS[key] || 'chartStrategy'),
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
      <div className="h-64">
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
              label={(props) => renderCustomLabel(props as CustomLabelProps)}
              labelLine={false}
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
    </div>
  );
}
