import { Cpu, Plus, Search, Filter, Download, MapPin, Battery, Signal } from 'lucide-react'
import clsx from 'clsx'

const devices = [
  {
    id: 1,
    name: 'Sensor Temperatura - Sala 101',
    devEui: '0123456789ABCDEF',
    application: 'Monitoramento HVAC',
    status: 'active',
    battery: 87,
    signal: 95,
    location: 'São Paulo - SP',
    lastSeen: '2 min',
  },
  {
    id: 2,
    name: 'Medidor Energia - Bloco A',
    devEui: 'FEDCBA9876543210',
    application: 'Gestão Energética',
    status: 'active',
    battery: 92,
    signal: 88,
    location: 'São Paulo - SP',
    lastSeen: '5 min',
  },
  {
    id: 3,
    name: 'Sensor Umidade - Armazém 3',
    devEui: '1122334455667788',
    application: 'Controle de Estoque',
    status: 'active',
    battery: 65,
    signal: 92,
    location: 'Guarulhos - SP',
    lastSeen: '1 min',
  },
  {
    id: 4,
    name: 'GPS Tracker - Veículo 042',
    devEui: '8877665544332211',
    application: 'Logística',
    status: 'warning',
    battery: 23,
    signal: 78,
    location: 'Em trânsito',
    lastSeen: '45 min',
  },
  {
    id: 5,
    name: 'Sensor Vazão - Linha 5',
    devEui: 'AABBCCDDEEFF0011',
    application: 'Monitoramento Industrial',
    status: 'active',
    battery: 78,
    signal: 85,
    location: 'São Bernardo - SP',
    lastSeen: '3 min',
  },
]

export default function Devices() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie todos os seus dispositivos IoT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Novo Device
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">248</div>
          <div className="text-sm text-gray-600 mt-1">Total de Devices</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">235</div>
          <div className="text-sm text-gray-600 mt-1">Ativos</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600">8</div>
          <div className="text-sm text-gray-600 mt-1">Atenção</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-600">5</div>
          <div className="text-sm text-gray-600 mt-1">Offline</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou DevEUI..."
            className="w-full pl-10 input"
          />
        </div>
        <select className="input w-48">
          <option>Todas as applications</option>
          <option>Monitoramento HVAC</option>
          <option>Gestão Energética</option>
          <option>Logística</option>
        </select>
        <button className="btn btn-ghost">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Devices Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Device
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Application
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sinal
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bateria
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Localização
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Última Atividade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Cpu className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {device.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {device.devEui}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">{device.application}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={clsx(
                      'badge',
                      device.status === 'active' && 'badge-success',
                      device.status === 'warning' && 'badge-warning',
                      device.status === 'offline' && 'badge-error'
                    )}>
                      {device.status === 'active' ? 'Ativo' : device.status === 'warning' ? 'Atenção' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Signal className={clsx(
                        'w-4 h-4',
                        device.signal > 80 ? 'text-green-600' : 
                        device.signal > 50 ? 'text-yellow-600' : 'text-red-600'
                      )} />
                      <span className="text-sm text-gray-700">{device.signal}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Battery className={clsx(
                        'w-4 h-4',
                        device.battery > 50 ? 'text-green-600' : 
                        device.battery > 20 ? 'text-yellow-600' : 'text-red-600'
                      )} />
                      <span className="text-sm text-gray-700">{device.battery}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {device.location}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{device.lastSeen}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

