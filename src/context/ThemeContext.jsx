import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  const [forcedTheme, setForcedTheme] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', forcedTheme || theme);
    if (!forcedTheme) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, forcedTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setForcedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
