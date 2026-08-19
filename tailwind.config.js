/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/frontend/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master Named Theme Colors
        cream: '#FDF8F0',
        maroon: '#B82D2D',
        textBrown: '#2B1810',
        creamBg: '#FDF8F0',
        creamCard: '#FFFDF9',
        creamSurface: '#F7EFE3',
        marigold: {
          DEFAULT: '#E8871E',
          dark: '#C26E10',
          light: '#FDF2E2',
          500: '#E8871E',
          600: '#C26E10',
        },
        templeRed: {
          DEFAULT: '#B82D2D',
          dark: '#942121',
          light: '#FDF0F0',
          500: '#B82D2D',
          600: '#942121',
        },
        divineGold: {
          DEFAULT: '#D4AF37',
          dark: '#B38F26',
          light: '#FBF5DF',
          500: '#D4AF37',
        },
        darkBrown: '#2B1810',
        warmSlate: '#594238',
        warmMuted: '#8C7367',
      },
      fontFamily: {
        serif: ['Rozha One', 'Cinzel', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
