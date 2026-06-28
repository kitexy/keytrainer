/** Generate KeyTrainer app icon via sharp + iconutil */
import sharp from 'sharp'
import { execSync } from 'child_process'
import { mkdirSync, rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'resources')
const ICONSET = join(OUT, 'icon.iconset')

mkdirSync(OUT, { recursive: true })

// ─── Create SVG icon ───
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="1024" height="1024" rx="180" fill="url(#bg)"/>
  <!-- Key grid 3x2 -->
  <g transform="translate(152, 252)">
    <rect x="0"    y="0"   width="210" height="210" rx="48" fill="#CECBF6"/>
    <rect x="250"  y="0"   width="210" height="210" rx="48" fill="#B5D4F4"/>
    <rect x="500"  y="0"   width="210" height="210" rx="48" fill="#9FE1CB"/>
    <rect x="0"    y="250" width="210" height="210" rx="48" fill="#FAEEDA"/>
    <rect x="250"  y="250" width="210" height="210" rx="48" fill="#FAC775"/>
    <rect x="500"  y="250" width="210" height="210" rx="48" fill="#F4C0D1"/>
  </g>
  <!-- Space bar -->
  <rect x="276" y="720" width="472" height="80" rx="40" fill="#D3D1C7"/>
</svg>`

const SVG_BUF = Buffer.from(SVG)

// ─── Render 1024x1024 PNG ───
await sharp(SVG_BUF).resize(1024, 1024).png().toFile(join(OUT, 'icon.png'))
console.log('✅ icon.png (1024)')

// ─── Create iconset ───
mkdirSync(ICONSET, { recursive: true })
const sizes = [16, 32, 64, 128, 256, 512]
for (const s of sizes) {
  await sharp(SVG_BUF).resize(s, s).png().toFile(join(ICONSET, `icon_${s}x${s}.png`))
  await sharp(SVG_BUF).resize(s * 2, s * 2).png().toFile(join(ICONSET, `icon_${s}x${s}@2x.png`))
}

// ─── Convert to .icns ───
execSync('iconutil -c icns ' + ICONSET, { stdio: 'inherit' })
rmSync(ICONSET, { recursive: true, force: true })
console.log('✅ icon.icns')
console.log('🎯 Icon ready!')
