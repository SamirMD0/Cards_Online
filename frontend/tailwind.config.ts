import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
  colors: {
    dark: {
      900: '#0A0E14',
      800: '#151922',
      700: '#1F2937',
      600: '#374151',
      500: '#4B5563',
    },
    uno: {
      red: '#E53E3E',
      blue: '#3182CE',
      green: '#38A169',
      yellow: '#D69E2E',
      wild: '#2D3748',
    },
  },

      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'lamp': '0 -20px 150px 50px rgba(255, 220, 100, 0.4), 0 0 80px 20px rgba(255, 220, 100, 0.2)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 50px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4)',
        'glow-red': '0 0 20px rgba(229, 62, 62, 0.6), 0 0 40px rgba(229, 62, 62, 0.3)',
        'glow-blue': '0 0 20px rgba(49, 130, 206, 0.6), 0 0 40px rgba(49, 130, 206, 0.3)',
        'glow-green': '0 0 20px rgba(56, 161, 105, 0.6), 0 0 40px rgba(56, 161, 105, 0.3)',
        'glow-yellow': '0 0 20px rgba(214, 158, 46, 0.6), 0 0 40px rgba(214, 158, 46, 0.3)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 30px rgba(255, 220, 100, 0.5), 0 0 60px rgba(255, 220, 100, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 50px rgba(255, 220, 100, 0.8), 0 0 100px rgba(255, 220, 100, 0.5)',
          },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)',
          },
          '50%': { 
            transform: 'translateY(-10px)',
          },
        },
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
    },
  },
  plugins: [],
} satisfies Config;