/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        summarify: {
          light: '#AF26D1',
          dark: '#7A0098',
        },
      },
    },
  },
  plugins: [],
};
