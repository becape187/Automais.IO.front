import { useState, useEffect } from 'react'
import { Plus, Network, Edit, Trash2, Shield, Search } from 'lucide-react'
import { vpnNetworksApi } from '../../services/vpnNetworksApi'
import { getTenantId } from '../../config/tenant'
import Modal from '../../components/Modal/Modal'

export default function Vpn() {
  const [networks, setNetworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    cidr: '',
    description: '',
    dnsServers: '',
    serverEndpoint: 'automais.io',
    isDefault: false,
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadNetworks()
  }, [])

  const loadNetworks = async () => {
    try {
      setLoading(true)
      const tenantId = getTenantId()
      const data = await vpnNetworksApi.getByTenant(tenantId)
      setNetworks(data)
    } catch (error) {
      console.error('Erro ao carregar redes VPN:', error)
      alert('Erro ao carregar redes VPN: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (network = null) => {
    setSelectedNetwork(network)
    if (network) {
      setFormData({
        name: network.name || '',
        slug: network.slug || '',
        cidr: network.cidr || '',
        description: network.description || '',
        dnsServers: network.dnsServers || '',
        serverEndpoint: network.serverEndpoint || 'automais.io',
        isDefault: network.isDefault || false,
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        cidr: '',
        description: '',
        dnsServers: '',
        serverEndpoint: 'automais.io',
        isDefault: false,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedNetwork(null)
    setFormData({
      name: '',
      slug: '',
      cidr: '',
      description: '',
      dnsServers: '',
      isDefault: false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const tenantId = getTenantId()
      if (selectedNetwork) {
        await vpnNetworksApi.update(selectedNetwork.id, formData)
      } else {
        await vpnNetworksApi.create(tenantId, formData)
      }
      handleCloseModal()
      loadNetworks()
    } catch (error) {
      console.error('Erro ao salvar rede VPN:', error)
      alert('Erro ao salvar rede VPN: ' + (error.response?.data?.message || error.message || 'Erro desconhecido'))
    }
  }

  const handleDelete = async (networkId) => {
    if (!confirm('Tem certeza que deseja excluir esta rede VPN?')) {
      return
    }
    try {
      await vpnNetworksApi.delete(networkId)
      loadNetworks()
    } catch (error) {
      console.error('Erro ao excluir rede VPN:', error)
      alert('Erro ao excluir rede VPN: ' + (error.response?.data?.message || error.message || 'Erro desconhecido'))
    }
  }

  const filteredNetworks = networks.filter(network =>
    network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    network.cidr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (network.slug && network.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando redes VPN...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">VPN</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie as redes VPN para seus routers
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nova Rede VPN
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar redes VPN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 input"
        />
      </div>

      {/* Networks List */}
      {filteredNetworks.length === 0 ? (
        <div className="card p-12 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma rede VPN encontrada' : 'Nenhuma rede VPN encontrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca.'
              : 'Crie sua primeira rede VPN para começar a usar VPN com seus routers.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Rede VPN
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNetworks.map((network) => (
            <div key={network.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Network className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{network.name}</h3>
                    {network.isDefault && (
                      <span className="text-xs text-primary-600 font-medium">Padrão</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(network)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(network.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">CIDR:</span>{' '}
                  <span className="font-mono font-medium text-gray-900">{network.cidr}</span>
                </div>
                {network.slug && (
                  <div>
                    <span className="text-gray-600">Slug:</span>{' '}
                    <span className="font-mono text-gray-900">{network.slug}</span>
                  </div>
                )}
                {network.dnsServers && (
                  <div>
                    <span className="text-gray-600">DNS:</span>{' '}
                    <span className="text-gray-900">{network.dnsServers}</span>
                  </div>
                )}
                {network.serverEndpoint && (
                  <div>
                    <span className="text-gray-600">Endpoint:</span>{' '}
                    <span className="font-mono text-gray-900">{network.serverEndpoint}</span>
                  </div>
                )}
                {network.description && (
                  <div className="text-gray-600 text-xs mt-2">
                    {network.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedNetwork ? 'Editar Rede VPN' : 'Nova Rede VPN'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              placeholder="Ex: Rede Principal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="input w-full"
              placeholder="Ex: rede-principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CIDR <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cidr}
              onChange={(e) => setFormData({ ...formData, cidr: e.target.value })}
              className="input w-full font-mono"
              placeholder="Ex: 10.100.1.0/24"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Formato: IP/prefixo (ex: 10.100.1.0/24)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servidores DNS
            </label>
            <input
              type="text"
              value={formData.dnsServers}
              onChange={(e) => setFormData({ ...formData, dnsServers: e.target.value })}
              className="input w-full"
              placeholder="Ex: 8.8.8.8, 8.8.4.4"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separe múltiplos DNS por vírgula
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint do Servidor VPN
            </label>
            <input
              type="text"
              value={formData.serverEndpoint}
              onChange={(e) => setFormData({ ...formData, serverEndpoint: e.target.value })}
              className="input w-full font-mono"
              placeholder="automais.io"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Endpoint do servidor WireGuard (ex: automais.io). Este valor será usado nos arquivos .conf gerados.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full"
              rows="3"
              placeholder="Descrição opcional da rede VPN"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Rede padrão
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {selectedNetwork ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

