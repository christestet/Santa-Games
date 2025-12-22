import React from 'react';

interface HUDProps {
    score: number;
    timeLeft: number;
    frozen?: boolean;
    combo?: number;
    className?: string; // To allow extra positioning if needed
}

export const HUD: React.FC<HUDProps> = ({ score, timeLeft, frozen = false, combo = 0, className = '' }) => {
    return (
        <>
            <div className={`score-display ${className}`}>Punkte: {score}</div>
            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''} ${className}`}>
                {frozen ? '❄️' : '⏳'} {timeLeft}
            </div>
            {combo > 1 && (
                <div className={`combo-display ${combo > 5 ? 'combo-shake' : ''}`}>
                    COMBO x{combo} 🔥
                </div>
            )}
        </>
    );
};
