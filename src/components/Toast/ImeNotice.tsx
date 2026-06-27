/**
 * ImeNotice — 开始练习前的输入法提醒条
 *
 * 显示在「开始练习」按钮上方，提醒用户切换到英文输入法。
 * 只在 idle 状态下渲染。
 */

export default function ImeNotice() {
  return (
    <div className="
      flex items-center justify-center gap-2 mb-4 px-4 py-2.5
      bg-amber-500/10 border border-amber-500/20 rounded-xl
      text-amber-200/80 text-sm
    ">
      <span className="text-base">⌨️</span>
      <span>练习前请将输入法切换为</span>
      <kbd className="
        px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded
        text-amber-300 font-semibold text-xs
        font-mono
      ">
        ABC
      </kbd>
      <span>/</span>
      <kbd className="
        px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded
        text-amber-300 font-semibold text-xs
        font-mono
      ">
        EN
      </kbd>
    </div>
  )
}
