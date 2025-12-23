import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language, TRANSLATIONS, WEIHNACHTS_WITZE, SPRUECHE, PARCEL_TEXTS } from '../constants/gameTexts';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
    getJoke: () => string;
    getSpruch: () => string;
    getParcelText: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Try to get language from localStorage or default to German
    const [language, setLangState] = useState<Language>(() => {
        const saved = localStorage.getItem('santa-game-lang');
        return (saved === 'de' || saved === 'en') ? saved : 'de';
    });

    const setLanguage = useCallback((lang: Language) => {
        setLangState(lang);
        localStorage.setItem('santa-game-lang', lang);
    }, []);

    const t = useCallback((path: string): string => {
        const keys = path.split('.');
        let current: any = TRANSLATIONS[language];

        for (const key of keys) {
            if (current && current[key]) {
                current = current[key];
            } else {
                console.warn(`Translation missing for: ${path} in ${language}`);
                return path;
            }
        }

        return current as string;
    }, [language]);

    const getJoke = useCallback(() => {
        const jokes = WEIHNACHTS_WITZE[language];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }, [language]);

    const getSpruch = useCallback(() => {
        const sprueche = SPRUECHE[language];
        return sprueche[Math.floor(Math.random() * sprueche.length)];
    }, [language]);

    const getParcelText = useCallback(() => {
        const texts = PARCEL_TEXTS[language];
        return texts[Math.floor(Math.random() * texts.length)];
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getJoke, getSpruch, getParcelText }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
