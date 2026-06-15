# KeyTrainer Phase 2 — UI 设计规范

> UI Designer: 为 Phase 2（核心打字引擎）创建的界面设计系统
> 设计日期: 2026-06-08
> 设计目标: 极简、专注、实时反馈的打字训练体验

---

## 一、设计系统基础

### 1.1 颜色系统

#### 主色调（专注模式）
```css
:root {
  /* 背景色 - 深色专注模式 */
  --bg-primary: #0f1117;           /* 主背景 - 深灰黑 */
  --bg-secondary: #1a1d27;         /* 侧边栏/卡片背景 */
  --bg-tertiary: #242837;          /* 悬浮/选中状态 */
  
  /* 文字颜色 */
  --text-primary: #e4e6f0;         /* 主要文字 */
  --text-secondary: #8b8fa3;       /* 次要文字 */
  --text-tertiary: #5a5e73;        /* 禁用/占位文字 */
  
  /* 品牌色 - 专注蓝 */
  --accent-primary: #4f8cff;       /* 主要操作按钮 */
  --accent-light: #6ba3ff;         /* Hover 状态 */
  --accent-dark: #3a6fd8;          /* Active 状态 */
  
  /* 语义色 - 打字反馈 */
  --color-correct: #10b981;         /* 正确 - 绿色 */
  --color-wrong: #ef4444;           /* 错误 - 红色 */
  --color-current: #fbbf24;         /* 当前位置 - 黄色 */
  --color-next: #4f8cff;            /* 下一个键 - 蓝色 */
  
  /* 指法分区色 (8色) */
  --finger-l-pinky: #cecbf6;       /* 左小指 - 淡紫 */
  --finger-l-ring: #b5d4f4;        /* 左无名指 - 淡蓝 */
  --finger-l-middle: #9fe1cb;       /* 左中指 - 淡青 */
  --finger-l-index: #c0dd97;        /* 左食指 - 淡绿 */
  --finger-r-index: #faeeda;        /* 右食指 - 淡黄 */
  --finger-r-middle: #fac775;        /* 右中指 - 淡橙 */
  --finger-r-ring: #f4c0d1;         /* 右无名指 - 淡粉 */
  --finger-r-pinky: #f7c1c1;        /* 右小指 - 淡红 */
  --finger-thumb: #d3d1c7;         /* 拇指 - 浅灰 */
}
```

#### 浅色模式（可选）
```css
[data-theme="light"] {
  --bg-primary: #f8f9fc;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f0f2f8;
  --text-primary: #1a1d27;
  --text-secondary: #5a5e73;
  --text-tertiary: #8b8fa3;
}
```

### 1.2 字体系统

```css
:root {
  /* 字体族 */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* 字体大小 */
  --text-xs: 0.75rem;    /* 12px - 标签、辅助文字 */
  --text-sm: 0.875rem;   /* 14px - 小按钮、元数据 */
  --text-base: 1rem;     /* 16px - 正文 */
  --text-lg: 1.125rem;   /* 18px - 小标题 */
  --text-xl: 1.25rem;    /* 20px - 标题 */
  --text-2xl: 1.5rem;    /* 24px - 大标题 */
  --text-3xl: 2rem;      /* 32px - 页面标题 */
  
  /* 字体粗细 */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

### 1.3 间距系统

```css
:root {
  /* 基于 4px 的间距系统 */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### 1.4 阴影与层级

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(79, 140, 255, 0.3);  /* 聚焦光晕 */
}
```

---

## 二、核心组件设计

### 2.1 打字区域 (TypingArea)

#### 视觉设计
```
┌─────────────────────────────────────────────┐
│  Typing Area Container                     │
│  ┌───────────────────────────────────────┐ │
│  │ "...the quick "  [当前行]            │ │
│  │ █████████████████░░░░░░░░░░░░░░░░ │ │
│  │         ↑ cursor (黄色闪烁)          │ │
│  │                                       │ │
│  │ 已完成文字 (灰色)                     │ │
│  │ 当前字符 (黄色背景 + 闪烁光标)        │ │
│  │ 未完成文字 (半透明)                   │ │
│  │ 错误字符 (红色背景 + 删除线)          │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [WPM: 45] [ACC: 96%] [TIME: 01:23]      │
└─────────────────────────────────────────────┘
```

#### 交互状态
1. **等待输入** - 光标在第一个字符处闪烁（黄色）
2. **输入正确** - 字符变绿，光标前进
3. **输入错误** - 字符变红 + 抖动动画，光标不动
4. **完成行** - 整行滑出，新行滑入

#### CSS 实现
```css
.typing-area {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: var(--space-8);
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  line-height: 1.8;
  min-height: 200px;
  position: relative;
  box-shadow: var(--shadow-md);
}

