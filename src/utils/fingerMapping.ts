/**
 * 指位映射 — QWERTY 标准盲打指法
 *
 * 双手食指分别定位在 F 和 J 键，其他手指依次放在相邻键上。
 * 每个键对应一个「标准手指」，用于指位训练合规判定。
 */

import type { Finger } from '../types'

// ─── 完整键→手指映射表 ───────────────────────────────────────

export interface KeyFingerEntry {
  code: string
  finger: Finger
  row: 'number' | 'top' | 'home' | 'bottom' | 'modifier' | 'space'
  column: number // 0=最左, 13=最右
  homeRowEquivalent: string // 该键对应的 home row 基准键（用于指位训练提示）
}

const keyFingerMap: Record<string, KeyFingerEntry> = {
  // ─── 数字行 ───
  '`':  { code: '`',  finger: 'L-pinky',  row: 'number', column: 0,  homeRowEquivalent: 'A' },
  '1':  { code: '1',  finger: 'L-pinky',  row: 'number', column: 1,  homeRowEquivalent: 'A' },
  '2':  { code: '2',  finger: 'L-ring',   row: 'number', column: 2,  homeRowEquivalent: 'S' },
  '3':  { code: '3',  finger: 'L-middle', row: 'number', column: 3,  homeRowEquivalent: 'D' },
  '4':  { code: '4',  finger: 'L-index',  row: 'number', column: 4,  homeRowEquivalent: 'F' },
  '5':  { code: '5',  finger: 'L-index',  row: 'number', column: 5,  homeRowEquivalent: 'F' },
  '6':  { code: '6',  finger: 'R-index',  row: 'number', column: 6,  homeRowEquivalent: 'J' },
  '7':  { code: '7',  finger: 'R-index',  row: 'number', column: 7,  homeRowEquivalent: 'J' },
  '8':  { code: '8',  finger: 'R-middle', row: 'number', column: 8,  homeRowEquivalent: 'K' },
  '9':  { code: '9',  finger: 'R-ring',   row: 'number', column: 9,  homeRowEquivalent: 'L' },
  '0':  { code: '0',  finger: 'R-pinky',  row: 'number', column: 10, homeRowEquivalent: ';' },
  '-':  { code: '-',  finger: 'R-pinky',  row: 'number', column: 11, homeRowEquivalent: ';' },
  '=':  { code: '=',  finger: 'R-pinky',  row: 'number', column: 12, homeRowEquivalent: ';' },

  // ─── 上排 ───
  'Tab':  { code: 'Tab',  finger: 'L-pinky',  row: 'top', column: 0,  homeRowEquivalent: 'A' },
  'q':    { code: 'q',    finger: 'L-pinky',  row: 'top', column: 1,  homeRowEquivalent: 'A' },
  'w':    { code: 'w',    finger: 'L-ring',   row: 'top', column: 2,  homeRowEquivalent: 'S' },
  'e':    { code: 'e',    finger: 'L-middle', row: 'top', column: 3,  homeRowEquivalent: 'D' },
  'r':    { code: 'r',    finger: 'L-index',  row: 'top', column: 4,  homeRowEquivalent: 'F' },
  't':    { code: 't',    finger: 'L-index',  row: 'top', column: 5,  homeRowEquivalent: 'F' },
  'y':    { code: 'y',    finger: 'R-index',  row: 'top', column: 6,  homeRowEquivalent: 'J' },
  'u':    { code: 'u',    finger: 'R-index',  row: 'top', column: 7,  homeRowEquivalent: 'J' },
  'i':    { code: 'i',    finger: 'R-middle', row: 'top', column: 8,  homeRowEquivalent: 'K' },
  'o':    { code: 'o',    finger: 'R-ring',   row: 'top', column: 9,  homeRowEquivalent: 'L' },
  'p':    { code: 'p',    finger: 'R-pinky',  row: 'top', column: 10, homeRowEquivalent: ';' },
  '[':    { code: '[',    finger: 'R-pinky',  row: 'top', column: 11, homeRowEquivalent: ';' },
  ']':    { code: ']',    finger: 'R-pinky',  row: 'top', column: 12, homeRowEquivalent: ';' },
  '\\':   { code: '\\',   finger: 'R-pinky',  row: 'top', column: 13, homeRowEquivalent: ';' },

  // ─── 基准行（Home Row）───
  'CapsLock': { code: 'CapsLock', finger: 'L-pinky',  row: 'home', column: 0,  homeRowEquivalent: 'A' },
  'a':  { code: 'a',  finger: 'L-pinky',  row: 'home', column: 1,  homeRowEquivalent: 'A' },
  's':  { code: 's',  finger: 'L-ring',   row: 'home', column: 2,  homeRowEquivalent: 'S' },
  'd':  { code: 'd',  finger: 'L-middle', row: 'home', column: 3,  homeRowEquivalent: 'D' },
  'f':  { code: 'f',  finger: 'L-index',  row: 'home', column: 4,  homeRowEquivalent: 'F' },
  'g':  { code: 'g',  finger: 'L-index',  row: 'home', column: 5,  homeRowEquivalent: 'F' },
  'h':  { code: 'h',  finger: 'R-index',  row: 'home', column: 6,  homeRowEquivalent: 'J' },
  'j':  { code: 'j',  finger: 'R-index',  row: 'home', column: 7,  homeRowEquivalent: 'J' },
  'k':  { code: 'k',  finger: 'R-middle', row: 'home', column: 8,  homeRowEquivalent: 'K' },
  'l':  { code: 'l',  finger: 'R-ring',   row: 'home', column: 9,  homeRowEquivalent: 'L' },
  ';':  { code: ';',  finger: 'R-pinky',  row: 'home', column: 10, homeRowEquivalent: ';' },
  "'":  { code: "'",  finger: 'R-pinky',  row: 'home', column: 11, homeRowEquivalent: ';' },

  // ─── 下排 ───
  'z':    { code: 'z',    finger: 'L-pinky',  row: 'bottom', column: 1,  homeRowEquivalent: 'A' },
  'x':    { code: 'x',    finger: 'L-ring',   row: 'bottom', column: 2,  homeRowEquivalent: 'S' },
  'c':    { code: 'c',    finger: 'L-middle', row: 'bottom', column: 3,  homeRowEquivalent: 'D' },
  'v':    { code: 'v',    finger: 'L-index',  row: 'bottom', column: 4,  homeRowEquivalent: 'F' },
  'b':    { code: 'b',    finger: 'L-index',  row: 'bottom', column: 5,  homeRowEquivalent: 'F' },
  'n':    { code: 'n',    finger: 'R-index',  row: 'bottom', column: 6,  homeRowEquivalent: 'J' },
  'm':    { code: 'm',    finger: 'R-index',  row: 'bottom', column: 7,  homeRowEquivalent: 'J' },
  ',':    { code: ',',    finger: 'R-middle', row: 'bottom', column: 8,  homeRowEquivalent: 'K' },
  '.':    { code: '.',    finger: 'R-ring',   row: 'bottom', column: 9,  homeRowEquivalent: 'L' },
  '/':    { code: '/',    finger: 'R-pinky',  row: 'bottom', column: 10, homeRowEquivalent: ';' },

  // ─── 空格 ───
  ' ':  { code: ' ',  finger: 'thumb', row: 'space', column: 5, homeRowEquivalent: 'Space' },
}

