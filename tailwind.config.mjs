/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '375px',
      md: '768px',
      lg: '1024px',
      xl: '1200px',
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
      },
      boxShadow: {
        'custom-deep': '0px 4px 22px rgba(0, 0, 0, 0.15), 0px 4px 44px rgba(37, 37, 37, 0.05) inset',
      },
      container: {
        center: true,
        padding: '16px',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1187px',
        },
      },
      colors: {
        yellow: '#FDC043',
        yellowLight: '#FFB723',
        dark: '#383837',
        gray: '#323232',
        lightGray: '#EAEAEA',
        lightGrayText: '#A7A7A7',
      },
      fontSize: {
        huge: ['4rem', '1.2'],
        '75': ['75px', '113%'],
        '55': ['55px', '154%'],
        '35': ['35px', '128%'],
        '30': ['30px', '100%'],
        '32': ['32px', '100%'],
        '25': ['25px', '140%'],
        '20': ['20px', '140%'],
        '18': ['18px', '140%'],
        '16': ['16px', '140%'],
        '14': ['14px', '140%'],
        '12': ['12px', '140%'],
      },
    },
  },
  plugins: [],
}
