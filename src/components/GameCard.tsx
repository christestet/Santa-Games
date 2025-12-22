import { useState } from 'react';

interface GameCardProps {
    title: string;
    icon: string;
    instructions: string;
    onPlay: () => void;
}

export default function GameCard({ title, icon, instructions, onPlay }: GameCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    return (
        <div className={`game-card-container ${isFlipped ? 'is-flipped' : ''}`}>
            <div className="game-card-inner">
                {/* Front Side */}
                <div className="game-card-front" onClick={onPlay}>
                    <span className="game-icon">{icon}</span>
                    <h3>{title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                        <button className="btn-small">SPIELEN</button>
                        <button
                            className="btn-small"
                            style={{ background: 'transparent', border: '1px solid var(--antique-gold)', color: 'var(--antique-gold)' }}
                            onClick={handleFlip}
                        >
                            INFO
                        </button>
                    </div>
                </div>

                {/* Back Side */}
                <div className="game-card-back">
                    <h3 style={{ fontFamily: 'var(--font-festive)', color: 'var(--warm-gold)', margin: 0 }}>{title}</h3>
                    <p className="instruction-text">{instructions}</p>
                    <button className="btn-small" onClick={handleFlip}>
                        ZURÜCK
                    </button>
                </div>
            </div>
        </div>
    );
}
