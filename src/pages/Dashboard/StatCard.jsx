import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

export default function StatCard({ name, value, change, trend, icon: Icon, color }) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
  }

  const trendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }

  const TrendIcon = trendIcon[trend]

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{name}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          
          <div className="mt-2 flex items-center gap-1">
            <TrendIcon 
              className={clsx(
                'w-4 h-4',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-gray-600'
              )} 
            />
            <span 
              className={clsx(
                'text-sm font-medium',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-gray-600'
              )}
            >
              {change}
            </span>
            <span className="text-sm text-gray-600">vs. ontem</span>
          </div>
        </div>

        <div className={clsx('p-3 rounded-xl', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

