import React, { createContext, useContext, useState, useEffect } from 'react';

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

    const setTheme = (newTheme: Theme) => setThemeState(newTheme);
    const toggleTheme = () => setThemeState(prev => (prev === 'classic' ? 'grinch' : 'classic'));

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
