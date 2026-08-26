/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#F7F6F2',
          100: '#EDEBD8',
          200: '#D8D4B8',
          300: '#BDB88F',
          400: '#A09868',
          500: '#857A50',
          600: '#6B6140',
          700: '#544C31',
          800: '#3D3822',
          900: '#292615',
          950: '#171509',
        },
        gold: { DEFAULT: '#C9A84C', light: '#F0D98A' },
        surface: { DEFAULT: '#F8F8F6', 2: '#F0EFE9' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.10)',
        'olive': '0 4px 20px rgba(84,76,49,0.25)',
      },
    },
  },
  plugins: [],
}
