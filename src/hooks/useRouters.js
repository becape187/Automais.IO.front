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
    queryFn: () => routersApi.getByTenant(tenantId),
    enabled: !!tenantId,
  })

  // Callback para atualizar dados quando receber notificação SignalR
  const handleStatusChange = useCallback((data) => {
    // Atualizar o cache do React Query com os novos dados
    queryClient.setQueryData(['routers', tenantId], (oldData) => {
      if (!oldData) return oldData

      return oldData.map((router) => {
        if (router.id === data.routerId) {
          return {
            ...router,
            status: data.status,
            lastSeenAt: data.lastSeenAt,
          }
        }
        return router
      })
    })

    // Invalidar query individual do router também
    queryClient.invalidateQueries({ queryKey: ['router', data.routerId] })
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

