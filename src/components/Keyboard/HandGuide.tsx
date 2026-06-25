/**
 * HandGuide — 指法指引覆盖层
 *
 * 在母键（A/S/D/F/J/K/L/;）上叠加半透明色块，
 * 色块尺寸与键帽完全一致，并在色块中央显示指位名称（左小 / 右中 等）。
 */

import { KEYBOARD_LAYOUT } from '../../utils/keyboardLayout'

const KW = 58   // 标准键宽
const KH = 52   // 标准键高

/** 从 KEYBOARD_LAYOUT 查找指定 code 的键位 x/y */
function getKey(code: string) {
  return KEYBOARD_LAYOUT.find(k => k.code === code)
}

// 母键定义：[code, 指位标签, 填充色, 文字色]
const HOME_KEYS: Array<{ code: string; label: string; fill: string; textFill: string }> = [
  { code: 'KeyA',      label: '左小',  fill: '#9b8ec4', textFill: '#fff' },
  { code: 'KeyS',      label: '左无名', fill: '#5f8fc4', textFill: '#fff' },
  { code: 'KeyD',      label: '左中',  fill: '#3aac8d', textFill: '#fff' },
  { code: 'KeyF',      label: '左食',  fill: '#7ab648', textFill: '#fff' },
  { code: 'KeyJ',      label: '右食',  fill: '#d4a843', textFill: '#fff' },
  { code: 'KeyK',      label: '右中',  fill: '#d4843a', textFill: '#fff' },
  { code: 'KeyL',      label: '右无名', fill: '#c4556a', textFill: '#fff' },
  { code: 'Semicolon', label: '右小',  fill: '#b84545', textFill: '#fff' },
]

export default function HandGuide() {
  return (
    <g pointerEvents="none">
      {HOME_KEYS.map(({ code, label, fill, textFill }) => {
        const key = getKey(code)
        if (!key) return null

        const x = key.x
        const y = key.y
        const cx = x + KW / 2   // 键帽中心 x
        const cy = y + KH / 2   // 键帽中心 y

        return (
          <g key={code}>
            {/* 色块：完全覆盖键帽，圆角与 KeyCap 一致 */}
            <rect
              x={x} y={y}
              width={KW} height={KH}
              rx={8} ry={8}
              fill={fill}
              opacity={0.55}
            />
            {/* 指位标签 */}
            <text
              x={cx} y={cy + 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textFill}
              fontSize={11}
              fontWeight={600}
              fontFamily="PingFang SC, Helvetica Neue, system-ui, sans-serif"
              opacity={0.95}
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
