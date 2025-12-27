import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { isGamePlayable } from '@constants/gameConstants';
import { ScoreError } from '@hooks/useHighScores';
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
    error?: ScoreError;
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
    const gameExpired = !isGamePlayable();

    // Available play time durations
    const timeOptions = [30, 60, 90, 120];

    // State for selected time filter
    const [selectedTime, setSelectedTime] = useState<number>(60);

    // Filter scores by selected time duration
    const filteredScores = scores.filter(s => s.time === selectedTime);

    // Show all scores when game has expired, otherwise respect limit
    const displayLimit = gameExpired ? filteredScores.length : limit;
    const displayScores = filteredScores.slice(0, displayLimit);

    return (
        <div className="leaderboard frost-card">
            <h2 className="flex items-center gap-2 justify-center">
                <GameIcon name="trophy" size={24} /> {t('game.leaderboard')}
                {gameExpired && scores.length > 0 && (
                    <span className="text-sm opacity-70 ml-2">
                        ({scores.length} {scores.length === 1 ? t('game.player') : t('game.players')})
                    </span>
                )}
            </h2>

            {/* Time duration tabs */}
            <div className="flex gap-2 justify-center mb-4 flex-wrap">
                {timeOptions.map(time => (
                    <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            selectedTime === time
                                ? 'bg-[var(--primary-color)] text-white border-2 border-[var(--primary-color)] opacity-100'
                                : 'bg-transparent border-2 border-[var(--card-border)] opacity-60 hover:opacity-80'
                        }`}
                        style={{
                            fontFamily: 'var(--font-retro)',
                            fontSize: '0.9rem'
                        }}
                    >
                        {time}s
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="p-8 text-center">
                    <div className="spinner">⏳</div>
                    <p>{t('common.loading')}</p>
                </div>
            ) : error ? (
                <div className="p-4 text-[#ff6b6b]">
                    <p>{error === 'fetch' ? t('hooks.fetchError') : t('hooks.submitError')}</p>
                    {onRetry && (
                        <button className="btn-small mt-2" onClick={onRetry}>
                            {t('common.retry')}
                        </button>
                    )}
                </div>
            ) : filteredScores.length === 0 ? (
                <p className="p-4 opacity-70">
                    {t('game.noScores')} {selectedTime}s
                </p>
            ) : (
                <div className={gameExpired && displayScores.length > 10 ? 'max-h-96 overflow-y-auto' : ''}>
                    {displayScores.map((s, i) => (
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
