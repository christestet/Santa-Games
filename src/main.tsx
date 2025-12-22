import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './components/LanguageContext.tsx'
import { SoundProvider } from './components/SoundContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SoundProvider>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </SoundProvider>
    </StrictMode>,
)
