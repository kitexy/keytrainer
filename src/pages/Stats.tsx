import { useState, useEffect } from 'react'
import { db } from '../utils/db'

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

// ─── 趋势图 ───────────────────────────────────────────────────

function TrendChart({ data, label, color = '#60a5fa' }: {
  data: { date: string; value: number }[]
  label: string
  color?: string
}) {
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
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <line key={pct}
              x1={padX} y1={chartH - padY - (chartH - padY * 2) * pct}
              x2={chartW - padX} y2={chartH - padY - (chartH - padY * 2) * pct}
              stroke="#374151" strokeWidth={0.5} strokeDasharray="4 2"
            />
          ))}
          <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
  const [summary, setSummary] = useState({
    totalSessions: 0,
    avgWpm: 0,
    avgAccuracy: 0,
    avgFcs: 0,
    totalPracticeTime: 0,
    streakDays: 0,
  })
  const [wpmTrend, setWpmTrend] = useState<{ date: string; value: number }[]>([])
  const [fcsTrend, setFcsTrend] = useState<{ date: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // 并行加载
      const [historyResult, summaryResult, trendResult] = await Promise.all([
        db.getHistory({ limit: 50 }),
        db.getStatsSummary(),
        db.getWpmTrend(30),
      ])

      // 历史记录
      if (historyResult.success && historyResult.sessions) {
        const entries: HistoryEntry[] = historyResult.sessions.map(s => ({
          mode: s.mode,
          wpm: s.wpm,
          accuracy: s.accuracy,
          fcs: s.fcs,
          duration: s.duration,
          errorCount: s.error_count,
          totalKeystrokes: s.total_chars,
          date: s.created_at,
        }))
        setHistory(entries)
      }

      // 概览
      if (summaryResult.success) {
        setSummary({
          totalSessions: summaryResult.totalSessions ?? 0,
          avgWpm: summaryResult.avgWpm ?? 0,
          avgAccuracy: summaryResult.avgAccuracy ?? 0,
          avgFcs: summaryResult.avgFcs ?? 0,
          totalPracticeTime: summaryResult.totalPracticeTime ?? 0,
          streakDays: summaryResult.streakDays ?? 0,
        })

        // WPM 趋势
        if (trendResult.success && trendResult.trend) {
          setWpmTrend(trendResult.trend.map(t => ({
            date: t.date,
            value: t.avgWpm,
          })))
        }
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // 从 history 中生成 FCS 趋势
  useEffect(() => {
    if (history.length === 0) return
    const byDate: Record<string, { sum: number; count: number }> = {}
    for (const h of history) {
      const d = h.date.split('T')[0] ?? h.date.substring(0, 10)
      if (!byDate[d]) byDate[d] = { sum: 0, count: 0 }
      byDate[d].sum += h.fcs
      byDate[d].count++
    }
    setFcsTrend(
      Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { sum, count }]) => ({
          date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          value: Math.round(sum / count),
        }))
    )
  }, [history])

  // 格式化总练习时间
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}时${m}分` : `${m}分钟`
  }

  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      <div className="w-full max-w-[960px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">📊 统计分析</h2>
        <p className="text-sm text-gray-500 mt-1">追踪你的进步</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 text-sm">加载历史数据...</div>
      ) : (
        <>
          {/* 概览卡片 */}
          <div className="w-full max-w-[960px] mb-6">
            <div className="flex gap-4">
              {[
                { label: '练习次数', value: summary.totalSessions, unit: '次', accent: 'blue' },
                { label: '平均 WPM', value: summary.avgWpm, unit: 'wpm', accent: 'green' },
                { label: '平均准确率', value: `${summary.avgAccuracy}`, unit: '%', accent: 'purple' },
                { label: '平均 FCS', value: `${summary.avgFcs}`, unit: '%', accent: 'cyan' },
                summary.streakDays > 0
                  ? { label: '连续天数', value: summary.streakDays, unit: '天', accent: 'orange' as const }
                  : { label: '总练习', value: formatTime(summary.totalPracticeTime), unit: '', accent: 'slate' as const },
              ].map((card, i) => (
                <div key={i} className={`
                  flex-1 flex flex-col items-center justify-center
                  px-4 py-4 rounded-xl min-w-[120px]
                  ${card.accent === 'blue' ? 'bg-blue-500/10 border border-blue-500/20' :
                    card.accent === 'green' ? 'bg-green-500/10 border border-green-500/20' :
                    card.accent === 'purple' ? 'bg-purple-500/10 border border-purple-500/20' :
                    card.accent === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/20' :
                    card.accent === 'orange' ? 'bg-orange-500/10 border border-orange-500/20' :
                    'bg-gray-800/40 border border-gray-700/30'}
                `}>
                  <span className={`text-3xl font-bold tracking-tight leading-none mb-1 font-mono
                    ${card.accent === 'blue' ? 'text-blue-400' :
                      card.accent === 'green' ? 'text-green-400' :
                      card.accent === 'purple' ? 'text-purple-400' :
                      card.accent === 'cyan' ? 'text-cyan-400' :
                      card.accent === 'orange' ? 'text-orange-400' :
                      'text-gray-300'}`}>
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
                <TrendChart data={wpmTrend.map(d => ({ ...d, date: d.date }))} label="WPM 趋势" color="#4ade80" />
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
                      <span className="text-xs text-gray-600">{entry.duration}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
