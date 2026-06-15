import { app, BrowserWindow, shell, ipcMain } from 'electron'
import * as path from 'path'

// 禁用 Electron 默认菜单（我们用自定义 Sidebar）
let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',          // macOS 隐藏标题栏，显示红黄绿按钮
    vibrancy: 'under-window',        // macOS 毛玻璃效果
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 编译后的 JS
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // 开发模式：加载 Vite  Dev Server
  // 生产模式：加载本地文件
  const isDev = !app.isPackaged && process.env.VITE_DEV_SERVER_URL

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 外部链接用系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App 生命周期
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // macOS: 关闭所有窗口不退出应用
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ——— IPC 占位（Phase 3 实现） ———
ipcMain.handle('db:query', async (_event, sql: string, params: any[]) => {
  // TODO: better-sqlite3 查询
  return []
})

ipcMain.handle('settings:get', async (_event, key: string) => {
  // TODO: electron-store 读取
  return null
})

ipcMain.handle('settings:set', async (_event, key: string, value: any) => {
  // TODO: electron-store 写入
  return true
})
