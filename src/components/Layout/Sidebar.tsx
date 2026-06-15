import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/finger',     label: '指位训练', icon: '⌨' },
  { to: '/practice',   label: '自由练习', icon: '✎' },
  { to: '/lessons',    label: '课程训练', icon: '📚' },
  { to: '/speed',      label: '速度测试', icon: '⚡' },
  { to: '/stats',      label: '统计分析', icon: '📊' },
  { to: '/settings',   label: '设置',     icon: '⚙' },
] as const

export default function Sidebar() {
  return (
    <aside className="w-52 bg-gray-900/80 border-r border-gray-800/60 flex flex-col shrink-0">
      {/* Logo / 标题 */}
      <div className="px-5 py-6 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <h1 className="text-lg font-bold tracking-tight text-white">KeyTrainer</h1>
      </div>

      {/* 导航 */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 底部版本信息 */}
      <div className="px-5 py-4 text-[11px] text-gray-600 border-t border-gray-800/40">
        KeyTrainer v0.1.0
      </div>
    </aside>
  )
}
