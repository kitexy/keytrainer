/**
 * TypingArea — 打字练习主区域
 *
 * 展示目标文本，字符级着色，自动滚动跟踪。
 * 包含 focus 管理和空状态/完成状态 UI。
 */

import { useEffect, useRef } from 'react'
import { useTypingStore } from '../../stores/typingStore'
import CharSpan from './CharSpan'

export default function TypingArea() {
  const { typedChars, currentIndex, sessionStatus } = useTypingStore()
  const containerRef = useRef<HTMLDivElement>(null)

  // 练习开始时自动聚焦
  useEffect(() => {
    if (sessionStatus === 'running') {
      containerRef.current?.focus()
    }
  }, [sessionStatus])

  // 自动滚动：保持当前行在可见区域内
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const currentEl = el.querySelector('.char-current') as HTMLElement | null
    if (currentEl) {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
      const scrollTarget = Math.max(0, currentEl.offsetTop - lineHeight * 1.0)
      el.scrollTo({ top: scrollTarget, behavior: 'smooth' })
    }
  }, [currentIndex])

  // 空状态
  if (sessionStatus === 'idle') {
    return (
      <div className="
        w-full h-[120px] flex items-center justify-center
        bg-gray-900/60 rounded-xl border border-gray-800/60
        text-gray-600 text-base select-none
      ">
        选择一种练习模式，点击「开始练习」或直接开始打字…
      </div>
    )
  }

  // 完成状态
  if (sessionStatus === 'finished') {
    return (
      <div className="
        w-full h-[120px] flex items-center justify-center
        bg-gray-900/60 rounded-xl border border-green-900/30
        text-green-400 text-lg font-medium
      ">
        ✅ 练习完成！
      </div>
    )
  }

  const displayChars = typedChars.length > 0
    ? typedChars
    : []

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="
        w-full h-[120px] overflow-y-hidden
        bg-gray-900/70 rounded-xl border border-gray-800/60
        px-6 py-4
        text-lg leading-relaxed tracking-wide
        font-mono
        cursor-text
        outline-none
        select-none
        scrollbar-hide
        hover:border-gray-700/60
        transition-colors duration-200
      "
      style={{
        fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '18px',
        lineHeight: '1.75',
      }}
    >
      {displayChars.map((tc, i) => (
        <CharSpan
          key={i}
          char={tc.char}
          status={tc.status}
          isCurrent={i === currentIndex}
        />
      ))}
    </div>
  )
}
