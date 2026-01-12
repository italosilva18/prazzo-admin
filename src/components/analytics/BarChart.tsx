import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarChartProps {
  data: Array<Record<string, any>>
  bars: Array<{
    dataKey: string
    color: string
    name?: string
    radius?: number
  }>
  xAxisKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => [string, string]
  stacked?: boolean
}

export function BarChart({
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  yAxisFormatter,
  tooltipFormatter,
  stacked = false,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-muted/30 rounded-lg"
        style={{ height }}
      >
        <p className="text-muted-foreground text-sm">Sem dados disponiveis</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
          formatter={tooltipFormatter}
          cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: 16 }}
            iconType="rect"
          />
        )}
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color}
            radius={bar.radius !== undefined ? bar.radius : [4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
