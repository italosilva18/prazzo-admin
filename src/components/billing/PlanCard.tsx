import { Check, Users, Building, ListTodo, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface Plan {
  id: string
  name: string
  description?: string
  monthly_price: number
  annual_price: number
  features: string[]
  limits: {
    max_users?: number
    max_units?: number
    max_tasks?: number
  }
  is_active: boolean
  subscribers_count?: number
  created_at: string
  updated_at: string
}

interface PlanCardProps {
  plan: Plan
  onEdit?: (plan: Plan) => void
  onToggleStatus?: (plan: Plan) => void
  featured?: boolean
}

export function PlanCard({ plan, onEdit, onToggleStatus, featured = false }: PlanCardProps) {
  const monthlyDiscount = plan.annual_price > 0
    ? Math.round((1 - (plan.annual_price / 12) / plan.monthly_price) * 100)
    : 0

  return (
    <div
      className={cn(
        "relative bg-card rounded-xl border border-border p-6 transition-all hover:shadow-lg",
        featured && "border-primary shadow-md",
        !plan.is_active && "opacity-60"
      )}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Mais Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
          {plan.description && (
            <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(plan)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title="Editar plano"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(plan)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title={plan.is_active ? "Desativar plano" : "Ativar plano"}
            >
              {plan.is_active ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(plan.monthly_price)}
          </span>
          <span className="text-sm text-muted-foreground">/mes</span>
        </div>
        {plan.annual_price > 0 && (
          <div className="mt-1">
            <span className="text-sm text-muted-foreground">
              ou {formatCurrency(plan.annual_price)}/ano
            </span>
            {monthlyDiscount > 0 && (
              <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                -{monthlyDiscount}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Limits */}
      <div className="space-y-2 mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">
            {plan.limits.max_users ? `${plan.limits.max_users} usuarios` : 'Usuarios ilimitados'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Building className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">
            {plan.limits.max_units ? `${plan.limits.max_units} unidades` : 'Unidades ilimitadas'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ListTodo className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">
            {plan.limits.max_tasks ? `${plan.limits.max_tasks} tarefas/mes` : 'Tarefas ilimitadas'}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recursos inclusos
        </p>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span className="text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {/* Subscribers count */}
      {plan.subscribers_count !== undefined && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{plan.subscribers_count}</span> assinantes ativos
          </p>
        </div>
      )}

      {/* Status badge */}
      <div className="absolute top-4 right-4">
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
      </div>
    </div>
  )
}
