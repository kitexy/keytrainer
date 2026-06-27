/**
 * ChartCard — 图表统一容器
 *
 * 暗色毛玻璃卡片，包裹所有 Recharts 图表，
 * 保证视觉一致性。
 */

import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export default function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-gray-900/40 border border-gray-800/40 rounded-xl p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}
