import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  Building2,
} from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatNumber, formatDate } from '@/lib/utils'
import {
  MetricCard,
  LineChart,
  BarChart,
  DateRangePicker,
  type DateRange,
} from '@/components/analytics'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AnalyticsUsage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  const { data: usage, isLoading } = useQuery({
    queryKey: ['analytics-usage', dateRange],
    queryFn: () => superadminService.getUsageMetrics(dateRange),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/analytics">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Metricas de Uso</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <MetricCard
              key={i}
              title=""
              value=""
              icon={Users}
              loading={true}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/analytics">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Metricas de Uso</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Analise detalhada de engajamento e atividade
            </p>
          </div>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* DAU/WAU/MAU Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="DAU (Diario)"
          value={formatNumber(usage?.dau || 0)}
          change={usage?.dau_change}
          icon={Users}
          iconBgColor="bg-blue-500"
        />
        <MetricCard
          title="WAU (Semanal)"
          value={formatNumber(usage?.wau || 0)}
          change={usage?.wau_change}
          icon={Calendar}
          iconBgColor="bg-green-500"
        />
        <MetricCard
          title="MAU (Mensal)"
          value={formatNumber(usage?.mau || 0)}
          change={usage?.mau_change}
          icon={Clock}
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* Engagement Ratio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">DAU/MAU Ratio</h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {((usage?.dau || 0) / (usage?.mau || 1) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Stickiness do produto
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Sessao Media</h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {usage?.avg_session_duration || '0'}min
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Duracao media por sessao
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Acoes por Sessao</h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {usage?.actions_per_session?.toFixed(1) || '0'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Media de acoes realizadas
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DAU Chart */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Usuarios Ativos Diarios
          </h3>
          <LineChart
            data={usage?.dau_chart || []}
            lines={[
              { dataKey: 'value', color: '#3B82F6', name: 'DAU' },
            ]}
            xAxisKey="date"
            height={300}
          />
        </div>

        {/* Peak Hours */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Horarios de Pico
          </h3>
          <BarChart
            data={usage?.peak_hours || []}
            bars={[
              { dataKey: 'activity', color: '#2DD4B7', name: 'Atividade' },
            ]}
            xAxisKey="hour"
            height={300}
            showLegend={false}
          />
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Empresas Mais Ativas
          </h3>
          <Badge variant="secondary">Top 10</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase border-b border-border">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Empresa</th>
                <th className="pb-3 font-medium">Usuarios Ativos</th>
                <th className="pb-3 font-medium">Tarefas/Dia</th>
                <th className="pb-3 font-medium">Score Atividade</th>
                <th className="pb-3 font-medium">Ultima Atividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usage?.top_companies?.map((company: any, index: number) => (
                <tr key={company.id} className="hover:bg-muted/50">
                  <td className="py-3 text-muted-foreground font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">
                        {company.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatNumber(company.active_users)}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {company.tasks_per_day?.toFixed(1) || '0'}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${company.activity_score}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {company.activity_score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground text-sm">
                    {company.last_activity ? formatDate(company.last_activity) : '-'}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    Sem dados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribuicao por Dia da Semana
          </h3>
          <BarChart
            data={usage?.weekday_distribution || []}
            bars={[
              { dataKey: 'value', color: '#8B5CF6', name: 'Atividade' },
            ]}
            xAxisKey="day"
            height={250}
            showLegend={false}
          />
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Retencao de Usuarios
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dia 1</span>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${usage?.retention?.day1 || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {usage?.retention?.day1 || 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dia 7</span>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${usage?.retention?.day7 || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {usage?.retention?.day7 || 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dia 30</span>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${usage?.retention?.day30 || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {usage?.retention?.day30 || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
