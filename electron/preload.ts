import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的安全 API
// 所有 IPC 调用都经过这里，渲染进程无法直接访问 electron 模块
contextBridge.exposeInMainWorld('api', {
  // 数据库操作
  db: {
    query: (sql: string, params: any[] = []) =>
      ipcRenderer.invoke('db:query', sql, params),
  },
  // 设置读写
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) =>
      ipcRenderer.invoke('settings:set', key, value),
  },
  // 平台信息
  platform: process.platform,
})
