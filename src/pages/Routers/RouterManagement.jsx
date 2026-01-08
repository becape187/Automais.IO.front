import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Shield, 
  Network, 
  Route as RouteIcon, 
  Wifi, 
  Terminal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Edit,
  X
} from 'lucide-react'
import api from '../../services/api'
import clsx from 'clsx'
import Modal from '../../components/Modal/Modal'

const TABS = {
  FIREWALL: 'firewall',
  NAT: 'nat',
  ROUTES: 'routes',
  INTERFACES: 'interfaces',
  TERMINAL: 'terminal'
}

export default function RouterManagement() {
  const { routerId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(TABS.FIREWALL)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({})
  const [terminalCommand, setTerminalCommand] = useState('')
  const [terminalHistory, setTerminalHistory] = useState([])
  const [executingCommand, setExecutingCommand] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  // Colunas do Winbox para cada tipo
  const WINBOX_COLUMNS = {
    firewall: ['chain', 'action', 'src-address', 'dst-address', 'protocol', 'dst-port', 'in-interface', 'out-interface', 'comment'],
    nat: ['chain', 'action', 'src-address', 'dst-address', 'protocol', 'dst-port', 'to-addresses', 'to-ports', 'comment'],
    routes: ['dst-address', 'gateway', 'distance', 'scope', 'target-scope', 'routing-mark', 'interface', 'comment'],
    interfaces: ['name', 'type', 'mtu', 'mac-address', 'rx-byte', 'tx-byte', 'rx-packet', 'tx-packet', 'running', 'disabled', 'comment']
  }

  useEffect(() => {
    checkConnection()
  }, [routerId])

  useEffect(() => {
    if (connectionStatus?.connected) {
      loadTabData()
    }
  }, [activeTab, connectionStatus])

  const checkConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/routers/${routerId}/management/status`)
      setConnectionStatus(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao conectar ao router')
      setConnectionStatus({ connected: false })
    } finally {
      setLoading(false)
    }
  }

  const loadTabData = async () => {
    if (!connectionStatus?.connected) return

    try {
      setLoading(true)
      setError(null)

      let endpoint = ''
      switch (activeTab) {
        case TABS.FIREWALL:
          endpoint = 'firewall'
          break
        case TABS.NAT:
          endpoint = 'nat'
          break
        case TABS.ROUTES:
          endpoint = 'routes'
          break
        case TABS.INTERFACES:
          endpoint = 'interfaces'
          break
        default:
          return
      }

      const response = await api.get(`/routers/${routerId}/management/${endpoint}`)
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const executeTerminalCommand = async () => {
    if (!terminalCommand.trim() || executingCommand) return

    try {
      setExecutingCommand(true)
      setError(null)

      const response = await api.post(`/routers/${routerId}/management/terminal`, {
        command: terminalCommand
      })

      setTerminalHistory(prev => [
        ...prev,
        { type: 'command', content: terminalCommand },
        { type: 'result', content: response.data }
      ])

      setTerminalCommand('')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao executar comando')
      setTerminalHistory(prev => [
        ...prev,
        { type: 'command', content: terminalCommand },
        { type: 'error', content: err.response?.data?.detail || err.message }
      ])
    } finally {
      setExecutingCommand(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeTerminalCommand()
    }
  }

  const handleRowClick = (item) => {
    setSelectedItem(item)
    setIsConfigModalOpen(true)
  }

  const renderTable = (items, type) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nenhum item encontrado
        </div>
      )
    }

    // Usar colunas do Winbox se disponíveis, senão usar todas as colunas disponíveis
    const winboxColumns = WINBOX_COLUMNS[type] || []
    const allKeys = new Set()
    items.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== '.id' && !key.startsWith('=')) {
          allKeys.add(key)
        }
      })
    })

    // Se temos colunas do Winbox definidas, usar apenas elas (na ordem correta)
    // Senão, usar todas as colunas disponíveis
    const columns = winboxColumns.length > 0
      ? winboxColumns.filter(col => allKeys.has(col))
      : Array.from(allKeys)

    // Formatar valores para exibição
    const formatValue = (value, column) => {
      if (value === null || value === undefined || value === '') return '-'
      
      // Formatar bytes para interfaces
      if ((column === 'rx-byte' || column === 'tx-byte') && !isNaN(value)) {
        const bytes = parseInt(value)
        if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`
        if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${bytes} B`
      }

      return String(value)
    }

    // Obter classe CSS para destacar valores importantes
    const getValueClassName = (value, column) => {
      // Formatar booleanos (similar ao Winbox)
      if (value === 'true' || value === true) return 'text-green-600 font-bold'
      if (value === 'false' || value === false) return 'text-gray-400'
      
      // Destacar ações importantes
      if (column === 'action') {
        const actionColors = {
          'accept': 'text-green-600 font-semibold',
          'drop': 'text-red-600 font-semibold',
          'reject': 'text-orange-600 font-semibold',
          'masquerade': 'text-blue-600 font-semibold',
          'src-nat': 'text-blue-600 font-semibold',
          'dst-nat': 'text-blue-600 font-semibold'
        }
        return actionColors[String(value)?.toLowerCase()] || 'text-gray-700'
      }

      return 'text-gray-800'
    }

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-100">
              {columns.map(col => (
                <th key={col} className="text-left p-2.5 font-semibold text-gray-800 text-xs border-r border-gray-200 last:border-r-0">
                  {col.replace(/-/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr 
                key={item['.id'] || idx} 
                className={clsx(
                  "border-b border-gray-200 cursor-pointer transition-colors",
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                  "hover:bg-blue-100"
                )}
                onClick={() => handleRowClick(item)}
                onDoubleClick={() => handleRowClick(item)}
              >
                {columns.map(col => (
                  <td key={col} className={clsx("p-2.5 text-xs border-r border-gray-100 last:border-r-0 font-mono", getValueClassName(item[col], col))}>
                    {formatValue(item[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderConfigModal = () => {
    if (!selectedItem) return null

    const formatFieldName = (key) => {
      return key
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    const formatFieldValue = (value) => {
      if (value === null || value === undefined || value === '') return '(vazio)'
      if (value === 'true' || value === true) return 'Sim'
      if (value === 'false' || value === false) return 'Não'
      return String(value)
    }

    return (
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false)
          setSelectedItem(null)
        }}
        title={`Configuração - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">ID: {selectedItem['.id'] || 'N/A'}</p>
            <p className="text-xs text-gray-500">
              Clique duas vezes em um campo para editar (em desenvolvimento)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(selectedItem)
              .filter(([key]) => key !== '.id' && !key.startsWith('='))
              .map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 pb-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    {formatFieldName(key)}
                  </label>
                  <div className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                    {formatFieldValue(value)}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={() => {
                setIsConfigModalOpen(false)
                setSelectedItem(null)
              }}
              className="btn btn-secondary btn-sm"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                // TODO: Implementar edição
                alert('Edição em desenvolvimento. Use o terminal para editar manualmente.')
              }}
              className="btn btn-primary btn-sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/routers')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciamento Router
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {connectionStatus?.routerName || 'Carregando...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status da conexão */}
          <div className="flex items-center gap-2">
            {connectionStatus?.connected ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600">Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600">Desconectado</span>
              </>
            )}
          </div>
          <button
            onClick={checkConnection}
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            Reconectar
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: TABS.FIREWALL, label: 'Firewall', icon: Shield },
            { id: TABS.NAT, label: 'NAT', icon: Network },
            { id: TABS.ROUTES, label: 'Rotas', icon: RouteIcon },
            { id: TABS.INTERFACES, label: 'Interfaces', icon: Wifi },
            { id: TABS.TERMINAL, label: 'Terminal', icon: Terminal },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="card p-6">
        {loading && activeTab !== TABS.TERMINAL ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : activeTab === TABS.TERMINAL ? (
          <div className="space-y-4">
            <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto">
              {terminalHistory.length === 0 ? (
                <div className="text-gray-500">
                  Digite um comando RouterOS e pressione Enter para executar...
                </div>
              ) : (
                terminalHistory.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    {item.type === 'command' && (
                      <div className="text-blue-400">
                        <span className="text-gray-500">$</span> {item.content}
                      </div>
                    )}
                    {item.type === 'result' && (
                      <div className="text-green-400 whitespace-pre-wrap">
                        {typeof item.content === 'object' 
                          ? JSON.stringify(item.content, null, 2)
                          : item.content}
                      </div>
                    )}
                    {item.type === 'error' && (
                      <div className="text-red-400">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={terminalCommand}
                onChange={(e) => setTerminalCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite um comando RouterOS (ex: /ip/address/print)"
                className="flex-1 input font-mono"
                disabled={executingCommand || !connectionStatus?.connected}
              />
              <button
                onClick={executeTerminalCommand}
                className="btn btn-primary"
                disabled={executingCommand || !terminalCommand.trim() || !connectionStatus?.connected}
              >
                {executingCommand ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Executar'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Dica:</strong> Clique em uma linha para ver os detalhes da configuração
              </p>
            </div>
            {activeTab === TABS.FIREWALL && renderTable(data.rules, 'firewall')}
            {activeTab === TABS.NAT && renderTable(data.rules, 'nat')}
            {activeTab === TABS.ROUTES && renderTable(data.routes, 'routes')}
            {activeTab === TABS.INTERFACES && renderTable(data.interfaces, 'interfaces')}
          </div>
        )}
      </div>

      {/* Modal de Configuração */}
      {renderConfigModal()}
    </div>
  )
}

