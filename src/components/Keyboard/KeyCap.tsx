/**
 * KeyCap — 单个键帽渲染组件
 *
 * SVG <g> 元素，包含圆角矩形 + 标签文字。
 * 根据状态切换颜色：default/正确/错误/当前/待击。
 */

import type { Finger } from '../../types'

export type KeyCapStatus = 'default' | 'current' | 'correct' | 'incorrect' | 'pending'

interface KeyCapProps {
  /** 键位布局数据 */
  keyData: {
    code: string
    label: string
    shiftLabel?: string
    x: number
    y: number
    w: number
    h: number
    finger: Finger
  }
  /** 当前状态 */
  status: KeyCapStatus
  /** 是否显示指法分区颜色（半透明覆盖） */
  showFingerZones?: boolean
  /** 指法颜色 hex */
  fingerColor?: string
  /** 自定义 class */
  className?: string
}

const KW = 58   // 标准键宽
const KH = 52   // 键高
const RX = 8    // 圆角半径

/** 状态 → 颜色映射 */
const STATUS_COLORS: Record<KeyCapStatus, { bg: string; border: string; text: string }> = {
  default:   { bg: '#1e1e2e', border: '#2a2a3c', text: '#cdd6f4' },
  pending:   { bg: '#1e1e2e', border: '#2a2a3c', text: '#6c7086' },
  current:   { bg: '#1e3a5f', border: '#3b82f6', text: '#89b4fa' },
  correct:    { bg: '#1e3e2e', border: '#2a5a3c', text: '#a6e3a1' },
  incorrect:  { bg: '#3e1e1e', border: '#5a2a2a', text: '#f38ba8' },
}

export default function KeyCap({
  keyData,
  status,
  showFingerZones = false,
  fingerColor = '#ffffff20',
  className = '',
}: KeyCapProps) {
  const { label, shiftLabel, x, y, w, h } = keyData
  const colors = STATUS_COLORS[status]
  const keyW = w * KW
  const keyH = h * KH

  return (
    <g className={`keycap keycap--${status} ${className}`}>
      {/* 指法分区颜色覆盖层 */}
      {showFingerZones && (
        <rect
          x={x}
          y={y}
          width={keyW}
          height={keyH}
          rx={RX - 2}
          fill={fingerColor}
          opacity={0.25}
          className="pointer-events-none"
        />
      )}

      {/* 键帽主体 */}
      <rect
        x={x}
        y={y}
        width={keyW}
        height={keyH}
        rx={RX}
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={1}
        className={`
          transition-all duration-200
          ${status === 'current' ? 'animate-key-pulse' : ''}
          ${status === 'incorrect' ? 'animate-shake' : ''}
        `}
      />

      {/* 主标签 */}
      <text
        x={x + keyW / 2}
        y={y + keyH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={16}
        fontFamily="'SF Mono', 'JetBrains Mono', 'Fira Code', monospace"
        fontWeight={500}
        className="pointer-events-none select-none"
      >
        {label}
      </text>

      {/* Shift 标签（右上角小字） */}
      {shiftLabel && (
        <text
          x={x + keyW - 8}
          y={y + 16}
          textAnchor="end"
          fill={colors.text}
          fontSize={9}
          opacity={0.5}
          fontFamily="'SF Mono', 'JetBrains Mono', monospace"
          className="pointer-events-none select-none"
        >
          {shiftLabel}
        </text>
      )}
    </g>
  )
}
