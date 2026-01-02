import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

type Theme = 'classic' | 'grinch';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('santa-game-theme');
        return (saved as Theme) || 'classic';
    });

    useEffect(() => {
        localStorage.setItem('santa-game-theme', theme);
        // Apply theme class to body
        document.body.classList.remove('classic-theme', 'grinch-theme');
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);

    // ✅ Memoize callbacks - prevents unnecessary re-renders
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => (prev === 'classic' ? 'grinch' : 'classic'));
    }, []);

    // ✅ Memoize context value - CRITICAL for performance
    const value = useMemo(
        () => ({ theme, setTheme, toggleTheme }),
        [theme, setTheme, toggleTheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
