import { Cpu, Activity, Clock } from 'lucide-react'
import clsx from 'clsx'

const devices = [
  { 
    id: 1, 
    name: 'Sensor Temperatura - Sala 101', 
    devEui: '0123456789ABCDEF',
    application: 'Monitoramento HVAC',
    status: 'active',
    lastSeen: '2 minutos atrás',
    battery: 87,
  },
  { 
    id: 2, 
    name: 'Medidor Energia - Bloco A', 
    devEui: 'FEDCBA9876543210',
    application: 'Gestão Energética',
    status: 'active',
    lastSeen: '5 minutos atrás',
    battery: 92,
  },
  { 
    id: 3, 
    name: 'Sensor Umidade - Armazém 3', 
    devEui: '1122334455667788',
    application: 'Controle de Estoque',
    status: 'active',
    lastSeen: '1 minuto atrás',
    battery: 65,
  },
  { 
    id: 4, 
    name: 'GPS Tracker - Veículo 042', 
    devEui: '8877665544332211',
    application: 'Logística',
    status: 'warning',
    lastSeen: '45 minutos atrás',
    battery: 23,
  },
  { 
    id: 5, 
    name: 'Sensor Vazão - Linha 5', 
    devEui: 'AABBCCDDEEFF0011',
    application: 'Monitoramento Industrial',
    status: 'active',
    lastSeen: '3 minutos atrás',
    battery: 78,
  },
]

export default function RecentDevices() {
  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Devices Recentes</h3>
          <p className="text-sm text-gray-600 mt-1">Última atividade dos dispositivos</p>
        </div>
        <button className="btn btn-primary">
          Adicionar Device
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
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
                Bateria
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Última Atividade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {devices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50 transition-colors">
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
                  <span 
                    className={clsx(
                      'badge',
                      device.status === 'active' && 'badge-success',
                      device.status === 'warning' && 'badge-warning',
                      device.status === 'inactive' && 'badge-gray'
                    )}
                  >
                    <Activity className="w-3 h-3" />
                    {device.status === 'active' ? 'Ativo' : 'Atenção'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          'h-full rounded-full transition-all',
                          device.battery > 50 ? 'bg-green-500' : 
                          device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${device.battery}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-10">
                      {device.battery}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {device.lastSeen}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

