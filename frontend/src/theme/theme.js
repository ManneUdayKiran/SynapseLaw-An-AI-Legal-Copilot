import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b3b35',
      light: '#185950',
      dark: '#06231f',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#d9822b',
      light: '#f2a04b',
      dark: '#9e5a16',
      contrastText: '#ffffff'
    },
    error: {
      main: '#c53030',
      light: '#fde8e8',
      dark: '#9b1c1c'
    },
    warning: {
      main: '#d9822b',
      light: '#feecdc',
      dark: '#b45309'
    },
    success: {
      main: '#0e7054',
      light: '#def7ec',
      dark: '#03543f'
    },
    background: {
      default: '#f4f6f3',
      paper: '#ffffff'
    },
    text: {
      primary: '#0d1f1c',
      secondary: '#4d615c'
    },
    divider: 'rgba(11, 59, 53, 0.1)'
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.01em' },
    overline: { fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.01em'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 14px rgba(11, 59, 53, 0.15)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0b3b35 0%, #17655b 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #072b26 0%, #115249 100%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(11, 59, 53, 0.05)',
          border: '1px solid rgba(11, 59, 53, 0.09)',
          transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 30px rgba(11, 59, 53, 0.1)',
            borderColor: 'rgba(11, 59, 53, 0.18)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8
        }
      }
    }
  }
});

export default theme;