// ─── 指法分区颜色 ────────────────────────────────────────────

export const FINGER_COLORS: Record<Finger, string> = {
  'L-pinky':  '#CECBF6', // 淡紫
  'L-ring':   '#B5D4F4', // 淡蓝
  'L-middle': '#9FE1CB', // 淡青
  'L-index':  '#C0DD97', // 淡绿
  'R-index':  '#FAEEDA', // 淡黄
  'R-middle': '#FAC775', // 淡橙
  'R-ring':   '#F4C0D1', // 淡粉
  'R-pinky':  '#F7C1C1', // 淡红
  'thumb':    '#D3D1C7', // 浅灰
}

// ─── 正向查询 ────────────────────────────────────────────────

/** 获取某个按键的标准手指 */
export function getFingerForKey(code: string): Finger | null {
  const lower = code.toLowerCase()
  return keyFingerMap[lower]?.finger ?? keyFingerMap[code]?.finger ?? null
}

/** 获取某个按键的完整映射信息 */
export function getKeyEntry(code: string): KeyFingerEntry | null {
  const lower = code.toLowerCase()
  return keyFingerMap[lower] ?? keyFingerMap[code] ?? null
}

/** 获取某个手指负责的所有按键 */
export function getKeysByFinger(finger: Finger): KeyFingerEntry[] {
  return Object.values(keyFingerMap).filter(e => e.finger === finger)
}

/** 按排获取所有按键 */
export function getKeysByRow(row: 'number' | 'top' | 'home' | 'bottom'): KeyFingerEntry[] {
  return Object.values(keyFingerMap).filter(e => e.row === row)
}

/** 获取 home row 基准键列表（8个） */
export function getHomeRowKeys(): KeyFingerEntry[] {
  const homeRow = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
  return homeRow.map(k => keyFingerMap[k]).filter(Boolean)
}

/** 获取基准行对应手指 */
export function homeRowFingers(): Finger[] {
  return ['L-pinky', 'L-ring', 'L-middle', 'L-index', 'R-index', 'R-middle', 'R-ring', 'R-pinky']
}

// ─── 组别查询 ────────────────────────────────────────────────

/** 左手所有按键 */
export function getLeftHandKeys(): KeyFingerEntry[] {
  return Object.values(keyFingerMap).filter(e => e.finger.startsWith('L-'))
}

/** 右手所有按键 */
export function getRightHandKeys(): KeyFingerEntry[] {
  return Object.values(keyFingerMap).filter(e => e.finger.startsWith('R-'))
}

/** 获取训练友好的字符列表 */
export function getTypableChars(): string[] {
  return Object.values(keyFingerMap)
    .filter(e => e.code.length === 1 && e.code !== ' ')
    .map(e => e.code)
}
