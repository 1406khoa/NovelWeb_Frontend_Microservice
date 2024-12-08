const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'flip-in': {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0)', opacity: '1' },
        },
        'flip-out': {
          '0%': { transform: 'rotateY(0)', opacity: '1' },
          '100%': { transform: 'rotateY(-90deg)', opacity: '0' },
        },
      },
      animation: {
        'flip-in': 'flip-in 0.5s ease-out',
        'flip-out': 'flip-out 0.5s ease-in',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
      });
    }),
  ],
};
