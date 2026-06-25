/**
 * 打字状态管理 — Zustand Store
 *
 * 管理一次打字练习的完整生命周期：
 * idle → running → paused → finished
 *
 * 包含 FCS (Finger Compliance Score) 指法合规分启发式计算。
 * 完成时自动通过 db API 持久化会话数据。
 */

import { create } from 'zustand'
import type { Keystroke, Finger } from '../types'
import { getFingerForKey } from '../utils/fingerMapping'
import { db } from '../utils/db'

// ─── 字符状态 ────────────────────────────────────────────────

export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'corrected'

export interface TypedChar {
  char: string
  typed: string | null
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
  mode: string // 练习模式标识

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
  progress: number
  elapsedSeconds: number
  fcs: number

  // ─── 动作 ───
  initSession: (text: string, mode?: string) => void
  recordKeystroke: (key: string, code: string) => void
  backspace: () => void
  finishSession: () => void
  reset: () => void
  tick: () => void
}

// ─── 工具函数 ────────────────────────────────────────────────

function calcWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const minutes = elapsedMs / 60000
  const words = correctChars / 5
  return Math.round(words / minutes)
}

function calcAccuracy(totalKeystrokes: number, errorCount: number): number {
  if (totalKeystrokes === 0) return 100
  return Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)
}

function assessFingerCompliance(
  keystrokes: Keystroke[],
  current: Keystroke
): { compliant: boolean; reason?: string } {
  if (keystrokes.length === 0) return { compliant: true }

  const prev = keystrokes[keystrokes.length - 1]
  const interval = current.timestamp - prev.timestamp

  if (interval > 800) return { compliant: true }

  if (
    current.expectedFinger === prev.expectedFinger &&
    current.keyCode !== prev.keyCode
  ) {
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

  if (interval < 200 && current.expectedFinger === prev.expectedFinger) {
    return { compliant: false, reason: `同指跨行切换过快 (${interval}ms)` }
  }

  return { compliant: true }
}

function calcFcs(keystrokes: Keystroke[]): number {
  if (keystrokes.length === 0) return 100
  const compliant = keystrokes.filter(ks => ks.fingerCompliant).length
  return Math.round((compliant / keystrokes.length) * 100)
}

// ─── 持久化 ──────────────────────────────────────────────────

/** 将击键记录转为 DB 友好格式 */
function keystrokesToDb(ksList: Keystroke[]) {
  let prevTs = ksList[0]?.timestamp ?? 0
  return ksList.map((ks, i) => ({
    char: ks.char,
    expected: ks.expectedChar,
    correct: ks.correct,
    keyCode: ks.keyCode,
    finger: ks.expectedFinger,
    compliant: ks.fingerCompliant,
    position: i,
    latencyMs: i === 0 ? 0 : ks.timestamp - prevTs,
  }))
}

// ─── Store ───────────────────────────────────────────────────

export const useTypingStore = create<TypingState>((set, get) => ({
  targetText: '',
  typedChars: [],
  currentIndex: 0,
  sessionStatus: 'idle',
  mode: 'free',
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
  initSession: (text: string, mode = 'free') => {
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
      mode,
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

    const { typedChars, currentIndex, keystrokes, startTime, mode } = state
    const actualStartTime = startTime ?? Date.now()

    if (currentIndex >= typedChars.length) return

    const expectedChar = typedChars[currentIndex].char
    const isCorrect = key === expectedChar
    const timestamp = Date.now()
    const expectedFinger = getFingerForKey(expectedChar) as Finger ?? 'L-index'

    const tempKs: Keystroke = {
      char: key,
      expectedChar,
      correct: isCorrect,
      timestamp,
      keyCode: code,
      expectedFinger,
      inferredFinger: expectedFinger,
      fingerCompliant: true,
    }

    const { compliant } = assessFingerCompliance(keystrokes, tempKs)
    const finalKs: Keystroke = { ...tempKs, fingerCompliant: compliant }

    const newChars = [...typedChars]
    newChars[currentIndex] = {
      ...newChars[currentIndex],
      typed: key,
      status: isCorrect ? 'correct' : 'incorrect',
    }

    const newKeystrokes = [...keystrokes, finalKs]
    const newErrorCount = state.errorCount + (isCorrect ? 0 : 1)
    const newTotal = state.totalKeystrokes + 1

    const elapsedMs = timestamp - actualStartTime
    const correctCount = newChars.filter(c => c.status === 'correct').length
    const wpm = calcWpm(correctCount, elapsedMs)
    const accuracy = calcAccuracy(newTotal, newErrorCount)
    const progress = Math.round((currentIndex + 1) / newChars.length * 100)
    const fcs = calcFcs(newKeystrokes)

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

    // 自动保存
    if (isFinished) {
      const finalState = get()
      const duration = Math.round((finalState.endTime! - (finalState.startTime ?? actualStartTime)) / 1000)
      db.saveSession({
        mode,
        wpm: finalState.wpm,
        accuracy: finalState.accuracy,
        fcs: finalState.fcs,
        duration,
        totalChars: finalState.typedChars.length,
        errorCount: finalState.errorCount,
        targetText: finalState.targetText,
        keystrokes: keystrokesToDb(newKeystrokes),
      }).catch(() => {
        // 静默失败——持久化不影响核心体验
      })
    }
  },

  /** 回退（Backspace） */
  backspace: () => {
    const state = get()
    if (state.sessionStatus !== 'running') return
    if (state.currentIndex <= 0) return

    const newIndex = state.currentIndex - 1
    const newChars = [...state.typedChars]
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

    const now = Date.now()
    const duration = Math.round((now - (state.startTime ?? now)) / 1000)

    set({
      sessionStatus: 'finished',
      endTime: now,
    })

    // 自动保存
    db.saveSession({
      mode: state.mode,
      wpm: state.wpm,
      accuracy: state.accuracy,
      fcs: state.fcs,
      duration,
      totalChars: state.typedChars.length,
      errorCount: state.errorCount,
      targetText: state.targetText,
      keystrokes: keystrokesToDb(state.keystrokes),
    }).catch(() => {})
  },

  /** 重置所有状态 */
  reset: () => {
    set({
      targetText: '',
      typedChars: [],
      currentIndex: 0,
      sessionStatus: 'idle',
      mode: 'free',
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