.typing-char {
  transition: all 150ms ease;
  border-radius: 2px;
  padding: 0 1px;
}

.typing-char--correct {
  color: var(--color-correct);
  background: rgba(16, 185, 129, 0.1);
}

.typing-char--wrong {
  color: var(--color-wrong);
  background: rgba(239, 68, 68, 0.2);
  text-decoration: line-through;
  animation: shake 300ms ease;
}

.typing-char--current {
  background: var(--color-current);
  color: var(--bg-primary);
  animation: blink 1s infinite;
  box-shadow: var(--shadow-glow);
}

.typing-char--upcoming {
  color: var(--text-tertiary);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
```

---

### 2.2 实时统计面板 (StatsPanel)

#### 布局设计
```
┌─────────────────────────────────────────────┐
│  Stats Panel                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   WPM    │ │ Accuracy │ │  Time    │  │
│  │   45     │ │   96%    │ │ 01:23    │  │
│  │ ──────── │ │ ──────── │ │ ──────── │  │
│  │ [图表]   │ │ [图表]   │ │ [进度条] │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│                                             │
│  ┌─ Finger Compliance ─────────────────┐    │
│  │  FCS: 92%  [█████████░] 91%       │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### 数据卡片组件
```css
.stat-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: var(--space-6);
  text-align: center;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-card__value {
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  color: var(--accent-primary);
  font-family: var(--font-mono);
}

.stat-card__label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

### 2.3 虚拟键盘 (VirtualKeyboard)

#### 设计规格
- **布局**: 标准 QWERTY，包含功能键、修饰键
- **尺寸**: 键帽 48x48px，间隙 4px
- **颜色编码**: 根据指法分区着色（8色）

#### 键帽状态
```css
.keycap {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all 150ms ease;
  cursor: pointer;
  user-select: none;
}

.keycap--home-row {
  /* 基准行键帽 - 特殊标记 */
  border-bottom: 3px solid var(--accent-primary);
}

.keycap--active {
  /* 当前应该按的键 */
  background: var(--accent-primary);
  color: white;
  box-shadow: var(--shadow-glow);
  transform: scale(1.1);
  animation: pulse 1s infinite;
}

.keycap--pressed {
  /* 用户刚按过的键 */
  background: var(--color-correct);
  transform: scale(0.95);
}

.keycap--wrong {
  /* 按错的键 */
  background: var(--color-wrong);
  animation: shake 300ms ease;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 10px var(--accent-primary); }
  50% { box-shadow: 0 0 25px var(--accent-primary); }
}
```

#### 指法分区覆盖层
```css
.finger-zone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.15;
  transition: opacity 300ms ease;
}

.finger-zone--visible {
  opacity: 0.3;
}

/* 8个手指区域各自有不同的渐变色 */
.finger-zone__l-pinky { background: var(--finger-l-pinky); }
.finger-zone__l-ring { background: var(--finger-l-ring); }
.finger-zone__l-middle { background: var(--finger-l-middle); }
.finger-zone__l-index { background: var(--finger-l-index); }
.finger-zone__r-index { background: var(--finger-r-index); }
.finger-zone__r-middle { background: var(--finger-r-middle); }
.finger-zone__r-ring { background: var(--finger-r-ring); }
.finger-zone__r-pinky { background: var(--finger-r-pinky); }
```

---

### 2.4 进度指示器 (ProgressBar)

#### 设计
```
Level 1: Home Row (ASDF)     ████████░░ 80%
[████████████████░░░░░░░░] 01234567890123456789/20
```

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--color-correct));
  border-radius: 4px;
  transition: width 300ms ease;
  position: relative;
}

.progress-bar__fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: white;
  border-radius: 2px;
  animation: pulse-dot 1s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

---

## 三、交互设计

### 3.1 打字反馈机制

| 事件 | 视觉反馈 | 音效 | 时长 |
|------|----------|------|------|
| **正确输入** | 字符变绿 + 轻微放大 | "click" 轻响 | 150ms |
| **错误输入** | 字符变红 + 抖动 | "error" 低音 | 300ms |
| **完成单词** | 单词背景闪绿 | "ding" 提示音 | 200ms |
| **完成行** | 行滑出 + 新行滑入 | "whoosh" 音效 | 400ms |
| **超时警告** | 边框闪红 | "beep" 警告音 | 500ms |

### 3.2 键盘交互

- **keydown**: 键帽按下动画（scale 0.95）
- **keyup**: 键帽恢复
- **长按**: 无特殊效果（防止重复输入）

### 3.3 动画时序

```css
/* 快速响应动画 (< 200ms) */
--duration-instant: 100ms;
--duration-fast: 150ms;

