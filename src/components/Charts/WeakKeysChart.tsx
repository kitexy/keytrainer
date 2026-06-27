/**
 * WeakKeysChart — 薄弱键位水平柱状图
 *
 * 展示错误率最高的键位，颜色按错误率梯度变化。
 * macOS 暗色主题风格。
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export interface WeakKey {
  keyCode: string
  expected: string
  finger: string
  total: number
  errors: number
  errorRate: number
}

interface WeakKeysChartProps {
  data: WeakKey[]
}

// 错误率 → 颜色（低 → 高）
function errorColor(rate: number): string {
  if (rate <= 5)  return '#4ade80'   // 绿 — 熟练
  if (rate <= 15) return '#facc15'   // 黄 — 一般
  if (rate <= 30) return '#f97316'   // 橙 — 薄弱
  return '#ef4444'                    // 红 — 极弱
}

export default function WeakKeysChart({ data }: WeakKeysChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-600 py-8 text-center">尚无足够数据（每个键需要至少 5 次击键）</p>
  }

  // Recharts 水平柱状图 Y 轴是分类，X 轴是数值
  // 取 Top 10，倒序使最大的在上方
  const top10 = data.slice(0, 10).reverse()

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, top10.length * 36)}>
      <BarChart
        data={top10}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="0" stroke="transparent" />
        <XAxis
          type="number"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="expected"
          tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f1f2e',
            border: '1px solid #374151',
            borderRadius: 10,
            fontSize: 12,
            color: '#e5e7eb',
          }}
          formatter={(value: number, _name: string, props: any) => [
            `${value}% (${props.payload.errors}/${props.payload.total}次)`,
            '错误率',
          ]}
          labelFormatter={(label) => `键位: ${label}`}
        />
        <Bar dataKey="errorRate" radius={[0, 6, 6, 0]} barSize={16}>
          {top10.map((entry, i) => (
            <Cell key={i} fill={errorColor(entry.errorRate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
