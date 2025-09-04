/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        risk: {
          low: '#10B981',
          moderate: '#F59E0B',
          high: '#EF4444',
          extreme: '#7C2D12',
        },
      },
    },
  },
  plugins: [],
};

