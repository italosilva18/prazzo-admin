import { useQuery } from '@tanstack/react-query'
import { BarChart3, Users, CheckCircle, Building2 } from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatNumber } from '@/lib/utils'

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: superadminService.getAnalyticsOverview,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics?.total_companies || 0)}</p>
              <p className="text-sm text-gray-500">Total Empresas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics?.total_users || 0)}</p>
              <p className="text-sm text-gray-500">Total Usuarios</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics?.total_tasks || 0)}</p>
              <p className="text-sm text-gray-500">Total Tarefas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{(analytics?.completion_rate || 0).toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Taxa Conclusao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Hoje</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Usuarios Ativos</span>
              <span className="text-lg font-medium text-gray-900">{analytics?.active_users_today || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Tarefas Criadas</span>
              <span className="text-lg font-medium text-gray-900">{analytics?.tasks_created_today || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas por Status</h3>
          <div className="space-y-3">
            {analytics?.tasks_by_status?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'active' ? 'bg-blue-500' :
                    item.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(item.count)}</span>
              </div>
            )) || <p className="text-gray-500 text-sm">Sem dados</p>}
          </div>
        </div>
      </div>

      {/* Usage by Company */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso por Empresa</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="pb-3">Empresa</th>
                <th className="pb-3">Usuarios</th>
                <th className="pb-3">Tarefas</th>
                <th className="pb-3">Taxa Conclusao</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics?.usage_by_company?.map((company: any) => (
                <tr key={company.company_id}>
                  <td className="py-3 font-medium text-gray-900">{company.company_name}</td>
                  <td className="py-3 text-gray-600">{company.users_count}</td>
                  <td className="py-3 text-gray-600">{company.tasks_count}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${company.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{company.completion_rate.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">Sem dados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
