/**
 * StatsPanel — 实时统计面板
 *
 * macOS 风格：半透明卡片、圆角分组、数字大字显示。
 * 展示 WPM、准确率、用时、进度、错误数、FCS。
 */

import { useTypingStore } from '../../stores/typingStore'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  accent?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan'
}

const accentMap = {
  blue:   { bg: 'bg-blue-500/10', text: 'text-blue-400',   border: 'border-blue-500/20' },
  green:  { bg: 'bg-green-500/10', text: 'text-green-400',  border: 'border-green-500/20' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  red:    { bg: 'bg-red-500/10', text: 'text-red-400',    border: 'border-red-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  cyan:   { bg: 'bg-cyan-500/10', text: 'text-cyan-400',   border: 'border-cyan-500/20' },
}

function StatCard({ label, value, unit, accent = 'blue' }: StatCardProps) {
  const colors = accentMap[accent]
  return (
    <div className={`
      flex flex-col items-center justify-center
      px-4 py-3 rounded-xl min-w-[100px]
      ${colors.bg} border ${colors.border}
    `}>
      <span className="text-[28px] font-bold tracking-tight leading-none mb-1"
        style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
      >
        <span className={colors.text}>{value}</span>
        {unit && (
          <span className="text-sm font-normal text-gray-500 ml-0.5">{unit}</span>
        )}
      </span>
      <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

export default function StatsPanel() {
  const { wpm, accuracy, elapsedSeconds, progress, errorCount, sessionStatus, totalKeystrokes, fcs } = useTypingStore()

  if (sessionStatus === 'idle') {
    return (
      <div className="w-full max-w-[960px] mx-auto">
        <div className="flex items-center justify-center gap-6 py-4 opacity-30">
          {[
            { label: 'WPM', value: '0', unit: 'wpm', accent: 'green' as const },
            { label: '准确率', value: '--', unit: '%', accent: 'blue' as const },
            { label: '用时', value: '00:00', accent: 'yellow' as const },
            { label: '进度', value: '0', unit: '%', accent: 'purple' as const },
          ].map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[960px] mx-auto">
      {/* 主统计卡片 */}
      <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
        <StatCard
          label="WPM"
          value={wpm}
          unit="wpm"
          accent={wpm > 40 ? 'green' : wpm > 20 ? 'yellow' : 'blue'}
        />
        <StatCard
          label="准确率"
          value={accuracy}
          unit="%"
          accent={accuracy >= 95 ? 'green' : accuracy >= 80 ? 'yellow' : 'red'}
        />
        <StatCard
          label="用时"
          value={formatTime(elapsedSeconds)}
          accent="blue"
        />
        <StatCard
          label="FCS"
          value={fcs}
          unit="%"
          accent={fcs >= 80 ? 'green' : fcs >= 50 ? 'yellow' : 'red'}
        />
        <StatCard
          label="进度"
          value={progress}
          unit="%"
          accent="purple"
        />
        <StatCard
          label="错误"
          value={errorCount}
          unit={`/${totalKeystrokes}`}
          accent={errorCount === 0 ? 'green' : 'red'}
        />
      </div>

      {/* 进度条 */}
      <div className="mt-2 px-1">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
