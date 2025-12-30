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
                    const isActive = selectedTime === time;
                    return (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`flex-1 min-w-[70px] max-w-[100px] px-3 py-2 font-bold uppercase transition-all ${
                                isActive
                                    ? 'bg-[var(--primary-color)] text-white opacity-100'
                                    : 'bg-transparent opacity-60 hover:opacity-80'
                            }`}
                            style={{
                                fontFamily: 'var(--font-retro)',
                                fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
                                border: 'var(--border-width) solid var(--card-border)',
                                boxShadow: isActive ? '4px 4px 0 rgba(0,0,0,1)' : '4px 4px 0 rgba(0,0,0,0.5)',
                                position: 'relative'
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
                <div
                    className={gameExpired && displayScores.length > 10 ? 'overflow-y-auto' : ''}
                    style={{
                        maxHeight: gameExpired && displayScores.length > 10 ? 'min(60vh, 500px)' : 'auto',
                        overscrollBehavior: 'contain',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {displayScores.map((s, i) => {
                        // Scale down font size for longer names
                        const nameLength = s.name.length;
                        const fontSize = nameLength > 12 ? '0.85em' : nameLength > 8 ? '0.95em' : '1em';

                        return (
                            <div
                                key={i}
                                className="score-row"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                                    gap: 'clamp(0.5rem, 2vw, 1rem)',
                                    flexWrap: 'nowrap'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: '1 1 auto',
                                        minWidth: 0
                                    }}
                                >
                                    {i + 1}. {s.name}
                                </span>
                                <span
                                    className="text-[var(--accent-color)]"
                                    style={{
                                        flex: '0 0 auto',
                                        textAlign: 'right',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {s.score}
                                    {s.timestamp && (
                                        <span
                                            className="text-[0.8em] opacity-80 ml-2"
                                            style={{
                                                display: window.innerWidth < 375 ? 'none' : 'inline'
                                            }}
                                        >
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
