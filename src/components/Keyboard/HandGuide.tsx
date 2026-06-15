/**
 * HandGuide — 半透明手型指引
 *
 * 在 Keyboard SVG 上叠加半透明手型轮廓，
 * 展示左右手在 Home Row 的正确放置位置。
 *
 * 简约线条风格，不干扰键盘阅读。
 */

interface HandGuideProps {
  // reserved for future use
}

export default function HandGuide(_props: HandGuideProps) {
  // Home Row y 坐标（来自 keyboardLayout ROW_Y[2]）
  const homeY = 144
  const fingerW = 36  // 手指宽度
  const fingerH = 72  // 手指长度（覆盖到上排）
  const wristW = 90   // 手腕宽度
  const wristH = 40   // 手腕高度

  return (
    <g opacity={0.18} pointerEvents="none">
      {/* ─── 左手 ─────────────────────────────── */}
      {/* 左手腕 */}
      <rect
        x={84} y={homeY + fingerH - 8}
        width={wristW} height={wristH}
        rx={10} ry={10}
        fill="#8888cc"
      />
      {/* 左小指 — A */}
      <rect x={96}  y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#CECBF6" />
      {/* 左无名指 — S */}
      <rect x={160} y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#B5D4F4" />
      {/* 左中指 — D */}
      <rect x={224} y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#9FE1CB" />
      {/* 左食指 — F */}
      <rect x={288} y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#C0DD97" />

      {/* ─── 右手 ─────────────────────────────── */}
      {/* 右手腕 */}
      <rect
        x={468} y={homeY + fingerH - 8}
        width={wristW} height={wristH}
        rx={10} ry={10}
        fill="#ccaa88"
      />
      {/* 右食指 — J */}
      <rect x={420} y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#FAEEDA" />
      {/* 右中指 — K */}
      <rect x={484} y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#FAC775" />
      {/* 右无名指 — L */}
      <rect x={548} y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#F4C0D1" />
      {/* 右小指 — ; */}
      <rect x={612} y={homeY - fingerH + 16} width={fingerW} height={fingerH+8} rx={8} fill="#F7C1C1" />

      {/* ─── 拇指 — 空格键 ────────────────────── */}
      <rect
        x={234} y={268}
        width={172} height={22}
        rx={6} fill="#D3D1C7"
      />

      {/* ─── 标签 ─────────────────────────────── */}
      <text x={132} y={homeY + fingerH + wristH + 22} textAnchor="middle" fill="#8888cc" fontSize={11} fontFamily="system-ui, sans-serif" fontWeight={500}>
        左手
      </text>
      <text x={510} y={homeY + fingerH + wristH + 22} textAnchor="middle" fill="#ccaa88" fontSize={11} fontFamily="system-ui, sans-serif" fontWeight={500}>
        右手
      </text>
    </g>
  )
}
