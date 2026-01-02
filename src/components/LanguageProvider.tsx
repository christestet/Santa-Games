import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { Language, TRANSLATIONS, WEIHNACHTS_WITZE, SPRUECHE, PARCEL_TEXTS } from '../constants/gameTexts';
import { LanguageContext } from './LanguageContext';

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
        let current: unknown = TRANSLATIONS[language];

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                console.warn(`Translation missing for: ${path} in ${language}`);
                return path;
            }
        }

        if (typeof current === 'string') {
            return current;
        }

        console.warn(`Translation path ${path} did not resolve to a string in ${language}`);
        return path;
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

    // ✅ Memoize context value - CRITICAL for performance
    const value = useMemo(
        () => ({ language, setLanguage, t, getJoke, getSpruch, getParcelText }),
        [language, setLanguage, t, getJoke, getSpruch, getParcelText]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
