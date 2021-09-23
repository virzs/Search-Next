module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  important: true,
  theme: {
    extend: {
      colors: {
        primary: '#5f5f5f',
        gray: {
          60: '#F0F3F9',
          70: 'F3F3F3',
          150: '#EAEAEA',
        },
      },
      lineHeight: {},
    },
  },
  variants: {
    extend: {},
  },
  plugins: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
};
