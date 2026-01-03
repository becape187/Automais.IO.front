import api from './api'

export const applicationsApi = {
  // Listar applications do tenant
  getByTenant: async (tenantId) => {
    const response = await api.get(`/tenants/${tenantId}/applications`)
    return response.data
  },

  // Obter application por ID
  getById: async (id) => {
    const response = await api.get(`/applications/${id}`)
    return response.data
  },

  // Criar application
  create: async (tenantId, data) => {
    const response = await api.post(`/tenants/${tenantId}/applications`, data)
    return response.data
  },

  // Atualizar application
  update: async (id, data) => {
    const response = await api.put(`/applications/${id}`, data)
    return response.data
  },

  // Deletar application
  delete: async (id) => {
    await api.delete(`/applications/${id}`)
  },
}

