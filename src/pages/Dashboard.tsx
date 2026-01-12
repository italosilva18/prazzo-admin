import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Building2, Users, CreditCard, CheckCircle, TrendingUp, Activity } from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function Dashboard() {
  const { t } = useTranslation('dashboard')
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: superadminService.getDashboardStats,
  })

  const StatCard = ({ icon: Icon, label, value, color, subValue }: {
    icon: any
    label: string
    value: string | number
    color: string
    subValue?: string
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subValue && <p className="text-xs text-green-600">{subValue}</p>}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label={t('stats.companies')}
          value={formatNumber(stats?.total_companies || 0)}
          color="bg-blue-500"
          subValue={`${stats?.active_companies || 0} ${t('stats.active')}`}
        />
        <StatCard
          icon={Users}
          label={t('stats.users')}
          value={formatNumber(stats?.total_users || 0)}
          color="bg-green-500"
          subValue={`${stats?.active_users || 0} ${t('stats.activeUsers')}`}
        />
        <StatCard
          icon={CreditCard}
          label={t('stats.mrr')}
          value={formatCurrency(stats?.mrr || 0)}
          color="bg-purple-500"
        />
        <StatCard
          icon={CheckCircle}
          label={t('stats.tasks')}
          value={formatNumber(stats?.total_tasks || 0)}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companies by Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('charts.companiesByPlan')}</h3>
          <div className="space-y-3">
            {stats?.companies_by_plan?.map((item: any) => (
              <div key={item.plan} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{t(`plans.${item.plan || 'free'}`)}</span>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
            )) || <p className="text-gray-500 text-sm">{t('charts.noData')}</p>}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('charts.topCompanies')}</h3>
          <div className="space-y-3">
            {stats?.top_companies?.slice(0, 5).map((company: any) => (
              <div key={company.company_id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{company.company_name}</p>
                  <p className="text-xs text-gray-500">{company.users} {t('stats.users').toLowerCase()}</p>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(company.revenue)}
                </span>
              </div>
            )) || <p className="text-gray-500 text-sm">{t('charts.noData')}</p>}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {t('systemHealth.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats?.system_health?.database_status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">{t('systemHealth.database')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats?.system_health?.api_status === 'operational' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">{t('systemHealth.api')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">{t('systemHealth.cache')}</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{t('systemHealth.uptime')}: {stats?.system_health?.uptime || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
