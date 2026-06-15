/**
 * 练习文本生成器
 *
 * 根据练习模式生成目标文本。
 * 支持：随机字符、指定排、指定手指、渐进课程。
 */

import type { Finger } from '../types'
import { getKeysByFinger, getKeysByRow, getTypableChars } from './fingerMapping'

// ─── 基础生成器 ──────────────────────────────────────────────

/** 从指定字符集中随机生成文本 */
function generate(count: number, charset: string[]): string {
  let result = ''
  for (let i = 0; i < count; i++) {
    result += charset[Math.floor(Math.random() * charset.length)]
  }
  return result
}

/** 随机字母（全键位） */
export function generateRandomChars(count = 60): string {
  return generate(count, getTypableChars())
}

/** 仅基准行 */
export function generateHomeRow(count = 60): string {
  const homeRow = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
  return generate(count, homeRow)
}

/** 仅上排 */
export function generateTopRow(count = 60): string {
  const topRow = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
  return generate(count, topRow)
}

/** 仅下排 */
export function generateBottomRow(count = 60): string {
  const bottomRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  return generate(count, bottomRow)
}

/** 指定手指的按键 */
export function generateByFinger(finger: Finger, count = 60): string {
  const keys = getKeysByFinger(finger)
    .filter(e => e.code.length === 1)
    .map(e => e.code)
  if (keys.length === 0) return ''
  return generate(count, keys)
}

/** 指定排 */
export function generateByRow(row: 'number' | 'top' | 'home' | 'bottom', count = 60): string {
  const keys = getKeysByRow(row)
    .filter(e => e.code.length === 1)
    .map(e => e.code)
  return generate(count, keys)
}

// ─── 课程文本生成 ────────────────────────────────────────────

/** 左手基准行 */
export function generateHomeRowLeft(count = 40): string {
  return generate(count, ['a', 's', 'd', 'f'])
}

/** 右手基准行 */
export function generateHomeRowRight(count = 40): string {
  return generate(count, ['j', 'k', 'l', ';'])
}

// ─── 常用英文单词库 ──────────────────────────────────────────

const COMMON_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us',
]

/** 随机生成单词文本 */
export function generateWords(count = 20): string {
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    words.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)])
  }
  return words.join(' ')
}

// ─── 13级渐进课程 ────────────────────────────────────────────

export interface LessonLevel {
  level: number
  name: string
  description: string
  generate: (count?: number) => string
}

export const lessonLevels: LessonLevel[] = [
  {
    level: 1,
    name: 'Home Row 左手',
    description: '建立左手基准位：ASDF',
    generate: (n) => generateHomeRowLeft(n),
  },
  {
    level: 2,
    name: 'Home Row 右手',
    description: '建立右手基准位：JKL;',
    generate: (n) => generateHomeRowRight(n),
  },
  {
    level: 3,
    name: 'Home Row 混合',
    description: '双手协调：ASDF JKL;',
    generate: (n) => generateHomeRow(n),
  },
  {
    level: 4,
    name: '左食指扩展',
    description: '左食指上下移动：RFVTGB',
    generate: (n) => generate(n ?? 40, ['r', 'f', 'v', 't', 'g', 'b']),
  },
  {
    level: 5,
    name: '右食指扩展',
    description: '右食指上下移动：UJMNHY',
    generate: (n) => generate(n ?? 40, ['u', 'j', 'm', 'n', 'h', 'y']),
  },
  {
    level: 6,
    name: '左中 + 无名指',
    description: '双指协同：EDC WSX',
    generate: (n) => generate(n ?? 40, ['e', 'd', 'c', 'w', 's', 'x']),
  },
  {
    level: 7,
    name: '右中 + 无名指',
    description: '双指协同：IK, OL.',
    generate: (n) => generate(n ?? 40, ['i', 'k', ',', 'o', 'l', '.']),
  },
  {
    level: 8,
    name: '小指强化',
    description: '最弱手指重点强化：QA ZP ;/',
    generate: (n) => generate(n ?? 40, ['q', 'a', 'z', 'p', ';', '/']),
  },
  {
    level: 9,
    name: '上排全键',
    description: '上排流利度：QWERT YUIOP',
    generate: (n) => generateTopRow(n),
  },
  {
    level: 10,
    name: '下排全键',
    description: '下排精准度：ZXCVB NM',
    generate: (n) => generateBottomRow(n),
  },
  {
    level: 11,
    name: '数字行',
    description: '数字盲打：1-0',
    generate: (n) => generate(n ?? 40, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']),
  },
  {
    level: 12,
    name: '符号键',
    description: '编程常用符号',
    generate: (n) => generate(n ?? 40, ['-', '=', '[', ']', '\\', ';', "'", ',', '.', '/']),
  },
  {
    level: 13,
    name: '全键盘综合',
    description: '毕业考试',
    generate: (n) => generateRandomChars(n ?? 80),
  },
]
