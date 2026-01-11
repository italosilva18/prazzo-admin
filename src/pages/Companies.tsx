import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Search, Plus, MoreVertical } from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function Companies() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search, statusFilter, page],
    queryFn: () => superadminService.getCompanies({ search, status: statusFilter, page, limit: 20 }),
  })

  const companies = data?.data || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Empresa
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="suspended">Suspenso</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Mensal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  Nenhuma empresa encontrada
                </td>
              </tr>
            ) : (
              companies.map((company: any) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize">
                      {company.plan || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{company.users_count}</td>
                  <td className="px-6 py-4 text-gray-900">{formatCurrency(company.monthly_price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      company.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : company.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {company.status === 'active' ? 'Ativo' : company.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(company.created_at)}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {companies.length} de {pagination.total} empresas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Proxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
