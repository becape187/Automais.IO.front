// Configuração da API
// Detecta automaticamente se está em produção ou desenvolvimento

// Função para verificar se está em produção (lazy evaluation para evitar problemas de inicialização)
function checkIsProduction() {
  if (typeof window === 'undefined') return false
  try {
    const hostname = window.location.hostname
    return hostname === 'automais.io' || hostname === 'www.automais.io'
  } catch {
    return false
  }
}

// Cache do resultado para evitar múltiplas verificações
let _isProduction = null
function getIsProduction() {
  if (_isProduction === null) {
    _isProduction = checkIsProduction()
  }
  return _isProduction
}

// Exportar como função para evitar problemas de inicialização
export function isProduction() {
  return getIsProduction()
}

// URL base da API
// Em produção: HTTPS direto na porta 5001 (sem nginx)
// Em desenvolvimento: usa proxy do Vite (/api)
export function getApiBaseUrl() {
  return getIsProduction() 
    ? 'https://automais.io:5001/api'
    : '/api'
}

// Exportar como constante (calculado na primeira importação)
// getApiBaseUrl() é seguro pois verifica window antes de usar
export const API_BASE_URL = getApiBaseUrl()

// URL base para SignalR
export function getSignalRBaseUrl() {
  return getIsProduction()
    ? 'https://automais.io:5001/hubs'
    : '/hubs'
}

// Exportar como constante (calculado na primeira importação)
export const SIGNALR_BASE_URL = getSignalRBaseUrl()

// Função auxiliar para detectar se está em HTTPS
function getIsHttps() {
  if (typeof window === 'undefined') return false
  try {
    return window.location.protocol === 'https:'
  } catch {
    return false
  }
}

// Função auxiliar para obter protocolo WebSocket
function getWsProtocol() {
  return getIsHttps() ? 'wss://' : 'ws://'
}

// URL do WebSocket RouterOS (via API C# como proxy)
// A API C# faz proxy para o servidor routeros.io Python baseado no routerId
// IMPORTANTE: Detecta automaticamente se deve usar ws:// ou wss:// baseado no protocolo da página
// Função para construir URL do WebSocket na API C# baseada no routerId
export function getRouterOsWsUrl(routerId) {
  if (!routerId) {
    throw new Error('routerId é obrigatório para conectar ao WebSocket RouterOS')
  }
  
  // Construir URL do WebSocket na API C#: /api/ws/routeros/{routerId}
  // A API C# fará o proxy para o routeros.io Python baseado no ServerEndpoint da VpnNetwork
  const wsPath = `/api/ws/routeros/${routerId}`
  const wsProtocol = getWsProtocol()
  
  if (getIsProduction()) {
    // Em produção, usar o mesmo host da API
    return `${wsProtocol}automais.io:5001${wsPath}`
  } else {
    // Em desenvolvimento, usar localhost (o proxy do Vite não funciona para WebSocket, usar localhost direto)
    return `${wsProtocol}localhost:5000${wsPath}`
  }
}

// URL padrão (para compatibilidade, mas deve ser substituída por getRouterOsWsUrl)
// Detecta automaticamente se deve usar ws:// ou wss:// baseado no protocolo da página
// Usar função para evitar execução durante inicialização do módulo
export function getRouterOsWsUrlDefault() {
  const defaultWsProtocol = getWsProtocol()
  return getIsProduction() 
    ? `${defaultWsProtocol}automais.io:5001/api/ws/routeros`
    : `${defaultWsProtocol}localhost:5000/api/ws/routeros`
}

// NOTA: ROUTEROS_WS_URL foi removido pois não está sendo usado
// Use getRouterOsWsUrl(routerId) ao invés disso
