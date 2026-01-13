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
    this.connectionTimeout = 10000 // 10 segundos para conectar
    this.heartbeatInterval = null
    this.heartbeatIntervalMs = 30000 // 30 segundos
    this.lastPongTime = null
    this.isReconnecting = false
    this.connectPromise = null
  }

  /**
   * Conecta ao WebSocket do serviço RouterOS via API C#
   * @param {string} routerId - ID do router (obrigatório)
   * @param {boolean} forceReconnect - Forçar reconexão mesmo se já estiver conectado
   */
  async connect(routerId, forceReconnect = false) {
    if (!routerId) {
      throw new Error('routerId é obrigatório para conectar ao WebSocket RouterOS')
    }

    // Se já está conectando, aguardar a conexão existente
    if (this.connectPromise && !forceReconnect) {
      return this.connectPromise
    }

    const wsUrl = getRouterOsWsUrl(routerId)
    
    // Se já está conectado ao mesmo router, retornar conexão existente
    if (!forceReconnect && this.connection?.readyState === WebSocket.OPEN && this.currentRouterId === routerId) {
      return this.connection
    }

    // Se está conectando, aguardar
    if (!forceReconnect && this.connection?.readyState === WebSocket.CONNECTING) {
      return this.connectPromise || new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (this.connection?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection)
            resolve(this.connection)
          } else if (this.connection?.readyState === WebSocket.CLOSED) {
            clearInterval(checkConnection)
            reject(new Error('Falha ao conectar'))
          }
        }, 100)
        
        // Timeout de 10 segundos
        setTimeout(() => {
          clearInterval(checkConnection)
          reject(new Error('Timeout ao aguardar conexão'))
        }, this.connectionTimeout)
      })
    }

    // Fechar conexão existente se necessário
    if (this.connection && (forceReconnect || this.currentRouterId !== routerId)) {
      try {
        this.connection.close()
      } catch (e) {
        // Ignorar erro ao fechar conexão existente
      }
      this.connection = null
    }

    this.isReconnecting = true
    this.connectPromise = new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        if (this.connection?.readyState !== WebSocket.OPEN) {
          try {
            this.connection?.close()
          } catch (e) {
            // Ignorar erro ao fechar
          }
          this.connection = null
          this.connectPromise = null
          this.isReconnecting = false
          reject(new Error(`Timeout ao conectar WebSocket após ${this.connectionTimeout}ms`))
        }
      }, this.connectionTimeout)

      try {
        this.connection = new WebSocket(wsUrl)

        this.connection.onopen = () => {
          clearTimeout(connectionTimeout)
          this.currentRouterId = routerId
          this.reconnectAttempts = 0
          this.isReconnecting = false
          this.lastPongTime = Date.now()
          this.startHeartbeat()
          this.emit('connected')
          this.connectPromise = null
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
          clearTimeout(connectionTimeout)
          console.error(`[WebSocket] ❌ Erro no WebSocket RouterOS (router ${routerId}):`, error)
          this.isReconnecting = false
          this.connectPromise = null
          this.emit('error', error)
          reject(error)
        }

        this.connection.onclose = (event) => {
          clearTimeout(connectionTimeout)
          this.stopHeartbeat()
          this.isReconnecting = false
          
          // Rejeitar promise de conexão pendente
          if (this.connectPromise) {
            reject(new Error(`Conexão fechada: ${event.reason || 'sem motivo'} (código ${event.code})`))
            this.connectPromise = null
          }
          
          // Limpar requisições pendentes
          this.pendingRequests.forEach(({ reject: reqReject, timeoutId }) => {
            clearTimeout(timeoutId)
            reqReject(new Error('WebSocket desconectado'))
          })
          this.pendingRequests.clear()
          
          // Limpar referência da conexão
          this.connection = null
          
          this.emit('disconnected', event)
          
          // Tentar reconectar se não foi fechado intencionalmente e temos routerId
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && this.currentRouterId && !this.isReconnecting) {
            this.reconnectAttempts++
            const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000) // Max 30s
            setTimeout(() => {
              if (this.currentRouterId && !this.isReconnecting) {
                this.connect(this.currentRouterId, true).catch(err => {
                  console.error(`[WebSocket] Erro ao reconectar:`, err)
                })
              }
            }, delay)
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`[WebSocket] Máximo de tentativas de reconexão atingido (${this.maxReconnectAttempts})`)
            this.emit('maxReconnectAttemptsReached')
          }
        }
      } catch (error) {
        clearTimeout(connectionTimeout)
        this.isReconnecting = false
        this.connectPromise = null
        reject(error)
      }
    })

    return this.connectPromise
  }

  /**
   * Inicia heartbeat para verificar saúde da conexão
   */
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.connection?.readyState === WebSocket.OPEN) {
        // Verificar se recebeu pong recentemente (dentro de 2x o intervalo)
        if (this.lastPongTime && (Date.now() - this.lastPongTime) > (this.heartbeatIntervalMs * 2)) {
          console.warn('[WebSocket] ⚠️ Heartbeat timeout - conexão pode estar morta, forçando reconexão...')
          this.forceDisconnect()
          this.reconnectAttempts = 0 // Resetar tentativas para reconexão forçada
          if (this.currentRouterId) {
            this.connect(this.currentRouterId, true).catch(console.error)
          }
          return
        }
        
        // Enviar ping (usando get_status como ping) - sem retry para não sobrecarregar
        try {
          // Usar send direto sem retry para heartbeat
          const id = ++this.messageId
          const request = {
            action: 'get_status',
            router_id: this.currentRouterId,
            router_ip: null,
            id
          }
          
          const heartbeatTimeout = setTimeout(() => {
            this.pendingRequests.delete(id)
            // Não forçar desconexão imediatamente, apenas marcar como sem resposta
          }, 5000)
          
          this.pendingRequests.set(id, {
            resolve: () => {
              clearTimeout(heartbeatTimeout)
              this.lastPongTime = Date.now()
            },
            reject: () => {
              clearTimeout(heartbeatTimeout)
            },
            timeoutId: heartbeatTimeout
          })
          
          if (this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(request))
          }
        } catch (err) {
          // Se erro ao enviar, conexão pode estar morta
          this.forceDisconnect()
          if (this.currentRouterId) {
            this.reconnectAttempts = 0
            this.connect(this.currentRouterId, true).catch(console.error)
          }
        }
      } else {
        // Conexão não está aberta - parar heartbeat
        this.stopHeartbeat()
      }
    }, this.heartbeatIntervalMs)
  }

  /**
   * Para o heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Desconecta do WebSocket
   */
  async disconnect() {
    this.stopHeartbeat()
    if (this.connection) {
      try {
        this.connection.close(1000, 'Desconexão solicitada')
      } catch (e) {
        console.warn('[WebSocket] Erro ao fechar conexão:', e)
      }
      this.connection = null
      this.currentRouterId = null
      this.pendingRequests.clear()
      this.connectPromise = null
      this.isReconnecting = false
      this.reconnectAttempts = 0
    }
  }

  /**
   * Obtém o routerId atual da conexão WebSocket
   */
  getCurrentRouterId() {
    return this.currentRouterId
  }

  /**
   * Força fechamento e limpeza da conexão
   */
  forceDisconnect() {
    this.stopHeartbeat()
    
    // Limpar requisições pendentes
    this.pendingRequests.forEach(({ reject: reqReject, timeoutId }) => {
      clearTimeout(timeoutId)
      reqReject(new Error('Conexão forçada a fechar'))
    })
    this.pendingRequests.clear()
    
    // Fechar conexão se existir
    if (this.connection) {
      try {
        // Remover listeners para evitar loops
        this.connection.onopen = null
        this.connection.onmessage = null
        this.connection.onerror = null
        this.connection.onclose = null
        
        // Fechar conexão
        if (this.connection.readyState === WebSocket.OPEN || this.connection.readyState === WebSocket.CONNECTING) {
          this.connection.close(1006, 'Conexão forçada a fechar')
        }
      } catch (e) {
        // Ignorar erro ao forçar fechamento
      }
      this.connection = null
    }
    
    // Resetar estado
    this.connectPromise = null
    this.isReconnecting = false
    // NÃO resetar reconnectAttempts aqui - deixar para o próximo connect()
  }

  /**
   * Envia uma mensagem e aguarda resposta
   * @param {object} message - Mensagem a ser enviada
   * @param {number} timeout - Timeout em milissegundos (padrão: 30000)
   * @param {number} maxRetries - Número máximo de tentativas (padrão: 1)
   */
  async send(message, timeout = 30000, maxRetries = 1) {
    let lastError = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Verificar se está conectado
        if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
          // Tentar reconectar se tiver routerId
          if (this.currentRouterId && !this.isReconnecting) {
            try {
              // Forçar limpeza antes de reconectar
              this.forceDisconnect()
              await this.connect(this.currentRouterId, true)
              // Aguardar um pouco para estabilizar
              await new Promise(resolve => setTimeout(resolve, 200))
            } catch (connectError) {
              throw new Error(`Falha ao reconectar: ${connectError.message}`)
            }
          } else {
            throw new Error(`WebSocket não está conectado (estado: ${this.connection?.readyState || 'null'})`)
          }
        }

        return await new Promise((resolve, reject) => {
          const id = ++this.messageId
          const request = { ...message, id }

          // Configurar timeout
          const timeoutId = setTimeout(() => {
            this.pendingRequests.delete(id)
            const error = new Error(`Timeout ao aguardar resposta após ${timeout}ms`)
            error.code = 'TIMEOUT'
            
            // Se não for o último attempt, não forçar desconexão ainda
            if (attempt < maxRetries) {
              reject(error)
            } else {
              // Último attempt falhou com timeout - conexão provavelmente está morta
              this.forceDisconnect()
              reject(error)
            }
          }, timeout)

          // Armazenar callback
          this.pendingRequests.set(id, { resolve, reject, timeoutId })

          // Enviar mensagem
          try {
            if (this.connection.readyState !== WebSocket.OPEN) {
              clearTimeout(timeoutId)
              this.pendingRequests.delete(id)
              reject(new Error('Conexão fechada durante envio'))
              return
            }
            
            this.connection.send(JSON.stringify(request))
          } catch (error) {
            clearTimeout(timeoutId)
            this.pendingRequests.delete(id)
            // Erro ao enviar - conexão provavelmente está morta
            console.error(`[WebSocket] Erro ao enviar mensagem:`, error)
            this.forceDisconnect()
            reject(new Error(`Erro ao enviar mensagem: ${error.message}`))
          }
        })
      } catch (error) {
        lastError = error
        
        // Se foi timeout e não é o último attempt, aguardar antes de tentar novamente
        if (error.code === 'TIMEOUT' && attempt < maxRetries) {
          console.warn(`[WebSocket] ⚠️ Timeout (tentativa ${attempt + 1}/${maxRetries + 1}) - aguardando antes de retry...`)
          const delay = Math.min(1000 * Math.pow(2, attempt), 3000) // Backoff exponencial, max 3s
          await new Promise(resolve => setTimeout(resolve, delay))
          
          // Tentar reconectar antes do próximo attempt
          if (this.currentRouterId && !this.isReconnecting) {
            try {
              console.log(`[WebSocket] 🔄 Reconectando após timeout...`)
              this.forceDisconnect()
              await this.connect(this.currentRouterId, true)
              await new Promise(resolve => setTimeout(resolve, 200))
            } catch (connectError) {
              console.error(`[WebSocket] ❌ Erro ao reconectar após timeout:`, connectError)
            }
          }
        } else if (error.code !== 'TIMEOUT') {
          console.warn(`[WebSocket] ⚠️ Erro ao enviar mensagem (tentativa ${attempt + 1}/${maxRetries + 1}):`, error.message)
          
          // Se não for o último attempt, aguardar antes de tentar novamente
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000) // Backoff exponencial, max 5s
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    // Se foi timeout, forçar reconexão para próxima vez
    if (lastError?.code === 'TIMEOUT') {
      this.forceDisconnect()
    }
    
    throw lastError || new Error('Falha ao enviar mensagem após todas as tentativas')
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
    }, 10000, 0) // Timeout de 10s, sem retry (para não sobrecarregar)
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
    }, 60000, 1) // Timeout de 60s, 1 retry (comandos podem demorar)
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
