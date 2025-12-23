import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from '@components/LanguageContext.tsx'
import { SoundProvider } from '@components/SoundContext.tsx'
import { ThemeProvider } from '@components/ThemeContext.tsx'
import { GameProvider } from '@components/GameContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <SoundProvider>
                <LanguageProvider>
                    <GameProvider>
                        <App />
                    </GameProvider>
                </LanguageProvider>
            </SoundProvider>
        </ThemeProvider>
    </StrictMode>,
)
