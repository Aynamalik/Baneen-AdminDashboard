/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false, // Avoid conflicts with MUI CssBaseline
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E91E63',
          light: '#F48FB1',
          dark: '#C2185B',
        },
        secondary: {
          DEFAULT: '#9C27B0',
          light: '#BA68C8',
          dark: '#7B1FA2',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
