/**
 * 渲染进程数据访问层
 *
 * 在 Electron 环境下通过 window.api 调用主进程的 SQLite，
 * 在浏览器预览模式下自动 fallback 到 localStorage。
 */

// ─── 检测环境 ────────────────────────────────────────────────

/** 是否在 Electron 桌面环境中 */
const isElectron = typeof window !== 'undefined' && !!window.api?.db

// ─── localStorage 回退层 ─────────────────────────────────────

const LS_SESSIONS = 'keytrainer-sessions'
const LS_LESSONS = 'keytrainer-lessons'

interface LocalSession {
  id: string
  mode: string
  wpm: number
  accuracy: number
  fcs: number
  duration: number
  totalChars: number
  errorCount: number
  targetText: string
  created_at: string
}

function loadLocalSessions(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(LS_SESSIONS) || '[]')
  } catch {
    return []
  }
}

function saveLocalSessions(sessions: LocalSession[]): void {
  try {
    // 保留最近 200 条
    const trimmed = sessions.slice(-200)
    localStorage.setItem(LS_SESSIONS, JSON.stringify(trimmed))
  } catch {
    // 存储空间不足时清空旧数据
    localStorage.removeItem(LS_SESSIONS)
  }
}

// ─── 公开 API（与 Electron DbApi 同形） ───────────────────────

