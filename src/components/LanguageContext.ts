import { createContext, useContext } from 'react';
import { Language } from '../constants/gameTexts';

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
    getJoke: () => string;
    getSpruch: () => string;
    getParcelText: () => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
