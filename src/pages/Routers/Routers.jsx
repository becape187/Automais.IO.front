import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Plus, Search, Trash2, Edit, AlertCircle, Download, Wifi, WifiOff } from 'lucide-react'
import { useRouters, useDeleteRouter } from '../../hooks/useRouters'
import RouterModal from '../../components/Modal/RouterModal'
import { routersApi } from '../../services/routersApi'
import { useSignalR } from '../../hooks/useSignalR'
import clsx from 'clsx'

const statusLabels = {
  Online: { label: 'Online', color: 'badge-success' },
  Offline: { label: 'Offline', color: 'badge-gray' },
  Maintenance: { label: 'Manutenção', color: 'badge-warning' },
  Error: { label: 'Erro', color: 'badge-error' },
}

export default function Routers() {
  const navigate = useNavigate()
  const { data: routers, isLoading, error } = useRouters()
  const deleteRouter = useDeleteRouter()
  const { isConnected: isSignalRConnected } = useSignalR('RouterStatusChanged', () => {
    // Callback vazio - o useRouters já cuida da atualização
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRouter, setSelectedRouter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAdd = () => {
    setSelectedRouter(null)
    setIsModalOpen(true)
  }

  const handleEdit = (router) => {
    setSelectedRouter(router)
    setIsModalOpen(true)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja remover o router "${name}"?`)) {
      try {
        await deleteRouter.mutateAsync(id)
      } catch (error) {
        alert(error.message || 'Erro ao remover router')
      }
    }
  }

  const handleDownloadConfig = async (routerId, routerName) => {
    try {
      await routersApi.downloadVpnConfig(routerId)
    } catch (error) {
        alert(error.message || 'Erro ao baixar configuração VPN')
    }
  }

  const filteredRouters = routers?.filter((router) =>
    router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    router.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando routers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Erro ao carregar routers: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Routers</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie seus routers MikroTik
            </p>
          </div>
          {/* Indicador de conexão SignalR */}
          <div className="flex items-center gap-2" title={isSignalRConnected ? 'Atualização em tempo real ativa' : 'Atualização em tempo real desconectada'}>
            {isSignalRConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-xs text-gray-500">
              {isSignalRConnected ? 'Tempo real' : 'Offline'}
            </span>
          </div>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Adicionar Router
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">
            {routers?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total de Routers</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">
            {routers?.filter((r) => r.status === 'Online').length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Online</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-600">
            {routers?.filter((r) => r.status === 'Offline').length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Offline</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-600">
            {routers?.filter((r) => r.status === 'Error').length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Com Erro</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou número de série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 input"
          />
        </div>
      </div>

      {/* Routers Grid */}
      {filteredRouters.length === 0 ? (
        <div className="card p-12 text-center">
          <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum router encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Tente ajustar sua busca'
              : 'Comece adicionando seu primeiro router'}
          </p>
          {!searchTerm && (
            <button onClick={handleAdd} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Adicionar Router
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRouters.map((router) => (
            <div 
              key={router.id} 
              className="card p-6 cursor-pointer hover:border-primary-500 hover:border-2 transition-all"
              onClick={() => navigate(`/routers/${router.id}/management`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Radio className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {router.name}
                    </h3>
                    {router.serialNumber && (
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {router.serialNumber}
                      </p>
                    )}
                    {router.model && (
                      <p className="text-sm text-gray-600 mt-1">
                        {router.model}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'badge',
                      statusLabels[router.status]?.color || 'badge-gray'
                    )}
                  >
                    {statusLabels[router.status]?.label || router.status}
                  </span>
                </div>
              </div>

              {router.description && (
                <p className="text-sm text-gray-600 mb-4">{router.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Firmware</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {router.firmwareVersion || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Última Atividade</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {router.lastSeenAt
                      ? new Date(router.lastSeenAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Nunca'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                {router.vpnNetworkId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadConfig(router.id, router.name)
                    }}
                    className="btn btn-secondary btn-sm"
                    title="Baixar configuração VPN"
                  >
                    <Download className="w-4 h-4" />
                    Config VPN
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(router)
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(router.id, router.name)
                  }}
                  className="btn btn-error btn-sm"
                  disabled={deleteRouter.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <RouterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRouter(null)
        }}
        router={selectedRouter}
      />
    </div>
  )
}

