import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { BlockCostsMap, BlockName } from '@/types/calculator';
import { BLOCK_LABELS } from '@/config/defaults';

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

export function CostBreakdownChart({ blockCosts, totalCost }: CostBreakdownChartProps) {
  const data = (Object.entries(blockCosts) as [BlockName, { total: number }][])
    .filter(([_, cost]) => cost.total > 0)
    .map(([key, cost], index) => ({
      name: BLOCK_LABELS[key] || key,
      shortName: getShortLabel(key),
      value: Math.round(cost.total),
      percentage: totalCost > 0 ? (cost.total / totalCost) * 100 : 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-summary-muted text-sm">
        Andmed puuduvad
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
    <div className="space-y-3">
      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
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
                color: 'white',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend below */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-summary-muted truncate" title={item.name}>
              {item.shortName}
            </span>
            <span className="text-summary-foreground ml-auto flex-shrink-0">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      
      {data.length > 6 && (
        <p className="text-xs text-summary-muted text-center">
          +{data.length - 6} muud kategooriat
        </p>
      )}
    </div>
  );
}

function getShortLabel(key: string): string {
  const shortLabels: Record<string, string> = {
    strategyPrep: 'Strateegia',
    adsBranding: 'Kuulutused',
    candidateMgmt: 'Kandidaadid',
    interviews: 'Intervjuud',
    backgroundOffer: 'Taustakontroll',
    otherServices: 'Muud teenused',
    preboarding: 'Ettevalmistus',
    onboarding: 'Sisseelamine',
    vacancy: 'Vakants',
    indirectCosts: 'Kaudsed',
    expectedRisk: 'Risk',
  };
  return shortLabels[key] || key;
}
