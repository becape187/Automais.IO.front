import { Radio, Signal, MapPin } from 'lucide-react'
import clsx from 'clsx'

const gateways = [
  { id: 1, name: 'Gateway Matriz', location: 'São Paulo - SP', status: 'online', signal: 98 },
  { id: 2, name: 'Gateway Filial 01', location: 'Rio de Janeiro - RJ', status: 'online', signal: 85 },
  { id: 3, name: 'Gateway Armazém', location: 'Belo Horizonte - MG', status: 'online', signal: 92 },
  { id: 4, name: 'Gateway Porto', location: 'Santos - SP', status: 'online', signal: 78 },
]

export default function GatewayStatus() {
  return (
    <div className="card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Status dos Gateways</h3>
        <p className="text-sm text-gray-600 mt-1">Todos os gateways operacionais</p>
      </div>

      <div className="space-y-3">
        {gateways.map((gateway) => (
          <div 
            key={gateway.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <Radio className="w-5 h-5 text-green-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {gateway.name}
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                <MapPin className="w-3 h-3" />
                {gateway.location}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {gateway.signal}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
        Ver todos os gateways
      </button>
    </div>
  )
}

