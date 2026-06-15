/**
 * 打字状态管理 — Zustand Store
 *
 * 管理一次打字练习的完整生命周期：
 * idle → running → paused → finished
 *
 * 包含 FCS (Finger Compliance Score) 指法合规分启发式计算。
 */

import { create } from 'zustand'
import type { Keystroke, Finger } from '../types'
import { getFingerForKey } from '../utils/fingerMapping'

// ─── 字符状态 ────────────────────────────────────────────────

export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'corrected'

export interface TypedChar {
  char: string // 目标字符
  typed: string | null // 用户实际输入
  status: CharStatus
}

// ─── 会话状态 ────────────────────────────────────────────────

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface TypingState {
  // 核心数据
  targetText: string
  typedChars: TypedChar[]
  currentIndex: number
  sessionStatus: SessionStatus

  // 计时
  startTime: number | null
  endTime: number | null

  // 击键记录
  keystrokes: Keystroke[]
  errorCount: number
  totalKeystrokes: number

  // ─── 计算属性 ───
  wpm: number
  accuracy: number
  progress: number // 0-100
  elapsedSeconds: number
  fcs: number // Finger Compliance Score 0-100

  // ─── 动作 ───
  initSession: (text: string) => void
  recordKeystroke: (key: string, code: string) => void
  backspace: () => void
  finishSession: () => void
  reset: () => void
  tick: () => void // 每秒更新 elapsedSeconds
}

// ─── 工具函数 ────────────────────────────────────────────────

/** 计算 WPM（标准公式） */
function calcWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const minutes = elapsedMs / 60000
  const words = correctChars / 5
  return Math.round(words / minutes)
}

/** 计算准确率 */
function calcAccuracy(totalKeystrokes: number, errorCount: number): number {
  if (totalKeystrokes === 0) return 100
  return Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)
}

// ─── FCS 指法合规分 ───────────────────────────────────────────

/**
 * 启发式指法合规判定
 *
 * 由于无法检测物理手指，使用以下启发式：
 * 1. 同一"预期手指"连续击打 2+ 个不同键 → 疑似"一指走天下"
 * 2. 击键间隔 < 200ms 的跨行切换 → 大概率用错手指
 * 3. 连续 3+ 次同一预期手指 → 越来越可疑
 *
 * 返回 { compliant: boolean, reason?: string }
 */
function assessFingerCompliance(
  keystrokes: Keystroke[],
  current: Keystroke
): { compliant: boolean; reason?: string } {
  if (keystrokes.length === 0) return { compliant: true }

  const prev = keystrokes[keystrokes.length - 1]
  const interval = current.timestamp - prev.timestamp

  // 如果击键间隔 > 800ms，用户有足够时间调整手指 → 视为合规
  if (interval > 800) return { compliant: true }

  // 同手指连续击打不同键
  if (
    current.expectedFinger === prev.expectedFinger &&
    current.keyCode !== prev.keyCode
  ) {
    // 检查前面是否还有同手指的击键
    let consecutiveSameFinger = 1
    for (let i = keystrokes.length - 1; i >= 0; i--) {
      if (keystrokes[i].expectedFinger === current.expectedFinger) {
        consecutiveSameFinger++
        if (consecutiveSameFinger >= 3) break
      } else {
        break
      }
    }

    if (consecutiveSameFinger >= 3) {
      return { compliant: false, reason: `${current.expectedFinger} 连续击键过多` }
    }
  }

  // 跨行快速切换 (< 200ms) 且不同手指 → 正常
  // 同手指跨行且间隔 < 200ms → 几乎不可能用正确手指
  if (interval < 200 && current.expectedFinger === prev.expectedFinger) {
    return { compliant: false, reason: `同指跨行切换过快 (${interval}ms)` }
  }

  return { compliant: true }
}

/** 计算 FCS */
function calcFcs(keystrokes: Keystroke[]): number {
  if (keystrokes.length === 0) return 100
  const compliant = keystrokes.filter(ks => ks.fingerCompliant).length
  return Math.round((compliant / keystrokes.length) * 100)
}

// ─── Store ───────────────────────────────────────────────────

