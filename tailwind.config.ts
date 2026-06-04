import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cabinet Grotesk', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      colors: {
        navy: {
          950: '#0D1021',
          900: '#1A1A2E',
          800: '#16213E',
          700: '#1F2C52',
          600: '#2A3F73',
        },
        accent: {
          600: '#C73B2E',
          500: '#E94560',
          400: '#F06070',
          300: '#F58C98',
        },
        neutral: {
          950: '#0A0A0B',
          900: '#1A1A1A',
          700: '#4A4A6A',
          500: '#7A7A9A',
          300: '#C4C4D4',
          100: '#F0F0F8',
          50: '#F8F8FC',
        },
        success: {
          DEFAULT: '#1A7B4B',
          light: '#DCFCE7',
        },
        warning: '#E97B00',
        error: '#DC2626',
        info: '#1D6FAA',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(26,26,46,0.08)',
        md: '0 4px 16px rgba(26,26,46,0.12)',
        lg: '0 8px 32px rgba(26,26,46,0.16)',
        xl: '0 16px 48px rgba(26,26,46,0.20)',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp var(--transition-base) ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
