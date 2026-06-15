/**
 * MacBook QWERTY 键盘 SVG 布局数据
 *
 * 坐标系统：viewBox "0 0 1000 380"
 * 标准键宽 ≈ 60 单位，间距 ≈ 6 单位
 * 每行 15 个标准位，总宽 15×62 + 起点偏移 = ~940
 */

import type { Finger } from '../types'

// ─── 键帽定义 ────────────────────────────────────────────────

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
}

// ─── 基础常量 ────────────────────────────────────────────────

const KW = 58   // 标准键宽度
const GAP = 6   // 键间距
const START_X = 24  // 第一行起始 x

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
  { code: 'Digit4',    label: '4', shiftLabel: '$', x: xPos(4),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-index' },
  { code: 'Digit5',    label: '5', shiftLabel: '%', x: xPos(5),     y: ROW_Y[0], w: 1, h: 1, finger: 'L-index' },
  { code: 'Digit6',    label: '6', shiftLabel: '^', x: xPos(6),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-index' },
  { code: 'Digit7',    label: '7', shiftLabel: '&', x: xPos(7),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-index' },
  { code: 'Digit8',    label: '8', shiftLabel: '*', x: xPos(8),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-middle' },
  { code: 'Digit9',    label: '9', shiftLabel: '(', x: xPos(9),     y: ROW_Y[0], w: 1, h: 1, finger: 'R-ring' },
  { code: 'Digit0',    label: '0', shiftLabel: ')', x: xPos(10),    y: ROW_Y[0], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Minus',     label: '-', shiftLabel: '_', x: xPos(11),    y: ROW_Y[0], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Equal',     label: '=', shiftLabel: '+', x: xPos(12),    y: ROW_Y[0], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Backspace', label: '⌫',  x: xPos(13), y: ROW_Y[0], w: 1.5, h: 1, finger: 'R-pinky', isModifier: true },

  // ────── 上排 (y=82) ───────────────────────────────────────
  { code: 'Tab',       label: '⇥',  x: xPos(0),   y: ROW_Y[1], w: 1.5, h: 1, finger: 'L-pinky',  isModifier: true },
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
  { code: 'BracketLeft',  label: '[',  shiftLabel: '{', x: xPos(11) + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'BracketRight', label: ']',  shiftLabel: '}', x: xPos(12) + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Backslash', label: '\\', shiftLabel: '|', x: xPos(13) + (KW+GAP)*0.5, y: ROW_Y[1], w: 1, h: 1, finger: 'R-pinky' },

  // ────── 基准行 (y=144) ────────────────────────────────────
  { code: 'CapsLock',  label: '⇪',  x: xPos(0),   y: ROW_Y[2], w: 1.75, h: 1, finger: 'L-pinky',  isModifier: true },
  { code: 'KeyA',      label: 'A',   x: xPos(1)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-pinky' },
  { code: 'KeyS',      label: 'S',   x: xPos(2)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-ring' },
  { code: 'KeyD',      label: 'D',   x: xPos(3)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-middle' },
  { code: 'KeyF',      label: 'F',   x: xPos(4)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-index', },
  { code: 'KeyG',      label: 'G',   x: xPos(5)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyH',      label: 'H',   x: xPos(6)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyJ',      label: 'J',   x: xPos(7)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyK',      label: 'K',   x: xPos(8)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-middle' },
  { code: 'KeyL',      label: 'L',   x: xPos(9)  + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-ring' },
  { code: 'Semicolon', label: ';',   shiftLabel: ':', x: xPos(10) + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Quote',     label: "'",   shiftLabel: '"', x: xPos(11) + (KW+GAP)*0.75, y: ROW_Y[2], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'Enter',     label: '⏎',  x: xPos(12) + (KW+GAP)*0.75, y: ROW_Y[2], w: 1.75, h: 1, finger: 'R-pinky', isModifier: true },

  // ────── 下排 (y=206) ──────────────────────────────────────
  { code: 'ShiftLeft',  label: '⇧',  x: xPos(0),    y: ROW_Y[3], w: 2.25, h: 1, finger: 'L-pinky', isModifier: true },
  { code: 'KeyZ',       label: 'Z',   x: xPos(1) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-pinky' },
  { code: 'KeyX',       label: 'X',   x: xPos(2) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-ring' },
  { code: 'KeyC',       label: 'C',   x: xPos(3) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-middle' },
  { code: 'KeyV',       label: 'V',   x: xPos(4) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyB',       label: 'B',   x: xPos(5) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'L-index' },
  { code: 'KeyN',       label: 'N',   x: xPos(6) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-index' },
  { code: 'KeyM',       label: 'M',   x: xPos(7) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-index' },
  { code: 'Comma',      label: ',',   shiftLabel: '<', x: xPos(8)  + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-middle' },
  { code: 'Period',     label: '.',   shiftLabel: '>', x: xPos(9)  + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-ring' },
  { code: 'Slash',      label: '/',   shiftLabel: '?', x: xPos(10) + (KW+GAP)*1.25, y: ROW_Y[3], w: 1, h: 1, finger: 'R-pinky' },
  { code: 'ShiftRight', label: '⇧',  x: xPos(11) + (KW+GAP)*1.25, y: ROW_Y[3], w: 2.0, h: 1, finger: 'R-pinky', isModifier: true },

  // ────── 修饰行 (y=268) ────────────────────────────────────
  { code: 'Fn',        label: 'fn',   x: xPos(0),   y: ROW_Y[4], w: 1,   h: 1, finger: 'thumb', isModifier: true },
  { code: 'ControlLeft', label: '⌃',  x: xPos(1),   y: ROW_Y[4], w: 1,   h: 1, finger: 'L-pinky', isModifier: true },
  { code: 'AltLeft',   label: '⌥',   x: xPos(2),   y: ROW_Y[4], w: 1,   h: 1, finger: 'L-pinky', isModifier: true },
  { code: 'MetaLeft',  label: '⌘',   x: xPos(3),   y: ROW_Y[4], w: 1.25, h: 1, finger: 'thumb', isModifier: true },
  { code: 'Space',     label: '',     x: xPos(4)  + (KW+GAP)*0.25, y: ROW_Y[4], w: 5.0, h: 1, finger: 'thumb' },
  { code: 'MetaRight', label: '⌘',   x: xPos(9)  + (KW+GAP)*0.25, y: ROW_Y[4], w: 1.25, h: 1, finger: 'thumb', isModifier: true },
  { code: 'AltRight',  label: '⌥',   x: xPos(10) + (KW+GAP)*0.5,  y: ROW_Y[4], w: 1,   h: 1, finger: 'R-pinky', isModifier: true },
  { code: 'ArrowKeys', label: '◀▼▲▶', x: xPos(11) + (KW+GAP)*0.5,  y: ROW_Y[4], w: 2.0, h: 1, finger: 'R-pinky', isModifier: true },
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
