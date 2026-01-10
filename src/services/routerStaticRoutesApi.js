import api from './api'

export const routerStaticRoutesApi = {
  // Listar rotas estáticas de um router
  getByRouter: async (routerId) => {
    const response = await api.get(`/routers/${routerId}/routes`)
    return response.data
  },

  // Obter rota por ID
  getById: async (routerId, routeId) => {
    const response = await api.get(`/routers/${routerId}/routes/${routeId}`)
    return response.data
  },

  // Criar rota estática
  create: async (routerId, data) => {
    const response = await api.post(`/routers/${routerId}/routes`, data)
    return response.data
  },

  // Atualizar rota estática
  update: async (routerId, routeId, data) => {
    const response = await api.put(`/routers/${routerId}/routes/${routeId}`, data)
    return response.data
  },

  // Deletar rota estática
  delete: async (routerId, routeId) => {
    await api.delete(`/routers/${routerId}/routes/${routeId}`)
  },

  // Atualizar status em lote (adicionar/remover)
  batchUpdateStatus: async (routerId, data) => {
    const response = await api.post(`/routers/${routerId}/routes/batch-status`, data)
    return response.data
  },

  // Aplicar rotas pendentes no RouterOS
  applyRoutes: async (routerId) => {
    const response = await api.post(`/routers/${routerId}/routes/apply`)
    return response.data
  },
}
