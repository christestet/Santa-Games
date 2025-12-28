import React, { useState, useCallback, ReactNode } from 'react';
import { GAME_CONFIG } from '@constants/gameConfig';
import { isGamePlayable } from '@constants/gameConstants';
import { useHighScores } from '@hooks/useHighScores';
import { GameType, GameState } from '@/types/game';
import { GameContext } from '../context/GameContext';

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [currentGame, setCurrentGame] = useState<GameType>('none');
    const [score, setScore] = useState(0);
    const [currentJoke, setCurrentJoke] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [isPaused, setIsPaused] = useState(false);
    const [settings, setSettings] = useState(() => {
        // Try to get timer setting from localStorage
        const savedTimer = localStorage.getItem('santa-game-timer');
        const timer = savedTimer ? parseInt(savedTimer, 10) : GAME_CONFIG.TIMER;
        return {
            ...GAME_CONFIG,
            TIMER: timer
        };
    });
    const [showSettings, setShowSettings] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastPlayedTime, setLastPlayedTime] = useState(() => {
        const savedTimer = localStorage.getItem('santa-game-timer');
        return savedTimer ? parseInt(savedTimer, 10) : GAME_CONFIG.TIMER;
    });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameKey, setGameKey] = useState(0);

    const { highScores, isLoading, error, fetchScores, submitScore: apiSubmitScore } = useHighScores();

    const startGame = useCallback((game: GameType) => {
        // Prevent starting game if deadline has passed
        if (!isGamePlayable()) {
            console.warn('Game cannot be started - deadline has passed');
            return;
        }

        setCurrentGame(game);
        setScore(0);
        setPlayerName("");
        setGameState('playing');
        setIsPaused(false);
        setLastPlayedTime(settings.TIMER);
    }, [settings.TIMER]);

    const endGame = useCallback((finalScore: number, joke: string) => {
        setScore(finalScore);
        setCurrentJoke(joke);
        setGameState('name-entry');
        setIsPaused(false);
    }, []);

    const pauseGame = useCallback(() => setIsPaused(true), []);
    const resumeGame = useCallback(() => setIsPaused(false), []);

    const quitGame = useCallback(() => {
        setIsTransitioning(true);
        setIsPaused(false);

        // Delay transition to allow touch events to complete
        setTimeout(() => {
            setGameState('menu');
            // Keep transitioning flag for additional 100ms after menu renders
            setTimeout(() => {
                setIsTransitioning(false);
            }, 100);
        }, 150);
    }, []);

    const restartGame = useCallback(() => {
        // Prevent restarting game if deadline has passed
        if (!isGamePlayable()) {
            console.warn('Game cannot be restarted - deadline has passed');
            setIsPaused(false);
            setGameState('menu');
            return;
        }

        setIsPaused(false);
        setGameKey(prev => prev + 1);
        startGame(currentGame);
    }, [currentGame, startGame]);

    const updateSettings = useCallback((newSettings: typeof GAME_CONFIG) => {
        setSettings(newSettings);
        // Persist timer setting to localStorage
        localStorage.setItem('santa-game-timer', newSettings.TIMER.toString());
    }, []);

    const toggleSettings = useCallback((show: boolean) => {
        setShowSettings(show);
    }, []);

    const submitScore = useCallback(async () => {
        if (!playerName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        const success = await apiSubmitScore(playerName, score, settings.TIMER);
        if (success) {
            setGameState('gameover');
        }
        setIsSubmitting(false);
    }, [playerName, score, isSubmitting, apiSubmitScore, settings.TIMER]);

    const value = {
        gameState,
        currentGame,
        score,
        currentJoke,
        playerName,
        isPaused,
        settings,
        showSettings,
        highScores,
        isLoadingScores: isLoading,
        scoreError: error,
        isSubmittingScore: isSubmitting,
        lastPlayedTime,
        isTransitioning,
        gameKey,
        startGame,
        endGame,
        pauseGame,
        resumeGame,
        restartGame,
        quitGame,
        updateSettings,
        toggleSettings,
        setPlayerName,
        submitScore,
        fetchScores
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
