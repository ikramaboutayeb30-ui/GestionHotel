const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: 'rgba(128, 144, 137, 0.45) transparent',
      },
      '*::selection': {
        backgroundColor: 'rgba(107, 194, 179, 0.28)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 16,
      }),
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: 10, minHeight: 40, paddingInline: 16 },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: { borderRadius: 10 },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 650 },
    },
  },
  MuiTooltip: {
    defaultProps: { arrow: true },
    styleOverrides: {
      tooltip: { borderRadius: 8, fontSize: '0.75rem', padding: '7px 10px' },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: { borderRadius: 10 },
    },
  },
  MuiMenu: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      paper: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 12,
        boxShadow: theme.shadows[8],
        marginTop: 8,
      }),
    },
  },
}

export default components

