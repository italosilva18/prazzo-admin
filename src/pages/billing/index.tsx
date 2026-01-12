import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import {
  CreditCard,
  TrendingUp,
  Users,
  Receipt,
  Package,
  FileText,
} from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BillingStats {
  mrr: number
  arr: number
  active_subscriptions: number
  pending_invoices: number
  pending_amount: number
  overdue_invoices: number
  overdue_amount: number
  total_revenue_month: number
  growth_rate: number
}

const tabs = [
  { id: 'overview', label: 'Visao Geral', icon: TrendingUp, href: '/billing' },
  { id: 'plans', label: 'Planos', icon: Package, href: '/billing/plans' },
  { id: 'subscriptions', label: 'Assinaturas', icon: Users, href: '/billing/subscriptions' },
  { id: 'invoices', label: 'Faturas', icon: FileText, href: '/billing/invoices' },
]

export default function BillingOverview() {
  const location = useLocation()

  const { data: stats, isLoading } = useQuery<BillingStats>({
    queryKey: ['billingStats'],
    queryFn: superadminService.getBillingStats,
  })

  const { data: billingOverview } = useQuery({
    queryKey: ['billing-overview'],
    queryFn: superadminService.getBillingOverview,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Faturamento</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse">
              <div className="h-16 bg-accent rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Faturamento</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats?.mrr || billingOverview?.total_mrr || 0)}</p>
              <p className="text-sm text-muted-foreground">MRR</p>
            </div>
          </div>
          {stats?.growth_rate !== undefined && (
            <p className={cn(
              "text-xs mt-2",
              stats.growth_rate >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {stats.growth_rate >= 0 ? '+' : ''}{stats.growth_rate.toFixed(1)}% vs mes anterior
            </p>
          )}
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats?.arr || billingOverview?.total_arr || 0)}</p>
              <p className="text-sm text-muted-foreground">ARR</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.active_subscriptions || billingOverview?.active_subscriptions || 0}</p>
              <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.pending_invoices || 0}</p>
              <p className="text-sm text-muted-foreground">Faturas Pendentes</p>
            </div>
          </div>
          {stats?.pending_amount && (
            <p className="text-xs text-yellow-600 mt-2">
              {formatCurrency(stats.pending_amount)} a receber
            </p>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.href ||
              (tab.href === '/billing' && location.pathname === '/billing')
            return (
              <Link
                key={tab.id}
                to={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Receita por Plano</h3>
          <div className="space-y-4">
            {billingOverview?.revenue_by_plan?.map((item: any) => (
              <div key={item.plan} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-foreground capitalize">{item.plan || 'free'}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(item.revenue)}</p>
                  <p className="text-xs text-muted-foreground">{item.companies} empresas</p>
                </div>
              </div>
            )) || <p className="text-muted-foreground text-sm">Sem dados</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Pagadores</h3>
          <div className="space-y-4">
            {billingOverview?.top_paying_companies?.slice(0, 5).map((company: any, index: number) => (
              <div key={company.company_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{company.company_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{company.plan || 'free'}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(company.monthly_price)}
                </span>
              </div>
            )) || <p className="text-muted-foreground text-sm">Sem dados</p>}
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats?.overdue_invoices && stats.overdue_invoices > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">
                {stats.overdue_invoices} fatura(s) vencida(s)
              </p>
              <p className="text-sm text-red-700">
                Total em atraso: {formatCurrency(stats.overdue_amount || 0)}
              </p>
            </div>
            <Link
              to="/billing/invoices?status=overdue"
              className="ml-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Ver Faturas
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/billing/plans"
          className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <Package className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-foreground mb-1">Gerenciar Planos</h3>
          <p className="text-sm text-muted-foreground">
            Criar, editar e gerenciar planos de assinatura
          </p>
        </Link>

        <Link
          to="/billing/subscriptions"
          className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <Users className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-foreground mb-1">Assinaturas</h3>
          <p className="text-sm text-muted-foreground">
            Visualizar e gerenciar assinaturas das empresas
          </p>
        </Link>

        <Link
          to="/billing/invoices"
          className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <FileText className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-foreground mb-1">Faturas</h3>
          <p className="text-sm text-muted-foreground">
            Gerenciar faturas e registrar pagamentos
          </p>
        </Link>
      </div>
    </div>
  )
}
