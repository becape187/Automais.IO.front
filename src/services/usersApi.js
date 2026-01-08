import api from './api'

export const usersApi = {
  // Listar usuários do tenant
  getByTenant: async (tenantId) => {
    const response = await api.get(`/tenants/${tenantId}/users`)
    return response.data
  },

  // Obter usuário por ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Criar usuário
  create: async (tenantId, data) => {
    const response = await api.post(`/tenants/${tenantId}/users`, data)
    return response.data
  },

  // Atualizar usuário
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  // Deletar usuário
  delete: async (id) => {
    await api.delete(`/users/${id}`)
  },

  // Atualizar redes do usuário
  updateNetworks: async (id, data) => {
    const response = await api.post(`/users/${id}/networks`, data)
    return response.data
  },

  // Obter rotas disponíveis do tenant
  getAvailableRoutes: async (tenantId) => {
    const response = await api.get(`/tenants/${tenantId}/routes`)
    return response.data
  },

  // Obter rotas permitidas do usuário
  getUserRoutes: async (id) => {
    const response = await api.get(`/users/${id}/routes`)
    return response.data
  },

  // Atualizar rotas permitidas do usuário
  updateUserRoutes: async (id, data) => {
    await api.put(`/users/${id}/routes`, data)
  },
}

