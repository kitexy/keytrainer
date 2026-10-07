/**
 * MacBook QWERTY 键盘 SVG 布局数据
 *
 * 坐标系统：viewBox "0 0 970 340"
 * 标准键宽 KW=58，键距 GAP=6，栅格步长 64
 * 所有行左边缘 x=24、右边缘 x=946（左右对齐，仿真实 MacBook）
 */

import type { Finger } from '../types'

// ─── 键帽定义 ────────────────────────────────────────────────

/** 键帽内的一个符号（用于多符号键，如中文键盘的 ￥/$、全角标点） */
export interface KeyLabelSpec {
  t: string        // 文本
  ax: number       // 横向位置（键帽内归一化 0..1）
  ay: number       // 纵向位置（键帽内归一化 0..1）
  size?: number    // 字号（默认 10）
  dim?: boolean    // 次要符号（半透明）
  cjk?: boolean    // 使用中文无衬线字体
}

export interface KeyLayout {
  code: string          // keyboard event code
  label: string         // 显示文本（小写）
  shiftLabel?: string   // Shift 状态显示文本
  x: number             // SVG x
  y: number             // SVG y
  w: number             // 宽度（标准=1，如 Tab=1.5）
  h: number             // 高度（标准=1）
  finger: Finger        // 正确指法
  isModifier?: boolean  // 是否为修饰键
  /** 主图标/文字在键帽中的位置（默认居中） */
  labelAlign?: 'center' | 'bottom-left'
  /** 键帽左下角的小字英文名称（仿 MacBook：tab / shift / delete / return …） */
  word?: string
  /** 覆盖默认标签字号 */
  labelSize?: number
  /** 多符号键：完全接管标签渲染（仿 MacBook 中文键盘的多符号键帽） */
  labels?: KeyLabelSpec[]
}

// ─── 基础常量 ────────────────────────────────────────────────

const KW = 58      // 标准键宽度
const KH = 52      // 标准键高度
const GAP = 6      // 键间距
const START_X = 24 // 第一行起始 x

// 每行 y 坐标
const ROW_Y = [20, 82, 144, 206, 268]

// 行键位列表（不含偏移宽键）
// 数字行: 15 keys
// 上排: 14 keys (tab + 13)
// 基准行: 13 keys (caps + 12)
// 下排: 12 keys (shift + 11)
// 修饰行: 特殊处理

function xPos(col: number, offset: number = 0): number {
  return START_X + col * (KW + GAP) + offset
}

// ─── 布局定义 ────────────────────────────────────────────────