export const useTypingStore = create<TypingState>((set, get) => ({
  targetText: '',
  typedChars: [],
  currentIndex: 0,
  sessionStatus: 'idle',
  startTime: null,
  endTime: null,
  keystrokes: [],
  errorCount: 0,
  totalKeystrokes: 0,
  wpm: 0,
  accuracy: 100,
  progress: 0,
  elapsedSeconds: 0,
  fcs: 100,

  /** 初始化新会话 */
  initSession: (text: string) => {
    const chars: TypedChar[] = Array.from(text).map((char) => ({
      char,
      typed: null,
      status: 'pending' as CharStatus,
    }))
    set({
      targetText: text,
      typedChars: chars,
      currentIndex: 0,
      sessionStatus: 'running',
      startTime: Date.now(),
      endTime: null,
      keystrokes: [],
      errorCount: 0,
      totalKeystrokes: 0,
      wpm: 0,
      accuracy: 100,
      progress: 0,
      elapsedSeconds: 0,
      fcs: 100,
    })
  },

  /** 记录一次击键 */
  recordKeystroke: (key: string, code: string) => {
    const state = get()
    if (state.sessionStatus !== 'running' && state.sessionStatus !== 'idle') return

    const { typedChars, currentIndex, keystrokes, startTime } = state

    // 如果还没开始计时，第一次击键触发开始
    const actualStartTime = startTime ?? Date.now()

    if (currentIndex >= typedChars.length) return // 已经打完

    const expectedChar = typedChars[currentIndex].char
    const isCorrect = key === expectedChar
    const timestamp = Date.now()
    const expectedFinger = getFingerForKey(code) as Finger ?? 'L-index'

    // 构建击键记录（先不判定合规）
    const tempKs: Keystroke = {
      char: key,
      expectedChar,
      correct: isCorrect,
      timestamp,
      keyCode: code,
      expectedFinger,
      inferredFinger: expectedFinger,
      fingerCompliant: true, // 占位
    }

    // FCS 判定
    const { compliant } = assessFingerCompliance(keystrokes, tempKs)
    const finalKs: Keystroke = { ...tempKs, fingerCompliant: compliant }

    // 更新字符状态
    const newChars = [...typedChars]
    newChars[currentIndex] = {
      ...newChars[currentIndex],
      typed: key,
      status: isCorrect ? 'correct' : 'incorrect',
    }

    const newKeystrokes = [...keystrokes, finalKs]
    const newErrorCount = state.errorCount + (isCorrect ? 0 : 1)
    const newTotal = state.totalKeystrokes + 1

    // 计算各项指标
    const elapsedMs = timestamp - actualStartTime
    const correctCount = newChars.filter(c => c.status === 'correct').length
    const wpm = calcWpm(correctCount, elapsedMs)
    const accuracy = calcAccuracy(newTotal, newErrorCount)
    const progress = Math.round((currentIndex + 1) / newChars.length * 100)
    const fcs = calcFcs(newKeystrokes)

    // 检测是否完成
    const nextIndex = currentIndex + 1
    const isFinished = nextIndex >= newChars.length

    set({
      typedChars: newChars,
      currentIndex: nextIndex,
      startTime: actualStartTime,
      keystrokes: newKeystrokes,
      errorCount: newErrorCount,
      totalKeystrokes: newTotal,
      wpm,
      accuracy,
      progress,
      fcs,
      elapsedSeconds: Math.round(elapsedMs / 1000),
      sessionStatus: isFinished ? 'finished' : 'running',
      endTime: isFinished ? timestamp : null,
    })
  },

  /** 回退（Backspace） */
  backspace: () => {
    const state = get()
    if (state.sessionStatus !== 'running') return
    if (state.currentIndex <= 0) return

    const newIndex = state.currentIndex - 1
    const newChars = [...state.typedChars]

    // 恢复为 pending 状态
    newChars[newIndex] = {
      ...newChars[newIndex],
      typed: null,
      status: 'pending',
    }

    set({
      typedChars: newChars,
      currentIndex: newIndex,
      progress: Math.round(newIndex / newChars.length * 100),
    })
  },

  /** 手动结束会话 */
  finishSession: () => {
    const state = get()
    if (state.sessionStatus !== 'running') return
    set({
      sessionStatus: 'finished',
      endTime: Date.now(),
    })
  },

  /** 重置所有状态 */
  reset: () => {
    set({
      targetText: '',
      typedChars: [],
      currentIndex: 0,
      sessionStatus: 'idle',
      startTime: null,
      endTime: null,
      keystrokes: [],
      errorCount: 0,
      totalKeystrokes: 0,
      wpm: 0,
      accuracy: 100,
      progress: 0,
      elapsedSeconds: 0,
      fcs: 100,
    })
  },

  /** 每秒更新计时器 */
  tick: () => {
    const state = get()
    if (state.sessionStatus !== 'running' || !state.startTime) return
    const elapsed = Math.round((Date.now() - state.startTime) / 1000)
    set({ elapsedSeconds: elapsed })
  },
}))
