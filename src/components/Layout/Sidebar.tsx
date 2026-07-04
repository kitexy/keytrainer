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
    <aside
      className="w-52 flex flex-col shrink-0"
      style={{
        backgroundColor: 'var(--kt-sidebar-bg)',
        borderRight: '1px solid var(--kt-sidebar-border)',
      }}
    >
      {/* macOS traffic lights 占位 */}
      <div className="h-10" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Logo / 标题 */}
      <div className="px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <h1
          className="text-lg font-bold tracking-tight"
          style={{ color: 'var(--kt-sidebar-logo)' }}
        >
          KeyTrainer
        </h1>
      </div>

      {/* 导航 */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'sidebar-active' : 'sidebar-item'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 底部版本信息 */}
      <div
        className="px-5 py-4 text-[11px] border-t border-transparent"
        style={{ color: 'var(--kt-sidebar-version)' }}
      >
        KeyTrainer v0.3.0
      </div>
    </aside>
  )
}
