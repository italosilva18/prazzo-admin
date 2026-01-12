import { useState } from 'react'
import { X, Building2, Calendar, CreditCard, Mail, FileText, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface Invoice {
  id: string
  invoice_number: string
  company_id: string
  company_name: string
  subscription_id: string
  plan_name: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_at?: string
  payment_method?: string
  transaction_id?: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
  notes?: string
  created_at: string
  updated_at: string
}

interface InvoiceModalProps {
  invoice: Invoice
  onClose: () => void
  onMarkPaid?: (id: string, paymentData: { payment_method: string; transaction_id?: string }) => void
  onSendReminder?: (id: string) => void
  onCancel?: (id: string) => void
  isLoading?: boolean
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Paga',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
}

const paymentMethods = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartao de Credito' },
  { value: 'debit_card', label: 'Cartao de Debito' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'boleto', label: 'Boleto' },
]

export function InvoiceModal({
  invoice,
  onClose,
  onMarkPaid,
  onSendReminder,
  onCancel,
  isLoading = false,
}: InvoiceModalProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionId, setTransactionId] = useState('')

  const handleMarkPaid = () => {
    if (onMarkPaid && paymentMethod) {
      onMarkPaid(invoice.id, {
        payment_method: paymentMethod,
        transaction_id: transactionId || undefined,
      })
    }
  }

  const isOverdue = invoice.status === 'pending' && new Date(invoice.due_date) < new Date()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Fatura #{invoice.invoice_number}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Criada em {formatDate(invoice.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Amount */}
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div>
              <span className={cn("text-xs font-medium px-3 py-1 rounded-full", statusColors[invoice.status])}>
                {statusLabels[invoice.status]}
              </span>
              {isOverdue && invoice.status === 'pending' && (
                <span className="ml-2 text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-800">
                  Vencida
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor total</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(invoice.amount)}</p>
            </div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Empresa</span>
              </div>
              <p className="font-medium text-foreground">{invoice.company_name}</p>
              <p className="text-xs text-muted-foreground mt-1">ID: {invoice.company_id}</p>
            </div>
            <div className="bg-accent/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Plano</span>
              </div>
              <p className="font-medium text-foreground">{invoice.plan_name}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Vencimento</span>
              </div>
              <p className={cn("font-medium", isOverdue ? "text-red-600" : "text-foreground")}>
                {formatDate(invoice.due_date)}
              </p>
            </div>
            {invoice.paid_at && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700">Pago em</span>
                </div>
                <p className="font-medium text-green-800">{formatDate(invoice.paid_at)}</p>
              </div>
            )}
          </div>

          {/* Payment info if paid */}
          {invoice.status === 'paid' && (invoice.payment_method || invoice.transaction_id) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Dados do pagamento</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {invoice.payment_method && (
                  <div>
                    <span className="text-green-700">Metodo: </span>
                    <span className="font-medium text-green-800">
                      {paymentMethods.find((m) => m.value === invoice.payment_method)?.label || invoice.payment_method}
                    </span>
                  </div>
                )}
                {invoice.transaction_id && (
                  <div>
                    <span className="text-green-700">Transacao: </span>
                    <span className="font-medium text-green-800">{invoice.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Itens da fatura
            </h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-accent/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descricao</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Qtd</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor Unit.</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-foreground">{item.description}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-accent/30">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-foreground">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {formatCurrency(invoice.amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-accent/30 rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Observacoes</p>
              <p className="text-sm text-foreground">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Form */}
          {showPaymentForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
              <p className="text-sm font-medium text-green-800">Registrar pagamento</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    Metodo de pagamento *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    ID da transacao (opcional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Ex: TXN123456"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarkPaid}
                  disabled={!paymentMethod || isLoading}
                  className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!showPaymentForm && (
          <div className="p-6 border-t border-border flex flex-wrap gap-2">
            {(invoice.status === 'pending' || invoice.status === 'overdue') && onMarkPaid && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como Pago
              </button>
            )}
            {(invoice.status === 'pending' || invoice.status === 'overdue') && onSendReminder && (
              <button
                onClick={() => onSendReminder(invoice.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 disabled:opacity-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Enviar Lembrete
              </button>
            )}
            {invoice.status === 'pending' && onCancel && (
              <button
                onClick={() => onCancel(invoice.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto"
              >
                Cancelar Fatura
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
