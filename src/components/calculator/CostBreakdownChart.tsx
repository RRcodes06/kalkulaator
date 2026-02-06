import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { BlockCostsMap, BlockName } from '@/types/calculator';
import { BLOCK_LABELS } from '@/config/defaults';

interface CostBreakdownChartProps {
  blockCosts: BlockCostsMap;
  totalCost: number;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(30, 80%, 55%)',
  'hsl(160, 60%, 45%)',
  'hsl(200, 70%, 50%)',
];

export function CostBreakdownChart({ blockCosts, totalCost }: CostBreakdownChartProps) {
  const data = (Object.entries(blockCosts) as [BlockName, { total: number }][])
    .filter(([_, cost]) => cost.total > 0)
    .map(([key, cost], index) => ({
      name: BLOCK_LABELS[key] || key,
      value: Math.round(cost.total),
      percentage: totalCost > 0 ? (cost.total / totalCost) * 100 : 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-summary-muted text-sm">
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
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: '10px',
              lineHeight: '1.5',
            }}
            formatter={(value, entry: any) => (
              <span style={{ color: 'hsl(var(--summary-foreground))' }}>
                {value} ({entry.payload.percentage.toFixed(0)}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
