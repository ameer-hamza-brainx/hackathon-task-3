/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/popup/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        focus: {
          active: '#6366f1',
          inactive: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
};
