// Configuração da API
// Detecta automaticamente se está em produção ou desenvolvimento

export const isProduction = 
  window.location.hostname === 'automais.io' || 
  window.location.hostname === 'www.automais.io'

// URL base da API
// Em produção: HTTPS direto na porta 5001 (sem nginx)
// Em desenvolvimento: usa proxy do Vite (/api)
export const API_BASE_URL = isProduction 
  ? 'https://automais.io:5001/api'
  : '/api'

// URL base para SignalR
export const SIGNALR_BASE_URL = isProduction
  ? 'https://automais.io:5001/hubs'
  : '/hubs'

