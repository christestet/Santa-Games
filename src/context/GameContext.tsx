import { createContext, useContext } from 'react';
import { GameType, GameState } from '@/types/game';
import { GAME_CONFIG } from '@constants/gameConfig';

export interface GameContextProps {
    gameState: GameState;
    currentGame: GameType;
    score: number;
    currentJoke: string;
    playerName: string;
    isPaused: boolean;
    settings: typeof GAME_CONFIG;
    showSettings: boolean;
    highScores: { name: string; score: number; time: number; timestamp: number }[];
    isLoadingScores: boolean;
    scoreError: string | null;
    isSubmittingScore: boolean;

    // Actions
    startGame: (game: GameType) => void;
    endGame: (finalScore: number, joke: string) => void;
    pauseGame: () => void;
    resumeGame: () => void;
    restartGame: () => void;
    quitGame: () => void;
    updateSettings: (newSettings: typeof GAME_CONFIG) => void;
    toggleSettings: (show: boolean) => void;
    setPlayerName: (name: string) => void;
    submitScore: () => Promise<void>;
    fetchScores: () => Promise<void>;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
