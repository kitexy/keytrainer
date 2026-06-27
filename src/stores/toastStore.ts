/**
 * Toast 通知状态管理
 *
 * 简单队列，自动消失。
 */

import { create } from 'zustand'

export type ToastType = 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastState {
  toasts: Toast[]
  /** 添加一则 toast */
  show: (message: string, type?: ToastType, duration?: number) => void
  /** 手动移除 */
  dismiss: (id: string) => void
}

let _nextId = 0
function uid(): string {
  return `toast-${++_nextId}-${Date.now()}`
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show(message, type = 'info', duration = 3000) {
    const id = uid()
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      get().dismiss(id)
    }, duration)
  },

  dismiss(id) {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
  },
}))
