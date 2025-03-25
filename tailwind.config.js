/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  darkMode: 'class', // enables dark mode by toggling the 'dark' class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  themes: [
    "light",      // default light theme
    "dark",       // dark theme (automatically applies with prefers-color-scheme or class toggling)
    "cupcake",    // additional theme
    // You can add more themes here...
  ],

};
