import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superadminService } from '@/services/superadminService'
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Building2,
  ChevronRight
} from 'lucide-react'

interface Ticket {
  id: string
  company_id: string
  company_name: string
  subject: string
  status: string
  priority: string
  replies_count: number
  created_at: string
  updated_at: string
}

interface TicketDetail {
  id: string
  company_id: string
  company_name: string
  subject: string
  description: string
  status: string
  priority: string
  replies: Array<{
    id: string
    user_id: string
    user_name: string
    message: string
    is_admin: boolean
    created_at: string
  }>
  created_at: string
  updated_at: string
}

interface TicketStats {
  total_tickets: number
  open_tickets: number
  in_progress_tickets: number
  resolved_tickets: number
  closed_tickets: number
  by_priority: Array<{ priority: string; count: number }>
  by_company: Array<{ company_id: string; company_name: string; open_count: number; total_count: number }>
  avg_response_time: string
}

const statusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export default function Support() {
  const queryClient = useQueryClient()
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const { data: stats } = useQuery<TicketStats>({
    queryKey: ['supportStats'],
    queryFn: superadminService.getSupportStats,
  })

  const { data: ticketsData } = useQuery({
    queryKey: ['tickets', statusFilter, priorityFilter],
    queryFn: () => superadminService.getTickets({ status: statusFilter || undefined, priority: priorityFilter || undefined }),
  })

  const { data: ticketDetail, isLoading: loadingDetail } = useQuery<TicketDetail>({
    queryKey: ['ticketDetail', selectedTicket],
    queryFn: () => superadminService.getTicketDetail(selectedTicket!),
    enabled: !!selectedTicket,
  })

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      superadminService.replyTicket(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketDetail', selectedTicket] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setReplyMessage('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; priority?: string } }) =>
      superadminService.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketDetail', selectedTicket] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['supportStats'] })
    },
  })

  const tickets: Ticket[] = ticketsData?.data || []

  const handleReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return
    replyMutation.mutate({ id: selectedTicket, message: replyMessage })
  }

  const handleStatusChange = (status: string) => {
    if (!selectedTicket) return
    updateMutation.mutate({ id: selectedTicket, data: { status } })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Suporte</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.open_tickets || 0}</p>
              <p className="text-sm text-muted-foreground">Abertos</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.in_progress_tickets || 0}</p>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.resolved_tickets || 0}</p>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.closed_tickets || 0}</p>
              <p className="text-sm text-muted-foreground">Fechados</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total_tickets || 0}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold mb-3">Tickets</h2>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 bg-background"
              >
                <option value="">Todos Status</option>
                <option value="open">Aberto</option>
                <option value="in_progress">Em Andamento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 bg-background"
              >
                <option value="">Todas Prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum ticket encontrado</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                    selectedTicket === ticket.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{ticket.company_name}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status] || ticket.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}>
                      {priorityLabels[ticket.priority] || ticket.priority}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {ticket.replies_count} resp.
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          {!selectedTicket ? (
            <div className="h-full flex items-center justify-center text-muted-foreground p-8">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione um ticket para ver os detalhes</p>
              </div>
            </div>
          ) : loadingDetail ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ticketDetail ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">{ticketDetail.subject}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{ticketDetail.company_name}</span>
                      <span className="text-xs">•</span>
                      <span>{new Date(ticketDetail.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={ticketDetail.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`text-sm px-3 py-1.5 rounded-lg border-0 ${statusColors[ticketDetail.status]}`}
                    >
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {/* Original message */}
                <div className="bg-accent/30 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Mensagem Original</p>
                  <p className="text-sm text-muted-foreground">{ticketDetail.description}</p>
                </div>

                {/* Replies */}
                {ticketDetail.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded-lg p-4 ${
                      reply.is_admin ? 'bg-primary/10 ml-8' : 'bg-accent/30 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">
                        {reply.user_name}
                        {reply.is_admin && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm">{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    placeholder="Digite sua resposta..."
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || replyMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
