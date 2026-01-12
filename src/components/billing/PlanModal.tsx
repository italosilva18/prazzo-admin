import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Plan } from './PlanCard'

interface PlanFormData {
  name: string
  description: string
  monthly_price: number
  annual_price: number
  features: string[]
  limits: {
    max_users: number | undefined
    max_units: number | undefined
    max_tasks: number | undefined
  }
  is_active: boolean
}

interface PlanModalProps {
  plan?: Plan | null
  onClose: () => void
  onSave: (data: PlanFormData) => void
  isLoading?: boolean
}

const initialFormData: PlanFormData = {
  name: '',
  description: '',
  monthly_price: 0,
  annual_price: 0,
  features: [''],
  limits: {
    max_users: undefined,
    max_units: undefined,
    max_tasks: undefined,
  },
  is_active: true,
}

export function PlanModal({ plan, onClose, onSave, isLoading = false }: PlanModalProps) {
  const [formData, setFormData] = useState<PlanFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
        monthly_price: plan.monthly_price,
        annual_price: plan.annual_price,
        features: plan.features.length > 0 ? plan.features : [''],
        limits: {
          max_users: plan.limits.max_users,
          max_units: plan.limits.max_units,
          max_tasks: plan.limits.max_tasks,
        },
        is_active: plan.is_active,
      })
    }
  }, [plan])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome e obrigatorio'
    }
    if (formData.monthly_price < 0) {
      newErrors.monthly_price = 'Preco mensal deve ser maior ou igual a zero'
    }
    if (formData.annual_price < 0) {
      newErrors.annual_price = 'Preco anual deve ser maior ou igual a zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const cleanedFeatures = formData.features.filter((f) => f.trim() !== '')
      onSave({
        ...formData,
        features: cleanedFeatures,
      })
    }
  }

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Nome do plano *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Profissional"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Descricao
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descricao do plano..."
                rows={2}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Precos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Preco mensal (R$) *
                </label>
                <input
                  type="number"
                  value={formData.monthly_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, monthly_price: parseFloat(e.target.value) || 0 }))
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.monthly_price && (
                  <p className="text-xs text-red-500 mt-1">{errors.monthly_price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Preco anual (R$)
                </label>
                <input
                  type="number"
                  value={formData.annual_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, annual_price: parseFloat(e.target.value) || 0 }))
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.annual_price && (
                  <p className="text-xs text-red-500 mt-1">{errors.annual_price}</p>
                )}
              </div>
            </div>
          </div>

          {/* Limits */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Limites
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Deixe em branco para recursos ilimitados
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Max. usuarios
                </label>
                <input
                  type="number"
                  value={formData.limits.max_users ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      limits: {
                        ...prev.limits,
                        max_users: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    }))
                  }
                  min="0"
                  placeholder="Ilimitado"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Max. unidades
                </label>
                <input
                  type="number"
                  value={formData.limits.max_units ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      limits: {
                        ...prev.limits,
                        max_units: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    }))
                  }
                  min="0"
                  placeholder="Ilimitado"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Max. tarefas/mes
                </label>
                <input
                  type="number"
                  value={formData.limits.max_tasks ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      limits: {
                        ...prev.limits,
                        max_tasks: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    }))
                  }
                  min="0"
                  placeholder="Ilimitado"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recursos
              </h3>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Ex: Relatorios avancados"
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className="text-sm font-medium text-foreground">
              Plano ativo
            </span>
          </div>
        </form>

        {/* Actions */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Salvando...' : plan ? 'Salvar Alteracoes' : 'Criar Plano'}
          </button>
        </div>
      </div>
    </div>
  )
}
