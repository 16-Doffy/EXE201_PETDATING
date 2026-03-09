/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: '#FFE4EC',
        peach: '#FFEEDB',
        mint: '#E6FFF4',
        lavender: '#EFE7FF',
        ink: '#2E2A3B',
        rose: '#FF5A8A',
        figmaBlue: '#65ABEA',
        figmaPink: '#F9DDE7',
        figmaViolet: '#596BD9',
        figmaYellow: '#F8BE38',
        figmaCream: '#F4E9E3',
        figmaTextBlue: '#2C4CDE',
        figmaTextRed: '#FF476A',
      },
      borderRadius: {
        xl2: '24px',
      },
    },
  },
  plugins: [],
};
