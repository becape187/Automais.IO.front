import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useCreateRouter, useUpdateRouter } from '../../hooks/useRouters'
import { vpnNetworksApi } from '../../services/vpnNetworksApi'
import { getTenantId } from '../../config/tenant'

export default function RouterModal({ isOpen, onClose, router = null }) {
  const isEditing = !!router
  const createRouter = useCreateRouter()
  const updateRouter = useUpdateRouter()

  const [formData, setFormData] = useState({
    name: router?.name || '',
    serialNumber: router?.serialNumber || '',
    model: router?.model || '',
    routerOsApiUrl: router?.routerOsApiUrl || '',
    routerOsApiUsername: '',
    routerOsApiPassword: '',
    vpnNetworkId: router?.vpnNetworkId || '',
    allowedNetworks: router?.allowedNetworks?.join('\n') || '',
    description: router?.description || '',
  })

  const [errors, setErrors] = useState({})
  const [vpnNetworks, setVpnNetworks] = useState([])
  const [loadingVpnNetworks, setLoadingVpnNetworks] = useState(false)

  // Carregar redes VPN quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadVpnNetworks()
    }
  }, [isOpen])

  const loadVpnNetworks = async () => {
    try {
      setLoadingVpnNetworks(true)
      const tenantId = getTenantId()
      if (tenantId) {
        const networks = await vpnNetworksApi.getByTenant(tenantId)
        setVpnNetworks(networks)
      }
    } catch (error) {
      console.error('Erro ao carregar redes VPN:', error)
      setVpnNetworks([])
    } finally {
      setLoadingVpnNetworks(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    if (formData.routerOsApiUrl && !formData.routerOsApiUrl.startsWith('http')) {
      newErrors.routerOsApiUrl = 'URL deve começar com http:// ou https://'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        // Converter allowedNetworks de string (separada por \n) para array
        allowedNetworks: formData.allowedNetworks
          ? formData.allowedNetworks.split('\n').map(n => n.trim()).filter(n => n)
          : undefined,
        // Converter vpnNetworkId para null se vazio
        vpnNetworkId: formData.vpnNetworkId || null,
      }

      if (isEditing) {
        await updateRouter.mutateAsync({
          id: router.id,
          data: dataToSend,
        })
      } else {
        await createRouter.mutateAsync(dataToSend)
      }
      onClose()
      // Reset form
      setFormData({
        name: '',
        serialNumber: '',
        model: '',
        routerOsApiUrl: '',
        routerOsApiUsername: '',
        routerOsApiPassword: '',
        vpnNetworkId: '',
        allowedNetworks: '',
        description: '',
      })
    } catch (error) {
      console.error('Erro ao salvar router:', error)
      alert(error.message || 'Erro ao salvar router')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Router' : 'Adicionar Router'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Ex: Router Matriz"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Série
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="input w-full"
              placeholder="Ex: SN123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="input w-full"
              placeholder="Ex: RB750Gr3"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da API RouterOS
          </label>
          <input
            type="text"
            name="routerOsApiUrl"
            value={formData.routerOsApiUrl}
            onChange={handleChange}
            className={`input w-full ${errors.routerOsApiUrl ? 'border-red-500' : ''}`}
            placeholder="Ex: http://192.168.1.1"
          />
          {errors.routerOsApiUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.routerOsApiUrl}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário API
            </label>
            <input
              type="text"
              name="routerOsApiUsername"
              value={formData.routerOsApiUsername}
              onChange={handleChange}
              className="input w-full"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha API
            </label>
            <input
              type="password"
              name="routerOsApiPassword"
              value={formData.routerOsApiPassword}
              onChange={handleChange}
              className="input w-full"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            🔐 Configuração VPN (Opcional)
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Para gerar o certificado VPN automaticamente, selecione uma rede VPN.
            Se deixar vazio, o router será criado sem VPN.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rede VPN <span className="text-red-500">*</span>
            </label>
            {loadingVpnNetworks ? (
              <div className="input w-full text-gray-500">Carregando redes VPN...</div>
            ) : (
              <>
                <select
                  name="vpnNetworkId"
                  value={formData.vpnNetworkId}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="">Selecione uma rede VPN (opcional)</option>
                  {vpnNetworks.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.name} ({network.cidr}) {network.isDefault && '(Padrão)'}
                    </option>
                  ))}
                </select>
                {vpnNetworks.length === 0 && (
                  <p className="mt-1 text-xs text-yellow-600">
                    ⚠️ Nenhuma rede VPN encontrada. Crie uma rede VPN primeiro na página VPN.
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Selecione a rede VPN onde o router será conectado. <strong>Obrigatório para gerar certificado.</strong>
                </p>
              </>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redes Permitidas (Opcional)
            </label>
            <textarea
              name="allowedNetworks"
              value={formData.allowedNetworks}
              onChange={handleChange}
              className="input w-full font-mono text-sm"
              rows="3"
              placeholder="10.0.1.0/24&#10;192.168.100.0/24&#10;172.16.0.0/16"
            />
            <p className="mt-1 text-xs text-gray-500">
              <strong>Opcional:</strong> Uma rede por linha (formato CIDR). Essas redes serão acessíveis via VPN.
              <br />
              Se deixar vazio, o router terá acesso apenas à própria rede VPN.
              <br />
              <strong>Exemplo:</strong> 10.0.1.0/24 (uma rede) ou múltiplas redes, uma por linha.
            </p>
          </div>

          {formData.vpnNetworkId && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-800">
                ✅ Certificado VPN será gerado automaticamente após criar o router.
                {formData.allowedNetworks && (
                  <> Redes adicionais serão configuradas para roteamento.</>
                )}
                {!formData.allowedNetworks && (
                  <> O router terá acesso apenas à rede VPN base.</>
                )}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full"
            rows="3"
            placeholder="Descrição opcional do router"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={createRouter.isPending || updateRouter.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createRouter.isPending || updateRouter.isPending}
          >
            {createRouter.isPending || updateRouter.isPending
              ? 'Salvando...'
              : isEditing
              ? 'Atualizar'
              : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

