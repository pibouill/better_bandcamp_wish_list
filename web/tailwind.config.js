/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        bandcamp: {
          green: '#629aa9',
          dark: '#f6931d',
          light: '#1a1a1a'
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
