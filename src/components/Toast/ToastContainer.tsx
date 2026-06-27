/**
 * ToastContainer — 全局 Toast 通知容器
 *
 * 固定定位在屏幕顶部中央，带滑入/滑出动画。
 */

import { useToastStore } from '../../stores/toastStore'

const typeStyles: Record<string, string> = {
  info:    'bg-blue-600/90 border-blue-400/30 text-blue-100',
  warning: 'bg-amber-600/90 border-amber-400/30 text-amber-100',
}

const typeIcons: Record<string, string> = {
  info:    '💡',
  warning: '⚠️',
}

export default function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
      style={{ minWidth: 320 }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            px-5 py-3 rounded-xl border backdrop-blur-md
            text-sm font-medium
            shadow-lg shadow-black/20
            animate-toast-in
            pointer-events-auto
            ${typeStyles[toast.type] ?? typeStyles.info}
          `}
          role="alert"
        >
          <span className="mr-2">{typeIcons[toast.type] ?? ''}</span>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
