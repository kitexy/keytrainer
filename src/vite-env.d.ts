/// <reference types="vite/client" />

/**
 * window.api 类型由 electron/preload.ts 通过 contextBridge 注入。
 * 详细类型定义见 src/types/electron.d.ts
 *
 * 这里只做最小声明，确保 TypeScript 不报 unknown type 错误。
 */

declare global {
  interface Window {
    api?: {
      db: {
        saveSession: (params: any) => Promise<any>
        getHistory: (params?: any) => Promise<any>
        getStatsSummary: () => Promise<any>
        getWeakKeys: (limit?: number) => Promise<any>
        getWpmTrend: (days?: number) => Promise<any>
        getLessonRecords: () => Promise<any>
        upsertLessonRecord: (params: any) => Promise<any>
      }
      settings: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<any>
        getAll: () => Promise<any>
      }
      platform: string
      initialTheme: 'light' | 'dark'
    }
  }
}

export {}
