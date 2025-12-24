import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { Card } from './ui/Card';

interface GameCardProps {
    title: string;
    icon: React.ReactNode;
    instructions: string;
    onPlay: () => void;
    disabled?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ title, icon, instructions, onPlay, disabled = false }) => {
    const { t } = useLanguage();
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const handleCardClick = () => {
        if (!disabled) {
            onPlay();
        }
    };

    return (
        <div
            className={`game-card-container ${isFlipped ? 'is-flipped' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleCardClick}
        >
            <div className="game-card-inner">
                {/* Front Side */}
                <div className="game-card-front">
                    <span className="game-icon">{icon}</span>
                    <h3>{title}</h3>
                    <div className="flex gap-2 w-full justify-center">
                        <button
                            className="btn-small"
                            disabled={disabled}
                        >
                            {disabled ? t('menu.expired') : t('menu.play')}
                        </button>
                        <button
                            className="btn-small bg-transparent border-[length:var(--border-width)] border-[var(--card-border)] text-[var(--card-border)]"
                            onClick={handleFlip}
                        >
                            {t('menu.info')}
                        </button>
                    </div>
                </div>

                {/* Back Side */}
                <div className="game-card-back">
                    <h3 className="font-[var(--font-retro)] text-[var(--primary-color)] m-0">{title}</h3>
                    <p className="instruction-text">{instructions}</p>
                    <button className="btn-small" onClick={handleFlip}>
                        {t('common.back')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
