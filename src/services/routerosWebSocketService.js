import { getRouterOsWsUrl } from '../config/api'

/**
 * Serviço WebSocket para comunicação com o RouterOS WebSocket Service (Python)
 * Conecta através da API C# que faz proxy para o serviço Python
 */
class RouterOsWebSocketService {
  constructor() {
    this.connection = null
    this.currentRouterId = null
    this.messageId = 0
    this.pendingRequests = new Map()
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  /**
   * Conecta ao WebSocket do serviço RouterOS via API C#
   * @param {string} routerId - ID do router (obrigatório)
   */
  async connect(routerId) {
    if (!routerId) {
      throw new Error('routerId é obrigatório para conectar ao WebSocket RouterOS')
    }

    const wsUrl = getRouterOsWsUrl(routerId)
    // Se já está conectado ao mesmo router, retornar conexão existente
    if (this.connection?.readyState === WebSocket.OPEN && this.currentRouterId === routerId) {
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
          console.log('RouterOS WebSocket conectado para router', routerId)
          this.currentRouterId = routerId
          this.reconnectAttempts = 0
          this.emit('connected')
          resolve(this.connection)
        }

        this.connection.onmessage = (event) => {
          try {
            // Tentar parsear JSON normalmente
            let data
            let rawData = event.data
            
            // Se for uma string, tentar corrigir problemas de codificação UTF-8 antes de parsear
            if (typeof rawData === 'string') {
              // Remover caracteres de controle e bytes inválidos UTF-8
              // Substituir sequências UTF-8 malformadas por espaços
              rawData = rawData.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
              
              // Tentar corrigir bytes UTF-8 malformados (como 0xc3, 0xc9 seguidos de bytes inválidos)
              // Esses bytes são o início de caracteres UTF-8 de 2 bytes, mas o segundo byte está faltando ou inválido
              rawData = rawData.replace(/[\xC0-\xC1\xF5-\xFF]/g, '') // Bytes inválidos UTF-8
              rawData = rawData.replace(/\xC2[\x00-\x7F]/g, '') // Sequências malformadas começando com 0xC2
              rawData = rawData.replace(/\xC3[\x00-\x7F]/g, '') // Sequências malformadas começando com 0xC3
              rawData = rawData.replace(/\xC9[\x00-\x7F]/g, '') // Sequências malformadas começando com 0xC9
            }
            
            try {
              data = JSON.parse(rawData)
            } catch (parseError) {
              // Se ainda falhar, tentar uma abordagem mais agressiva
              console.warn('Erro ao parsear JSON após correção básica, tentando correção avançada:', parseError.message)
              
              if (typeof rawData === 'string') {
                // Remover todos os caracteres não-ASCII problemáticos e manter apenas ASCII seguro
                // Isso pode perder alguns dados, mas pelo menos não quebra a aplicação
                let safeData = rawData
                  .split('')
                  .map(char => {
                    const code = char.charCodeAt(0)
                    // Manter apenas caracteres ASCII imprimíveis e alguns caracteres Unicode seguros
                    if (code >= 32 && code <= 126) {
                      return char // ASCII imprimível
                    } else if (code >= 160 && code <= 255) {
                      // Caracteres Latin-1, tentar manter
                      try {
                        return String.fromCharCode(code)
                      } catch {
                        return '?'
                      }
                    } else if (code > 255) {
                      // Unicode, tentar manter
                      try {
                        return char
                      } catch {
                        return '?'
                      }
                    }
                    return '' // Remover caracteres de controle
                  })
                  .join('')
                
                try {
                  data = JSON.parse(safeData)
                  console.warn('JSON parseado após correção agressiva (alguns dados podem ter sido perdidos)')
                } catch (e) {
                  console.error('Não foi possível corrigir a mensagem JSON mesmo após correção agressiva:', e)
                  // Ignorar a mensagem problemática para não quebrar a aplicação
                  return
                }
              } else {
                console.error('Dados não são string, não é possível corrigir:', typeof rawData)
                return
              }
            }
            
            this.handleMessage(data)
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
            // Não emitir erro para não quebrar a aplicação, apenas logar
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
          
          // Tentar reconectar se não foi fechado intencionalmente e temos routerId
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && this.currentRouterId) {
            this.reconnectAttempts++
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
            console.log(`Tentando reconectar em ${delay}ms... (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
            setTimeout(() => {
              if (this.currentRouterId) {
                this.connect(this.currentRouterId).catch(console.error)
              }
            }, delay)
          } else if (!this.currentRouterId) {
            console.warn('Não é possível reconectar: routerId não disponível')
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
      this.currentRouterId = null
      this.pendingRequests.clear()
      this.listeners.clear()
    }
  }

  /**
   * Obtém o routerId atual da conexão WebSocket
   */
  getCurrentRouterId() {
    return this.currentRouterId
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
   * Sanitiza string para remover bytes UTF-8 inválidos
   */
  sanitizeString(str) {
    if (typeof str !== 'string') {
      return String(str)
    }
    
    // Remover caracteres de controle e bytes UTF-8 inválidos
    return str
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .replace(/[\xC0-\xC1\xF5-\xFF]/g, '')
      .replace(/\xC2[\x00-\x7F]/g, '')
      .replace(/\xC3[\x00-\x7F]/g, '')
      .replace(/\xC9[\x00-\x7F]/g, '')
      .split('')
      .map(char => {
        const code = char.charCodeAt(0)
        if (code >= 32 && code <= 126) {
          return char // ASCII imprimível
        } else if (code >= 160 && code <= 255) {
          try {
            return String.fromCharCode(code)
          } catch {
            return '?'
          }
        } else if (code > 255) {
          try {
            return char
          } catch {
            return '?'
          }
        }
        return ''
      })
      .join('')
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
        // Sanitizar a mensagem de erro antes de criar o Error
        const errorMessage = this.sanitizeString(data.error || 'Erro desconhecido')
        reject(new Error(errorMessage))
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

// Exportar instância singleton
export const routerOsWebSocketService = new RouterOsWebSocketService()
