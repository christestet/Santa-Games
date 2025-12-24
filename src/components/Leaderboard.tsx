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
            <h2 className="flex items-center gap-2 justify-center">
                <GameIcon name="trophy" size={24} /> {t('game.leaderboard')}
            </h2>
            {isLoading ? (
                <div className="p-8 text-center">
                    <div className="spinner">⏳</div>
                    <p>{t('common.loading')}</p>
                </div>
            ) : error ? (
                <div className="p-4 text-[#ff6b6b]">
                    <p>{error}</p>
                    {onRetry && (
                        <button className="btn-small mt-2" onClick={onRetry}>
                            {t('common.retry')}
                        </button>
                    )}
                </div>
            ) : scores.length === 0 ? (
                <p className="p-4 opacity-70">{t('game.noScores')}</p>
            ) : (
                scores.slice(0, limit).map((s, i) => (
                    <div key={i} className="score-row">
                        <span>{i + 1}. {s.name}</span>
                        <span className="text-[var(--accent-color)]">
                            {s.score}
                            {(s.time || s.timestamp) && (
                                <span className="text-[0.8em] opacity-80 ml-2">
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
