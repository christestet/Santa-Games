import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useGame } from '@/context/GameContext';
import { Card } from './ui/Card';
import { isGamePlayable, GAME_DEADLINE } from '@constants/gameConstants';

interface GameCardProps {
    title: string;
    icon: React.ReactNode;
    instructions: string;
    onPlay: () => void;
    disabled?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ title, icon, instructions, onPlay, disabled = false }) => {
    const { t } = useLanguage();
    const { isTransitioning } = useGame();
    const [isFlipped, setIsFlipped] = useState(false);

    // Check if we're in endgame phase (less than 2 days remaining)
    const now = new Date().getTime()
    const deadline = GAME_DEADLINE.getTime()
    const daysRemaining = Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
    const isEndgame = daysRemaining < 2 && isGamePlayable()

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const handleCardClick = () => {
        if (!disabled && !isTransitioning) {
            onPlay();
        }
    };

    return (
        <div
            className={`game-card-container ${isFlipped ? 'is-flipped' : ''} ${disabled || isTransitioning ? 'opacity-50 cursor-not-allowed' : ''} ${isEndgame ? 'endgame-card' : ''}`}
            onClick={handleCardClick}
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
        >
            <div className="game-card-inner">
                {/* Front Side */}
                <div className={`game-card-front ${isEndgame ? 'endgame-frost' : ''}`}>
                    <span className="game-icon">{icon}</span>
                    <h3>{title}</h3>
                    <div className="flex gap-2 w-full justify-center">
                        <button
                            className="btn-small"
                            disabled={disabled || isTransitioning}
                        >
                            {disabled ? t('menu.expired') : t('menu.play')}
                        </button>
                        <button
                            className="btn-small bg-transparent border-4 border-card-border text-card-border"
                            onClick={handleFlip}
                            disabled={isTransitioning}
                        >
                            {t('menu.info')}
                        </button>
                    </div>
                </div>

                {/* Back Side */}
                <div className={`game-card-back ${isEndgame ? 'endgame-frost' : ''}`}>
                    <h3 className="font-[var(--font-retro)] text-[var(--primary-color)] m-0">{title}</h3>
                    <p className="instruction-text">{instructions}</p>
                    <button className="btn-small" onClick={handleFlip} disabled={isTransitioning}>
                        {t('common.back')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
