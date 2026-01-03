# Automais IoT Platform - Frontend

Interface web para gerenciamento da plataforma IoT multi-tenant.

## 🎨 Design System

### Paleta de Cores (Roxo)

- **Primary (Roxo)**: `#a855f7` - Elementos principais, CTAs
- **Secondary (Roxo Azulado)**: `#8b5cf6` - Elementos secundários
- **Accent (Rosa/Magenta)**: `#d946ef` - Destaques e acentos
- **Gradientes**: Combinações de roxo para criar profundidade

### Componentes

- **Sidebar**: Navegação lateral com gradiente roxo
- **Cards**: Contêineres brancos com bordas sutis
- **Botões**: Primário com gradiente, secundário sólido, outline e ghost
- **Badges**: Indicadores de status coloridos
- **Forms**: Inputs com foco roxo

## 🚀 Stack Tecnológica

- **React 18** - UI Library
- **Vite** - Build tool
- **React Router v6** - Roteamento
- **TailwindCSS** - Estilização
- **Tanstack Query** - Data fetching
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **React Hook Form + Zod** - Formulários e validação

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura

```
src/
├── components/
│   └── Layout/
│       ├── Layout.jsx      # Layout principal
│       ├── Sidebar.jsx     # Navegação lateral
│       └── Header.jsx      # Cabeçalho
├── pages/
│   ├── Auth/
│   │   └── Login.jsx       # Página de login
│   ├── Dashboard/
│   │   ├── Dashboard.jsx   # Dashboard principal
│   │   ├── StatCard.jsx    # Card de estatística
│   │   ├── ActivityChart.jsx   # Gráfico de atividade
│   │   ├── GatewayStatus.jsx   # Status dos gateways
│   │   └── RecentDevices.jsx   # Lista de devices
│   ├── Applications/       # Gestão de applications
│   ├── Devices/           # Gestão de devices
│   ├── Gateways/          # Gestão de gateways
│   ├── Users/             # Gestão de usuários
│   └── WireGuard/         # Gestão de VPN
├── App.jsx                # Componente raiz
├── main.jsx              # Entry point
└── index.css             # Estilos globais
```

## 🎯 Páginas Implementadas

### ✅ Login
- Autenticação (mockup)
- Design roxo elegante
- Campos de email/senha
- Demo mode habilitado

### ✅ Dashboard
- Cards de estatísticas com ícones
- Gráfico de atividade semanal
- Status dos gateways
- Tabela de devices recentes

### ✅ Applications
- Grid de applications
- Estatísticas por app
- Busca e filtros

### ✅ Devices
- Tabela completa de devices
- Status, bateria, sinal
- Filtros por application
- Estatísticas gerais

### ✅ Gateways
- Grid de gateways
- Status online/offline
- Sinal e uptime
- Localização

### ✅ Users
- Tabela de usuários
- Roles (Owner, Admin, Operator, Viewer)
- Status ativo/inativo
- Convite de novos usuários

### ✅ WireGuard
- Gestão de peers VPN
- Peers de usuários e devices
- Redes permitidas
- Tráfego RX/TX

## 🎨 Classes Utilitárias

### Botões
```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-outline">Outline</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-danger">Danger</button>
```

### Badges
```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
<span className="badge badge-gray">Gray</span>
```

### Cards
```jsx
<div className="card">Conteúdo</div>
<div className="card card-hover">Com hover</div>
```

### Inputs
```jsx
<input className="input" />
<label className="label">Label</label>
```

## 🔜 Próximos Passos

1. **Integração com API**
   - Configurar Axios
   - Criar hooks com React Query
   - Implementar autenticação real

2. **Modais e Formulários**
   - Modal de criação de devices
   - Modal de criação de applications
   - Formulários com validação Zod

3. **Detalhes e Edição**
   - Página de detalhes do device
   - Página de detalhes do gateway
   - Edição inline

4. **Telemetria em Tempo Real**
   - WebSocket para updates
   - Gráficos ao vivo
   - Alertas em tempo real

5. **Responsividade Mobile**
   - Menu mobile
   - Layout adaptativo
   - Gestos touch

## 🎨 Customização

Para alterar as cores, edite `tailwind.config.js`:

```js
colors: {
  primary: { ... },  // Sua cor principal
  secondary: { ... }, // Cor secundária
  // etc
}
```

## 📝 Notas

- Este é um **mockup funcional** com dados estáticos
- Todas as ações ainda não persistem (sem backend)
- Design focado em UX/UI moderna e limpa
- Paleta roxa elegante e profissional

