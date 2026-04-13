// Tipografía

export const FONTS = {
  // Familias de fuentes
  primary: 'Inter',
  secondary: 'Roboto',
  mono: 'JetBrains Mono',
  
  // Tamaños
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Pesos
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const TYPOGRAPHY = {
  // Estilos predefinidos
  h1: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.bold,
    lineHeight: 40,
  },
  h2: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.semibold,
    lineHeight: 32,
  },
  h3: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semibold,
    lineHeight: 28,
  },
  body: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.normal,
    lineHeight: 24,
  },
  caption: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.normal,
    lineHeight: 20,
  },
  small: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.normal,
    lineHeight: 16,
  },
};