export const KEYBOARD_LAYOUT: KeyLayout[] = [
  // ────── 数字行 (y=20) ─────────────────────────────────────
  { code: 'Backquote', label: '`', shiftLabel: '~', x: xPos(0),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-pinky' },
  { code: 'Digit1',    label: '1', shiftLabel: '!', x: xPos(1),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-pinky' },
  { code: 'Digit2',    label: '2', shiftLabel: '@', x: xPos(2),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-ring' },
  { code: 'Digit3',    label: '3', shiftLabel: '#', x: xPos(3),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-middle' },
  { code: 'Digit4',    label: '4', shiftLabel: '$', x: xPos(4),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-index',
    labels: [ { t: '¥', ax: 0.30, ay: 0.25, size: 9, dim: true, cjk: true }, { t: '$', ax: 0.70, ay: 0.25, size: 9, dim: true }, { t: '4', ax: 0.5, ay: 0.58, size: 16 } ] },
  { code: 'Digit5',    label: '5', shiftLabel: '%', x: xPos(5),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-index' },
  { code: 'Digit6',    label: '6', shiftLabel: '^', x: xPos(6),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-index',
    labels: [ { t: '…', ax: 0.30, ay: 0.25, size: 9, dim: true }, { t: '^', ax: 0.70, ay: 0.25, size: 9, dim: true }, { t: '6', ax: 0.5, ay: 0.58, size: 16 } ] },
  { code: 'Digit7',    label: '7', shiftLabel: '&', x: xPos(7),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-index' },
  { code: 'Digit8',    label: '8', shiftLabel: '*', x: xPos(8),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-middle' },
  { code: 'Digit9',    label: '9', shiftLabel: '(', x: xPos(9),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-ring' },
  { code: 'Digit0',    label: '0', shiftLabel: ')', x: xPos(10),    y: ROW_Y[0], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Minus',     label: '-', shiftLabel: '_', x: xPos(11),    y: ROW_Y[0], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Equal',     label: '=', shiftLabel: '+', x: xPos(12),    y: ROW_Y[0], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Backspace', label: '⌫',  x: xPos(13), y: ROW_Y[0], w: 1.55, h: 1, finger: 'R-pinky', isModifier: true, labelAlign: 'bottom-left', word: 'delete' },

  // ────── 上排 (y=82) ───────────────────────────────────────
  { code: 'Tab',       label: '⇥',  x: xPos(0),   y: ROW_Y[1], w: 1.5, h: 1, finger: 'L-pinky',  isModifier: true, labelAlign: 'bottom-left', word: 'tab' },
  { code: 'KeyQ',      label: 'Q',   x: xPos(1)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'L-pinky' },
  { code: 'KeyW',      label: 'W',   x: xPos(2)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'L-ring' },
  { code: 'KeyE',      label: 'E',   x: xPos(3)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'L-middle' },
  { code: 'KeyR',      label: 'R',   x: xPos(4)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyT',      label: 'T',   x: xPos(5)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyY',      label: 'Y',   x: xPos(6)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyU',      label: 'U',   x: xPos(7)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyI',      label: 'I',   x: xPos(8)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-middle' },
  { code: 'KeyO',      label: 'O',   x: xPos(9)  + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-ring' },
  { code: 'KeyP',      label: 'P',   x: xPos(10) + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'BracketLeft',  label: '[',  shiftLabel: '{', x: xPos(11) + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-pinky',
    labels: [ { t: '[', ax: 0.30, ay: 0.28, size: 12 }, { t: '{', ax: 0.70, ay: 0.28, size: 12 }, { t: '【', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true }, { t: '｛', ax: 0.70, ay: 0.74, size: 11, dim: true, cjk: true } ] },
  { code: 'BracketRight', label: ']',  shiftLabel: '}', x: xPos(12) + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-pinky',
    labels: [ { t: ']', ax: 0.30, ay: 0.28, size: 12 }, { t: '}', ax: 0.70, ay: 0.28, size: 12 }, { t: '】', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true }, { t: '｝', ax: 0.70, ay: 0.74, size: 11, dim: true, cjk: true } ] },
  { code: 'Backslash', label: '\\', shiftLabel: '|', x: xPos(13) + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-pinky',
    labels: [ { t: '\\', ax: 0.30, ay: 0.28, size: 12 }, { t: '|', ax: 0.70, ay: 0.28, size: 12 }, { t: '、', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true } ] },

  // ────── 基准行 (y=144) ────────────────────────────────────
  { code: 'CapsLock',  label: '中/英', x: xPos(0),   y: ROW_Y[2], w: 1.75, h: 1, finger: 'L-pinky',  isModifier: true, labelSize: 13 },
  { code: 'KeyA',      label: 'A',   x: xPos(1)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-pinky' },
  { code: 'KeyS',      label: 'S',   x: xPos(2)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-ring' },
  { code: 'KeyD',      label: 'D',   x: xPos(3)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-middle' },
  { code: 'KeyF',      label: 'F',   x: xPos(4)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-index', },
  { code: 'KeyG',      label: 'G',   x: xPos(5)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyH',      label: 'H',   x: xPos(6)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyJ',      label: 'J',   x: xPos(7)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyK',      label: 'K',   x: xPos(8)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-middle' },
  { code: 'KeyL',      label: 'L',   x: xPos(9)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-ring' },
  { code: 'Semicolon', label: ';',   shiftLabel: ':', x: xPos(10) + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-pinky',
    labels: [ { t: ';', ax: 0.30, ay: 0.28, size: 13 }, { t: ':', ax: 0.70, ay: 0.28, size: 13 }, { t: '；', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true }, { t: '：', ax: 0.70, ay: 0.74, size: 11, dim: true, cjk: true } ] },
  { code: 'Quote',     label: "'",   shiftLabel: '"', x: xPos(11) + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-pinky',
    labels: [ { t: "'", ax: 0.30, ay: 0.28, size: 13 }, { t: '"', ax: 0.70, ay: 0.28, size: 13 }, { t: '’', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true }, { t: '”', ax: 0.70, ay: 0.74, size: 11, dim: true, cjk: true } ] },
  { code: 'Enter',     label: '⏎',  x: xPos(12) + (KW+GAP)*0.75, y: ROW_Y[2], w: 1.83, h: 1, finger: 'R-pinky', isModifier: true, labelAlign: 'bottom-left', word: 'return' },

  // ────── 下排 (y=206) ──────────────────────────────────────
  { code: 'ShiftLeft',  label: '⇧',  x: xPos(0),    y: ROW_Y[3], w: 2.25, h: 1, finger: 'L-pinky', isModifier: true, labelAlign: 'bottom-left', word: 'shift' },
  { code: 'KeyZ',       label: 'Z',   x: xPos(1) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-pinky' },
  { code: 'KeyX',       label: 'X',   x: xPos(2) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-ring' },
  { code: 'KeyC',       label: 'C',   x: xPos(3) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-middle' },
  { code: 'KeyV',       label: 'V',   x: xPos(4) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyB',       label: 'B',   x: xPos(5) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyN',       label: 'N',   x: xPos(6) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyM',       label: 'M',   x: xPos(7) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-index' },
  { code: 'Comma',      label: ',',   shiftLabel: '<', x: xPos(8)  + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-middle',
    labels: [ { t: ',', ax: 0.30, ay: 0.28, size: 13 }, { t: '<', ax: 0.70, ay: 0.28, size: 12 }, { t: '，', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true }, { t: '《', ax: 0.70, ay: 0.74, size: 11, dim: true, cjk: true } ] },
  { code: 'Period',     label: '.',   shiftLabel: '>', x: xPos(9)  + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-ring',
    labels: [ { t: '.', ax: 0.30, ay: 0.28, size: 13 }, { t: '>', ax: 0.70, ay: 0.28, size: 12 }, { t: '。', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true }, { t: '》', ax: 0.70, ay: 0.74, size: 11, dim: true, cjk: true } ] },
  { code: 'Slash',      label: '/',   shiftLabel: '?', x: xPos(10) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-pinky',
    labels: [ { t: '/', ax: 0.30, ay: 0.28, size: 13 }, { t: '?', ax: 0.70, ay: 0.28, size: 12 }, { t: '、', ax: 0.30, ay: 0.74, size: 11, dim: true, cjk: true }, { t: '？', ax: 0.70, ay: 0.74, size: 11, dim: true, cjk: true } ] },
  { code: 'ShiftRight', label: '⇧',  x: xPos(11) + (KW+GAP)*1.25, y: ROW_Y[3], w: 2.38, h: 1, finger: 'R-pinky', isModifier: true, labelAlign: 'bottom-left', word: 'shift' },

  // ────── 修饰行 (y=268) ────────────────────────────────────
  { code: 'Fn',        label: 'fn',   x: xPos(0),   y: ROW_Y[4], w: 1,    h: 1, finger: 'thumb', isModifier: true, labelAlign: 'bottom-left' },
  { code: 'ControlLeft', label: '⌃',  x: xPos(1),   y: ROW_Y[4], w: 1,    h: 1, finger: 'L-pinky', isModifier: true, labelAlign: 'bottom-left', word: 'control' },
  { code: 'AltLeft',   label: '⌥',   x: xPos(2),   y: ROW_Y[4], w: 1,    h: 1, finger: 'L-pinky', isModifier: true, labelAlign: 'bottom-left', word: 'option' },
  { code: 'MetaLeft',  label: '⌘',   x: xPos(3),   y: ROW_Y[4], w: 1.25, h: 1, finger: 'thumb', isModifier: true, labelAlign: 'bottom-left', word: 'command' },
  // 空格 & 右修饰键：加长空格让右边缘与其他行对齐 (x=946)
  { code: 'Space',     label: '',     x: 294.5,     y: ROW_Y[4], w: 6.2,  h: 1, finger: 'thumb' },
  { code: 'MetaRight', label: '⌘',   x: 660.1,     y: ROW_Y[4], w: 1.25, h: 1, finger: 'thumb', isModifier: true, labelAlign: 'bottom-left', word: 'command' },
  { code: 'AltRight',  label: '⌥',   x: 738.6,     y: ROW_Y[4], w: 1,    h: 1, finger: 'R-pinky', isModifier: true, labelAlign: 'bottom-left', word: 'option' },
  // ── 方向键组（仿 MacBook）：四个等大键，呈 T 形 — ▲ 在上，◀ ▼ ▶ 在下 ──
  { code: 'ArrowUp',    label: '▲', x: 852,   y: ROW_Y[4],        w: 0.75, h: 0.5, finger: 'R-pinky', isModifier: true },
  { code: 'ArrowLeft',  label: '◀', x: 802.5, y: ROW_Y[4] + KH/2, w: 0.75, h: 0.5, finger: 'R-pinky', isModifier: true },
  { code: 'ArrowDown',  label: '▼', x: 852,   y: ROW_Y[4] + KH/2, w: 0.75, h: 0.5, finger: 'R-pinky', isModifier: true },
  { code: 'ArrowRight', label: '▶', x: 901.5, y: ROW_Y[4] + KH/2, w: 0.75, h: 0.5, finger: 'R-pinky', isModifier: true },
]

// ─── 工具函数 ────────────────────────────────────────────────

/** 根据 key code 查找布局 */
export function getKeyLayout(code: string): KeyLayout | undefined {
  return KEYBOARD_LAYOUT.find(k => k.code === code)
}

/** 根据实际按键字符查找布局（支持 .key 匹配） */
export function getKeyLayoutByChar(char: string): KeyLayout | undefined {
  const lower = char.toLowerCase()
  // 遍历布局查找 label 匹配或 shiftLabel 匹配
  for (const key of KEYBOARD_LAYOUT) {
    if (key.label.toLowerCase() === lower) return key
    if (key.shiftLabel && key.shiftLabel === char) return key
  }
  return undefined
}

/** 获取所有可打字键（排除修饰键） */
export function getTypableKeys(): KeyLayout[] {
  return KEYBOARD_LAYOUT.filter(k => !k.isModifier)
}

/** 键盘 SVG viewBox 尺寸 */
export const KEYBOARD_VIEWBOX = {
  width: 960,
  height: 340,
}
