// Configuração do Tenant
// TODO: Implementar contexto de autenticação para obter o tenantId do usuário logado
// Por enquanto, usando um GUID fixo para testes

// Para usar em produção, substitua por:
// - Contexto de autenticação
// - LocalStorage/SessionStorage
// - Redux/Zustand store

export const getTenantId = () => {
  // Por enquanto retornando um GUID fixo para testes
  // Em produção, isso virá do contexto de autenticação
  const storedTenantId = localStorage.getItem('tenantId')
  if (storedTenantId) {
    return storedTenantId
  }
  
  // GUID padrão para desenvolvimento
  // Substitua pelo tenantId real do seu ambiente
  return '00000000-0000-0000-0000-000000000000'
}

export const setTenantId = (tenantId) => {
  localStorage.setItem('tenantId', tenantId)
}

