/**
 * Theme Configuration
 * نظام موحد للألوان والمسافات والخطوط والحدود
 */

export const theme = {
  colors: {
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    background: {
      primary: '#050508',
      secondary: '#0f172a',
      tertiary: '#1e293b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      muted: '#94a3b8',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  typography: {
    fontFamily: {
      arabic: "'Cairo', 'Tajawal', sans-serif",
      sans: "'Inter', system-ui, sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 20px rgba(139, 92, 246, 0.3)',
  },

  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

/**
 * CSS Variables للتعامل مع Theme
 */
export const cssVariables = {
  '--color-primary-500': theme.colors.primary[500],
  '--color-pink-500': theme.colors.pink[500],
  '--color-blue-500': theme.colors.blue[500],
  '--color-background-primary': theme.colors.background.primary,
  '--color-background-secondary': theme.colors.background.secondary,
  '--color-text-primary': theme.colors.text.primary,
  '--color-text-secondary': theme.colors.text.secondary,
  '--color-text-muted': theme.colors.text.muted,
  '--spacing-md': theme.spacing.md,
  '--spacing-lg': theme.spacing.lg,
  '--border-radius-lg': theme.borderRadius.lg,
  '--border-radius-xl': theme.borderRadius.xl,
  '--border-radius-2xl': theme.borderRadius['2xl'],
  '--transition-normal': theme.transitions.normal,
} as const;
