import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  CheckSquare,
  Activity,
  ArrowLeft,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Search,
  AlertCircle,
} from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatNumber, formatDate } from '@/lib/utils'
import {
  DateRangePicker,
  type DateRange,
} from '@/components/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type SortField = 'users' | 'tasks' | 'activity' | 'last_activity'
type SortOrder = 'asc' | 'desc'

export default function AnalyticsCompanies() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [sortField, setSortField] = useState<SortField>('activity')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-companies', dateRange, sortField, sortOrder],
    queryFn: () =>
      superadminService.getCompanyRanking({
        period: dateRange,
        sortBy: sortField,
        sortOrder,
      }),
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'churn_risk':
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Risco
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredCompanies = data?.companies?.filter((company: any) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/analytics">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Ranking de Empresas</h1>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/analytics">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ranking de Empresas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredCompanies.length} empresas no periodo selecionado
            </p>
          </div>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(data?.summary?.total_companies || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Empresas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(data?.summary?.active_companies || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(data?.summary?.at_risk || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Risco de Churn</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {(data?.summary?.avg_completion_rate || 0).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Taxa Media Conclusao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase border-b border-border bg-muted/30">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => handleSort('users')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Usuarios
                    {getSortIcon('users')}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => handleSort('tasks')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Tarefas
                    {getSortIcon('tasks')}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => handleSort('activity')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Atividade
                    {getSortIcon('activity')}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => handleSort('last_activity')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Ultima Acao
                    {getSortIcon('last_activity')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company: any, index: number) => (
                  <tr
                    key={company.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/companies?id=${company.id}`)}
                  >
                    <td className="px-4 py-4 text-muted-foreground font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {company.plan || 'Free'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {formatNumber(company.users_count)}
                        </span>
                        {company.active_users !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({company.active_users} ativos)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {formatNumber(company.tasks_count)}
                        </span>
                        <span className="text-xs text-green-600">
                          ({company.completion_rate?.toFixed(0) || 0}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              company.activity_score >= 70
                                ? 'bg-green-500'
                                : company.activity_score >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${company.activity_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {company.activity_score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(company.status)}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground text-sm">
                      {company.last_activity
                        ? formatDate(company.last_activity)
                        : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    {search
                      ? 'Nenhuma empresa encontrada com esse termo'
                      : 'Nenhuma empresa disponivel'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        {filteredCompanies.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredCompanies.length} de {data?.total || filteredCompanies.length} empresas
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Proximo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
