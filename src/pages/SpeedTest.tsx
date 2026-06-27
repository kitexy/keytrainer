import { useState, useCallback, useEffect, useRef } from 'react'
import useTypingEngine from '../hooks/useTypingEngine'
import TypingArea from '../components/TypingArea/TypingArea'
import StatsPanel from '../components/StatsPanel/StatsPanel'
import Keyboard from '../components/Keyboard/Keyboard'
import { useTypingStore } from '../stores/typingStore'
import { useToastStore } from '../stores/toastStore'
import ImeNotice from '../components/Toast/ImeNotice'
import { generateWords } from '../utils/textGenerator'

type Duration = 30 | 60 | 180 | 300

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 30,  label: '30 秒' },
  { value: 60,  label: '1 分钟' },
  { value: 180, label: '3 分钟' },
  { value: 300, label: '5 分钟' },
]

export default function SpeedTest() {
  const { start, reset } = useTypingEngine()
  const wpm = useTypingStore(s => s.wpm)
  const accuracy = useTypingStore(s => s.accuracy)
  const fcs = useTypingStore(s => s.fcs)
  const sessionStatus = useTypingStore(s => s.sessionStatus)
  const errorCount = useTypingStore(s => s.errorCount)
  const totalKeystrokes = useTypingStore(s => s.totalKeystrokes)

  const [duration, setDuration] = useState<Duration>(60)
  const [remaining, setRemaining] = useState<number>(duration)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isRunning = sessionStatus === 'running'

  // 倒计时
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          // 时间到 — 结束
          useTypingStore.getState().finishSession()
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  // 重置
  const handleReset = useCallback(() => {
    reset()
    setRemaining(duration)
  }, [reset, duration])

  const handleStart = useCallback((d: Duration) => {
    setDuration(d)
    setRemaining(d)
    const text = generateWords(60) // 60个单词，够用到超时
    start(text, 'speed')
    useToastStore.getState().show('⌨️ 请确认已切换到英文输入法', 'info', 2000)
  }, [start])

  const handleRetry = useCallback(() => {
    handleStart(duration)
  }, [handleStart, duration])

  const isIdle = sessionStatus === 'idle'
  const isFinished = sessionStatus === 'finished'

  // 倒计时显示格式化
  const formatRemaining = (s: number): string => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // 倒计时颜色
  const timerColor = remaining <= 10 ? 'text-red-400' : remaining <= 30 ? 'text-yellow-400' : 'text-blue-400'

  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      {/* 标题 */}
      <div className="w-full max-w-[960px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">⚡ 速度测试</h2>
        <p className="text-sm text-gray-500 mt-1">限时挑战，看看你有多快</p>
      </div>

      {/* 时长选择（仅 idle） */}
      {isIdle && (
        <div className="w-full max-w-[960px]">
          <ImeNotice />
          <div className="grid grid-cols-4 gap-3 mb-6">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStart(opt.value)}
                className={`
                  flex flex-col items-center gap-2 px-6 py-5 rounded-xl border
                  transition-all duration-200
                  bg-gray-900/40 border-gray-800/40
                  hover:bg-gray-900/60 hover:border-blue-500/30
                  hover:shadow-lg hover:shadow-blue-500/5
                  group
                `}
              >
                <span className="text-3xl font-bold text-gray-200 group-hover:text-blue-300"
                  style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-gray-600">限时挑战</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 打字界面 */}
      {(isRunning || isFinished) && (
        <>
          {/* 倒计时大显示 */}
          <div className="w-full max-w-[960px] mb-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-500">
                {isRunning ? '进行中' : '时间到！'}
              </span>
              <div className={`text-4xl font-bold ${timerColor}`}
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
              >
                {isFinished ? formatRemaining(0) : formatRemaining(remaining)}
              </div>
              <span className="text-sm text-gray-500">
                / {formatRemaining(duration)}
              </span>
            </div>
            {/* 倒计时进度条 */}
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  remaining <= 10 ? 'bg-red-500' : remaining <= 30 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${isFinished ? 100 : ((duration - remaining) / duration) * 100}%`,
                }}
              />
            </div>
          </div>

          <StatsPanel />

          <div className="w-full max-w-[960px] mt-4 mb-4">
            <TypingArea />
          </div>

          <Keyboard className="mb-4" />

          {/* 运行中：停止按钮 */}
          {isRunning && (
            <button
              onClick={() => useTypingStore.getState().finishSession()}
              className="
                px-5 py-2 bg-red-600/20 hover:bg-red-600/30
                text-red-400 font-medium rounded-xl border border-red-600/20
                transition-all duration-200 text-sm
              "
            >
              提前结束
            </button>
          )}
        </>
      )}

      {/* 完成面板 */}
      {isFinished && (
        <div className="w-full max-w-[960px] mt-6">
          <div className="flex items-center justify-center gap-8 p-6 bg-gray-900/60 rounded-xl border border-gray-800/60">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">WPM</div>
              <div className="text-4xl font-bold text-green-400"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
              >
                {wpm}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">准确率</div>
              <div className="text-4xl font-bold text-blue-400"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
              >
                {accuracy}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">FCS 指法</div>
              <div className={`text-4xl font-bold ${fcs >= 80 ? 'text-cyan-400' : fcs >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
              >
                {fcs}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">错误</div>
              <div className="text-4xl font-bold text-red-400"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
              >
                {errorCount}<span className="text-lg text-gray-500">/{totalKeystrokes}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleRetry}
                className="
                  px-5 py-2 bg-blue-600 hover:bg-blue-500
                  text-white font-medium rounded-xl
                  transition-all duration-200 active:scale-95 text-sm
                "
              >
                再来一次
              </button>
              <button
                onClick={handleReset}
                className="
                  px-5 py-2 bg-gray-800 hover:bg-gray-700
                  text-gray-300 font-medium rounded-xl border border-gray-700/60
                  transition-all duration-200 active:scale-95 text-sm
                "
              >
                选择时长
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
