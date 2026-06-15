/**
 * Keyboard — MacBook QWERTY SVG 可视化键盘
 *
 * 读取 typingStore 状态，实时高亮当前待击键、
 * 正确/错误键反馈、指法分区颜色覆盖层。
 */

import { useMemo } from 'react'
import { useTypingStore } from '../../stores/typingStore'
import type { KeyCapStatus } from './KeyCap'
import KeyCap from './KeyCap'
import HandGuide from './HandGuide'
import { KEYBOARD_LAYOUT, getKeyLayoutByChar } from '../../utils/keyboardLayout'
import { FINGER_COLORS } from '../../utils/fingerMapping'

interface KeyboardProps {
  /** 是否显示指法分区颜色（半透明覆盖） */
  showFingerZones?: boolean
  /** 是否显示手型放置指引 */
  showHandGuide?: boolean
  /** 自定义 class */
  className?: string
}

export default function Keyboard({ showFingerZones = false, showHandGuide = false, className = '' }: KeyboardProps) {
  const targetText = useTypingStore(s => s.targetText)
  const currentIndex = useTypingStore(s => s.currentIndex)
  const keystrokes = useTypingStore(s => s.keystrokes)
  const sessionStatus = useTypingStore(s => s.sessionStatus)

  // 当前待击字符 → 对应的键盘布局
  const currentChar = sessionStatus === 'running' ? targetText[currentIndex] : null
  const currentKeyLayout = currentChar ? getKeyLayoutByChar(currentChar) : null
  const currentKeyCode = currentKeyLayout?.code ?? null

  // 正确/错误键码集合
  const correctKeyCodes = useMemo(
    () => new Set(keystrokes.filter(ks => ks.correct).map(ks => ks.keyCode)),
    [keystrokes]
  )
  const incorrectKeyCodes = useMemo(
    () => new Set(keystrokes.filter(ks => !ks.correct).map(ks => ks.keyCode)),
    [keystrokes]
  )

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <svg
        viewBox="0 0 960 340"
        className="w-full max-w-[960px]"
        style={{ height: 'auto' }}
      >
        {/* 键盘背景 */}
        <rect
          x={0} y={0}
          width={960} height={340}
          rx={16}
          fill="#181825"
          stroke="#2a2a3c"
          strokeWidth={1}
        />

        {/* 所有键帽 */}
        {KEYBOARD_LAYOUT.map(key => {
          // 确定状态
          let status: KeyCapStatus = 'default'
          if (key.code === currentKeyCode) {
            status = 'current'
          } else if (incorrectKeyCodes.has(key.code)) {
            status = 'incorrect'
          } else if (correctKeyCodes.has(key.code)) {
            status = 'correct'
          }

          return (
            <KeyCap
              key={key.code}
              keyData={key}
              status={status}
              showFingerZones={showFingerZones}
              fingerColor={FINGER_COLORS[key.finger]}
            />
          )
        })}

        {/* 手型指引覆盖层 */}
        {showHandGuide && <HandGuide />}

        {/* 底部指示文字 */}
        <text
          x={480} y={325}
          textAnchor="middle"
          fill="#585b70"
          fontSize={10}
          fontFamily="system-ui, sans-serif"
        >
          MacBook QWERTY · 按对应键位开始练习
        </text>
      </svg>
    </div>
  )
}
