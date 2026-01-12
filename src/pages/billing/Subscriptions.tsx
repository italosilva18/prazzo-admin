import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users, Building2, Calendar, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { superadminService } from '@/services/superadminService'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { SubscriptionModal, type Subscription } from '@/components/billing/SubscriptionModal'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
}

const statusLabels: Record<string, string> = {
  active: 'Ativa',
  trial: 'Trial',
  cancelled: 'Cancelada',
  expired: 'Expirada',
  pending: 'Pendente',
}

interface Plan {
  id: string
  name: string
  monthly_price: number
  annual_price: number
}

export default function Subscriptions() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ['subscriptions', search, statusFilter, page],
    queryFn: () =>
      superadminService.getSubscriptions({
        status: statusFilter || undefined,
        page,
        limit: 20,
      }),
  })

  const { data: plansData } = useQuery({
    queryKey: ['plans-list'],
    queryFn: () => superadminService.getPlans({ status: 'active' }),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      superadminService.cancelSubscription(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      setSelectedSubscription(null)
      toast.success('Assinatura cancelada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao cancelar assinatura')
    },
  })

  const upgradeMutation = useMutation({
    mutationFn: ({ id, newPlanId }: { id: string; newPlanId: string }) =>
      superadminService.upgradeSubscription(id, newPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      setSelectedSubscription(null)
      toast.success('Upgrade realizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao fazer upgrade')
    },
  })

  const renewMutation = useMutation({
    mutationFn: (id: string) => superadminService.renewSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      setSelectedSubscription(null)
      toast.success('Assinatura renovada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao renovar assinatura')
    },
  })

  const subscriptions: Subscription[] = subscriptionsData?.data || []
  const pagination = subscriptionsData?.pagination || { total: 0, pages: 1 }
  const plans: Plan[] = plansData?.data || []

  const handleCancel = (id: string, reason: string) => {
    cancelMutation.mutate({ id, reason })
  }

  const handleUpgrade = (id: string, newPlanId: string) => {
    upgradeMutation.mutate({ id, newPlanId })
  }

  const handleRenew = (id: string) => {
    renewMutation.mutate(id)
  }

  // Stats
  const statsData = {
    active: subscriptions.filter((s) => s.status === 'active').length,
    trial: subscriptions.filter((s) => s.status === 'trial').length,
    cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
    expired: subscriptions.filter((s) => s.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie as assinaturas das empresas
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{statsData.active}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{statsData.trial}</p>
              <p className="text-xs text-muted-foreground">Em Trial</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{statsData.cancelled}</p>
              <p className="text-xs text-muted-foreground">Canceladas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{statsData.expired}</p>
              <p className="text-xs text-muted-foreground">Expiradas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="trial">Em Trial</option>
          <option value="cancelled">Canceladas</option>
          <option value="expired">Expiradas</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Plano
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Periodo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Vencimento
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-accent rounded w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-accent rounded w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-accent rounded w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-accent rounded w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-accent rounded w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-accent rounded w-24" />
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  Nenhuma assinatura encontrada
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription) => {
                const daysRemaining = Math.ceil(
                  (new Date(subscription.current_period_end).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
                const isExpiringSoon =
                  subscription.status === 'active' && daysRemaining <= 7 && daysRemaining > 0

                return (
                  <tr key={subscription.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{subscription.company_name}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {subscription.company_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{subscription.plan_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subscription.billing_cycle === 'annual' ? 'Anual' : 'Mensal'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          statusColors[subscription.status]
                        )}
                      >
                        {statusLabels[subscription.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(subscription.current_period_start)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">
                        {formatCurrency(subscription.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className={cn(
                          "text-sm",
                          isExpiringSoon ? "text-yellow-600 font-medium" : "text-muted-foreground"
                        )}
                      >
                        {formatDate(subscription.current_period_end)}
                      </p>
                      {isExpiringSoon && (
                        <p className="text-xs text-yellow-600">{daysRemaining} dias restantes</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSubscription(subscription)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {subscriptions.length} de {pagination.total} assinaturas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 hover:bg-accent transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 hover:bg-accent transition-colors"
              >
                Proxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedSubscription && (
        <SubscriptionModal
          subscription={selectedSubscription}
          availablePlans={plans}
          onClose={() => setSelectedSubscription(null)}
          onCancel={handleCancel}
          onUpgrade={handleUpgrade}
          onRenew={handleRenew}
          isLoading={
            cancelMutation.isPending || upgradeMutation.isPending || renewMutation.isPending
          }
        />
      )}
    </div>
  )
}
