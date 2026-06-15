/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 指法分区8色
        'finger-lp': '#CECBF6', // 左小指 淡紫
        'finger-lr': '#B5D4F4', // 左无名指 淡蓝
        'finger-lm': '#9FE1CB', // 左中指 淡青
        'finger-li': '#C0DD97', // 左食指 淡绿
        'finger-ri': '#FAEEDA', // 右食指 淡黄
        'finger-rm': '#FAC775', // 右中指 淡橙
        'finger-rr': '#F4C0D1', // 右无名指 淡粉
        'finger-rp': '#F7C1C1', // 右小指 淡红
        'finger-thumb': '#D3D1C7', // 拇指 浅灰
      },
      fontFamily: {
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
