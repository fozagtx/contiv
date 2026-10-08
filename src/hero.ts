import { heroui } from '@heroui/theme'

const primary = {
  50: '#E8F7EF',
  100: '#C9EEDB',
  200: '#93DFBB',
  300: '#5BCB94',
  400: '#2BAE6F',
  500: '#0F8A52',
  600: '#0C7446',
  700: '#095C38',
  800: '#07462B',
  900: '#05311E',
  DEFAULT: '#0F8A52',
  foreground: '#ffffff',
}

export default heroui({
  themes: {
    light: {
      colors: {
        primary,
      },
    },
    dark: {
      colors: {
        primary,
      },
    },
  },
})
