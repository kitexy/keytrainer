import { useState, useCallback, useEffect } from 'react'
import useTypingEngine from '../hooks/useTypingEngine'
import TypingArea from '../components/TypingArea/TypingArea'
import StatsPanel from '../components/StatsPanel/StatsPanel'
import Keyboard from '../components/Keyboard/Keyboard'
import { useTypingStore } from '../stores/typingStore'
import { useToastStore } from '../stores/toastStore'
import ImeNotice from '../components/Toast/ImeNotice'
import { lessonLevels } from '../utils/textGenerator'
import { db } from '../utils/db'

export interface LessonRecord {
  bestWpm: number
  bestAccuracy: number
  bestFcs: number
  completedAt: string | null
  attempts: number
}

export default function Lessons() {
  const { start, reset } = useTypingEngine()
  const wpm = useTypingStore(s => s.wpm)
  const accuracy = useTypingStore(s => s.accuracy)
  const fcs = useTypingStore(s => s.fcs)
  const sessionStatus = useTypingStore(s => s.sessionStatus)

  const [records, setRecords] = useState<Record<number, LessonRecord>>({})
  const [currentLevel, setCurrentLevel] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载课程记录
  useEffect(() => {
    db.getLessonRecords().then(result => {
      if (result.success && result.records) {
        const mapped: Record<number, LessonRecord> = {}
        for (const [level, rec] of Object.entries(result.records)) {
          mapped[Number(level)] = {
            bestWpm: rec.best_wpm,
            bestAccuracy: rec.best_accuracy,
            bestFcs: rec.best_fcs,
            completedAt: rec.completed_at,
            attempts: rec.attempts,
          }
        }
        setRecords(mapped)
      }
      setLoading(false)
    })
  }, [])

  const isIdle = sessionStatus === 'idle'
  const isRunning = sessionStatus === 'running'
  const isFinished = sessionStatus === 'finished'

  // 完成时自动保存记录
  useEffect(() => {
    if (!isFinished || !currentLevel) return

    const existing = records[currentLevel]
    db.upsertLessonRecord({
      level: currentLevel,
      bestWpm: Math.max(existing?.bestWpm ?? 0, wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
      bestFcs: Math.max(existing?.bestFcs ?? 0, fcs),
    }).then(() => {
      // 更新本地状态
      const newRecord: LessonRecord = {
        bestWpm: Math.max(existing?.bestWpm ?? 0, wpm),
        bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
        bestFcs: Math.max(existing?.bestFcs ?? 0, fcs),
        completedAt: new Date().toISOString(),
        attempts: (existing?.attempts ?? 0) + 1,
      }
      setRecords(prev => ({ ...prev, [currentLevel]: newRecord }))
    })
  }, [isFinished])

  const handleStart = useCallback((level: number) => {
    setCurrentLevel(level)
    const lesson = lessonLevels.find(l => l.level === level)
    if (lesson) {
      start(lesson.generate(), 'lesson')
      useToastStore.getState().show('⌨️ 请确认已切换到英文输入法', 'info', 2000)
    }
  }, [start])

  const handleBack = useCallback(() => {
    reset()
    setCurrentLevel(null)
  }, [reset])

  const handleRetry = useCallback(() => {
    if (currentLevel) handleStart(currentLevel)
  }, [currentLevel, handleStart])

  const handleNext = useCallback(() => {
    if (currentLevel && currentLevel < 13) {
      handleStart(currentLevel + 1)
    } else {
      handleBack()
    }
  }, [currentLevel, handleStart, handleBack])

  // 计算进度
  const completedCount = Object.values(records).filter(r => r.completedAt).length
  const maxCompletedLevel = Math.max(
    0,
    ...Object.keys(records).map(Number).filter(k => records[k]?.completedAt)
  )
  const nextAvailable = Math.min(maxCompletedLevel + 1, 13)

  // 列表视图
  if (isIdle && !currentLevel) {
    return (
      <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
        <div className="w-full max-w-[960px] mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">📚 课程训练</h2>
          <p className="text-sm text-gray-500 mt-1">
            13级渐进式指位课程 · 已解锁 {maxCompletedLevel + 1}/13 级 · 已完成 {completedCount} 级
          </p>
          <ImeNotice />
          <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 13) * 100}%` }}
            />
          </div>
        </div>

        <div className="w-full max-w-[960px]">
          {loading ? (
            <div className="text-center py-12 text-gray-600 text-sm">加载课程记录...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {lessonLevels.map(lesson => {
                const record = records[lesson.level]
                const isUnlocked = lesson.level <= nextAvailable
                const isCompleted = !!record?.completedAt

                return (
                  <button
                    key={lesson.level}
                    onClick={() => isUnlocked && handleStart(lesson.level)}
                    disabled={!isUnlocked}
                    className={`
                      flex items-start gap-4 px-5 py-4 rounded-xl border text-left
                      transition-all duration-200
                      ${isUnlocked
                        ? 'bg-gray-900/40 border-gray-800/40 hover:bg-gray-900/60 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer'
                        : 'bg-gray-900/20 border-gray-800/20 opacity-40 cursor-not-allowed'}
                    `}
                  >
                    <div className={`
                      shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold
                      ${isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : lesson.level === nextAvailable
                          ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                          : isUnlocked
                            ? 'bg-gray-800 text-gray-400'
                            : 'bg-gray-800/50 text-gray-600'}
                    `}>
                      {isCompleted ? '✓' : lesson.level}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isUnlocked ? 'text-gray-200' : 'text-gray-600'}`}>
                          {lesson.name}
                        </span>
                        {!isUnlocked && (
                          <span className="text-[10px] text-gray-700 bg-gray-800/50 px-1.5 py-0.5 rounded">🔒</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">{lesson.description}</p>

                      {record && (
                        <div className="flex gap-4 mt-2">
                          <span className="text-[11px] text-gray-500">
                            <span className="text-green-400 font-medium">{record.bestWpm}</span> WPM
                          </span>
                          <span className="text-[11px] text-gray-500">
                            <span className="text-blue-400 font-medium">{record.bestAccuracy}%</span> 准确
                          </span>
                          {record.bestFcs > 0 && (
                            <span className="text-[11px] text-gray-500">
                              <span className="text-cyan-400 font-medium">{record.bestFcs}%</span> FCS
                            </span>
                          )}
                          <span className="text-[11px] text-gray-600">{record.attempts}次尝试</span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 练习视图
  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      <div className="w-full max-w-[960px] mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-300 transition-colors text-lg"
            >
              ←
            </button>
            <h2 className="text-xl font-bold tracking-tight text-white">课程训练</h2>
          </div>
          {currentLevel && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">第 {currentLevel} 级</span>
              <span className="text-sm text-gray-600">/ 13</span>
            </div>
          )}
        </div>
        {currentLevel && (
          <div className="flex items-center gap-3 mt-2">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
              {currentLevel}
            </span>
            <span className="text-base text-gray-300 font-medium">
              {lessonLevels[currentLevel - 1]?.name}
            </span>
            <span className="text-xs text-gray-600">
              {lessonLevels[currentLevel - 1]?.description}
            </span>
          </div>
        )}
      </div>

      {(isRunning || isFinished) && (
        <>
          <StatsPanel />
          <div className="w-full max-w-[960px] mt-4 mb-4">
            <TypingArea />
          </div>
          <Keyboard className="mb-4" />
        </>
      )}

      {isFinished && (
        <div className="w-full max-w-[960px] mt-4">
          <div className="flex items-center justify-center gap-8 p-6 bg-gray-900/60 rounded-xl border border-gray-800/60">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">WPM</div>
              <div className="text-4xl font-bold text-green-400 font-mono">{wpm}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">准确率</div>
              <div className="text-4xl font-bold text-blue-400 font-mono">{accuracy}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">FCS 指法</div>
              <div className={`text-4xl font-bold font-mono ${fcs >= 80 ? 'text-cyan-400' : fcs >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {fcs}%
              </div>
            </div>
            <button onClick={handleRetry}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              重试
            </button>
            {currentLevel && currentLevel < 13 && (
              <button onClick={handleNext}
                className="px-5 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 font-medium rounded-xl border border-green-600/20 transition-all duration-200 active:scale-95 text-sm"
              >
                下一级 →
              </button>
            )}
            <button onClick={handleBack}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl border border-gray-700/60 transition-all duration-200 active:scale-95 text-sm"
            >
              返回课程
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
