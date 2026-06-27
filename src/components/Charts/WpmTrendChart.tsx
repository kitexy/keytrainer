/**
 * WpmTrendChart — WPM 趋势折线图
 *
 * Recharts LineChart，macOS 暗色主题风格：
 * - 无网格线、无边框
 * - 渐变填充面积
 * - 圆点标记 + 数值标签
 */

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'

export interface TrendPoint {
  date: string
  avgWpm: number
  sessions: number
}

interface WpmTrendChartProps {
  data: TrendPoint[]
}

export default function WpmTrendChart({ data }: WpmTrendChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-600 py-8 text-center">尚无数据</p>
  }

  // 格式化日期显示
  const formatted = data.map(d => ({
    ...d,
    label: formatShortDate(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#4ade80" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="transparent" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          dx={-4}
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f1f2e',
            border: '1px solid #374151',
            borderRadius: 10,
            fontSize: 12,
            color: '#e5e7eb',
          }}
          formatter={(value: number) => [`${value} WPM`, '平均速度']}
          labelFormatter={(label) => `${label}`}
        />
        <Area
          type="monotone"
          dataKey="avgWpm"
          stroke="#4ade80"
          strokeWidth={2}
          fill="url(#wpmGradient)"
          dot={{ r: 3, fill: '#4ade80', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#4ade80', stroke: '#1f2937', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** "2025-12-15" → "12/15" */
function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getMonth() + 1}/${d.getDate()}`
}
