import { useState } from 'react'
import { X, Building2, Calendar, CreditCard, AlertTriangle, ArrowUpCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface Subscription {
  id: string
  company_id: string
  company_name: string
  plan_id: string
  plan_name: string
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'pending'
  billing_cycle: 'monthly' | 'annual'
  current_period_start: string
  current_period_end: string
  trial_end?: string
  cancelled_at?: string
  cancel_reason?: string
  amount: number
  created_at: string
  updated_at: string
}

interface Plan {
  id: string
  name: string
  monthly_price: number
  annual_price: number
}

interface SubscriptionModalProps {
  subscription: Subscription
  availablePlans?: Plan[]
  onClose: () => void
  onCancel?: (id: string, reason: string) => void
  onUpgrade?: (id: string, newPlanId: string) => void
  onRenew?: (id: string) => void
  isLoading?: boolean
}

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

export function SubscriptionModal({
  subscription,
  availablePlans = [],
  onClose,
  onCancel,
  onUpgrade,
  onRenew,
  isLoading = false,
}: SubscriptionModalProps) {
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [showUpgradeForm, setShowUpgradeForm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')

  const handleCancel = () => {
    if (onCancel && cancelReason.trim()) {
      onCancel(subscription.id, cancelReason)
    }
  }

  const handleUpgrade = () => {
    if (onUpgrade && selectedPlanId) {
      onUpgrade(subscription.id, selectedPlanId)
    }
  }

  const daysRemaining = Math.ceil(
    (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Detalhes da Assinatura</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{subscription.company_name}</h3>
              <p className="text-sm text-muted-foreground">ID: {subscription.company_id}</p>
            </div>
            <span className={cn("text-xs font-medium px-3 py-1 rounded-full", statusColors[subscription.status])}>
              {statusLabels[subscription.status]}
            </span>
          </div>

          {/* Plan Info */}
          <div className="bg-accent/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Plano atual</span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {subscription.billing_cycle === 'annual' ? 'Anual' : 'Mensal'}
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">{subscription.plan_name}</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatCurrency(subscription.amount)}
              <span className="text-sm font-normal text-muted-foreground">
                /{subscription.billing_cycle === 'annual' ? 'ano' : 'mes'}
              </span>
            </p>
          </div>

          {/* Period Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Inicio do periodo</span>
              </div>
              <p className="font-medium text-foreground">
                {formatDate(subscription.current_period_start)}
              </p>
            </div>
            <div className="bg-accent/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Fim do periodo</span>
              </div>
              <p className="font-medium text-foreground">
                {formatDate(subscription.current_period_end)}
              </p>
              {subscription.status === 'active' && daysRemaining <= 7 && daysRemaining > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  {daysRemaining} dias restantes
                </p>
              )}
            </div>
          </div>

          {/* Trial info */}
          {subscription.trial_end && subscription.status === 'trial' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Trial termina em {formatDate(subscription.trial_end)}
                </p>
              </div>
            </div>
          )}

          {/* Cancellation info */}
          {subscription.cancelled_at && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-1">
                Cancelada em {formatDate(subscription.cancelled_at)}
              </p>
              {subscription.cancel_reason && (
                <p className="text-sm text-red-700">
                  Motivo: {subscription.cancel_reason}
                </p>
              )}
            </div>
          )}

          {/* Cancel Form */}
          {showCancelForm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-red-800">Cancelar assinatura</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivo do cancelamento..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason.trim() || isLoading}
                  className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          )}

          {/* Upgrade Form */}
          {showUpgradeForm && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Fazer upgrade do plano</p>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Selecione um plano</option>
                {availablePlans
                  .filter((p) => p.id !== subscription.plan_id)
                  .map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {formatCurrency(plan.monthly_price)}/mes
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpgradeForm(false)}
                  className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={!selectedPlanId || isLoading}
                  className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Confirmar Upgrade
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!showCancelForm && !showUpgradeForm && (
          <div className="p-6 border-t border-border flex flex-wrap gap-2">
            {subscription.status === 'active' && onUpgrade && availablePlans.length > 0 && (
              <button
                onClick={() => setShowUpgradeForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Upgrade
              </button>
            )}
            {(subscription.status === 'expired' || subscription.status === 'cancelled') && onRenew && (
              <button
                onClick={() => onRenew(subscription.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Renovar
              </button>
            )}
            {subscription.status === 'active' && onCancel && (
              <button
                onClick={() => setShowCancelForm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-auto"
              >
                Cancelar Assinatura
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
