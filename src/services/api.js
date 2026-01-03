import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação quando necessário
api.interceptors.request.use(
  (config) => {
    // TODO: Adicionar token de autenticação quando implementar auth
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro da API
      const message = error.response.data?.message || 'Erro ao processar requisição'
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // Erro de rede
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'))
    } else {
      return Promise.reject(error)
    }
  }
)

export default api

