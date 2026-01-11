import { useQuery } from '@tanstack/react-query'
import { CreditCard, TrendingUp, Building2 } from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatCurrency } from '@/lib/utils'

export default function Billing() {
  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing-overview'],
    queryFn: superadminService.getBillingOverview,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Faturamento</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Faturamento</h1>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(billing?.total_mrr || 0)}</p>
              <p className="text-sm text-gray-500">MRR (Receita Mensal)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(billing?.total_arr || 0)}</p>
              <p className="text-sm text-gray-500">ARR (Receita Anual)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{billing?.active_subscriptions || 0}</p>
              <p className="text-sm text-gray-500">Assinaturas Ativas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Plano</h3>
          <div className="space-y-4">
            {billing?.revenue_by_plan?.map((item: any) => (
              <div key={item.plan} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600 capitalize">{item.plan || 'free'}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(item.revenue)}</p>
                  <p className="text-xs text-gray-500">{item.companies} empresas</p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">Sem dados</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pagadores</h3>
          <div className="space-y-4">
            {billing?.top_paying_companies?.slice(0, 5).map((company: any, index: number) => (
              <div key={company.company_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{company.company_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{company.plan || 'free'}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(company.monthly_price)}
                </span>
              </div>
            )) || <p className="text-gray-500 text-sm">Sem dados</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
