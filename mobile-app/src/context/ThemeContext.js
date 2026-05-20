import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const themeColors = {
  primary: '#19C2F3', // Cyan
  primaryDark: '#0FA4D1', // Darker Cyan for active states
  primaryLight: '#E0F7FE', // Very light cyan for backgrounds

  light: {
    background: '#F8FAFC', // Slate 50
    card: '#FFFFFF',
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    border: '#E2E8F0', // Slate 200
    header: '#FFFFFF',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    iconColor: '#334155', // Slate 700
  },
  
  dark: {
    background: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    border: '#334155', // Slate 700
    header: '#1E293B',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    iconColor: '#CBD5E1', // Slate 300
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('isDarkMode');
      if (storedTheme !== null) {
        setIsDarkMode(JSON.parse(storedTheme));
      }
    } catch (e) {
      console.log('Error loading theme:', e);
    }
    setIsThemeLoaded(true);
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const theme = isDarkMode ? themeColors.dark : themeColors.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, themeColors, isThemeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
