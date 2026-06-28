import { useState, useEffect, useCallback } from 'react'
import { useThemeStore, Theme } from '../stores/themeStore'
import { isSoundEnabled, setSoundEnabled } from '../utils/sound'

/* ─── 类型 ─────────────────────────────────────────────────── */

type FontSize = 'small' | 'medium' | 'large'

interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 px-5 bg-gray-900/30 border border-gray-800/30 rounded-xl">
      <div>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {description && (
          <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

/* ─── 开关按钮 ─────────────────────────────────────────────── */

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-12 h-6 rounded-full transition-colors duration-200
        ${on ? 'bg-blue-600' : 'bg-gray-700'}
      `}
    >
      <span className={`
        absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
        ${on ? 'translate-x-6' : 'translate-x-0.5'}
      `} />
    </button>
  )
}

/* ─── 分段选择器 ───────────────────────────────────────────── */

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1 bg-gray-800 p-0.5 rounded-lg">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
            ${value === opt.key
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   主组件
   ═══════════════════════════════════════════════════════════════ */

export default function Settings() {
  // ─── 主题 ───
  const { theme, setTheme } = useThemeStore()
  const themeLabels: Record<Theme, string> = {
    dark: '🌙 暗色',
    light: '☀️ 浅色',
    system: '🖥 跟随系统',
  }

  // ─── 音效 ───
  const [soundOn, setSoundOn] = useState(isSoundEnabled)
  const handleSoundToggle = useCallback(() => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    try {
      window.api?.settings?.set('soundEnabled', next)
    } catch { /* ignore */ }
  }, [soundOn])

  // ─── 手指提示 ───
  const [fingerHints, setFingerHints] = useState(() => {
    try { return localStorage.getItem('keytrainer-finger-hints') !== 'off' }
    catch { return true }
  })
  const handleFingerToggle = useCallback(() => {
    const next = !fingerHints
    setFingerHints(next)
    localStorage.setItem('keytrainer-finger-hints', next ? 'on' : 'off')
    try {
      window.api?.settings?.set('showFingerHints', next)
    } catch { /* ignore */ }
  }, [fingerHints])

  // ─── 字体大小 ───
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const attr = document.documentElement.getAttribute('data-font-size')
    return (attr as FontSize) || 'medium'
  })
  const handleFontSize = useCallback((size: FontSize) => {
    setFontSize(size)
    document.documentElement.setAttribute('data-font-size', size)
    try {
      window.api?.settings?.set('fontSize', size)
      localStorage.setItem('keytrainer-font-size', size)
    } catch { /* ignore */ }
  }, [])

  // ─── 键盘布局 ───
  const [kbdLayout, setKbdLayout] = useState<'qwerty' | 'dvorak' | 'colemak'>('qwerty')
  const layoutLabels: Record<string, string> = {
    qwerty: 'QWERTY（美式标准）',
    dvorak: 'Dvorak',
    colemak: 'Colemak',
  }

  // ─── 初始化：从主进程加载设置 ───
  useEffect(() => {
    async function load() {
      try {
        if (window.api?.settings?.getAll) {
          const res = await window.api.settings.getAll()
          if (res?.success) {
            if (res.fontSize) {
              setFontSize(res.fontSize)
              document.documentElement.setAttribute('data-font-size', res.fontSize)
            }
            if (res.soundEnabled !== undefined && res.soundEnabled !== isSoundEnabled) {
              setSoundOn(res.soundEnabled)
              setSoundEnabled(res.soundEnabled)
            }
            if (res.showFingerHints !== undefined) {
              setFingerHints(res.showFingerHints)
            }
            if (res.keyboardLayout) {
              setKbdLayout(res.keyboardLayout)
            }
          }
        }
      } catch { /* ignore */ }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      <div className="w-full max-w-[640px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">⚙ 设置</h2>
        <p className="text-sm text-gray-500 mt-1">个性化你的练习体验</p>
      </div>

      <div className="w-full max-w-[640px] space-y-3">
        {/* 主题 */}
        <SettingRow
          label="主题"
          description={`当前：${themeLabels[theme]}`}
        >
          <Segmented<Theme>
            options={[
              { key: 'dark', label: '🌙' },
              { key: 'light', label: '☀️' },
              { key: 'system', label: '🖥' },
            ]}
            value={theme}
            onChange={setTheme}
          />
        </SettingRow>

        {/* 字体大小 */}
        <SettingRow
          label="打字区字体大小"
          description={`当前：${fontSize === 'small' ? '小 (15px)' : fontSize === 'large' ? '大 (22px)' : '中 (18px)'}`}
        >
          <Segmented<FontSize>
            options={[
              { key: 'small', label: '小' },
              { key: 'medium', label: '中' },
              { key: 'large', label: '大' },
            ]}
            value={fontSize}
            onChange={handleFontSize}
          />
        </SettingRow>

        {/* 音效 */}
        <SettingRow
          label="打字音效"
          description="正确击键时播放短促按键音，错误时播放低沉提示音"
        >
          <Toggle on={soundOn} onToggle={handleSoundToggle} />
        </SettingRow>

        {/* 手指提示 */}
        <SettingRow
          label="手指提示"
          description="指位训练空闲时显示手型放置指引和指法分区图"
        >
          <Toggle on={fingerHints} onToggle={handleFingerToggle} />
        </SettingRow>

        {/* 键盘布局 */}
        <SettingRow
          label="键盘布局"
          description={`当前：${layoutLabels[kbdLayout]}`}
        >
          <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
            {kbdLayout.toUpperCase()}
          </span>
        </SettingRow>

        {/* 版本 */}
        <SettingRow
          label="KeyTrainer 版本"
          description="MacBook 键盘打字训练工具 · Phase 7"
        >
          <span className="text-xs text-gray-500">v0.3.0</span>
        </SettingRow>
      </div>

      {/* 底部提示 */}
      <div className="w-full max-w-[640px] mt-8 pt-6 border-t border-gray-800/40">
        <p className="text-[11px] text-gray-500 text-center">
          设置自动保存。主题切换即时生效，无需重启。
        </p>
      </div>
    </div>
  )
}
