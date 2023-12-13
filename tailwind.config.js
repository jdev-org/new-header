/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--georchestra-primary)',
        secondary: 'var(--georchestra-secondary)',
        primary_light: 'var(--georchestra-primary-light)',
        secondary_light: 'var(--georchestra-secondary-light)',
      },
    },
  },
  variants: {
    display: ['group-hover'],
  },
  plugins: [],
}
