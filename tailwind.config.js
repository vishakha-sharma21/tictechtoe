/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        paper: '#fafaf8',
        surface: '#f3f2ef',
        'muted-surface': '#eae9e4',
        border: {
          DEFAULT: '#e0ddd6',
          emphasis: '#ccc9c0',
        },
        text: {
          primary: '#0a0a0a',
          secondary: '#3d3d3d',
          muted: '#888',
          faint: '#bbb',
        },
        accent: {
          blue: '#2563eb',
          'blue-bg': '#eff6ff',
          green: '#16a34a',
          'green-bg': '#f0fdf4',
          amber: '#d97706',
          'amber-bg': '#fffbeb',
          red: '#dc2626',
          'red-bg': '#fef2f2',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'small': '8px',
        'card': '10px',
        'large-card': '16px',
        'modal': '24px',
      },
      spacing: {
        '13': '52px',
        '65': '260px',
        '105': '420px',
        '6.5': '26px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 15s linear infinite',
        'marquee-slow': 'marquee 45s linear infinite',
        'typewriter': 'typewriter 0.038s steps(1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
