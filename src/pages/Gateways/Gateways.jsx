import { Radio, Plus, Search, MapPin, Signal, Activity, Wifi } from 'lucide-react'
import clsx from 'clsx'

const gateways = [
  {
    id: 1,
    name: 'Gateway Matriz',
    eui: '0011223344556677',
    location: 'São Paulo - SP',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    status: 'online',
    signal: 98,
    devicesConnected: 45,
    uptime: '15 dias',
    lastSeen: 'Agora',
  },
  {
    id: 2,
    name: 'Gateway Filial 01',
    eui: '7766554433221100',
    location: 'Rio de Janeiro - RJ',
    coordinates: { lat: -22.9068, lng: -43.1729 },
    status: 'online',
    signal: 85,
    devicesConnected: 32,
    uptime: '8 dias',
    lastSeen: '1 min',
  },
  {
    id: 3,
    name: 'Gateway Armazém',
    eui: 'AABBCCDDEEFF0011',
    location: 'Belo Horizonte - MG',
    coordinates: { lat: -19.9167, lng: -43.9345 },
    status: 'online',
    signal: 92,
    devicesConnected: 28,
    uptime: '22 dias',
    lastSeen: '30 seg',
  },
  {
    id: 4,
    name: 'Gateway Porto',
    eui: '1122AABBCCDDEE00',
    location: 'Santos - SP',
    coordinates: { lat: -23.9608, lng: -46.3335 },
    status: 'online',
    signal: 78,
    devicesConnected: 15,
    uptime: '3 dias',
    lastSeen: '2 min',
  },
]

export default function Gateways() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gateways</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie seus gateways LoRaWAN
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Novo Gateway
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600 mt-1">Total de Gateways</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-sm text-gray-600 mt-1">Online</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600">0</div>
          <div className="text-sm text-gray-600 mt-1">Atenção</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-primary-600">248</div>
          <div className="text-sm text-gray-600 mt-1">Devices Conectados</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou EUI..."
            className="w-full pl-10 input"
          />
        </div>
        <select className="input w-48">
          <option>Todos os status</option>
          <option>Online</option>
          <option>Offline</option>
        </select>
      </div>

      {/* Gateways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="card p-6 card-hover cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Radio className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {gateway.name}
                    </h3>
                    <span className="badge badge-success">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {gateway.eui}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                    <MapPin className="w-3 h-3" />
                    {gateway.location}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1">Sinal</div>
                <div className="flex items-center gap-1">
                  <Signal className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">{gateway.signal}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Devices</div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-900">{gateway.devicesConnected}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Uptime</div>
                <div className="flex items-center gap-1">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">{gateway.uptime}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
              Última atividade: <span className="font-medium text-gray-900">{gateway.lastSeen}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

