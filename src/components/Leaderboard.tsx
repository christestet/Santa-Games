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
    defaultTime?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
    scores,
    isLoading,
    error,
    onRetry,
    limit = 5,
    defaultTime = 60
}) => {
    const { t } = useLanguage();
    const gameExpired = !isGamePlayable();

    // Available play time durations
    const timeOptions = [30, 60, 90, 120];

    // State for selected time filter - use defaultTime if it's one of the valid options
    const initialTime = timeOptions.includes(defaultTime) ? defaultTime : 60;
    const [selectedTime, setSelectedTime] = useState<number>(initialTime);

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

            {/* Time duration tabs - Mobile optimized */}
            <div className="flex gap-2 justify-center mb-4 flex-wrap px-2">
                {timeOptions.map(time => {
                    const scoreCount = scores.filter(s => s.time === time).length;
                    return (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`flex-1 min-w-[70px] max-w-[100px] px-3 py-2 rounded-lg font-bold transition-all ${
                                selectedTime === time
                                    ? 'bg-[var(--primary-color)] text-white border-2 border-[var(--primary-color)] opacity-100'
                                    : 'bg-transparent border-2 border-[var(--card-border)] opacity-60 hover:opacity-80'
                            }`}
                            style={{
                                fontFamily: 'var(--font-retro)',
                                fontSize: 'clamp(0.75rem, 3vw, 0.9rem)'
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <span>{time}s</span>
                                {gameExpired && scoreCount > 0 && (
                                    <span className="text-[0.7em] opacity-70">
                                        ({scoreCount})
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
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
                    {displayScores.map((s, i) => {
                        // Scale down font size for longer names
                        const nameLength = s.name.length;
                        const fontSize = nameLength > 12 ? '0.85em' : nameLength > 8 ? '0.95em' : '1em';

                        return (
                            <div key={i} className="score-row">
                                <span style={{ fontSize }}>{i + 1}. {s.name}</span>
                                <span className="text-[var(--accent-color)]">
                                    {s.score}
                                    {s.timestamp && (
                                        <span className="text-[0.8em] opacity-80 ml-2">
                                            ({new Date(s.timestamp).toLocaleDateString('en-GB', {
                                                year: '2-digit',
                                                month: '2-digit',
                                                day: '2-digit'
                                            })})
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
