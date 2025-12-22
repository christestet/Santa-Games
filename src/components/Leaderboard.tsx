import React from 'react';
import { useLanguage } from '../components/LanguageContext';

interface Score {
    name: string;
    score: number;
}

interface LeaderboardProps {
    scores: Score[];
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    limit?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
    scores,
    isLoading,
    error,
    onRetry,
    limit = 5
}) => {
    const { t } = useLanguage();
    return (
        <div className="leaderboard frost-card">
            <h2>🏆 {t('game.leaderboard')}</h2>
            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner">⏳</div>
                    <p>{t('common.loading')}</p>
                </div>
            ) : error ? (
                <div style={{ padding: '1rem', color: '#ff6b6b' }}>
                    <p>{error}</p>
                    {onRetry && (
                        <button className="btn-small" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
                            {t('common.retry')}
                        </button>
                    )}
                </div>
            ) : scores.length === 0 ? (
                <p style={{ padding: '1rem', opacity: 0.7 }}>{t('game.noScores')}</p>
            ) : (
                scores.slice(0, limit).map((s, i) => (
                    <div key={i} className="score-row">
                        <span>{i + 1}. {s.name}</span>
                        <span style={{ color: 'var(--christmas-gold)' }}>{s.score}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default Leaderboard;
