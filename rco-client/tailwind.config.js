/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background layers
        'bg-primary':   '#0d1117',
        'bg-surface':   '#161b22',
        'bg-elevated':  '#21262d',
        'bg-hover':     '#2d333b',
        // Accent colors
        'accent-blue':   '#58a6ff',
        'accent-green':  '#3fb950',
        'accent-purple': '#bc8cff',
        'accent-orange': '#f78166',
        'accent-yellow': '#e3b341',
        'accent-pink':   '#f778ba',
        // Text
        'text-primary':  '#e6edf3',
        'text-secondary':'#c9d1d9',
        'text-muted':    '#8b949e',
        // Border
        'border-default': '#30363d',
        'border-muted':   '#21262d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.05) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(88, 166, 255, 0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(88, 166, 255, 0.3)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(88, 166, 255, 0.3)',
        'glow-green': '0 0 20px rgba(63, 185, 80, 0.3)',
        'glow-purple': '0 0 20px rgba(188, 140, 255, 0.3)',
        'panel': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
