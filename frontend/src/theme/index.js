import { createTheme } from '@mui/material/styles'
import components from './components'
import darkPalette from './palettes/dark'
import lightPalette from './palettes/light'
import typography from './typography'

export function createAppTheme(mode = 'light') {
  const palette = mode === 'dark' ? darkPalette : lightPalette

  return createTheme({
    palette,
    typography,
    components,
    shape: { borderRadius: 12 },
    spacing: 8,
    shadows: [
      'none',
      '0 1px 2px rgba(15, 35, 29, 0.04)',
      '0 2px 6px rgba(15, 35, 29, 0.05)',
      '0 4px 10px rgba(15, 35, 29, 0.06)',
      '0 6px 14px rgba(15, 35, 29, 0.07)',
      '0 8px 18px rgba(15, 35, 29, 0.08)',
      '0 10px 22px rgba(15, 35, 29, 0.09)',
      '0 12px 26px rgba(15, 35, 29, 0.10)',
      '0 14px 30px rgba(15, 35, 29, 0.11)',
      '0 16px 34px rgba(15, 35, 29, 0.12)',
      ...Array(15).fill('0 18px 42px rgba(15, 35, 29, 0.14)'),
    ],
  })
}

