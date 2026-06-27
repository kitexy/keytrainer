/**
 * AccuracyTrendChart — 准确率 & FCS 趋势组合图
 *
 * 双线图：准确率（蓝色）+ FCS 指法合规分（青色），
 * macOS 暗色主题风格。
 */

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export interface TrendPoint {
  date: string
  avgAccuracy: number
  avgFcs: number
}

interface AccuracyTrendChartProps {
  data: TrendPoint[]
}

export default function AccuracyTrendChart({ data }: AccuracyTrendChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-600 py-8 text-center">尚无数据</p>
  }

  const formatted = data.map(d => ({
    ...d,
    label: formatShortDate(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
          domain={[50, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f1f2e',
            border: '1px solid #374151',
            borderRadius: 10,
            fontSize: 12,
            color: '#e5e7eb',
          }}
          formatter={(value: number, name: string) => [
            `${value}%`,
            name === 'avgAccuracy' ? '准确率' : 'FCS 指法',
          ]}
          labelFormatter={(label) => `${label}`}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
          formatter={(value: string) => value === 'avgAccuracy' ? '准确率' : 'FCS 指法'}
          iconType="circle"
        />
        <Line
          type="monotone"
          dataKey="avgAccuracy"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#60a5fa', stroke: '#1f2937', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="avgFcs"
          stroke="#22d3ee"
          strokeWidth={2}
          dot={{ r: 3, fill: '#22d3ee', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#22d3ee', stroke: '#1f2937', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getMonth() + 1}/${d.getDate()}`
}
