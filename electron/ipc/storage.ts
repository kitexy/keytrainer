/**
 * SQLite 持久化层 — 通过 better-sqlite3 管理练习数据
 *
 * 表结构：
 *   sessions    — 每次练习会话的摘要
 *   keystrokes  — 每次击键的详细记录（关联 session）
 *   lesson_records — 课程完成记录
 */

import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

// ─── 类型 ────────────────────────────────────────────────────

export interface SessionRow {
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
}

export interface KeystrokeRow {
  id: number
  session_id: number
  char: string
  expected: string
  correct: number
  key_code: string
  finger: string
  compliant: number
  position: number
  latency_ms: number
  created_at: string
}

export interface LessonRecordRow {
  level: number
  best_wpm: number
  best_accuracy: number
  best_fcs: number
  attempts: number
  completed_at: string | null
  updated_at: string
}

export interface StatsSummary {
  totalSessions: number
  avgWpm: number
  avgAccuracy: number
  avgFcs: number
  totalPracticeTime: number
  streakDays: number
  lastPracticeDate: string | null
}

export interface WeakKeyStat {
  keyCode: string
  expected: string
  finger: string
  total: number
  errors: number
  errorRate: number
}

// ─── 数据库单例 ──────────────────────────────────────────────

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (db) return db

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'keytrainer.db')

  db = new Database(dbPath)

  // WAL 模式：更好的并发性能
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // 建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      mode          TEXT NOT NULL DEFAULT 'free',
      wpm           REAL NOT NULL DEFAULT 0,
      accuracy      REAL NOT NULL DEFAULT 100,
      fcs           REAL NOT NULL DEFAULT 100,
      duration      INTEGER NOT NULL DEFAULT 0,
      total_chars   INTEGER NOT NULL DEFAULT 0,
      error_count   INTEGER NOT NULL DEFAULT 0,
      target_text   TEXT NOT NULL DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS keystrokes (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id    INTEGER NOT NULL,
      char          TEXT NOT NULL,
      expected      TEXT NOT NULL,
      correct       INTEGER NOT NULL DEFAULT 1,
      key_code      TEXT NOT NULL DEFAULT '',
      finger        TEXT NOT NULL DEFAULT '',
      compliant     INTEGER NOT NULL DEFAULT 1,
      position      INTEGER NOT NULL DEFAULT 0,
      latency_ms    INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_records (
      level         INTEGER PRIMARY KEY,
      best_wpm      REAL NOT NULL DEFAULT 0,
      best_accuracy REAL NOT NULL DEFAULT 0,
      best_fcs      REAL NOT NULL DEFAULT 0,
      attempts      INTEGER NOT NULL DEFAULT 0,
      completed_at  TEXT,
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_mode ON sessions(mode);
    CREATE INDEX IF NOT EXISTS idx_keystrokes_session ON keystrokes(session_id);
    CREATE INDEX IF NOT EXISTS idx_keystrokes_key_code ON keystrokes(key_code);
  `)

  return db
}

// ─── 会话操作 ────────────────────────────────────────────────

/** 保存一次练习会话 */
export function saveSession(params: {
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
}): number {
  const d = getDb()

  const insertSession = d.prepare(`
    INSERT INTO sessions (mode, wpm, accuracy, fcs, duration, total_chars, error_count, target_text)
    VALUES (@mode, @wpm, @accuracy, @fcs, @duration, @totalChars, @errorCount, @targetText)
  `)

  const result = insertSession.run({
    mode: params.mode,
    wpm: params.wpm,
    accuracy: params.accuracy,
    fcs: params.fcs,
    duration: params.duration,
    totalChars: params.totalChars,
    errorCount: params.errorCount,
    targetText: params.targetText,
  })

  const sessionId = result.lastInsertRowid as number

  // 保存击键记录（如果有）
  if (params.keystrokes && params.keystrokes.length > 0) {
    const insertKs = d.prepare(`
      INSERT INTO keystrokes (session_id, char, expected, correct, key_code, finger, compliant, position, latency_ms)
      VALUES (@session_id, @char, @expected, @correct, @key_code, @finger, @compliant, @position, @latency_ms)
    `)

    const insertMany = d.transaction((ksArray: typeof params.keystrokes) => {
      for (const ks of ksArray!) {
        insertKs.run({
          session_id: sessionId,
          char: ks.char,
          expected: ks.expected,
          correct: ks.correct ? 1 : 0,
          key_code: ks.keyCode,
          finger: ks.finger,
          compliant: ks.compliant ? 1 : 0,
          position: ks.position,
          latency_ms: ks.latencyMs,
        })
      }
    })

    insertMany(params.keystrokes)
  }

  return sessionId
}

/** 查询历史记录（分页） */
export function getHistory(params: {
  limit?: number
  offset?: number
  mode?: string
}): { sessions: SessionRow[]; total: number } {
  const d = getDb()
  const limit = params.limit ?? 20
  const offset = params.offset ?? 0

  let whereClause = ''
  const bindParams: any = {}

  if (params.mode) {
    whereClause = 'WHERE mode = @mode'
    bindParams.mode = params.mode
  }

  const countRow = d.prepare(`SELECT COUNT(*) as total FROM sessions ${whereClause}`).get(bindParams) as { total: number }
  const sessions = d.prepare(
    `SELECT * FROM sessions ${whereClause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`
  ).all({ ...bindParams, limit, offset }) as SessionRow[]

  return { sessions, total: countRow.total }
}

/** 获取统计概览 */
export function getStatsSummary(): StatsSummary {
  const d = getDb()

  const row = d.prepare(`
    SELECT
      COUNT(*) as totalSessions,
      ROUND(AVG(wpm), 1) as avgWpm,
      ROUND(AVG(accuracy), 1) as avgAccuracy,
      ROUND(AVG(fcs), 1) as avgFcs,
      COALESCE(SUM(duration), 0) as totalPracticeTime,
      MAX(created_at) as lastPracticeDate
    FROM sessions
  `).get() as any

  // 计算连续天数
  let streakDays = 0
  if (row.lastPracticeDate) {
    const dates = d.prepare(`
      SELECT DISTINCT date(created_at) as practice_date
      FROM sessions
      ORDER BY practice_date DESC
      LIMIT 60
    `).all() as { practice_date: string }[]

    const today = new Date().toISOString().split('T')[0]
    let checkDate = new Date(today)

    for (const { practice_date } of dates) {
      const expected = checkDate.toISOString().split('T')[0]
      if (practice_date === expected) {
        streakDays++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (practice_date < expected) {
        break
      }
    }
  }

  return {
    totalSessions: row.totalSessions || 0,
    avgWpm: row.avgWpm || 0,
    avgAccuracy: row.avgAccuracy || 0,
    avgFcs: row.avgFcs || 0,
    totalPracticeTime: row.totalPracticeTime || 0,
    streakDays,
    lastPracticeDate: row.lastPracticeDate || null,
  }
}

/** 获取薄弱键位统计 */
export function getWeakKeys(limit = 15): WeakKeyStat[] {
  const d = getDb()

  const rows = d.prepare(`
    SELECT
      key_code as keyCode,
      expected,
      finger,
      COUNT(*) as total,
      SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END) as errors,
      ROUND(CAST(SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as errorRate
    FROM keystrokes
    WHERE key_code != '' AND key_code NOT LIKE 'Shift%' AND key_code NOT LIKE 'Control%'
      AND key_code NOT LIKE 'Alt%' AND key_code NOT LIKE 'Meta%'
      AND key_code != 'Space' AND key_code != 'Tab' AND key_code != 'Enter' AND key_code != 'Backspace'
    GROUP BY key_code
    HAVING total >= 5
    ORDER BY errorRate DESC
    LIMIT @limit
  `).all({ limit }) as WeakKeyStat[]

  return rows
}

/** 获取 WPM 趋势数据（按天聚合） */
export function getWpmTrend(days = 30): { date: string; avgWpm: number; sessions: number }[] {
  const d = getDb()

  const rows = d.prepare(`
    SELECT
      date(created_at) as date,
      ROUND(AVG(wpm), 1) as avgWpm,
      COUNT(*) as sessions
    FROM sessions
    WHERE created_at >= datetime('now', @days || ' days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all({ days: `-${days}` }) as { date: string; avgWpm: number; sessions: number }[]

  return rows
}

// ─── 课程记录操作 ─────────────────────────────────────────────

/** 获取所有课程记录 */
export function getLessonRecords(): Record<number, LessonRecordRow> {
  const d = getDb()
  const rows = d.prepare('SELECT * FROM lesson_records').all() as LessonRecordRow[]
  const result: Record<number, LessonRecordRow> = {}
  for (const row of rows) {
    result[row.level] = row
  }
  return result
}

/** 更新课程记录（合并最佳成绩） */
export function upsertLessonRecord(params: {
  level: number
  bestWpm: number
  bestAccuracy: number
  bestFcs: number
}): void {
  const d = getDb()

  const existing = d.prepare('SELECT * FROM lesson_records WHERE level = @level').get({
    level: params.level,
  }) as LessonRecordRow | undefined

  if (existing) {
    d.prepare(`
      UPDATE lesson_records
      SET best_wpm = MAX(best_wpm, @bestWpm),
          best_accuracy = MAX(best_accuracy, @bestAccuracy),
          best_fcs = MAX(best_fcs, @bestFcs),
          attempts = attempts + 1,
          completed_at = datetime('now'),
          updated_at = datetime('now')
      WHERE level = @level
    `).run({
      level: params.level,
      bestWpm: params.bestWpm,
      bestAccuracy: params.bestAccuracy,
      bestFcs: params.bestFcs,
    })
  } else {
    d.prepare(`
      INSERT INTO lesson_records (level, best_wpm, best_accuracy, best_fcs, attempts, completed_at)
      VALUES (@level, @bestWpm, @bestAccuracy, @bestFcs, 1, datetime('now'))
    `).run({
      level: params.level,
      bestWpm: params.bestWpm,
      bestAccuracy: params.bestAccuracy,
      bestFcs: params.bestFcs,
    })
  }
}

/** 关闭数据库（应用退出时调用） */
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
