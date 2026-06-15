import type { CharStatus } from '../../stores/typingStore'

const statusStyles: Record<CharStatus, string> = {
  pending: 'text-gray-500',
  correct: 'text-green-400',
  incorrect: 'text-red-400 bg-red-400/10 rounded-sm',
  corrected: 'text-yellow-400',
}

interface CharSpanProps {
  char: string
  status: CharStatus
  isCurrent: boolean
}

export default function CharSpan({ char, status, isCurrent }: CharSpanProps) {
  const isSpace = char === ' '
  const display = isSpace ? '\u00B7' : char // 空格显示为 ·

  return (
    <span
      className={`
        relative inline-block
        ${statusStyles[status]}
        ${isCurrent ? 'char-current' : ''}
        ${isSpace && status === 'pending' ? 'text-gray-700' : ''}
      `}
    >
      {isCurrent && status === 'pending' && (
        <span className="
          absolute left-0 bottom-0.5 w-full h-[2px]
          bg-blue-400 rounded-full
          animate-cursor-blink
        " />
      )}
      {display}
    </span>
  )
}
