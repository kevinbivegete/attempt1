/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand — orange accent
        primary: {
          700: '#e0822d',
          600: '#ea9240',
          500: '#c07030',
          400: '#893027',
          300: '#f0c9a0',
          200: '#f8e4cc',
          100: '#d9d9d9', // exact canvas background from the design
          50:  '#e8e8e8',
        },
        // Neutral scale — light grey content area
        neutral: {
          800: '#18181b',
          700: '#3f3f46',
          600: '#52525b',
          500: '#71717a',
          400: '#a1a1aa',
          300: '#d4d4d8',
          200: '#f0f0f2',
          100: '#f8f8fa',
        },
        // Status
        success: '#16a34a',
        danger:  '#dc2626',
        warning: '#d97706',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm':      '0px',
        'DEFAULT': '0px',
        'md':      '0px',
        'lg':      '0px',
        'xl':      '0px',
        '2xl':     '0px',
        '3xl':     '0px',
        'full':    '0px',
      },
      boxShadow: {
        card:   '0 1px 8px rgba(0, 0, 0, 0.07)',
        sm:     '0 1px 4px rgba(0, 0, 0, 0.05)',
        purple: '0 4px 20px rgba(168, 82, 5, 0.22)',
        input:  '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #893027 0%, #e0822d 100%)',
      },
    },
  },
  plugins: [],
};
