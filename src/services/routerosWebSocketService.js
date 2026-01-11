import { getRouterOsWsUrlDefault } from '../config/api'

/**
 * Serviço WebSocket para comunicação com o RouterOS WebSocket Service (Python)
 * Conecta diretamente ao serviço Python
 */
class RouterOsWebSocketService {
  constructor() {
    this.connection = null
    this.currentUrl = null
    this.messageId = 0
    this.pendingRequests = new Map()
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  /**
   * Conecta ao WebSocket do serviço RouterOS
   * @param {string} wsUrl - URL do WebSocket (padrão: da configuração)
   */
  async connect(wsUrl = null) {
    // Usar URL padrão se não fornecida (evita problema de inicialização)
    if (!wsUrl) {
      wsUrl = getRouterOsWsUrlDefault()
    }
    // Se já está conectado à mesma URL, retornar conexão existente
    if (this.connection?.readyState === WebSocket.OPEN && this.currentUrl === wsUrl) {
      return this.connection
    }

    if (this.connection?.readyState === WebSocket.CONNECTING) {
      // Aguardar conexão existente
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (this.connection?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection)
            resolve(this.connection)
          } else if (this.connection?.readyState === WebSocket.CLOSED) {
            clearInterval(checkConnection)
            reject(new Error('Falha ao conectar'))
          }
        }, 100)
      })
    }

    return new Promise((resolve, reject) => {
      try {
        this.connection = new WebSocket(wsUrl)

        this.connection.onopen = () => {
          console.log('RouterOS WebSocket conectado')
          this.reconnectAttempts = 0
          this.emit('connected')
          resolve(this.connection)
        }

        this.connection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
          }
        }

        this.connection.onerror = (error) => {
          console.error('Erro no WebSocket RouterOS:', error)
          this.emit('error', error)
          reject(error)
        }

        this.connection.onclose = (event) => {
          console.log('RouterOS WebSocket fechado:', event.code, event.reason)
          this.emit('disconnected', event)
          
          // Tentar reconectar se não foi fechado intencionalmente
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
            console.log(`Tentando reconectar em ${delay}ms... (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
            setTimeout(() => {
              this.connect(wsUrl).catch(console.error)
            }, delay)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Desconecta do WebSocket
   */
  async disconnect() {
    if (this.connection) {
      this.connection.close(1000, 'Desconexão solicitada')
      this.connection = null
      this.currentUrl = null
      this.pendingRequests.clear()
      this.listeners.clear()
    }
  }

  /**
   * Obtém a URL atual da conexão WebSocket
   */
  getCurrentUrl() {
    return this.currentUrl
  }

  /**
   * Envia uma mensagem e aguarda resposta
   * @param {object} message - Mensagem a ser enviada
   * @param {number} timeout - Timeout em milissegundos (padrão: 30000)
   */
  async send(message, timeout = 30000) {
    if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket não está conectado')
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId
      const request = { ...message, id }

      // Configurar timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error('Timeout ao aguardar resposta'))
      }, timeout)

      // Armazenar callback
      this.pendingRequests.set(id, { resolve, reject, timeoutId })

      // Enviar mensagem
      try {
        this.connection.send(JSON.stringify(request))
      } catch (error) {
        clearTimeout(timeoutId)
        this.pendingRequests.delete(id)
        reject(error)
      }
    })
  }

  /**
   * Processa mensagens recebidas
   */
  handleMessage(data) {
    // Se tem ID, é uma resposta a uma requisição
    if (data.id && this.pendingRequests.has(data.id)) {
      const { resolve, reject, timeoutId } = this.pendingRequests.get(data.id)
      clearTimeout(timeoutId)
      this.pendingRequests.delete(data.id)

      if (data.error || data.success === false) {
        reject(new Error(data.error || 'Erro desconhecido'))
      } else {
        resolve(data)
      }
    } else {
      // É uma mensagem não solicitada (evento)
      this.emit('message', data)
    }
  }

  /**
   * Obtém status da conexão RouterOS
   */
  async getStatus(routerId, routerIp = null) {
    return this.send({
      action: 'get_status',
      router_id: routerId,
      router_ip: routerIp
    })
  }

  /**
   * Lista rotas do RouterOS
   */
  async listRoutes(routerId, routerIp, username, password) {
    return this.send({
      action: 'list_routes',
      router_id: routerId,
      router_ip: routerIp,
      username,
      password
    })
  }

  /**
   * Executa comando RouterOS
   */
  async executeCommand(routerId, routerIp, username, password, command) {
    return this.send({
      action: 'execute_command',
      router_id: routerId,
      router_ip: routerIp,
      username,
      password,
      command
    })
  }

  /**
   * Adiciona rota
   */
  async addRoute(routerId, routeData) {
    return this.send({
      action: 'add_route',
      router_id: routerId,
      route_data: routeData
    })
  }

  /**
   * Remove rota
   */
  async deleteRoute(routerId, routerIp, username, password, routeRouterOsId) {
    return this.send({
      action: 'delete_route',
      router_id: routerId,
      router_ip: routerIp,
      username,
      password,
      route_routeros_id: routeRouterOsId
    })
  }

  /**
   * Registrar listener para eventos
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    // Retornar função para remover listener
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Emitir evento para listeners
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Erro ao executar callback do evento ${event}:`, error)
        }
      })
    }
  }

  /**
   * Verificar se está conectado
   */
  isConnected() {
    return this.connection?.readyState === WebSocket.OPEN
  }

  /**
   * Obter estado da conexão
   */
  getState() {
    if (!this.connection) return 'DISCONNECTED'
    switch (this.connection.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'CONNECTED'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'DISCONNECTED'
      default:
        return 'UNKNOWN'
    }
  }
}

// Criar instância singleton (lazy - só quando necessário)
let _instance = null

function getInstance() {
  if (!_instance) {
    _instance = new RouterOsWebSocketService()
  }
  return _instance
}

// Exportar como objeto proxy para manter compatibilidade com código existente
export const routerOsWebSocketService = new Proxy({}, {
  get(target, prop) {
    const instance = getInstance()
    const value = instance[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})
