import api from './api'
import { getTenantId } from '../config/tenant'

export const routersApi = {
  // Listar routers do tenant
  getByTenant: async (tenantId) => {
    const response = await api.get(`/tenants/${tenantId}/routers`)
    return response.data
  },

  // Obter router por ID
  getById: async (id) => {
    const response = await api.get(`/routers/${id}`)
    return response.data
  },

  // Criar router
  create: async (tenantId, data) => {
    const response = await api.post(`/tenants/${tenantId}/routers`, data)
    return response.data
  },

  // Atualizar router
  update: async (id, data) => {
    const response = await api.put(`/routers/${id}`, data)
    return response.data
  },

  // Deletar router
  delete: async (id) => {
    await api.delete(`/routers/${id}`)
  },

  // Testar conexão do router
  testConnection: async (id) => {
    const response = await api.post(`/routers/${id}/test-connection`)
    return response.data
  },
}

