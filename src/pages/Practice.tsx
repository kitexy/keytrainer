import { useState, useCallback } from 'react'
import useTypingEngine from '../hooks/useTypingEngine'
import TypingArea from '../components/TypingArea/TypingArea'
import StatsPanel from '../components/StatsPanel/StatsPanel'
import Keyboard from '../components/Keyboard/Keyboard'
import { useTypingStore } from '../stores/typingStore'
import { useToastStore } from '../stores/toastStore'
import ImeNotice from '../components/Toast/ImeNotice'
import {
  generateRandomChars, generateHomeRow, generateTopRow,
  generateBottomRow, generateWords,
} from '../utils/textGenerator'
import { CODE_SNIPPETS, generateCodePractice } from '../utils/codeSnippets'

const MODES = [
  { id: 'random',  label: '随机字母', icon: '🔤', desc: '全键位随机英文字母' },
  { id: 'home',    label: '基准行',   icon: '🏠', desc: 'ASDF JKL; 定位练习' },
  { id: 'top',     label: '上排',     icon: '⬆️', desc: 'QWERT YUIOP' },
  { id: 'bottom',  label: '下排',     icon: '⬇️', desc: 'ZXCVB NM' },
  { id: 'words',   label: '常用单词', icon: '📝', desc: '高频英文单词' },
  { id: 'code',    label: '代码片段', icon: '💻', desc: '编程常用语法' },
] as const

type ModeId = typeof MODES[number]['id']

function generateText(mode: ModeId): string {
  switch (mode) {
    case 'random':  return generateRandomChars(120)
    case 'home':    return generateHomeRow(100)
    case 'top':     return generateTopRow(100)
    case 'bottom':  return generateBottomRow(100)
    case 'words':   return generateWords(30)
    case 'code':    return generateCodePractice()
  }
}

export default function Practice() {
  const { start, reset, sessionStatus } = useTypingEngine()
  const wpm = useTypingStore(s => s.wpm)
  const accuracy = useTypingStore(s => s.accuracy)
  const fcs = useTypingStore(s => s.fcs)
  const [selectedMode, setSelectedMode] = useState<ModeId>('random')

  const handleStart = useCallback(() => {
    const text = generateText(selectedMode)
    start(text, selectedMode)
    useToastStore.getState().show('⌨️ 请确认已切换到英文输入法', 'info', 2000)
  }, [selectedMode, start])

  const handleRetry = useCallback(() => {
    const text = generateText(selectedMode)
    start(text, selectedMode)
  }, [selectedMode, start])

  const isIdle = sessionStatus === 'idle'
  const isFinished = sessionStatus === 'finished'

  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      {/* 标题 */}
      <div className="w-full max-w-[960px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">✎ 自由练习</h2>
        <p className="text-sm text-gray-500 mt-1">选择模式，开始打字</p>
      </div>

      {/* 模式选择（仅 idle 状态） */}
      {isIdle && (
        <div className="w-full max-w-[960px] mb-6">
          <div className="grid grid-cols-6 gap-3">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`
                  flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border
                  transition-all duration-200 text-left
                  ${selectedMode === mode.id
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/5'
                    : 'bg-gray-900/40 border-gray-800/40 text-gray-400 hover:bg-gray-900/60 hover:border-gray-700/60 hover:text-gray-300'
                  }
                `}
              >
                <span className="text-xl">{mode.icon}</span>
                <span className="text-sm font-medium">{mode.label}</span>
                <span className="text-[10px] text-gray-600 leading-tight text-center">
                  {mode.desc}
                </span>
              </button>
            ))}
          </div>
          {selectedMode === 'code' && (
            <div className="mt-4 p-3 bg-gray-900/40 rounded-lg border border-gray-800/40">
              <p className="text-xs text-gray-500 mb-2">代码片段预览：</p>
              <pre className="text-xs text-gray-400 font-mono bg-gray-950/50 p-2 rounded overflow-x-auto max-h-32">
                {CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]}
              </pre>
            </div>
          )}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleStart}
              className="
                px-8 py-3 bg-blue-600 hover:bg-blue-500
                text-white font-semibold rounded-xl
                transition-all duration-200
                shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                active:scale-95
              "
            >
              开始练习
            </button>
          </div>
          <ImeNotice />
        </div>
      )}

      {/* 打字区域 + 统计 */}
      {(sessionStatus === 'running' || sessionStatus === 'finished') && (
        <>
          <StatsPanel />

          <div className="w-full max-w-[960px] mt-4 mb-4">
            <TypingArea />
          </div>

          {/* 可视化键盘 */}
          <Keyboard className="mt-2" showFingerZones={false} />
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
            <button
              onClick={handleRetry}
              className="
                px-6 py-2.5 bg-blue-600 hover:bg-blue-500
                text-white font-medium rounded-xl
                transition-all duration-200
                active:scale-95
              "
            >
              再来一次
            </button>
            <button
              onClick={reset}
              className="
                px-6 py-2.5 bg-gray-800 hover:bg-gray-700
                text-gray-300 font-medium rounded-xl border border-gray-700/60
                transition-all duration-200
                active:scale-95
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
