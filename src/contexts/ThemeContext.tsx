
"use client";
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeScheme = 'purple-bliss' | 'classic-teal' | 'forest-whisper' | 'ocean-blue' | 'sunset-orange' | 'rose-pink';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  themeScheme: ThemeScheme;
  setThemeScheme: Dispatch<SetStateAction<ThemeScheme>>;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  effectiveMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeScheme, setThemeScheme] = useState<ThemeScheme>('purple-bliss');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [effectiveMode, setEffectiveMode] = useState<'light' | 'dark'>('light');

  const applyTheme = useCallback((scheme: ThemeScheme, mode: ThemeMode) => {
    const root = window.document.documentElement;
    root.classList.remove(
      'light', 'dark', 
      'theme-purple-bliss', 'theme-classic-teal', 'theme-forest-whisper', 
      'theme-ocean-blue', 'theme-sunset-orange', 'theme-rose-pink'
    );

    let currentMode: 'light' | 'dark';
    if (mode === 'system') {
      currentMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      currentMode = mode;
    }
    
    root.classList.add(currentMode);
    setEffectiveMode(currentMode);

    if (scheme !== 'classic-teal' || (scheme === 'classic-teal' && currentMode === 'dark')) { // classic-teal light is the :root default
        root.classList.add(scheme === 'classic-teal' ? `theme-${scheme}` : `theme-${scheme}`);
    }
     if (scheme !== 'classic-teal') {
      root.classList.add(`theme-${scheme}`);
    }


    localStorage.setItem('themeScheme', scheme);
    localStorage.setItem('themeMode', mode);
  }, []);

  useEffect(() => {
    const storedScheme = localStorage.getItem('themeScheme') as ThemeScheme | null;
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;

    const initialScheme = storedScheme || 'purple-bliss';
    const initialMode = storedMode || 'system';
    
    setThemeScheme(initialScheme);
    setThemeModeState(initialMode);
    applyTheme(initialScheme, initialMode);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(themeScheme, themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme(themeScheme, 'system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeScheme, themeMode, applyTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyTheme(themeScheme, mode);
  };


  return (
    <ThemeContext.Provider value={{ themeScheme, setThemeScheme, themeMode, setThemeMode, effectiveMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
