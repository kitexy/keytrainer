/**
 * Electron API 类型定义
 *
 * 定义 IPC 通信的数据结构。window.api 的全局声明见 vite-env.d.ts
 */

export interface DbApi {
  saveSession: (params: SessionParams) => Promise<{ success: boolean; id?: number; error?: string }>
  getHistory: (params?: { limit?: number; offset?: number; mode?: string }) => Promise<{
    success: boolean
    sessions?: Array<{
      id: number
      mode: string
      wpm: number
      accuracy: number
      fcs: number
      duration: number
      total_chars: number
      error_count: number
      target_text: string
      created_at: string
    }>
    total?: number
    error?: string
  }>
  getStatsSummary: () => Promise<{
    success: boolean
    totalSessions?: number
    avgWpm?: number
    avgAccuracy?: number
    avgFcs?: number
    totalPracticeTime?: number
    streakDays?: number
    lastPracticeDate?: string | null
    error?: string
  }>
  getWeakKeys: (limit?: number) => Promise<{
    success: boolean
    keys?: Array<{
      keyCode: string
      expected: string
      finger: string
      total: number
      errors: number
      errorRate: number
    }>
    error?: string
  }>
  getWpmTrend: (days?: number) => Promise<{
    success: boolean
    trend?: Array<{ date: string; avgWpm: number; sessions: number }>
    error?: string
  }>
  getLessonRecords: () => Promise<{
    success: boolean
    records?: Record<number, {
      level: number
      best_wpm: number
      best_accuracy: number
      best_fcs: number
      attempts: number
      completed_at: string | null
      updated_at: string
    }>
    error?: string
  }>
  upsertLessonRecord: (params: { level: number; bestWpm: number; bestAccuracy: number; bestFcs: number }) => Promise<{
    success: boolean
    error?: string
  }>
}

export interface SettingsApi {
  get: (key: string) => Promise<{ success: boolean; value?: any; error?: string }>
  set: (key: string, value: any) => Promise<{ success: boolean; error?: string }>
  getAll: () => Promise<any>
}

export interface SessionParams {
  mode: string
  wpm: number
  accuracy: number
  fcs: number
  duration: number
  totalChars: number
  errorCount: number
  targetText: string
  keystrokes?: Array<{
    char: string
    expected: string
    correct: boolean
    keyCode: string
    finger: string
    compliant: boolean
    position: number
    latencyMs: number
  }>
}

export {}
