/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--georchestra-primary)',
        secondary: 'var(--georchestra-secondary)',
        'primary-light': 'var(--georchestra-primary-light)',
        'secondary-light': 'var(--georchestra-secondary-light)',
      },
    },
  },
  variants: {
    display: ['group-hover'],
  },
  plugins: [],
}
