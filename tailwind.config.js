/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        olive: {
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#E8E8E0',
          300: '#D9D9CC',
          400: '#C4C4B0',
          500: '#A89A7E',
          600: '#8B7D5E',
          700: '#6B6347',
          800: '#4F4838',
          900: '#3C342A',
          950: '#2A2420',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-bottom))',
      },
      minHeight: {
        screen: '100dvh',
      },
    },
  },
  plugins: [],
}