export const db = {
  async saveSession(params: {
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
  }): Promise<{ success: boolean; id?: number; error?: string }> {
    if (isElectron) {
      return window.api!.db.saveSession(params)
    }

    // localStorage 回退
    const sessions = loadLocalSessions()
    const newSession: LocalSession = {
      id: Date.now().toString(),
      mode: params.mode,
      wpm: params.wpm,
      accuracy: params.accuracy,
      fcs: params.fcs,
      duration: params.duration,
      totalChars: params.totalChars,
      errorCount: params.errorCount,
      targetText: params.targetText,
      created_at: new Date().toISOString(),
    }
    sessions.push(newSession)
    saveLocalSessions(sessions)
    return { success: true, id: parseInt(newSession.id) }
  },

  async getHistory(params?: { limit?: number; offset?: number; mode?: string }): Promise<{
    success: boolean
    sessions?: Array<any>
    total?: number
    error?: string
  }> {
    if (isElectron) {
      return window.api!.db.getHistory(params)
    }

    let sessions = loadLocalSessions()
    if (params?.mode) {
      sessions = sessions.filter(s => s.mode === params!.mode)
    }
    sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const total = sessions.length
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? 20
    const page = sessions.slice(offset, offset + limit)

    // 映射到 DB 格式
    return {
      success: true,
      sessions: page.map(s => ({
        id: parseInt(s.id),
        mode: s.mode,
        wpm: s.wpm,
        accuracy: s.accuracy,
        fcs: s.fcs,
        duration: s.duration,
        total_chars: s.totalChars,
        error_count: s.errorCount,
        target_text: s.targetText,
        created_at: s.created_at,
      })),
      total,
    }
  },

  async getStatsSummary(): Promise<{
    success: boolean
    totalSessions?: number
    avgWpm?: number
    avgAccuracy?: number
    avgFcs?: number
    totalPracticeTime?: number
    streakDays?: number
    lastPracticeDate?: string | null
    error?: string
  }> {
    if (isElectron) {
      return window.api!.db.getStatsSummary()
    }

    const sessions = loadLocalSessions()
    if (sessions.length === 0) {
      return {
        success: true,
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        avgFcs: 0,
        totalPracticeTime: 0,
        streakDays: 0,
        lastPracticeDate: null,
      }
    }

    const avgWpm = Math.round(sessions.reduce((s, e) => s + e.wpm, 0) / sessions.length)
    const avgAccuracy = Math.round(sessions.reduce((s, e) => s + e.accuracy, 0) / sessions.length)
    const avgFcs = Math.round(sessions.reduce((s, e) => s + e.fcs, 0) / sessions.length)
    const totalPracticeTime = sessions.reduce((s, e) => s + e.duration, 0)

    // 简易连续天数
    const dates = [...new Set(sessions.map(s => s.created_at.split('T')[0]))].sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let check = today
    for (const d of dates) {
      if (d === check) { streak++; check = shiftDate(check, -1) }
      else if (d < check) break
    }

    return {
      success: true,
      totalSessions: sessions.length,
      avgWpm,
      avgAccuracy,
      avgFcs,
      totalPracticeTime,
      streakDays: streak,
      lastPracticeDate: sessions[sessions.length - 1].created_at,
    }
  },

  async getWeakKeys(limit?: number): Promise<{
    success: boolean
    keys?: Array<{ keyCode: string; expected: string; finger: string; total: number; errors: number; errorRate: number }>
    error?: string
  }> {
    if (isElectron) {
      return window.api!.db.getWeakKeys(limit)
    }
    // localStorage 回退不保存 keystrokes 详情
    return { success: true, keys: [] }
  },

  async getWpmTrend(days?: number): Promise<{
    success: boolean
    trend?: Array<{ date: string; avgWpm: number; sessions: number }>
  }> {
    if (isElectron) {
      return window.api!.db.getWpmTrend(days)
    }

    const sessions = loadLocalSessions()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - (days ?? 30))
    const recent = sessions.filter(s => new Date(s.created_at) >= cutoff)

    const byDate: Record<string, { sum: number; count: number }> = {}
    for (const s of recent) {
      const d = s.created_at.split('T')[0]
      if (!byDate[d]) byDate[d] = { sum: 0, count: 0 }
      byDate[d].sum += s.wpm
      byDate[d].count++
    }

    return {
      success: true,
      trend: Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { sum, count }]) => ({
          date,
          avgWpm: Math.round(sum / count),
          sessions: count,
        })),
    }
  },

  async getLessonRecords(): Promise<{
    success: boolean
    records?: Record<number, any>
    error?: string
  }> {
    if (isElectron) {
      return window.api!.db.getLessonRecords()
    }

    try {
      const raw = localStorage.getItem(LS_LESSONS)
      const parsed = raw ? JSON.parse(raw) : {}
      // 转换为 DB 格式
      const records: Record<number, any> = {}
      for (const [level, record] of Object.entries(parsed) as [string, any][]) {
        records[Number(level)] = {
          level: Number(level),
          best_wpm: record.bestWpm || 0,
          best_accuracy: record.bestAccuracy || 0,
          best_fcs: record.bestFcs || 0,
          attempts: record.attempts || 0,
          completed_at: record.completedAt || null,
          updated_at: record.completedAt || new Date().toISOString(),
        }
      }
      return { success: true, records }
    } catch {
      return { success: true, records: {} }
    }
  },

  async upsertLessonRecord(params: { level: number; bestWpm: number; bestAccuracy: number; bestFcs: number }): Promise<{
    success: boolean
    error?: string
  }> {
    if (isElectron) {
      return window.api!.db.upsertLessonRecord(params)
    }

    try {
      const raw = localStorage.getItem(LS_LESSONS)
      const records = raw ? JSON.parse(raw) : {}
      const existing = records[params.level]
      records[params.level] = {
        bestWpm: Math.max(existing?.bestWpm ?? 0, params.bestWpm),
        bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, params.bestAccuracy),
        bestFcs: Math.max(existing?.bestFcs ?? 0, params.bestFcs),
        attempts: (existing?.attempts ?? 0) + 1,
        completedAt: new Date().toISOString(),
      }
      localStorage.setItem(LS_LESSONS, JSON.stringify(records))
      return { success: true }
    } catch {
      return { success: false, error: 'localStorage write failed' }
    }
  },
}

// ─── 设置操作 ────────────────────────────────────────────────

export const settings = {
  async get(key: string): Promise<any> {
    if (isElectron) {
      const result = await window.api!.settings.get(key)
      return result.success ? result.value : null
    }
    try {
      const raw = localStorage.getItem('keytrainer-settings')
      const parsed = raw ? JSON.parse(raw) : {}
      return parsed[key] ?? null
    } catch {
      return null
    }
  },

  async set(key: string, value: any): Promise<boolean> {
    if (isElectron) {
      const result = await window.api!.settings.set(key, value)
      return result.success
    }
    try {
      const raw = localStorage.getItem('keytrainer-settings')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed[key] = value
      localStorage.setItem('keytrainer-settings', JSON.stringify(parsed))
      return true
    } catch {
      return false
    }
  },

  async getAll(): Promise<Record<string, any>> {
    if (isElectron) {
      return window.api!.settings.getAll()
    }
    try {
      return JSON.parse(localStorage.getItem('keytrainer-settings') || '{}')
    } catch {
      return {}
    }
  },
}

// ─── 工具 ────────────────────────────────────────────────────

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/** 判断是否在 Electron 环境 */
export const isElectronEnv = isElectron
