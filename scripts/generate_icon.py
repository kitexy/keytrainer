"""生成 KeyTrainer 应用图标 — macOS .icns 格式"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

SIZE = 1024
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'resources')
PNG_PATH = os.path.join(OUT_DIR, 'icon.png')
ICONSET_DIR = os.path.join(OUT_DIR, 'icon.iconset')

os.makedirs(OUT_DIR, exist_ok=True)

# ─── 绘制 1024x1024 图标 ───
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 圆角方形背景
r = 180  # corner radius
bg_color = (30, 30, 35, 255)
draw.rounded_rectangle([(0, 0), (SIZE - 1, SIZE - 1)], radius=r, fill=bg_color)

# 键盘键帽阵列 — 3x3 简化键盘图案
key_size = 120
gap = 24
start_x = (SIZE - 3 * key_size - 2 * gap) // 2
start_y = (SIZE - 3 * key_size - 2 * gap) // 2 + 20

key_colors = [
    (200, 200, 240),  # 左
    (160, 200, 220),
    (180, 220, 200),
    (240, 220, 180),  # 右
    (250, 200, 160),
    (240, 180, 200),
]

for row in range(2):
    for col in range(3):
        x = start_x + col * (key_size + gap)
        y = start_y + row * (key_size + gap)
        idx = row * 3 + col
        color = key_colors[idx] + (255,)
        draw.rounded_rectangle(
            [(x, y), (x + key_size - 1, y + key_size - 1)],
            radius=28, fill=color
        )

# 底部长空格键
space_y = start_y + 2 * (key_size + gap)
space_w = int(key_size * 2.5)
space_x = (SIZE - space_w) // 2
draw.rounded_rectangle(
    [(space_x, space_y), (space_x + space_w, space_y + key_size - 1)],
    radius=28, fill=(200, 200, 195, 255)
)

img.save(PNG_PATH, 'PNG')
print(f'✅ 1024x1024 PNG: {PNG_PATH}')

# ─── 生成 .iconset ───
sizes = [16, 32, 64, 128, 256, 512]
os.makedirs(ICONSET_DIR, exist_ok=True)

for s in sizes:
    img.resize((s, s), Image.LANCZOS).save(f'{ICONSET_DIR}/icon_{s}x{s}.png')
    img.resize((s * 2, s * 2), Image.LANCZOS).save(f'{ICONSET_DIR}/icon_{s}x{s}@2x.png')

# ─── iconutil 转换 ───
subprocess.run(['iconutil', '-c', 'icns', ICONSET_DIR], check=True)
icns_path = os.path.join(OUT_DIR, 'icon.icns')
print(f'✅ .icns: {icns_path}')

# 清理
import shutil
shutil.rmtree(ICONSET_DIR)
print('🎯 图标生成完毕！')
