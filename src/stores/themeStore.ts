import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (t: Theme) => void
  _apply: (t: Theme) => void
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyToDOM(resolved: ResolvedTheme) {
  const root = document.documentElement
  if (resolved === 'light') {
    root.classList.add('light')
  } else {
    root.classList.remove('light')
  }
}

function persist(theme: Theme) {
  try {
    if (window.api?.settings?.set) {
      window.api.settings.set('theme', theme)
    }
  } catch { /* ignore */ }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  resolved: 'dark',

  setTheme: (theme: Theme) => {
    const resolved = resolveTheme(theme)
    applyToDOM(resolved)
    persist(theme)
    set({ theme, resolved })
  },

  _apply: (theme: Theme) => {
    const resolved = resolveTheme(theme)
    applyToDOM(resolved)
    set({ theme, resolved })
  },
}))

/**
 * 初始化主题：从主进程 settings 读取，并监听系统主题变化
 */
export async function initTheme() {
  let stored: Theme = 'dark'

  // 优先从同步 initialTheme 获取（已在 HTML 中应用）
  try {
    if (window.api?.initialTheme) {
      stored = window.api.initialTheme as Theme
    }
  } catch { /* fallback */ }

  // 也从异步 IPC 确认（覆盖更准确的 system 值）
  try {
    if (window.api?.settings?.get) {
      const res = await window.api.settings.get('theme')
      if (res?.success && res.value) {
        stored = res.value as Theme
      }
    }
  } catch { /* fallback to default */ }

  const { setTheme } = useThemeStore.getState()
  setTheme(stored)

  // 监听系统主题变化（仅在 system 模式下生效）
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, setTheme } = useThemeStore.getState()
    if (theme === 'system') {
      setTheme('system')
    }
  })
}
