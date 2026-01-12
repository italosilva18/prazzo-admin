import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineChartProps {
  data: Array<Record<string, any>>
  lines: Array<{
    dataKey: string
    color: string
    name?: string
    strokeWidth?: number
    dot?: boolean
  }>
  xAxisKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => [string, string]
}

export function LineChart({
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  yAxisFormatter,
  tooltipFormatter,
}: LineChartProps) {
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
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: 16 }}
            iconType="line"
          />
        )}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color}
            strokeWidth={line.strokeWidth || 2}
            dot={line.dot !== false ? { fill: line.color, strokeWidth: 2 } : false}
            activeDot={{ r: 6, fill: line.color }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
