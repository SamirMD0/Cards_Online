/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'uno-red': '#E53E3E',
        'uno-blue': '#3182CE',
        'uno-green': '#38A169',
        'uno-yellow': '#D69E2E',
        'uno-wild': '#2D3748',
        'dark-900': '#0A0E14',
        'dark-800': '#151922',
        'dark-700': '#1F2937',
        'dark-600': '#374151',
        'dark-500': '#4B5563',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      // ... rest of config
    },
  },
  plugins: [],
};