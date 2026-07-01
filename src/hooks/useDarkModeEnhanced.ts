import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  customColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  reducedMotion?: boolean;
  highContrast?: boolean;
}

const STORAGE_KEY = 'enhanced-theme';

export function useDarkModeEnhanced() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [config, setConfig] = useState<ThemeConfig>({ theme: 'dark' });
  const [isSystemDark, setIsSystemDark] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Load saved theme and config
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemeState(parsed.theme);
        setConfig(parsed);
      } catch (error) {
        console.error('Failed to load theme config:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
    
    // Apply custom colors if provided
    if (config.customColors) {
      Object.entries(config.customColors).forEach(([key, value]) => {
        if (value) {
          document.documentElement.style.setProperty(`--color-${key}`, String(value));
        }
      });
    }

    // Apply accessibility preferences
    if (config.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    if (config.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [theme, config, isSystemDark]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setConfig((prev) => ({ ...prev, theme: newTheme }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, theme: newTheme }));
  };

  const setCustomColor = (colorKey: keyof NonNullable<ThemeConfig['customColors']>, value: string) => {
    const newConfig = {
      ...config,
      customColors: { ...config.customColors, [colorKey]: value },
    };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const toggleReducedMotion = () => {
    const newConfig = { ...config, reducedMotion: !config.reducedMotion };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const toggleHighContrast = () => {
    const newConfig = { ...config, highContrast: !config.highContrast };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const resetTheme = () => {
    const defaultConfig: ThemeConfig = { theme: 'dark' };
    setThemeState('dark');
    setConfig(defaultConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
  };

  const effectiveTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;

  return {
    theme,
    effectiveTheme,
    isDark: effectiveTheme === 'dark',
    isSystemDark,
    config,
    setTheme,
    setCustomColor,
    toggleReducedMotion,
    toggleHighContrast,
    resetTheme,
  };
}

// Theme presets
export const themePresets = {
  dark: {
    theme: 'dark' as Theme,
    customColors: {
      background: '#050508',
      text: '#ffffff',
    },
  },
  light: {
    theme: 'light' as Theme,
    customColors: {
      background: '#ffffff',
      text: '#000000',
    },
  },
  midnight: {
    theme: 'dark' as Theme,
    customColors: {
      background: '#0a0a0f',
      text: '#e0e0e0',
    },
  },
  ocean: {
    theme: 'dark' as Theme,
    customColors: {
      background: '#0a1628',
      text: '#e0f2fe',
      primary: '#0ea5e9',
    },
  },
  forest: {
    theme: 'dark' as Theme,
    customColors: {
      background: '#0a1f0a',
      text: '#dcfce7',
      primary: '#22c55e',
    },
  },
};

export function applyThemePreset(preset: keyof typeof themePresets) {
  const config = themePresets[preset];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
}
