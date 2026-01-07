import { useEffect, useState, useRef } from 'react'
import { signalRService } from '../services/signalrService'

/**
 * Hook para gerenciar conexão SignalR e escutar eventos
 * @param {string} event - Nome do evento para escutar
 * @param {function} callback - Função callback quando o evento for disparado
 * @param {boolean} autoConnect - Se deve conectar automaticamente (padrão: true)
 */
export const useSignalR = (event, callback, autoConnect = true) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('Disconnected')
  const callbackRef = useRef(callback)

  // Atualizar callback ref quando mudar
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    let unsubscribe = null

    const connect = async () => {
      try {
        await signalRService.connect()
        setIsConnected(signalRService.isConnected())
        setConnectionState(signalRService.getState())

        // Registrar listener para o evento
        if (event && callbackRef.current) {
          unsubscribe = signalRService.on(event, (data) => {
            callbackRef.current?.(data)
          })
        }

        // Listener para mudanças de estado da conexão
        signalRService.on('reconnected', () => {
          setIsConnected(true)
          setConnectionState('Connected')
        })

        signalRService.on('reconnecting', () => {
          setIsConnected(false)
          setConnectionState('Reconnecting')
        })

        signalRService.on('connectionClosed', () => {
          setIsConnected(false)
          setConnectionState('Disconnected')
        })
      } catch (error) {
        console.error('Erro ao conectar SignalR:', error)
        setIsConnected(false)
        setConnectionState('Disconnected')
      }
    }

    if (autoConnect) {
      connect()
    }

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [event, autoConnect])

  return {
    isConnected,
    connectionState,
    connect: () => signalRService.connect(),
    disconnect: () => signalRService.disconnect(),
  }
}

