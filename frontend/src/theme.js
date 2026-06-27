import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#845EC2', // Primary Violet
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F3C5FF', // Pastel Pink
      contrastText: '#1E293B',
    },
    success: {
      main: '#00C9A7', // Primary Cyan
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FEFEDF', // Background Ivory
      paper: '#FEFEDF',   // Ivory for cards/tables
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#845EC2', // Primary Violet for border/dividers
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Arial", sans-serif',
    h5: {
      fontSize: '32px',
      fontWeight: 600,
      color: '#845EC2', // Primary Violet heading
    },
    h6: {
      fontSize: '22px',
      fontWeight: 600,
      color: '#845EC2',
    },
    subtitle1: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#1E293B',
    },
    subtitle2: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#64748B',
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      color: '#64748B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '14px',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FEFEDF',
          margin: 0,
          padding: 0,
          fontFamily: '"Inter", "Segoe UI", "Arial", sans-serif',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '4px',
          height: '34px',
          padding: '8px 16px', // Strict 8px padding
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(132, 94, 194, 0.08)',
          },
        },
        containedPrimary: {
          backgroundColor: '#845EC2',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#6c49a6',
          },
        },
        containedSecondary: {
          backgroundColor: '#F3C5FF',
          color: '#1E293B',
          '&:hover': {
            backgroundColor: '#dfa6eb',
          },
        },
        outlinedPrimary: {
          borderColor: '#845EC2',
          color: '#845EC2',
          '&:hover': {
            backgroundColor: 'rgba(132, 94, 194, 0.04)',
            borderColor: '#845EC2',
          },
        },
        outlinedSecondary: {
          borderColor: '#F3C5FF',
          color: '#845EC2',
          '&:hover': {
            backgroundColor: 'rgba(243, 197, 255, 0.04)',
            borderColor: '#F3C5FF',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          border: '1px solid #845EC2', // Card accent / border color
          boxShadow: 'none',
          backgroundColor: '#FEFEDF',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          border: '1px solid #845EC2',
          boxShadow: 'none',
          backgroundColor: '#FEFEDF',
          padding: '8px', // Strict 8px padding
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '4px',
          border: '1px solid #845EC2',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          backgroundColor: '#FEFEDF',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px', // Strict 8px padding
          borderColor: '#845EC2',
          fontSize: '14px',
          color: '#1E293B',
        },
        head: {
          backgroundColor: '#845EC2 !important', // Primary Violet header
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '13px',
          padding: '8px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(243, 197, 255, 0.25) !important', // Hover state Pastel Pink
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          height: '36px',
          backgroundColor: '#FEFEDF',
          padding: '8px', // Strict 8px padding
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00C9A7', // Primary Cyan hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#845EC2',
            borderWidth: '1px',
          },
        },
        notchedOutline: {
          borderColor: '#845EC2', // Divider / border color
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          transform: 'translate(14px, 8px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          paddingTop: '8px',
          paddingBottom: '8px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#00C9A7', // Active line color Primary Cyan
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '14px',
          textTransform: 'none',
          color: '#64748B',
          '&.Mui-selected': {
            color: '#845EC2',
          },
        },
      },
    },
  },
});

export default theme;
