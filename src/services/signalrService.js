import * as signalR from '@microsoft/signalr'
import { SIGNALR_BASE_URL } from '../config/api'

class SignalRService {
  constructor() {
    this.connection = null
    this.listeners = new Map()
  }

  // Conectar ao hub SignalR
  async connect() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection
    }

    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      // Aguardar conexão existente
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (this.connection?.state === signalR.HubConnectionState.Connected) {
            clearInterval(checkConnection)
            resolve(this.connection)
          } else if (this.connection?.state === signalR.HubConnectionState.Disconnected) {
            clearInterval(checkConnection)
            reject(new Error('Falha ao conectar'))
          }
        }, 100)
      })
    }

    // Criar nova conexão
    const hubUrl = `${SIGNALR_BASE_URL}/router-status`
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Reconectar após 0, 2, 10 e 30 segundos
          if (retryContext.previousRetryCount === 0) return 0
          if (retryContext.previousRetryCount === 1) return 2000
          if (retryContext.previousRetryCount === 2) return 10000
          return 30000
        },
      })
      .build()

    // Registrar listeners para eventos do hub
    this.connection.on('RouterStatusChanged', (data) => {
      this.emit('RouterStatusChanged', data)
    })

    // Tratamento de erros
    this.connection.onclose((error) => {
      console.error('SignalR conexão fechada:', error)
      this.emit('connectionClosed', error)
    })

    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconectando...', error)
      this.emit('reconnecting', error)
    })

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconectado:', connectionId)
      this.emit('reconnected', connectionId)
    })

    try {
      await this.connection.start()
      console.log('SignalR conectado com sucesso')
      return this.connection
    } catch (error) {
      console.error('Erro ao conectar SignalR:', error)
      throw error
    }
  }

  // Desconectar
  async disconnect() {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      this.listeners.clear()
    }
  }

  // Registrar listener para eventos
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

  // Emitir evento para listeners
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

  // Verificar se está conectado
  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  // Obter estado da conexão
  getState() {
    return this.connection?.state || signalR.HubConnectionState.Disconnected
  }
}

// Exportar instância singleton
export const signalRService = new SignalRService()

