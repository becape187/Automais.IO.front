import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routersApi } from '../services/routersApi'
import { getTenantId } from '../config/tenant'

export const useRouters = () => {
  const tenantId = getTenantId()

  return useQuery({
    queryKey: ['routers', tenantId],
    queryFn: () => routersApi.getByTenant(tenantId),
    enabled: !!tenantId,
  })
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

