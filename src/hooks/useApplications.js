import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '../services/applicationsApi'
import { getTenantId } from '../config/tenant'

export const useApplications = () => {
  const tenantId = getTenantId()

  return useQuery({
    queryKey: ['applications', tenantId],
    queryFn: () => applicationsApi.getByTenant(tenantId),
    enabled: !!tenantId,
  })
}

export const useApplication = (id) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateApplication = () => {
  const queryClient = useQueryClient()
  const tenantId = getTenantId()

  return useMutation({
    mutationFn: (data) => applicationsApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', tenantId] })
    },
  })
}

export const useUpdateApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => applicationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export const useDeleteApplication = () => {
  const queryClient = useQueryClient()
  const tenantId = getTenantId()

  return useMutation({
    mutationFn: (id) => applicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', tenantId] })
    },
  })
}

