import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Cpu,
  Radio,
  Users,
  Shield,
  Settings,
  LogOut,
  Network,
} from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: Package },
  { name: 'Devices', href: '/devices', icon: Cpu },
  { name: 'Gateways', href: '/gateways', icon: Radio },
  { name: 'Routers', href: '/routers', icon: Network },
  { name: 'Usuários', href: '/users', icon: Users },
  { name: 'VPN', href: '/vpn', icon: Shield },
]

export default function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-gradient-purple overflow-y-auto shadow-purple-lg">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Radio className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-white">
              <div className="text-xl font-bold">Automais</div>
              <div className="text-xs text-primary-100">IoT Platform</div>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        <div className="px-4 py-4 bg-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-semibold">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                Acme Corporation
              </div>
              <div className="text-xs text-primary-100">
                Owner
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-white text-primary-700 shadow-lg'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-primary-100 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200">
            <Settings className="w-5 h-5" />
            Configurações
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-primary-100 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

