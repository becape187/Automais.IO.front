import { Shield, Plus, Search, Download, Key, Network, User, Cpu } from 'lucide-react'
import clsx from 'clsx'

const peers = [
  {
    id: 1,
    name: 'John Doe - Notebook',
    type: 'user',
    publicKey: 'xYz123...abc456',
    allowedIPs: '10.100.1.10/32',
    allowedNetworks: ['netX', 'netY'],
    isEnabled: true,
    lastHandshake: '2 minutos atrás',
    trafficRx: '125 MB',
    trafficTx: '89 MB',
  },
  {
    id: 2,
    name: 'Jane Smith - Mobile',
    type: 'user',
    publicKey: 'abc456...xyz123',
    allowedIPs: '10.100.1.11/32',
    allowedNetworks: ['netX'],
    isEnabled: true,
    lastHandshake: '1 hora atrás',
    trafficRx: '45 MB',
    trafficTx: '32 MB',
  },
  {
    id: 3,
    name: 'Device Remoto - Gateway',
    type: 'device',
    publicKey: 'def789...ghi012',
    allowedIPs: '10.100.1.50/32',
    allowedNetworks: ['netZ'],
    isEnabled: true,
    lastHandshake: '30 segundos atrás',
    trafficRx: '2.3 GB',
    trafficTx: '1.8 GB',
  },
  {
    id: 4,
    name: 'Bob Johnson - Desktop',
    type: 'user',
    publicKey: 'ghi012...def789',
    allowedIPs: '10.100.1.12/32',
    allowedNetworks: ['netY', 'netZ'],
    isEnabled: false,
    lastHandshake: 'Nunca',
    trafficRx: '0 MB',
    trafficTx: '0 MB',
  },
]

export default function WireGuard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WireGuard VPN</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie acessos VPN de usuários e devices
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Novo Peer
        </button>
      </div>

      {/* Interface Info */}
      <div className="card p-6 bg-gradient-purple text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Interface: wg-acme-corp</h3>
            </div>
            <div className="space-y-2 text-primary-100">
              <div className="flex items-center gap-2 font-mono text-sm">
                <Network className="w-4 h-4" />
                <span>Endereço: 10.100.1.1/24</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <Key className="w-4 h-4" />
                <span>Porta: 51820</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">15</div>
            <div className="text-sm text-primary-100">Peers Configurados</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-sm text-gray-600 mt-1">Peers Ativos</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-primary-600">8</div>
          <div className="text-sm text-gray-600 mt-1">Usuários</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-secondary-600">4</div>
          <div className="text-sm text-gray-600 mt-1">Devices</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600 mt-1">Redes Disponíveis</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar peers..."
            className="w-full pl-10 input"
          />
        </div>
        <select className="input w-48">
          <option>Todos os tipos</option>
          <option>Usuários</option>
          <option>Devices</option>
        </select>
        <select className="input w-48">
          <option>Todos os status</option>
          <option>Ativos</option>
          <option>Inativos</option>
        </select>
      </div>

      {/* Peers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Peer
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  IPs Permitidos
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Redes
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tráfego (RX/TX)
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Último Handshake
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {peers.map((peer) => (
                <tr key={peer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'p-2 rounded-lg',
                        peer.type === 'user' ? 'bg-primary-100' : 'bg-secondary-100'
                      )}>
                        {peer.type === 'user' ? (
                          <User className="w-4 h-4 text-primary-600" />
                        ) : (
                          <Cpu className="w-4 h-4 text-secondary-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {peer.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {peer.publicKey}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-mono text-gray-700">{peer.allowedIPs}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {peer.allowedNetworks.map((net) => (
                        <span key={net} className="badge badge-primary text-xs">
                          {net}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={clsx(
                      'badge',
                      peer.isEnabled ? 'badge-success' : 'badge-gray'
                    )}>
                      {peer.isEnabled ? 'Ativo' : 'Desabilitado'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-700">
                      <div>↓ {peer.trafficRx}</div>
                      <div>↑ {peer.trafficTx}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{peer.lastHandshake}</span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
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

