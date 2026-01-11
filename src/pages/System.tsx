import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Database, Server, HardDrive, AlertTriangle } from 'lucide-react'
import { superadminService } from '@/services/superadminService'
import { toast } from 'sonner'
import { useState } from 'react'

export default function System() {
  const queryClient = useQueryClient()
  const [maintenanceMessage, setMaintenanceMessage] = useState('')

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: superadminService.getSystemHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: superadminService.getSystemConfig,
  })

  const maintenanceMutation = useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) =>
      superadminService.setMaintenanceMode(enabled, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] })
      toast.success('Modo de manutencao atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar modo de manutencao')
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'unhealthy':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (healthLoading || configLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Sistema</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sistema</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.status || 'unknown')}`} />
          <span className="text-sm text-gray-600 capitalize">{health?.status || 'Desconhecido'}</span>
        </div>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Database</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.database?.status || 'unknown')}`} />
          </div>
          <p className="text-sm text-gray-500">
            Latencia: {health?.database?.latency_ms?.toFixed(2) || 0}ms
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">API</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.api?.status || 'unknown')}`} />
          </div>
          <p className="text-sm text-gray-500">
            Status: {health?.api?.status === 'healthy' ? 'Operacional' : 'Problema'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Storage</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.storage?.status || 'unknown')}`} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uso</span>
              <span className="text-gray-900">{health?.storage?.percentage?.toFixed(1) || 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${health?.storage?.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {formatBytes(health?.storage?.used_bytes || 0)} de {formatBytes(health?.storage?.total_bytes || 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Cache</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.cache?.status || 'unknown')}`} />
          </div>
          <p className="text-sm text-gray-500">
            {health?.cache?.message || 'Operacional'}
          </p>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Modo de Manutencao</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Quando ativado, o sistema exibe uma mensagem de manutencao para todos os usuarios.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem de Manutencao
            </label>
            <input
              type="text"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Sistema em manutencao. Voltaremos em breve."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => maintenanceMutation.mutate({ enabled: true, message: maintenanceMessage })}
              disabled={maintenanceMutation.isPending}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              Ativar Manutencao
            </button>
            <button
              onClick={() => maintenanceMutation.mutate({ enabled: false })}
              disabled={maintenanceMutation.isPending}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Desativar Manutencao
            </button>
          </div>
        </div>
      </div>

      {/* System Limits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Max Empresas</p>
            <p className="text-2xl font-bold text-gray-900">{config?.limits?.max_companies || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Max Usuarios/Empresa</p>
            <p className="text-2xl font-bold text-gray-900">{config?.limits?.max_users_per_company || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Max Storage/Empresa</p>
            <p className="text-2xl font-bold text-gray-900">{config?.limits?.max_storage_per_company_mb || 'N/A'} MB</p>
          </div>
        </div>
      </div>
    </div>
  )
}
