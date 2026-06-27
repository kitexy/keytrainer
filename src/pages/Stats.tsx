/**
 * Stats 统计分析页
 *
 * 概览卡片 + Recharts 图表 + 最近记录列表。
 * macOS 暗色主题，所有图表统一风格。
 */

import { useState, useEffect } from 'react'
import { db } from '../utils/db'
import ChartCard from '../components/Charts/ChartCard'
import WpmTrendChart, { type TrendPoint } from '../components/Charts/WpmTrendChart'
import AccuracyTrendChart from '../components/Charts/AccuracyTrendChart'
import WeakKeysChart, { type WeakKey } from '../components/Charts/WeakKeysChart'

// ─── 类型 ────────────────────────────────────────────────────

interface HistoryEntry {
  id: number
  mode: string
  wpm: number
  accuracy: number
  fcs: number
  duration: number
  errorCount: number
  totalKeystrokes: number
  date: string
}

interface AccuracyTrendPoint {
  date: string
  avgAccuracy: number
  avgFcs: number
}

const MODE_LABELS: Record<string, string> = {
  random: '随机字母',
  home: '基准行',
  top: '上排',
  bottom: '下排',
  words: '常用单词',
  code: '代码片段',
  finger: '指位训练',
  lesson: '课程训练',
  speed: '速度测试',
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
  const [wpmTrend, setWpmTrend] = useState<TrendPoint[]>([])
  const [accuracyTrend, setAccuracyTrend] = useState<AccuracyTrendPoint[]>([])
  const [weakKeys, setWeakKeys] = useState<WeakKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [historyResult, summaryResult, trendResult, weakKeysResult] = await Promise.all([
        db.getHistory({ limit: 100 }),
        db.getStatsSummary(),
        db.getWpmTrend(60),
        db.getWeakKeys(15),
      ])

      // 历史记录
      if (historyResult.success && historyResult.sessions) {
        setHistory(historyResult.sessions.map((s: any) => ({
          id: s.id,
          mode: s.mode,
          wpm: s.wpm,
          accuracy: s.accuracy,
          fcs: s.fcs,
          duration: s.duration,
          errorCount: s.error_count,
          totalKeystrokes: s.total_chars,
          date: s.created_at,
        })))
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
      }

      // WPM 趋势
      if (trendResult.success && trendResult.trend) {
        setWpmTrend(trendResult.trend)
      }

      // 薄弱键位
      if (weakKeysResult.success && weakKeysResult.keys) {
        setWeakKeys(weakKeysResult.keys)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // 从 history 中计算按日聚合的准确率 & FCS 趋势
  useEffect(() => {
    if (history.length === 0) return
    const byDate: Record<string, { accSum: number; fcsSum: number; count: number }> = {}
    for (const h of history) {
      const d = h.date.split('T')[0] ?? h.date.substring(0, 10)
      if (!byDate[d]) byDate[d] = { accSum: 0, fcsSum: 0, count: 0 }
      byDate[d].accSum += h.accuracy
      byDate[d].fcsSum += h.fcs
      byDate[d].count++
    }
    setAccuracyTrend(
      Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { accSum, fcsSum, count }]) => ({
          date,
          avgAccuracy: Math.round(accSum / count),
          avgFcs: Math.round(fcsSum / count),
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
      {/* 标题 */}
      <div className="w-full max-w-[960px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">📊 统计分析</h2>
        <p className="text-sm text-gray-500 mt-1">追踪你的进步</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-600 animate-pulse">加载历史数据...</p>
        </div>
      ) : (
        <>
          {/* ─── 概览卡片 ────────────────────────────── */}
          <div className="w-full max-w-[960px] mb-6">
            <div className="flex gap-4">
              {[
                { label: '练习次数', value: summary.totalSessions, unit: '次', accent: 'blue' as const },
                { label: '平均 WPM', value: summary.avgWpm, unit: 'wpm', accent: 'green' as const },
                { label: '平均准确率', value: summary.avgAccuracy, unit: '%', accent: 'purple' as const },
                { label: '平均 FCS', value: summary.avgFcs, unit: '%', accent: 'cyan' as const },
                summary.streakDays > 0
                  ? { label: '连续天数', value: summary.streakDays, unit: '天', accent: 'orange' as const }
                  : { label: '总练习', value: formatTime(summary.totalPracticeTime), unit: '', accent: 'slate' as const },
              ].map(card => (
                <div key={card.label + card.unit} className={`
                  flex-1 flex flex-col items-center justify-center
                  px-4 py-4 rounded-xl min-w-[120px]
                  ${card.accent === 'blue'   ? 'bg-blue-500/10 border border-blue-500/20' :
                    card.accent === 'green'  ? 'bg-green-500/10 border border-green-500/20' :
                    card.accent === 'purple' ? 'bg-purple-500/10 border border-purple-500/20' :
                    card.accent === 'cyan'   ? 'bg-cyan-500/10 border border-cyan-500/20' :
                    card.accent === 'orange' ? 'bg-orange-500/10 border border-orange-500/20' :
                    'bg-gray-800/40 border border-gray-700/30'}
                `}>
                  <span className={`text-3xl font-bold tracking-tight leading-none mb-1 font-mono
                    ${card.accent === 'blue'   ? 'text-blue-400' :
                      card.accent === 'green'  ? 'text-green-400' :
                      card.accent === 'purple' ? 'text-purple-400' :
                      card.accent === 'cyan'   ? 'text-cyan-400' :
                      card.accent === 'orange' ? 'text-orange-400' :
                      'text-gray-300'}`}>
                    {card.value}
                    {card.unit && <span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── 图表区 ────────────────────────────── */}
          <div className="w-full max-w-[960px] grid grid-cols-2 gap-4 mb-4">
            <ChartCard title="WPM 趋势" subtitle="近60天日均速度变化">
              <WpmTrendChart data={wpmTrend} />
            </ChartCard>

            <ChartCard title="准确率 & FCS" subtitle="准确率与指法合规分趋势">
              <AccuracyTrendChart data={accuracyTrend} />
            </ChartCard>
          </div>

          {/* ─── 薄弱键位 ──────────────────────────── */}
          <div className="w-full max-w-[960px] mb-4">
            <ChartCard title="薄弱键位分析" subtitle="错误率最高的键位（需至少5次击键）">
              <WeakKeysChart data={weakKeys} />
            </ChartCard>
          </div>

          {/* ─── 最近记录 ──────────────────────────── */}
          {history.length > 0 && (
            <div className="w-full max-w-[960px]">
              <h3 className="text-sm font-medium text-gray-400 mb-3">最近练习记录</h3>
              <div className="space-y-1.5">
                {history.slice(0, 20).map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 px-4 py-2.5 bg-gray-900/30 border border-gray-800/30 rounded-lg
                               hover:bg-gray-900/50 transition-colors"
                  >
                    {/* 日期 */}
                    <span className="text-xs text-gray-600 w-16 shrink-0 font-mono">
                      {formatTimeShort(entry.date)}
                    </span>

                    {/* 模式标签 */}
                    <span className="text-[10px] text-gray-500 px-2 py-0.5 rounded bg-gray-800/50 border border-gray-700/30 shrink-0">
                      {MODE_LABELS[entry.mode] ?? entry.mode}
                    </span>

                    {/* 指标 */}
                    <div className="flex gap-5 ml-auto">
                      <Metric label="WPM" value={entry.wpm} color="text-green-400" />
                      <Metric label="准确率" value={`${entry.accuracy}%`} color="text-blue-400" />
                      <Metric label="FCS" value={`${entry.fcs}%`} color="text-cyan-400" />
                      <span className="text-xs text-gray-600">{entry.duration}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 空状态 ────────────────────────────── */}
          {history.length === 0 && (
            <div className="w-full max-w-[960px] bg-gray-900/40 border border-gray-800/40 rounded-xl p-10 text-center">
              <p className="text-gray-500 text-sm mb-1">还没有练习数据</p>
              <p className="text-gray-600 text-xs">
                完成一些课程训练后，这里会显示你的进步趋势和薄弱键位分析
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** 内联指标 */
function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <span className="text-xs text-gray-400">
      <span className={`font-medium font-mono ${color}`}>{value}</span>
      {' '}{label}
    </span>
  )
}

/** "2026-06-20T12:34:56" → "6/20" */
function formatTimeShort(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso.substring(0, 10)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
