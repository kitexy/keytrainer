import { useState } from 'react'
import { isSoundEnabled, setSoundEnabled } from '../utils/sound'

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
          <p className="text-[11px] text-gray-600 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

export default function Settings() {
  const [soundOn, setSoundOn] = useState(isSoundEnabled)
  const [showFingerHints, setShowFingerHints] = useState(() => {
    try { return localStorage.getItem('keytrainer-finger-hints') !== 'off' }
    catch { return true }
  })

  const handleSoundToggle = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
  }

  const handleFingerHintsToggle = () => {
    const next = !showFingerHints
    setShowFingerHints(next)
    try { localStorage.setItem('keytrainer-finger-hints', next ? 'on' : 'off') }
    catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col items-center h-full px-6 py-6 overflow-y-auto">
      <div className="w-full max-w-[640px] mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">⚙ 设置</h2>
        <p className="text-sm text-gray-500 mt-1">个性化你的练习体验</p>
      </div>

      <div className="w-full max-w-[640px] space-y-3">
        {/* 音效 */}
        <SettingRow
          label="打字音效"
          description="正确击键时播放短促按键音，错误时播放低沉提示音"
        >
          <button
            onClick={handleSoundToggle}
            className={`
              relative w-12 h-6 rounded-full transition-colors duration-200
              ${soundOn ? 'bg-blue-600' : 'bg-gray-700'}
            `}
          >
            <span className={`
              absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
              ${soundOn ? 'translate-x-6' : 'translate-x-0.5'}
            `} />
          </button>
        </SettingRow>

        {/* 手指提示 */}
        <SettingRow
          label="手指提示"
          description="指位训练空闲时显示手型放置指引和指法分区图"
        >
          <button
            onClick={handleFingerHintsToggle}
            className={`
              relative w-12 h-6 rounded-full transition-colors duration-200
              ${showFingerHints ? 'bg-blue-600' : 'bg-gray-700'}
            `}
          >
            <span className={`
              absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
              ${showFingerHints ? 'translate-x-6' : 'translate-x-0.5'}
            `} />
          </button>
        </SettingRow>

        {/* 主题 */}
        <SettingRow
          label="主题"
          description="当前：Catppuccin Mocha（暗色主题）"
        >
          <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded-lg">
            🌙 暗色
          </span>
        </SettingRow>

        {/* 字体大小 */}
        <SettingRow
          label="字体大小"
          description="当前：中等（18px 等宽）"
        >
          <div className="flex gap-2">
            {['小', '中', '大'].map(size => (
              <button key={size}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  size === '中'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                    : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </SettingRow>

        {/* 键盘布局 */}
        <SettingRow
          label="键盘布局"
          description="当前：QWERTY（美式标准）"
        >
          <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded-lg">
            QWERTY
          </span>
        </SettingRow>

        {/* 关于 */}
        <SettingRow
          label="关于 KeyTrainer"
          description="MacBook 键盘打字训练工具"
        >
          <span className="text-xs text-gray-600">v0.2.0</span>
        </SettingRow>
      </div>

      {/* 底部提示 */}
      <div className="w-full max-w-[640px] mt-8 pt-6 border-t border-gray-800/40">
        <p className="text-[11px] text-gray-600 text-center">
          练习数据保存在本地浏览器中。使用 Electron 桌面版可获得更完整的体验。
        </p>
      </div>
    </div>
  )
}
