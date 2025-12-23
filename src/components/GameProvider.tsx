import React, { useState, useCallback, ReactNode } from 'react';
import { GAME_CONFIG } from '@constants/gameConfig';
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
    const [settings, setSettings] = useState(GAME_CONFIG);
    const [showSettings, setShowSettings] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { highScores, isLoading, error, fetchScores, submitScore: apiSubmitScore } = useHighScores();

    const startGame = useCallback((game: GameType) => {
        setCurrentGame(game);
        setScore(0);
        setPlayerName("");
        setGameState('playing');
        setIsPaused(false);
    }, []);

    const endGame = useCallback((finalScore: number, joke: string) => {
        setScore(finalScore);
        setCurrentJoke(joke);
        setGameState('name-entry');
        setIsPaused(false);
    }, []);

    const pauseGame = useCallback(() => setIsPaused(true), []);
    const resumeGame = useCallback(() => setIsPaused(false), []);

    const quitGame = useCallback(() => {
        setIsPaused(false);
        setGameState('menu');
    }, []);

    const restartGame = useCallback(() => {
        setIsPaused(false);
        startGame(currentGame);
    }, [currentGame, startGame]);

    const updateSettings = useCallback((newSettings: typeof GAME_CONFIG) => {
        setSettings(newSettings);
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
