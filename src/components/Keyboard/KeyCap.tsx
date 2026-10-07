/**
 * KeyCap — 单个键帽渲染组件
 *
 * SVG <g> 元素，包含圆角矩形 + 标签文字。
 * 根据状态切换颜色：default/正确/错误/当前/待击。
 *
 * 支持三种标签排布（仿真实 MacBook）：
 *  - 居中：字母/数字键
 *  - 左下角：修饰键（符号 + 小字名称，如 ⌫ delete / ⇧ shift）
 *  - 上下叠放：含 Shift 符号的键（符号在上、主字符在下）
 */

import type { Finger } from '../../types'
import type { KeyLabelSpec } from '../../utils/keyboardLayout'

export type KeyCapStatus = 'default' | 'current' | 'correct' | 'incorrect' | 'pending'

export interface KeyData {
  code: string
  label: string
  shiftLabel?: string
  x: number
  y: number
  w: number
  h: number
  finger: Finger
  /** 主图标/文字位置 */
  labelAlign?: 'center' | 'bottom-left'
  /** 左下角小字英文名称 */
  word?: string
  /** 覆盖默认标签字号 */
  labelSize?: number
  /** 多符号键：完全接管标签渲染 */
  labels?: KeyLabelSpec[]
}

interface KeyCapProps {
  /** 键位布局数据 */
  keyData: KeyData
  /** 当前状态 */
  status: KeyCapStatus
  /** 是否显示指法分区颜色（半透明覆盖） */
  showFingerZones?: boolean
  /** 指法颜色 hex */
  fingerColor?: string
  /** Caps Lock 指示灯是否点亮（仅 CapsLock 键有意义） */
  capsOn?: boolean
  /** 自定义 class */
  className?: string
}

const KW = 58   // 标准键宽
const KH = 52   // 键高
const RX = 8    // 圆角半径

const MONO = "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace"
const SANS = "'PingFang SC', 'Helvetica Neue', system-ui, sans-serif"

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
  capsOn = false,
  className = '',
}: KeyCapProps) {
  const { code, label, shiftLabel, x, y, w, h } = keyData
  const colors = STATUS_COLORS[status]
  const keyW = w * KW
  const keyH = h * KH

  const isBottomLeft = keyData.labelAlign === 'bottom-left'
  // 主标签字号：小键自适应
  const baseFontSize = keyData.labelSize ?? (keyH < KH ? 10 : keyW < KW ? 11 : 16)

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

      {/* ── 标签渲染 ─────────────────────────────── */}
      {code === 'CapsLock' ? (
        // Caps Lock（中/英）：指示灯在上、文字在下，均左对齐
        <>
          <circle
            cx={x + 12}
            cy={y + 15}
            r={3}
            fill={capsOn ? '#a6e3a1' : '#45475a'}
            className={capsOn ? 'animate-key-pulse' : ''}
          />
          <text
            x={x + 9}
            y={y + keyH - 12}
            textAnchor="start"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={keyData.labelSize ?? 13}
            fontFamily={SANS}
            fontWeight={500}
            className="pointer-events-none select-none"
          >
            {label}
          </text>
        </>
      ) : keyData.labels ? (
        // 多符号键（仿 MacBook 中文键盘）：按归一化坐标逐个渲染
        keyData.labels.map((l, i) => (
          <text
            key={i}
            x={x + l.ax * keyW}
            y={y + l.ay * keyH}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={l.size ?? 10}
            opacity={l.dim ? 0.62 : 1}
            fontFamily={l.cjk ? SANS : MONO}
            fontWeight={l.dim ? 400 : 500}
            className="pointer-events-none select-none"
          >
            {l.t}
          </text>
        ))
      ) : isBottomLeft ? (
        // 修饰键：符号置于左下角（仿 MacBook M5 — Tab/Shift/Delete/Return 仅符号无文字）
        <>
          <text
            x={x + 11}
            y={y + keyH - 12}
            textAnchor="start"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={keyData.labelSize ?? 13}
            fontFamily={MONO}
            fontWeight={500}
            className="pointer-events-none select-none"
          >
            {label}
          </text>
          {keyData.word && (
            <text
              x={x + 11 + (label ? 19 : 0)}
              y={y + keyH - 12}
              textAnchor="start"
              dominantBaseline="central"
              fill={colors.text}
              fontSize={7.5}
              fontFamily={SANS}
              opacity={0.6}
              className="pointer-events-none select-none"
            >
              {keyData.word}
            </text>
          )}
        </>
      ) : shiftLabel ? (
        // 含 Shift 符号的键：符号在上、主字符在下（仿 MacBook 数字/符号行）
        <>
          <text
            x={x + keyW / 2}
            y={y + 13}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={9}
            fontFamily={MONO}
            opacity={0.6}
            className="pointer-events-none select-none"
          >
            {shiftLabel}
          </text>
          <text
            x={x + keyW / 2}
            y={y + keyH / 2 + 4}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={baseFontSize}
            fontFamily={MONO}
            fontWeight={500}
            className="pointer-events-none select-none"
          >
            {label}
          </text>
        </>
      ) : (
        // 默认居中
        <text
          x={x + keyW / 2}
          y={y + keyH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.text}
          fontSize={baseFontSize}
          fontFamily={MONO}
          fontWeight={500}
          className="pointer-events-none select-none"
        >
          {label}
        </text>
      )}
    </g>
  )
}
