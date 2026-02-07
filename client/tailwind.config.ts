import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#18181b',
        'secondary': '#71717a',
        'muted': '#a1a1aa',
        'border': '#e4e4e7',
        'surface': '#ffffff',
        'background': '#fafafa',
        'success': '#22c55e',
        'danger': '#ef4444',
        'warning': '#f59e0b',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'large': '0 24px 48px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
