import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { Card } from './ui/Card';

interface GameCardProps {
    title: string;
    icon: React.ReactNode;
    instructions: string;
    onPlay: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, icon, instructions, onPlay }) => {
    const { t } = useLanguage();
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    return (
        <div className={`game-card-container ${isFlipped ? 'is-flipped' : ''}`} onClick={onPlay}>
            <div className="game-card-inner">
                {/* Front Side */}
                <div className="game-card-front">
                    <span className="game-icon">{icon}</span>
                    <h3>{title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                        <button className="btn-small">{t('menu.play')}</button>
                        <button
                            className="btn-small"
                            style={{ background: 'transparent', border: 'var(--border-width) solid var(--card-border)', color: 'var(--card-border)' }}
                            onClick={handleFlip}
                        >
                            {t('menu.info')}
                        </button>
                    </div>
                </div>

                {/* Back Side */}
                <div className="game-card-back">
                    <h3 style={{ fontFamily: 'var(--font-retro)', color: 'var(--primary-color)', margin: 0 }}>{title}</h3>
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
