import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'ค้นหาสัตว์', icon: '🦁' },
  { to: '/encounters', label: 'พบแล้ว', icon: '🐾' },
  { to: '/report', label: 'แจ้งพบสัตว์', icon: '📸' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex safe-b">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-green-600' : 'text-gray-400'
            }`
          }
        >
          <span className="text-2xl leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
