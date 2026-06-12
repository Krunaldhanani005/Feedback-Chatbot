import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DC2626',
          'red-light': '#EF4444',
          'red-dark': '#B91C1C',
          'red-muted': 'rgba(220,38,38,0.08)',
          'red-soft': '#FEF2F2',
        },
        // Premium light — warm off-white system
        dark: {
          bg: '#F5F4F0',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#F8F7F4',
          border: '#E5E4DF',
          'border-light': '#EEEDEA',
        },
        text: {
          primary: '#0F0F0E',
          secondary: '#6B6B67',
          muted: '#A0A09C',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
        'surface-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8F7F4 100%)',
        'card-gradient': 'linear-gradient(145deg, #FFFFFF 0%, #F8F7F4 100%)',
        'glow-red': 'radial-gradient(ellipse at center, rgba(220,38,38,0.08) 0%, transparent 65%)',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,38,38,0.06) 0%, transparent 65%)',
        'dot-pattern': 'radial-gradient(rgba(210,208,202,0.5) 1px, transparent 1px)',
      },
      boxShadow: {
        'brand': '0 0 30px rgba(220,38,38,0.20)',
        'brand-sm': '0 0 14px rgba(220,38,38,0.14)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
        'glass': '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        'premium': '0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(229,228,223,0.8)',
        'modal': '0 32px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)',
        'inner': 'inset 0 1px 0 rgba(255,255,255,0.9)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
