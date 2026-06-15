/**
 * 音效系统 — Web Audio API
 *
 * 无需外部音频文件，纯代码合成音效。
 * 配合 typingStore 在击键时播放反馈音。
 */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

/** 播放短促按键音（正确击键） */
export function playKeyClick(): void {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06)

    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.06)
  } catch {
    // silence
  }
}

/** 播放错误音（低沉 buzz） */
export function playKeyError(): void {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch {
    // silence
  }
}

/** 播放完成提示音（清脆 ding） */
export function playComplete(): void {
  try {
    const ctx = getCtx()

    // 高音 ding
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1200, ctx.currentTime)
    gain1.gain.setValueAtTime(0.1, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.3)

    // 低音 dong
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(800, ctx.currentTime)
        gain2.gain.setValueAtTime(0.1, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(ctx.currentTime)
        osc2.stop(ctx.currentTime + 0.4)
      } catch {
        // silence
      }
    }, 150)
  } catch {
    // silence
  }
}

/**
 * 检查用户音效偏好（localStorage）
 * 默认开启
 */
export function isSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem('keytrainer-sound')
    return val !== 'off'
  } catch {
    return true
  }
}

/** 设置音效开关 */
export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem('keytrainer-sound', enabled ? 'on' : 'off')
  } catch {
    // ignore
  }
}
