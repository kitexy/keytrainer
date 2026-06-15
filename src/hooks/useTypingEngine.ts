/**
 * 核心打字引擎 Hook
 *
 * 负责：
 * 1. 键盘事件监听
 * 2. 击键 → typingStore 状态更新
 * 3. 计时器管理
 * 4. 输入过滤（忽略修饰键）
 */

import { useEffect, useRef, useCallback } from 'react'
import { useTypingStore } from '../stores/typingStore'
import { playKeyClick, playKeyError, isSoundEnabled } from '../utils/sound'

const IGNORED_KEYS = new Set([
  'Shift', 'Control', 'Alt', 'Meta',
  'CapsLock', 'Tab', 'Escape',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End', 'PageUp', 'PageDown',
  'Insert', 'Delete',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
  'F9', 'F10', 'F11', 'F12',
  'ContextMenu', 'NumLock', 'ScrollLock', 'Pause',
  'OS', 'Clear',
])

export default function useTypingEngine() {
  const {
    sessionStatus,
    initSession,
    recordKeystroke,
    backspace,
    finishSession,
    reset: resetStore,
    tick,
  } = useTypingStore()

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 启动计时器
  const startTimer = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      tick()
    }, 1000)
  }, [tick])

  // 停止计时器
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 开始新练习
  const start = useCallback((text: string) => {
    resetStore()
    initSession(text)
    startTimer()
  }, [initSession, resetStore, startTimer])

  // 重置
  const reset = useCallback(() => {
    stopTimer()
    resetStore()
  }, [stopTimer, resetStore])

  // 键盘事件处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (sessionStatus === 'finished') return

    // 忽略修饰键和功能键
    if (IGNORED_KEYS.has(e.key)) {
      // 但仍需阻止默认行为避免滚动等
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault()
      }
      return
    }

    e.preventDefault()

    // Backspace 回退
    if (e.key === 'Backspace') {
      backspace()
      return
    }

    // Enter：手动结束
    if (e.key === 'Enter') {
      finishSession()
      return
    }

    // 只处理单个可打印字符
    if (e.key.length === 1) {
      // 音效反馈（调用前判断）
      if (isSoundEnabled()) {
        const state = useTypingStore.getState()
        const expected = state.typedChars[state.currentIndex]?.char
        if (e.key === expected) {
          playKeyClick()
        } else {
          playKeyError()
        }
      }
      recordKeystroke(e.key, e.code)
    }
  }, [sessionStatus, recordKeystroke, backspace, finishSession])

  // 挂载/卸载键盘监听
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKeyDown])

  // 练习结束时停止计时器
  useEffect(() => {
    if (sessionStatus === 'finished' || sessionStatus === 'idle') {
      stopTimer()
    }
  }, [sessionStatus, stopTimer])

  return {
    start,
    reset,
    sessionStatus,
  }
}
