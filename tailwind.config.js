/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        fontFamily: {
        sans: ['SFProDisplayRegular', 'sans-serif'],
      },
        // Шкала шрифтов в пикселях, а не в rem. NativeWind на телефоне считает
        // rem = 14px (в браузере 16), поэтому стандартные text-sm/text-xs
        // выходили 12,25px и 10,5px — мельче, чем в веб-превью и чем задумано.
        // С пикселями размеры одинаковы на iOS, Android и в вебе.
        fontSize: {
          xs: ['12px', '16px'],
          sm: ['14px', '20px'],
          base: ['16px', '22px'],
          lg: ['18px', '24px'],
          xl: ['20px', '26px'],
          '2xl': ['24px', '30px'],
          '3xl': ['28px', '34px'],
          '4xl': ['32px', '38px'],
        },
        // leading-* тоже в rem и на телефоне сжимались так же (leading-5 = 17,5px).
        lineHeight: {
          3: '12px',
          4: '16px',
          5: '20px',
          6: '24px',
          7: '28px',
          8: '32px',
          9: '36px',
          10: '40px',
        },
      },
    },
    plugins: [],
  }
