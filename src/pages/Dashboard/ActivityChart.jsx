import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Seg', mensagens: 4000 },
  { name: 'Ter', mensagens: 3000 },
  { name: 'Qua', mensagens: 5000 },
  { name: 'Qui', mensagens: 4500 },
  { name: 'Sex', mensagens: 6000 },
  { name: 'Sáb', mensagens: 3500 },
  { name: 'Dom', mensagens: 2800 },
]

export default function ActivityChart() {
  return (
    <div className="card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Atividade Semanal</h3>
        <p className="text-sm text-gray-600 mt-1">Mensagens recebidas por dia</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
          />
          <Bar 
            dataKey="mensagens" 
            fill="url(#colorGradient)" 
            radius={[8, 8, 0, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