/* 标准动画 (200-400ms) */
--duration-normal: 300ms;

/* 缓慢动画 (> 400ms) */
--duration-slow: 500ms;

/* 缓动函数 */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

---

## 四、响应式设计

### 4.1 断点策略

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| **Mobile** | < 768px | 侧边栏隐藏，打字区域全宽 |
| **Tablet** | 768-1024px | 侧边栏缩小至 48px，键盘纵向排列 |
| **Desktop** | > 1024px | 完整布局，键盘横向排列 |

### 4.2 移动端适配

```css
@media (max-width: 768px) {
  .typing-area {
    font-size: var(--text-lg);  /* 减小字号 */
    padding: var(--space-4);
  }
  
  .virtual-keyboard {
    transform: scale(0.8);   /* 缩小键盘 */
    transform-origin: top center;
  }
  
  .sidebar {
    width: 48px;  /* 仅显示图标 */
  }
}
```

---

## 五、无障碍设计 (WCAG AA)

### 5.1 颜色对比度

| 组合 | 对比度 | 状态 |
|------|--------|------|
| 文字 #e4e6f0 / 背景 #0f1117 | 14.5:1 | ✅ Pass |
| 正确 #10b981 / 背景 #0f1117 | 6.2:1 | ✅ Pass |
| 错误 #ef4444 / 背景 #0f1117 | 5.8:1 | ✅ Pass |
| 当前 #fbbf24 / 背景 #0f1117 | 12.3:1 | ✅ Pass |

### 5.2 键盘导航

- **Tab**: 聚焦到可交互元素（按钮、输入框）
- **Enter/Space**: 激活按钮
- **Escape**: 暂停练习 / 返回主页

### 5.3 屏幕阅读器

```html
<div role="region" aria-label="Typing area">
  <div aria-live="polite" id="typing-feedback">
    <!-- 实时播报打字状态 -->
  </div>
</div>
```

---

## 六、组件实现清单

### Phase 2 需实现的组件

1. **TypingArea** - 打字区域主组件
   - [ ] 字符渲染（正确/错误/当前/未完成）
   - [ ] 光标闪烁动画
   - [ ] 键盘事件监听
   - [ ] 实时统计计算

2. **StatsPanel** - 实时统计面板
   - [ ] WPM 显示
   - [ ] 准确率显示
   - [ ] 时间显示
   - [ ] 指法合规分显示

3. **VirtualKeyboard** - 虚拟键盘
   - [ ] QWERTY 布局渲染
   - [ ] 键帽状态管理（active/pressed/wrong）
   - [ ] 指法分区覆盖层
   - [ ] 键盘事件同步

4. **ProgressBar** - 进度指示器
   - [ ] 线性进度条
   - [ ] 百分比显示
   - [ ] 动画过渡

5. **useTypingEngine** - 核心引擎 Hook
   - [ ] 字符级比对算法
   - [ ] WPM 计算（net WPM）
   - [ ] 准确率计算
   - [ ] 击键记录（timestamp, keyCode, finger）

---

## 七、设计交付物

### 7.1 设计文件

- ✅ 本设计规范文档
- ⏳ Figma 设计稿（高保真）
- ⏳ 组件库 Storybook
- ⏳ 图标库（SVG）

### 7.2 开发交接

- ✅ 设计 token（CSS 变量）
- ✅ 组件规范（Props、状态、动画）
- ⏳ 测试用例（交互状态）
- ⏳ 性能预算（FPS、包大小）

---

**UI Designer 签名**: 设计系统已完成，可进入开发阶段。
**下一步**: 开发者根据此规范实现 Phase 2 组件。
