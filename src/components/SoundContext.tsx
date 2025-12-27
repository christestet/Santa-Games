import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// --- Music Player ---
class MusicPlayer {
    audio: HTMLAudioElement | null = null;
    isPlaying: boolean = false;
    muted: boolean = false;

    constructor() {
        this.audio = new Audio('/audio/pixel-snowfall-carol.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.4;
    }

    start() {
        if (!this.audio || this.isPlaying) return;
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updateMuted();
        }).catch(err => console.error("Playback failed", err));
    }

    setMuted(muted: boolean) {
        this.muted = muted;
        this.updateMuted();
    }

    updateMuted() {
        if (!this.audio) return;
        this.audio.muted = this.muted;
    }
}

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('santa-game-muted');
        return saved === 'true';
    });

    const player = useRef<MusicPlayer | null>(null);

    useEffect(() => {
        if (!player.current) {
            player.current = new MusicPlayer();
        }

        const handleInteraction = () => {
            player.current?.start();
            window.removeEventListener('pointerdown', handleInteraction);
        };

        window.addEventListener('pointerdown', handleInteraction);
        return () => window.removeEventListener('pointerdown', handleInteraction);
    }, []);

    useEffect(() => {
        localStorage.setItem('santa-game-muted', String(isMuted));
        player.current?.setMuted(isMuted);
    }, [isMuted]);

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
