import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users,
  Activity,
  CheckCircle,
  Target,
  ArrowRight,
  TrendingUp,
  Building2,
} from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatNumber } from '@/lib/utils'
import {
  MetricCard,
  LineChart,
  BarChart,
  PieChart,
  DateRangePicker,
  type DateRange,
} from '@/components/analytics'
import { Button } from '@/components/ui/button'

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-overview', dateRange],
    queryFn: () => superadminService.getAnalyticsOverview(dateRange),
  })

  const { data: chartData, isLoading: chartsLoading } = useQuery({
    queryKey: ['analytics-charts', dateRange],
    queryFn: () => superadminService.getChartData(dateRange),
  })

  const quickLinks = [
    {
      to: '/analytics/usage',
      icon: Activity,
      label: 'Metricas de Uso',
      description: 'DAU, WAU, MAU e horarios de pico',
    },
    {
      to: '/analytics/growth',
      icon: TrendingUp,
      label: 'Crescimento',
      description: 'Usuarios, empresas e projecoes',
    },
    {
      to: '/analytics/companies',
      icon: Building2,
      label: 'Ranking Empresas',
      description: 'Empresas mais ativas',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <div className="w-[180px] h-10 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visao geral de metricas e desempenho
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Usuarios"
          value={formatNumber(analytics?.total_users || 0)}
          change={analytics?.user_change}
          icon={Users}
          iconBgColor="bg-blue-500"
        />
        <MetricCard
          title="Ativos Hoje"
          value={formatNumber(analytics?.active_today || 0)}
          change={analytics?.active_change}
          icon={Activity}
          iconBgColor="bg-green-500"
        />
        <MetricCard
          title="Tarefas Criadas"
          value={formatNumber(analytics?.tasks_created || 0)}
          change={analytics?.tasks_change}
          icon={CheckCircle}
          iconBgColor="bg-purple-500"
        />
        <MetricCard
          title="Taxa de Conclusao"
          value={`${(analytics?.completion_rate || 0).toFixed(1)}%`}
          change={analytics?.completion_change}
          icon={Target}
          iconBgColor="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users Chart */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Usuarios Ativos
            </h3>
            <span className="text-xs text-muted-foreground">
              Ultimos {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} dias
            </span>
          </div>
          {chartsLoading ? (
            <div className="h-[300px] bg-muted/30 rounded animate-pulse" />
          ) : (
            <LineChart
              data={chartData?.active_users_chart || []}
              lines={[
                { dataKey: 'value', color: '#2DD4B7', name: 'Usuarios Ativos' },
              ]}
              xAxisKey="date"
              height={300}
            />
          )}
        </div>

        {/* Tasks Chart */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Tarefas Criadas vs Concluidas
            </h3>
            <span className="text-xs text-muted-foreground">Por dia</span>
          </div>
          {chartsLoading ? (
            <div className="h-[300px] bg-muted/30 rounded animate-pulse" />
          ) : (
            <BarChart
              data={chartData?.tasks_chart || []}
              bars={[
                { dataKey: 'created', color: '#3B82F6', name: 'Criadas' },
                { dataKey: 'completed', color: '#22C55E', name: 'Concluidas' },
              ]}
              xAxisKey="date"
              height={300}
            />
          )}
        </div>
      </div>

      {/* Distribution and Quick Links Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribuicao por Plano
          </h3>
          {chartsLoading ? (
            <div className="h-[280px] bg-muted/30 rounded animate-pulse" />
          ) : (
            <PieChart
              data={chartData?.plans_distribution || []}
              height={280}
              innerRadius={50}
              outerRadius={90}
            />
          )}
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Explorar Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Atividade Hoje
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Usuarios Ativos</span>
              <span className="text-lg font-medium text-foreground">
                {formatNumber(analytics?.active_today || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Tarefas Criadas</span>
              <span className="text-lg font-medium text-foreground">
                {formatNumber(analytics?.tasks_created_today || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Tarefas Concluidas</span>
              <span className="text-lg font-medium text-foreground">
                {formatNumber(analytics?.tasks_completed_today || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Tarefas por Status
          </h3>
          <div className="space-y-3">
            {analytics?.tasks_by_status?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.status === 'completed'
                        ? 'bg-green-500'
                        : item.status === 'active'
                          ? 'bg-blue-500'
                          : item.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-sm text-muted-foreground capitalize">
                    {item.status}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatNumber(item.count)}
                </span>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm">Sem dados</p>
            )}
          </div>
        </div>
      </div>

      {/* Usage by Company */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Top Empresas por Uso
          </h3>
          <Button variant="outline" size="sm" asChild>
            <Link to="/analytics/companies">
              Ver todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase border-b border-border">
                <th className="pb-3 font-medium">Empresa</th>
                <th className="pb-3 font-medium">Usuarios</th>
                <th className="pb-3 font-medium">Tarefas</th>
                <th className="pb-3 font-medium">Taxa Conclusao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analytics?.usage_by_company?.slice(0, 5).map((company: any) => (
                <tr key={company.company_id} className="hover:bg-muted/50">
                  <td className="py-3 font-medium text-foreground">
                    {company.company_name}
                  </td>
                  <td className="py-3 text-muted-foreground">{company.users_count}</td>
                  <td className="py-3 text-muted-foreground">{company.tasks_count}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${company.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {company.completion_rate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    Sem dados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
