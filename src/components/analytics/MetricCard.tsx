import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs periodo anterior',
  icon: Icon,
  iconColor = 'text-white',
  iconBgColor = 'bg-primary',
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="w-12 h-12 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (change === undefined || change === null) return null
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (change === undefined || change === null) return 'text-muted-foreground'
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && change !== null && (
            <div className={cn('flex items-center gap-1 text-xs', getTrendColor())}>
              {getTrendIcon()}
              <span className="font-medium">
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconBgColor)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </div>
  )
}
