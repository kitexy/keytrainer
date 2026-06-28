import { app, BrowserWindow, shell, ipcMain } from 'electron'
import * as path from 'path'
import {
  saveSession,
  getHistory,
  getStatsSummary,
  getWeakKeys,
  getWpmTrend,
  getLessonRecords,
  upsertLessonRecord,
  closeDb,
} from './ipc/storage'
import { getSetting, setSetting, getAllSettings } from './ipc/settings'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const isDev = !app.isPackaged && process.env.VITE_DEV_SERVER_URL

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ─── App 生命周期 ─────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()
  registerIpcHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  closeDb()
})

// ─── IPC 处理器注册 ───────────────────────────────────────────

function registerIpcHandlers() {
  // ——— 会话 ———

  ipcMain.handle('db:save-session', async (_event, params) => {
    try {
      const id = saveSession(params)
      return { success: true, id }
    } catch (err: any) {
      console.error('db:save-session error:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('db:get-history', async (_event, params) => {
    try {
      return { success: true, ...getHistory(params) }
    } catch (err: any) {
      console.error('db:get-history error:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('db:get-stats-summary', async () => {
    try {
      return { success: true, ...getStatsSummary() }
    } catch (err: any) {
      console.error('db:get-stats-summary error:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('db:get-weak-keys', async (_event, limit?: number) => {
    try {
      return { success: true, keys: getWeakKeys(limit) }
    } catch (err: any) {
      console.error('db:get-weak-keys error:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('db:get-wpm-trend', async (_event, days?: number) => {
    try {
      return { success: true, trend: getWpmTrend(days) }
    } catch (err: any) {
      console.error('db:get-wpm-trend error:', err)
      return { success: false, error: err.message }
    }
  })

  // ——— 课程记录 ———

  ipcMain.handle('db:get-lesson-records', async () => {
    try {
      return { success: true, records: getLessonRecords() }
    } catch (err: any) {
      console.error('db:get-lesson-records error:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('db:upsert-lesson-record', async (_event, params) => {
    try {
      upsertLessonRecord(params)
      return { success: true }
    } catch (err: any) {
      console.error('db:upsert-lesson-record error:', err)
      return { success: false, error: err.message }
    }
  })

  // ——— 设置 ———

  ipcMain.handle('settings:get', async (_event, key: string) => {
    try {
      return { success: true, value: getSetting(key as any) }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('settings:set', async (_event, key: string, value: any) => {
    try {
      setSetting(key as any, value)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('settings:get-all', async () => {
    try {
      return { success: true, ...getAllSettings() }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 同步读取主题（避免启动闪烁）
  ipcMain.on('settings:get-theme-sync', (event) => {
    const theme = getSetting('theme') || 'dark'
    event.returnValue = theme
  })
}
