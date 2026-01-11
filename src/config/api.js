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

// URL do WebSocket RouterOS (via API C# como proxy)
// A API C# faz proxy para o servidor routeros.io Python baseado no routerId
// IMPORTANTE: Detecta automaticamente se deve usar ws:// ou wss:// baseado no protocolo da página
// Função para construir URL do WebSocket na API C# baseada no routerId
export const getRouterOsWsUrl = (routerId) => {
  // Detectar se a página está em HTTPS para usar wss:// (WebSocket seguro)
  // Páginas HTTPS não podem conectar a WebSockets inseguros (ws://)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const wsProtocol = isHttps ? 'wss://' : 'ws://'
  
  if (!routerId) {
    throw new Error('routerId é obrigatório para conectar ao WebSocket RouterOS')
  }
  
  // Construir URL do WebSocket na API C#: /api/ws/routeros/{routerId}
  // A API C# fará o proxy para o routeros.io Python baseado no ServerEndpoint da VpnNetwork
  const wsPath = `/api/ws/routeros/${routerId}`
  
  if (isProduction) {
    // Em produção, usar o mesmo host da API
    return `${wsProtocol}automais.io:5001${wsPath}`
  } else {
    // Em desenvolvimento, usar localhost (o proxy do Vite não funciona para WebSocket, usar localhost direto)
    return `${wsProtocol}localhost:5000${wsPath}`
  }
}

// URL padrão (para compatibilidade, mas deve ser substituída por getRouterOsWsUrl)
// Detecta automaticamente se deve usar ws:// ou wss:// baseado no protocolo da página
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
const defaultWsProtocol = isHttps ? 'wss://' : 'ws://'
export const ROUTEROS_WS_URL = isProduction 
  ? `${defaultWsProtocol}automais.io:5001/api/ws/routeros`
  : `${defaultWsProtocol}localhost:5000/api/ws/routeros`
