import { Package, Plus, Search, MoreVertical, Cpu, Activity } from 'lucide-react'
import clsx from 'clsx'

const applications = [
  {
    id: 1,
    name: 'Monitoramento HVAC',
    description: 'Sensores de temperatura e umidade em ambientes climatizados',
    deviceCount: 45,
    activeDevices: 43,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Gestão Energética',
    description: 'Medidores de consumo elétrico em tempo real',
    deviceCount: 32,
    activeDevices: 32,
    status: 'active',
    createdAt: '2024-02-03',
  },
  {
    id: 3,
    name: 'Controle de Estoque',
    description: 'Monitoramento de condições em armazéns',
    deviceCount: 28,
    activeDevices: 27,
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: 4,
    name: 'Logística',
    description: 'Rastreamento de veículos e cargas',
    deviceCount: 15,
    activeDevices: 12,
    status: 'warning',
    createdAt: '2024-03-05',
  },
]

export default function Applications() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas aplicações IoT e devices associados
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Nova Application
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar applications..."
            className="w-full pl-10 input"
          />
        </div>
        <select className="input w-48">
          <option>Todos os status</option>
          <option>Ativos</option>
          <option>Com alertas</option>
        </select>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="card p-6 card-hover cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-purple rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {app.description}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{app.deviceCount}</span> devices
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-green-600">{app.activeDevices}</span> ativos
                </span>
              </div>
              <div className="ml-auto">
                <span className={clsx(
                  'badge',
                  app.status === 'active' && 'badge-success',
                  app.status === 'warning' && 'badge-warning'
                )}>
                  {app.status === 'active' ? 'Operacional' : 'Atenção'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

