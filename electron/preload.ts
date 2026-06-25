/**
 * Preload 脚本 — contextBridge 安全暴露 IPC API
 *
 * 所有渲染进程对主进程的调用都经过这里。
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // ─── 数据库操作 ───

  db: {
    /** 保存练习会话 */
    saveSession: (params: any) =>
      ipcRenderer.invoke('db:save-session', params),

    /** 查询历史记录 */
    getHistory: (params?: { limit?: number; offset?: number; mode?: string }) =>
      ipcRenderer.invoke('db:get-history', params ?? {}),

    /** 获取统计概览 */
    getStatsSummary: () =>
      ipcRenderer.invoke('db:get-stats-summary'),

    /** 获取薄弱键位 */
    getWeakKeys: (limit?: number) =>
      ipcRenderer.invoke('db:get-weak-keys', limit),

    /** 获取 WPM 趋势 */
    getWpmTrend: (days?: number) =>
      ipcRenderer.invoke('db:get-wpm-trend', days),

    /** 获取课程记录 */
    getLessonRecords: () =>
      ipcRenderer.invoke('db:get-lesson-records'),

    /** 更新课程记录 */
    upsertLessonRecord: (params: { level: number; bestWpm: number; bestAccuracy: number; bestFcs: number }) =>
      ipcRenderer.invoke('db:upsert-lesson-record', params),
  },

  // ─── 设置操作 ───

  settings: {
    get: (key: string) =>
      ipcRenderer.invoke('settings:get', key),

    set: (key: string, value: any) =>
      ipcRenderer.invoke('settings:set', key, value),

    getAll: () =>
      ipcRenderer.invoke('settings:get-all'),
  },

  // ─── 平台信息 ───

  platform: process.platform,
})
