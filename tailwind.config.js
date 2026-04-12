/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        border: {
          DEFAULT: 'var(--border)',
          emphasis: 'var(--border-emphasis)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          faint: 'var(--text-faint)',
          muted: 'var(--text-secondary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          purple: 'var(--accent)',
          green: 'var(--accent-green)',
          yellow: 'var(--accent-yellow)',
          red: 'var(--accent-red)',
          blue: 'var(--accent-blue)',
          amber: '#d97706',
          'green-bg': 'rgba(34, 197, 94, 0.12)',
          'amber-bg': 'rgba(217, 119, 6, 0.12)',
          'red-bg': 'rgba(239, 68, 68, 0.12)',
          'blue-bg': 'rgba(59, 130, 246, 0.12)',
        },
        paper: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'muted-surface': 'var(--bg-elevated)',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        small: '8px',
        card: '10px',
        'large-card': '16px',
        modal: '24px',
      },
      spacing: {
        13: '52px',
        65: '260px',
        105: '420px',
        '6.5': '26px',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        nodePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'node-pulse': 'nodePulse 1.5s ease-in-out infinite',
      },
      boxShadow: {
        glow: '0 0 80px -20px rgba(124, 111, 205, 0.45)',
        'glow-sm': '0 0 40px -10px rgba(124, 111, 205, 0.35)',
        focus: '0 0 0 3px rgba(124, 111, 205, 0.25)',
      },
    },
  },
  plugins: [],
}
