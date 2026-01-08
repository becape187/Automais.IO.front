import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routersApi } from '../services/routersApi'
import { getTenantId } from '../config/tenant'
import { useSignalR } from './useSignalR'
import { useCallback } from 'react'

export const useRouters = () => {
  const tenantId = getTenantId()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['routers', tenantId],
    queryFn: async () => {
      console.log('🔄 Refetching routers...')
      const data = await routersApi.getByTenant(tenantId)
      console.log('✅ Routers atualizados do servidor:', data.length, 'routers')
      return data
    },
    enabled: !!tenantId,
    // Atualizar automaticamente a cada 10 segundos
    refetchInterval: 10000, // 10 segundos
    // Manter dados em cache enquanto atualiza em background
    refetchIntervalInBackground: true,
    // Não parar de atualizar quando a janela está em foco
    refetchOnWindowFocus: true,
    // Sempre mostrar dados atualizados, mesmo durante refetch
    keepPreviousData: false,
  })

  // Callback para atualizar dados quando receber notificação SignalR
  const handleStatusChange = useCallback((data) => {
    console.log('📡 RouterStatusChanged recebido:', data)
    
    // Atualizar o cache do React Query com os novos dados
    queryClient.setQueryData(['routers', tenantId], (oldData) => {
      if (!oldData) {
        console.warn('⚠️ Dados antigos não encontrados, invalidando query')
        queryClient.invalidateQueries({ queryKey: ['routers', tenantId] })
        return oldData
      }

      const updated = oldData.map((router) => {
        // Comparar IDs como strings para evitar problemas de tipo
        const routerIdStr = String(router.id)
        const dataRouterIdStr = String(data.routerId || data.RouterId)
        
        if (routerIdStr === dataRouterIdStr) {
          const newStatus = data.status || data.Status
          const newLastSeenAt = data.lastSeenAt || data.LastSeenAt
          const newLatency = data.latency !== undefined ? data.latency : (data.Latency !== undefined ? data.Latency : router.latency)
          
          console.log(`✅ Atualizando router ${router.name}: ${router.status} → ${newStatus}, Latency: ${newLatency}ms`)
          
          // Sempre criar novo objeto para garantir que React detecte a mudança
          return {
            ...router,
            status: newStatus,
            lastSeenAt: newLastSeenAt,
            latency: newLatency,
            // Atualizar outros campos se vierem no SignalR
            ...(data.hardwareInfo && { hardwareInfo: data.hardwareInfo }),
            ...(data.model && { model: data.model }),
            ...(data.firmwareVersion && { firmwareVersion: data.firmwareVersion }),
            // Adicionar timestamp para forçar atualização visual
            _updatedAt: Date.now(),
          }
        }
        return router
      })
      
      // Verificar se algum router foi atualizado
      const wasUpdated = updated.some((router, index) => {
        const oldRouter = oldData[index]
        return oldRouter && (
          router.status !== oldRouter.status || 
          router.lastSeenAt !== oldRouter.lastSeenAt ||
          router.latency !== oldRouter.latency
        )
      })
      
      if (!wasUpdated) {
        console.warn('⚠️ Nenhum router foi atualizado. RouterId recebido:', data.routerId || data.RouterId)
        console.log('Routers disponíveis:', oldData.map(r => ({ id: r.id, name: r.name })))
      }
      
      return updated
    })

    // Invalidar query individual do router também
    const routerId = data.routerId || data.RouterId
    if (routerId) {
      queryClient.invalidateQueries({ queryKey: ['router', routerId] })
    }
  }, [tenantId, queryClient])

  // Escutar atualizações de status via SignalR
  useSignalR('RouterStatusChanged', handleStatusChange)

  return query
}

export const useRouter = (id) => {
  return useQuery({
    queryKey: ['router', id],
    queryFn: () => routersApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateRouter = () => {
  const queryClient = useQueryClient()
  const tenantId = getTenantId()

  return useMutation({
    mutationFn: (data) => routersApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers', tenantId] })
    },
  })
}

export const useUpdateRouter = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => routersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['router', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['routers'] })
    },
  })
}

export const useDeleteRouter = () => {
  const queryClient = useQueryClient()
  const tenantId = getTenantId()

  return useMutation({
    mutationFn: (id) => routersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers', tenantId] })
    },
  })
}

export const useTestRouterConnection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => routersApi.testConnection(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['router', id] })
      queryClient.invalidateQueries({ queryKey: ['routers'] })
    },
  })
}

