/// <reference types="vite/client" />

// 声明 window.api 全局对象（由 preload.ts 注入）
declare global {
  interface Window {
    api: {
      db: {
        query: (sql: string, params?: any[]) => Promise<any[]>
      }
      settings: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<boolean>
      }
      platform: string
    }
  }
}

export {}
