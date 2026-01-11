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

// URL do WebSocket RouterOS (serviço Python)
// Esta URL é construída dinamicamente baseada no ServerEndpoint da VpnNetwork do router
// Função para construir URL do WebSocket baseada no ServerEndpoint
export const getRouterOsWsUrl = (serverEndpoint) => {
  if (!serverEndpoint) {
    // Fallback para URL padrão se não houver ServerEndpoint
    return isProduction 
      ? 'ws://automais.io:8765'
      : 'ws://localhost:8765'
  }
  
  // Construir URL baseada no ServerEndpoint
  // Se o ServerEndpoint já contém protocolo, usar; senão, adicionar ws://
  if (serverEndpoint.startsWith('ws://') || serverEndpoint.startsWith('wss://')) {
    // Se já tem porta, usar como está; senão, adicionar porta padrão
    if (serverEndpoint.includes(':')) {
      return serverEndpoint
    }
    return `${serverEndpoint}:8765`
  }
  
  // Adicionar protocolo e porta
  return `ws://${serverEndpoint}:8765`
}

// URL padrão (para compatibilidade, mas deve ser substituída por getRouterOsWsUrl)
export const ROUTEROS_WS_URL = isProduction 
  ? 'ws://automais.io:8765'
  : 'ws://localhost:8765'
