import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Package, LayoutGrid, List } from 'lucide-react'
import { toast } from 'sonner'
import { superadminService } from '@/services/superadminService'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { PlanCard, type Plan } from '@/components/billing/PlanCard'
import { PlanModal } from '@/components/billing/PlanModal'

export default function Plans() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans', statusFilter],
    queryFn: () => superadminService.getPlans({ status: statusFilter || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: superadminService.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setShowModal(false)
      toast.success('Plano criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar plano')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      superadminService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setShowModal(false)
      setSelectedPlan(null)
      toast.success('Plano atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar plano')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      superadminService.togglePlanStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Status do plano alterado!')
    },
    onError: () => {
      toast.error('Erro ao alterar status do plano')
    },
  })

  const plans: Plan[] = plansData?.data || []

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowModal(true)
  }

  const handleToggleStatus = (plan: Plan) => {
    toggleStatusMutation.mutate({ id: plan.id, is_active: !plan.is_active })
  }

  const handleSave = (data: any) => {
    if (selectedPlan) {
      updateMutation.mutate({ id: selectedPlan.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedPlan(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os planos de assinatura disponiveis
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Plano
        </button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-accent rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid' ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
            title="Visualizacao em grade"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'table' ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
            title="Visualizacao em tabela"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
              <div className="h-48 bg-accent rounded" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum plano encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro plano de assinatura para comecar.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Plano
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Preco Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Preco Anual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Limites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Assinantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Criado em
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{plan.name}</p>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {formatCurrency(plan.monthly_price)}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {plan.annual_price > 0 ? formatCurrency(plan.annual_price) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="space-y-0.5">
                      <p>{plan.limits.max_users ?? 'Ilimitado'} usuarios</p>
                      <p>{plan.limits.max_units ?? 'Ilimitado'} unidades</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {plan.subscribers_count ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        plan.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {plan.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(plan.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="text-sm text-primary hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleStatus(plan)}
                        className={cn(
                          "text-sm hover:underline",
                          plan.is_active ? "text-red-600" : "text-green-600"
                        )}
                      >
                        {plan.is_active ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PlanModal
          plan={selectedPlan}
          onClose={handleCloseModal}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  )
}
