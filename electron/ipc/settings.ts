/**
 * 应用设置持久化 — 基于 JSON 文件
 *
 * 存储用户偏好：音效、主题、字体大小、手指提示等。
 * 使用 Node.js fs 模块直接读写 JSON，无额外依赖。
 */

import fs from 'fs'
import path from 'path'
import { app } from 'electron'

// ─── 类型 ────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  keyboardLayout: 'qwerty' | 'dvorak' | 'colemak'
  soundEnabled: boolean
  showFingerHints: boolean
  autoSave: boolean
}

const defaults: AppSettings = {
  theme: 'dark',
  fontSize: 'medium',
  keyboardLayout: 'qwerty',
  soundEnabled: true,
  showFingerHints: true,
  autoSave: true,
}

// ─── 文件路径 ────────────────────────────────────────────────

function getSettingsPath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'keytrainer-settings.json')
}

function loadSettings(): AppSettings {
  try {
    const filePath = getSettingsPath()
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      return { ...defaults, ...parsed }
    }
  } catch {
    // 读取失败时使用默认值
  }
  return { ...defaults }
}

function saveSettings(settings: AppSettings): void {
  try {
    const filePath = getSettingsPath()
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8')
  } catch {
    // 静默失败
  }
}

// ─── 内存缓存 ────────────────────────────────────────────────

let cached: AppSettings | null = null

function getCached(): AppSettings {
  if (!cached) {
    cached = loadSettings()
  }
  return cached
}

// ─── 公开 API ────────────────────────────────────────────────

export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return getCached()[key]
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  const settings = getCached()
  settings[key] = value
  cached = settings
  saveSettings(settings)
}

export function getAllSettings(): AppSettings {
  return { ...getCached() }
}
