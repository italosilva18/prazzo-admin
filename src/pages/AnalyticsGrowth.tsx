import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Target,
  AlertTriangle,
} from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  MetricCard,
  LineChart,
  BarChart,
} from '@/components/analytics'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AnalyticsGrowth() {
  const { data: growth, isLoading } = useQuery({
    queryKey: ['analytics-growth'],
    queryFn: superadminService.getGrowthMetrics,
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
          <h1 className="text-2xl font-bold text-foreground">Metricas de Crescimento</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  const getChurnTrendIcon = () => {
    if (growth?.churn_trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-red-500" />
    }
    if (growth?.churn_trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-green-500" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/analytics">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metricas de Crescimento</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe o crescimento de usuarios, empresas e receita
          </p>
        </div>
      </div>

      {/* Growth Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Novos Usuarios (30d)"
          value={formatNumber(growth?.new_users_30d || 0)}
          change={growth?.user_growth_rate}
          icon={Users}
          iconBgColor="bg-blue-500"
        />
        <MetricCard
          title="Novas Empresas (30d)"
          value={formatNumber(growth?.new_companies_30d || 0)}
          change={growth?.company_growth_rate}
          icon={Building2}
          iconBgColor="bg-green-500"
        />
        <MetricCard
          title="Taxa de Churn"
          value={`${(growth?.churn_rate || 0).toFixed(1)}%`}
          change={growth?.churn_change}
          icon={AlertTriangle}
          iconBgColor={growth?.churn_rate > 5 ? 'bg-red-500' : 'bg-yellow-500'}
        />
        <MetricCard
          title="Conversao Trial"
          value={`${(growth?.trial_conversion_rate || 0).toFixed(1)}%`}
          change={growth?.conversion_change}
          icon={Target}
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Crescimento de Usuarios
            </h3>
            <Badge variant="secondary">Acumulado</Badge>
          </div>
          <LineChart
            data={growth?.user_growth || []}
            lines={[
              { dataKey: 'total', color: '#3B82F6', name: 'Total Usuarios' },
              { dataKey: 'new', color: '#22C55E', name: 'Novos', dot: false },
            ]}
            xAxisKey="date"
            height={300}
            showLegend={true}
          />
        </div>

        {/* Company Growth */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Crescimento de Empresas
            </h3>
            <Badge variant="secondary">Acumulado</Badge>
          </div>
          <LineChart
            data={growth?.company_growth || []}
            lines={[
              { dataKey: 'total', color: '#8B5CF6', name: 'Total Empresas' },
              { dataKey: 'new', color: '#F59E0B', name: 'Novas', dot: false },
            ]}
            xAxisKey="date"
            height={300}
            showLegend={true}
          />
        </div>
      </div>

      {/* Churn Analysis */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              Analise de Churn
            </h3>
            {getChurnTrendIcon()}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {(growth?.churn_rate || 0).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">Taxa atual</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Empresas Churned (30d)</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {growth?.churned_companies || 0}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Receita Perdida</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatCurrency(growth?.revenue_lost || 0)}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">LTV Medio Churned</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {formatCurrency(growth?.avg_churned_ltv || 0)}
            </p>
          </div>
        </div>
        <BarChart
          data={growth?.churn_history || []}
          bars={[
            { dataKey: 'churned', color: '#EF4444', name: 'Churned' },
            { dataKey: 'retained', color: '#22C55E', name: 'Retidas' },
          ]}
          xAxisKey="month"
          height={250}
        />
      </div>

      {/* Projections */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Projecoes (Proximos 30 dias)
          </h3>
          <Badge variant="outline" className="text-primary border-primary">
            Estimativa
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="p-4 border border-dashed border-primary/30 rounded-lg bg-primary/5">
            <p className="text-sm text-muted-foreground">Usuarios Projetados</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatNumber(growth?.projected_users || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +{growth?.projected_user_growth || 0} novos
            </p>
          </div>
          <div className="p-4 border border-dashed border-primary/30 rounded-lg bg-primary/5">
            <p className="text-sm text-muted-foreground">Empresas Projetadas</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatNumber(growth?.projected_companies || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +{growth?.projected_company_growth || 0} novas
            </p>
          </div>
          <div className="p-4 border border-dashed border-green-500/30 rounded-lg bg-green-500/5">
            <p className="text-sm text-muted-foreground">MRR Projetado</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(growth?.projected_mrr || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +{((growth?.mrr_growth_rate || 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 border border-dashed border-purple-500/30 rounded-lg bg-purple-500/5">
            <p className="text-sm text-muted-foreground">ARR Projetado</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {formatCurrency((growth?.projected_mrr || 0) * 12)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Receita anual
            </p>
          </div>
        </div>
        <LineChart
          data={growth?.projections || []}
          lines={[
            { dataKey: 'users', color: '#3B82F6', name: 'Usuarios' },
            { dataKey: 'companies', color: '#8B5CF6', name: 'Empresas' },
          ]}
          xAxisKey="date"
          height={250}
          showLegend={true}
        />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Funil de Conversao
        </h3>
        <div className="space-y-4">
          {growth?.conversion_funnel?.map((step: any, index: number) => (
            <div key={step.name} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{step.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(step.count)} ({step.rate}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${step.rate}%` }}
                  />
                </div>
              </div>
            </div>
          )) || (
            <p className="text-muted-foreground text-sm text-center py-4">
              Sem dados de funil
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
