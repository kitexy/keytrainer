import { useState, useCallback } from 'react'
import useTypingEngine from '../hooks/useTypingEngine'
import TypingArea from '../components/TypingArea/TypingArea'
import StatsPanel from '../components/StatsPanel/StatsPanel'
import Keyboard from '../components/Keyboard/Keyboard'
import { useTypingStore } from '../stores/typingStore'
import { useToastStore } from '../stores/toastStore'
import ImeNotice from '../components/Toast/ImeNotice'
import { lessonLevels } from '../utils/textGenerator'

export default function FingerTraining() {
  const { start, reset, sessionStatus } = useTypingEngine()
  const wpm = useTypingStore(s => s.wpm)
  const accuracy = useTypingStore(s => s.accuracy)
  const fcs = useTypingStore(s => s.fcs)
  const [currentLevel, setCurrentLevel] = useState<number | null>(null)

  const handleStartLevel = useCallback((level: number) => {
    setCurrentLevel(level)
    const lesson = lessonLevels.find(l => l.level === level)
    if (lesson) {
      start(lesson.generate(), 'finger')
      useToastStore.getState().show('⌨️ 请确认已切换到英文输入法', 'info', 2000)
    }
  }, [start])

  const handleRetry = useCallback(() => {
    if (currentLevel) {
      handleStartLevel(currentLevel)
    }
  }, [currentLevel, handleStartLevel])

  const isIdle = sessionStatus === 'idle'
  const isFinished = sessionStatus === 'finished'

  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      {/* 标题 */}
      <div className="w-full max-w-[960px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">🎯 指位训练</h2>
        <p className="text-sm text-gray-500 mt-1">
          按指法系统学习：基准行 → 单指扩展 → 逐排攻克 → 全键综合
        </p>
      </div>

      {/* 课程选择（仅 idle 状态） */}
      {isIdle && (
        <div className="w-full max-w-[960px]">
          <ImeNotice />
          <div className="grid grid-cols-4 gap-3 mb-4">
            {lessonLevels.map(lesson => (
              <button
                key={lesson.level}
                onClick={() => handleStartLevel(lesson.level)}
                className={`
                  flex flex-col items-start gap-1 px-4 py-3.5 rounded-xl border
                  transition-all duration-200 text-left
                  bg-gray-900/40 border-gray-800/40
                  hover:bg-gray-900/60 hover:border-blue-500/30
                  hover:shadow-lg hover:shadow-blue-500/5
                  group
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="
                    w-6 h-6 rounded-md bg-blue-500/20 text-blue-400
                    flex items-center justify-center text-xs font-bold
                  ">
                    {lesson.level}
                  </span>
                  <span className="text-sm font-medium text-gray-200 group-hover:text-blue-300 transition-colors">
                    {lesson.name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-600 pl-8">
                  {lesson.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 打字区域 + 统计 */}
      {(sessionStatus === 'running' || sessionStatus === 'finished') && (
        <>
          <StatsPanel />

          <div className="w-full max-w-[960px] mt-4 mb-4">
            {currentLevel && (
              <div className="flex items-center gap-3 mb-3">
                <span className="
                  w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400
                  flex items-center justify-center text-sm font-bold
                ">
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
            <TypingArea />
          </div>

          {/* 可视化键盘（练习时显示实时反馈） */}
          <Keyboard className="mb-4" showFingerZones={false} />
        </>
      )}

      {/* 空闲时显示指法分区图供参考 */}
      {isIdle && (
        <div className="w-full max-w-[960px] mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">指法分区参考</span>
          </div>
          <Keyboard showFingerZones={true} showHandGuide={true} />
        </div>
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
            <button
              onClick={handleRetry}
              className="
                px-6 py-2.5 bg-blue-600 hover:bg-blue-500
                text-white font-medium rounded-xl
                transition-all duration-200 active:scale-95
              "
            >
              再来一次
            </button>
            <button
              onClick={reset}
              className="
                px-6 py-2.5 bg-gray-800 hover:bg-gray-700
                text-gray-300 font-medium rounded-xl border border-gray-700/60
                transition-all duration-200 active:scale-95
              "
            >
              返回选择
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
