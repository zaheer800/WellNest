/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary navy — deep trust
          navy:      'rgb(10 37 64 / <alpha-value>)',      // #0A2540
          'navy-deep':'rgb(5 16 26 / <alpha-value>)',       // #05101A  (dark gradient end)
          // Accent teal — clarity / interactive
          teal:      'rgb(14 165 183 / <alpha-value>)',     // #0EA5B7
          'teal-dark':'rgb(8 129 143 / <alpha-value>)',     // #08818F  (hover)
          'teal-light':'rgb(232 248 250 / <alpha-value>)',  // #E8F8FA  (tint bg)
          // Growth green — progress / success
          green:     'rgb(34 197 94 / <alpha-value>)',      // #22C55E
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
