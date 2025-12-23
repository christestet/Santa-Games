import React from 'react';
import { Button } from './Button';
import { useLanguage } from '../LanguageContext';
import { useSound } from '../SoundContext';
import { useTheme } from '../ThemeContext';
import GameIcon from '../GameIcon';

interface HUDProps {
    score: number;
    timeLeft: number;
    frozen?: boolean;
    combo?: number;
    className?: string; // To allow extra positioning if needed
    onPause?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ score, timeLeft, frozen = false, combo = 0, className = '', onPause }) => {
    const { t } = useLanguage();
    const { isMuted, toggleMute } = useSound();
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <div className={`score-display ${className}`}>{t('common.score')}: {score}</div>

            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''} ${className}`}>
                <span>{frozen ? <GameIcon name="snowflake" size={20} /> : <GameIcon name="timer" size={20} />} {timeLeft}</span>
                <div className="hud-controls">
                    <Button
                        variant="icon"
                        size="small"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMute();
                        }}
                        className="hud-btn"
                    >
                        {isMuted ? <GameIcon name="sound_off" size={20} /> : <GameIcon name="sound_on" size={20} />}
                    </Button>
                    <Button
                        variant="icon"
                        size="small"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTheme();
                        }}
                        className="hud-btn"
                    >
                        {theme === 'classic' ? <GameIcon name="santa" size={24} /> : <GameIcon name="grinch" size={24} />}
                    </Button>
                    {onPause && (
                        <Button
                            variant="icon"
                            size="small"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPause();
                            }}
                            className="hud-btn"
                        >
                            <GameIcon name="pause" size={24} />
                        </Button>
                    )}
                </div>
            </div >

            {combo > 1 && (
                <div className={`combo-display ${combo > 5 ? 'combo-shake' : ''}`}>
                    COMBO x{combo} 🔥
                </div>
            )
            }
        </>
    );
};
