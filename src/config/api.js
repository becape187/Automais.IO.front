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
// Em produção, sempre usa WSS (WebSocket Secure) diretamente na porta 8765
// O serviço Python usa certificados Let's Encrypt para SSL
// Função para construir URL do WebSocket baseada no ServerEndpoint
export const getRouterOsWsUrl = (serverEndpoint) => {
  // Em produção, sempre usar WSS diretamente na porta 8765 (serviço Python com SSL)
  if (isProduction) {
    const host = window.location.hostname
    // Serviço Python serve WSS diretamente usando certificados Let's Encrypt
    return `wss://${host}:8765`
  }
  
  // Em desenvolvimento, usar WS direto
  const wsProtocol = 'ws://'
  
  if (!serverEndpoint) {
    // Fallback para URL padrão se não houver ServerEndpoint
    return `${wsProtocol}localhost:8765`
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
  return `${wsProtocol}${serverEndpoint}:8765`
}

// URL padrão (para compatibilidade, mas deve ser substituída por getRouterOsWsUrl)
// Usar função getter para evitar problemas de inicialização
export const getRouterOsWsUrlDefault = () => {
  if (isProduction) {
    return `wss://${window.location.hostname}:8765`
  }
  return 'ws://localhost:8765'
}
