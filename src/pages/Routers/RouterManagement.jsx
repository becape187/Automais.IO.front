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
  CheckCircle2
} from 'lucide-react'
import api from '../../services/api'
import clsx from 'clsx'

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

  const renderTable = (items, key) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nenhum item encontrado
        </div>
      )
    }

    // Extrair todas as chaves únicas de todos os itens
    const allKeys = new Set()
    items.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key))
    })

    const columns = Array.from(allKeys).filter(key => 
      key !== '.id' && !key.startsWith('=')
    )

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map(col => (
                <th key={col} className="text-left p-2 font-semibold text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col} className="p-2 text-gray-600">
                    {item[col] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
            {activeTab === TABS.FIREWALL && renderTable(data.rules, 'firewall')}
            {activeTab === TABS.NAT && renderTable(data.rules, 'nat')}
            {activeTab === TABS.ROUTES && renderTable(data.routes, 'routes')}
            {activeTab === TABS.INTERFACES && renderTable(data.interfaces, 'interfaces')}
          </div>
        )}
      </div>
    </div>
  )
}

