// ============================================================
// TourOS POS — Tema global (cores, espaçamentos, tipografia)
// ============================================================

export const colors = {
  PRIMARY: '#E94560',
  SECONDARY: '#1A1A2E',
  BACKGROUND: '#F5F5F5',
  SURFACE: '#FFFFFF',
  ERROR: '#E94560',
  TEXT: '#1A1A2E',
  TEXT_SECONDARY: '#666666',
  TEXT_MUTED: '#999999',
  BORDER: '#E0E0E0',
  SUCCESS: '#4CAF50',
  WARNING: '#F5A623',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
} as const;

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;

const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export default theme;
