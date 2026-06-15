import { useState, useEffect } from 'react'

// ─── 类型 ────────────────────────────────────────────────────

interface HistoryEntry {
  mode: string
  wpm: number
  accuracy: number
  fcs: number
  duration: number
  errorCount: number
  totalKeystrokes: number
  date: string
}

// 从 localStorage 读取所有练习记录
function loadHistory(): HistoryEntry[] {
  try {
    const lessons = JSON.parse(localStorage.getItem('keytrainer-lessons') || '{}')
    const entries: HistoryEntry[] = []
    for (const [level, record] of Object.entries(lessons) as [string, any][]) {
      if (record.completedAt) {
        entries.push({
          mode: `课程 L${level}`,
          wpm: record.bestWpm || 0,
          accuracy: record.bestAccuracy || 0,
          fcs: record.bestFcs || 0,
          duration: 0,
          errorCount: 0,
          totalKeystrokes: 0,
          date: record.completedAt,
        })
      }
    }
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
}

// ─── SVG 图表组件 ─────────────────────────────────────────────

// ─── 趋势图 ───────────────────────────────────────────────────

function TrendChart({ data, label, color = '#60a5fa' }: { data: { date: string; value: number }[], label: string, color?: string }) {
  if (data.length === 0) return null
  const chartW = 600
  const chartH = 120
  const padX = 20
  const padY = 20
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const minVal = 0

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * (chartW - padX * 2)
    const y = chartH - padY - ((d.value - minVal) / (maxVal - minVal)) * (chartH - padY * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{label}</h3>
      {data.length <= 1 ? (
        <p className="text-sm text-gray-600 py-8 text-center">需要更多练习数据来绘制趋势</p>
      ) : (
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: chartH }}>
          {/* 网格线 */}
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <line key={pct}
              x1={padX} y1={chartH - padY - (chartH - padY * 2) * pct}
              x2={chartW - padX} y2={chartH - padY - (chartH - padY * 2) * pct}
              stroke="#374151" strokeWidth={0.5} strokeDasharray="4 2"
            />
          ))}
          {/* 折线 */}
          <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {/* 数据点 */}
          {data.map((d, i) => {
            const x = padX + (i / Math.max(data.length - 1, 1)) * (chartW - padX * 2)
            const y = chartH - padY - ((d.value - minVal) / (maxVal - minVal)) * (chartH - padY * 2)
            return <circle key={i} cx={x} cy={y} r={3} fill={color} />
          })}
        </svg>
      )}
    </div>
  )
}

// ─── 页面 ────────────────────────────────────────────────────

export default function Stats() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const avgWpm = history.length > 0
    ? Math.round(history.reduce((s, e) => s + e.wpm, 0) / history.length)
    : 0
  const avgAccuracy = history.length > 0
    ? Math.round(history.reduce((s, e) => s + e.accuracy, 0) / history.length)
    : 0
  const avgFcs = history.length > 0
    ? Math.round(history.reduce((s, e) => s + e.fcs, 0) / history.length)
    : 0

  // WPM 趋势数据
  const trendData = history
    .slice(0, 20)
    .reverse()
    .map(e => ({
      date: new Date(e.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      value: e.wpm,
    }))

  const fcsTrend = history
    .slice(0, 20)
    .reverse()
    .map(e => ({
      date: new Date(e.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      value: e.fcs,
    }))

  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      <div className="w-full max-w-[960px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">📊 统计分析</h2>
        <p className="text-sm text-gray-500 mt-1">追踪你的进步</p>
      </div>

      {/* 概览卡片 */}
      <div className="w-full max-w-[960px] mb-6">
        <div className="flex gap-4">
          {[
            { label: '练习次数', value: history.length, unit: '次', accent: 'blue' },
            { label: '平均 WPM', value: avgWpm, unit: 'wpm', accent: 'green' },
            { label: '平均准确率', value: `${avgAccuracy}`, unit: '%', accent: 'purple' },
            { label: '平均 FCS', value: `${avgFcs}`, unit: '%', accent: 'cyan' },
          ].map((card, i) => (
            <div key={i} className={`
              flex-1 flex flex-col items-center justify-center
              px-4 py-4 rounded-xl min-w-[120px]
              ${card.accent === 'blue' ? 'bg-blue-500/10 border border-blue-500/20' :
                card.accent === 'green' ? 'bg-green-500/10 border border-green-500/20' :
                card.accent === 'purple' ? 'bg-purple-500/10 border border-purple-500/20' :
                'bg-cyan-500/10 border border-cyan-500/20'}
            `}>
              <span className={`text-3xl font-bold tracking-tight leading-none mb-1 font-mono
                ${card.accent === 'blue' ? 'text-blue-400' :
                  card.accent === 'green' ? 'text-green-400' :
                  card.accent === 'purple' ? 'text-purple-400' :
                  'text-cyan-400'}`}>
                {card.value}
                <span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>
              </span>
              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                {card.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 图表区 */}
      <div className="w-full max-w-[960px] space-y-4 mb-6">
        {history.length > 0 ? (
          <>
            <TrendChart data={trendData} label="WPM 趋势" color="#4ade80" />
            <TrendChart data={fcsTrend} label="FCS 指法合规分趋势" color="#22d3ee" />
          </>
        ) : (
          <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">还没有练习数据</p>
            <p className="text-gray-600 text-xs mt-1">完成一些课程训练后，这里会显示你的进步趋势</p>
          </div>
        )}
      </div>

      {/* 最近记录 */}
      {history.length > 0 && (
        <div className="w-full max-w-[960px]">
          <h3 className="text-sm font-medium text-gray-400 mb-3">最近练习记录</h3>
          <div className="space-y-2">
            {history.slice(0, 15).map((entry, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 bg-gray-900/30 border border-gray-800/30 rounded-lg">
                <span className="text-xs text-gray-600 w-16 shrink-0">
                  {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs text-gray-500 w-20 shrink-0">{entry.mode}</span>
                <div className="flex gap-4 ml-auto">
                  <span className="text-xs text-gray-400">
                    <span className="text-green-400 font-medium">{entry.wpm}</span> WPM
                  </span>
                  <span className="text-xs text-gray-400">
                    <span className="text-blue-400 font-medium">{entry.accuracy}%</span> 准确
                  </span>
                  <span className="text-xs text-gray-400">
                    <span className="text-cyan-400 font-medium">{entry.fcs}%</span> FCS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
