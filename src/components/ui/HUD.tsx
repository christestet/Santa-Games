import { Button } from './Button';

interface HUDProps {
    score: number;
    timeLeft: number;
    frozen?: boolean;
    combo?: number;
    className?: string; // To allow extra positioning if needed
    onPause?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ score, timeLeft, frozen = false, combo = 0, className = '', onPause }) => {
    return (
        <>
            <div className={`score-display ${className}`}>Punkte: {score}</div>

            <div className={`timer-display ${timeLeft < 10 ? 'timer-pulse' : ''} ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{frozen ? '❄️' : '⏳'} {timeLeft}</span>
                {onPause && (
                    <Button
                        variant="icon"
                        size="small"
                        onClick={onPause}
                        style={{ padding: '0.2rem 0.6rem', fontSize: '1.2rem', minHeight: 'auto' }}
                    >
                        ⏸️
                    </Button>
                )}
            </div>

            {combo > 1 && (
                <div className={`combo-display ${combo > 5 ? 'combo-shake' : ''}`}>
                    COMBO x{combo} 🔥
                </div>
            )}
        </>
    );
};
