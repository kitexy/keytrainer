// ——— 全局类型定义 ———

/** 手指类型（8指 + 拇指） */
export type Finger =
  | 'L-pinky' | 'L-ring' | 'L-middle' | 'L-index'
  | 'R-index'  | 'R-middle' | 'R-ring'  | 'R-pinky'
  | 'thumb'

/** 练习模式 */
export type PracticeMode = 'finger' | 'free' | 'words' | 'article' | 'code' | 'speed'

/** 指位训练阶段 */
export type FingerLessonStage =
  | 'home-row' | 'single-finger' | 'top-row' | 'bottom-row' | 'mixed'

/** 单个击键记录 */
export interface Keystroke {
  char: string
  expectedChar: string
  correct: boolean
  timestamp: number
  keyCode: string
  expectedFinger: Finger
  inferredFinger: Finger
  fingerCompliant: boolean
}

/** 一次练习会话 */
export interface PracticeSession {
  id: string
  mode: PracticeMode
  startedAt: number
  endedAt: number | null
  text: string
  wpm: number
  accuracy: number
  totalKeys: number
  errorKeys: number
  keystrokes: Keystroke[]
  fingerComplianceScore: number // FCS
}

/** 键盘上的单个键 */
export interface KeyDef {
  code: string
  label: string
  finger: Finger
  row: 'number' | 'top' | 'home' | 'bottom' | 'modifier'
  column: number
}

/** 统计数据概览 */
export interface StatsOverview {
  totalSessions: number
  avgWpm: number
  avgAccuracy: number
  streakDays: number
  totalPracticeTime: number // 秒
}
