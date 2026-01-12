import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  FileText,
  Building2,
  Calendar,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { superadminService } from '@/services/superadminService'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { InvoiceModal, type Invoice } from '@/components/billing/InvoiceModal'

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

const statusIcons: Record<string, any> = {
  pending: Clock,
  paid: CheckCircle,
  overdue: AlertTriangle,
  cancelled: XCircle,
}

export default function Invoices() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter, page],
    queryFn: () =>
      superadminService.getInvoices({
        status: statusFilter || undefined,
        page,
        limit: 20,
      }),
  })

  const markPaidMutation = useMutation({
    mutationFn: ({
      id,
      paymentData,
    }: {
      id: string
      paymentData: { payment_method: string; transaction_id?: string }
    }) => superadminService.markInvoicePaid(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billingStats'] })
      setSelectedInvoice(null)
      toast.success('Pagamento registrado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento')
    },
  })

  const sendReminderMutation = useMutation({
    mutationFn: (id: string) => superadminService.sendInvoiceReminder(id),
    onSuccess: () => {
      toast.success('Lembrete enviado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao enviar lembrete')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => superadminService.cancelInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setSelectedInvoice(null)
      toast.success('Fatura cancelada!')
    },
    onError: () => {
      toast.error('Erro ao cancelar fatura')
    },
  })

  const invoices: Invoice[] = invoicesData?.data || []
  const pagination = invoicesData?.pagination || { total: 0, pages: 1 }

  const handleMarkPaid = (
    id: string,
    paymentData: { payment_method: string; transaction_id?: string }
  ) => {
    markPaidMutation.mutate({ id, paymentData })
  }

  const handleSendReminder = (id: string) => {
    sendReminderMutation.mutate(id)
  }

  const handleCancel = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta fatura?')) {
      cancelMutation.mutate(id)
    }
  }

  // Stats
  const totalPending = invoices
    .filter((i) => i.status === 'pending')
    .reduce((acc, i) => acc + i.amount, 0)
  const totalOverdue = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((acc, i) => acc + i.amount, 0)
  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Faturas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie faturas e registre pagamentos
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold">
                {invoices.filter((i) => i.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">{formatCurrency(totalPending)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold">
                {invoices.filter((i) => i.status === 'overdue').length}
              </p>
              <p className="text-xs text-muted-foreground">Vencidas</p>
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">{formatCurrency(totalOverdue)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">
                {invoices.filter((i) => i.status === 'paid').length}
              </p>
              <p className="text-xs text-muted-foreground">Pagas</p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">{formatCurrency(totalPaid)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{invoices.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
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
            placeholder="Buscar por empresa ou numero..."
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
          <option value="pending">Pendentes</option>
          <option value="paid">Pagas</option>
          <option value="overdue">Vencidas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Fatura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Vencimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Pago em
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-accent rounded w-24" />
                  </td>
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
                    <div className="h-4 bg-accent rounded w-24" />
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  Nenhuma fatura encontrada
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const StatusIcon = statusIcons[invoice.status] || FileText
                const isOverdue =
                  invoice.status === 'pending' && new Date(invoice.due_date) < new Date()

                return (
                  <tr key={invoice.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            invoice.status === 'paid'
                              ? "bg-green-100"
                              : invoice.status === 'overdue' || isOverdue
                              ? "bg-red-100"
                              : "bg-yellow-100"
                          )}
                        >
                          <StatusIcon
                            className={cn(
                              "w-4 h-4",
                              invoice.status === 'paid'
                                ? "text-green-600"
                                : invoice.status === 'overdue' || isOverdue
                                ? "text-red-600"
                                : "text-yellow-600"
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">#{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">{invoice.plan_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{invoice.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          isOverdue && invoice.status === 'pending'
                            ? statusColors['overdue']
                            : statusColors[invoice.status]
                        )}
                      >
                        {isOverdue && invoice.status === 'pending'
                          ? 'Vencida'
                          : statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span
                          className={cn(
                            isOverdue && invoice.status === 'pending'
                              ? "text-red-600 font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatDate(invoice.due_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {invoice.paid_at ? formatDate(invoice.paid_at) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
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
              Mostrando {invoices.length} de {pagination.total} faturas
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
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onMarkPaid={handleMarkPaid}
          onSendReminder={handleSendReminder}
          onCancel={handleCancel}
          isLoading={
            markPaidMutation.isPending ||
            sendReminderMutation.isPending ||
            cancelMutation.isPending
          }
        />
      )}
    </div>
  )
}
