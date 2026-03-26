/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00B4DB', // Bright Blue
        secondary: '#0083B0', // Darker Blue for gradient
        accent: '#4facfe',
        background: '#F8FAFC',
        card: '#FFFFFF',
        textMain: '#1E293B',
        textSub: '#64748B',
        // Existing colors kept for compatibility or specific UI elements
        blush: '#FFE4EC',
        peach: '#FFEEDB',
        mint: '#E6FFF4',
        lavender: '#EFE7FF',
        rose: '#FF5A8A',
      },
      borderRadius: {
        xl2: '24px',
        xl3: '32px',
      },
    },
  },
  plugins: [],
};
