import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import GameIcon from './GameIcon';

interface Score {
    name: string;
    score: number;
    time?: number;
    timestamp?: number;
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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <GameIcon name="trophy" size={24} /> {t('game.leaderboard')}
            </h2>
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
                        <span style={{ color: 'var(--accent-color)' }}>
                            {s.score}
                            {(s.time || s.timestamp) && (
                                <span style={{ fontSize: '0.8em', opacity: 0.8, marginLeft: '0.5rem' }}>
                                    (
                                    {s.time ? `${s.time}s` : ''}
                                    {s.time && s.timestamp ? ' - ' : ''}
                                    {s.timestamp ? new Date(s.timestamp).toLocaleDateString('en-GB', {
                                        year: '2-digit',
                                        month: '2-digit',
                                        day: '2-digit'
                                    }) : ''}
                                    )
                                </span>
                            )}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
};

export default Leaderboard;
