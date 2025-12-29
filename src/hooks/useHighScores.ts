import { useState, useEffect, useCallback, useTransition } from 'react';
import { config } from '../config';
import { isGamePlayable } from '@constants/gameConstants';

export interface Score {
    name: string;
    score: number;
    time?: number;
    timestamp?: number;
}

export type ScoreError = 'fetch' | 'submit' | null;

export const useHighScores = () => {
    const [highScores, setHighScores] = useState<Score[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ScoreError>(null);
    const [isPending, startTransition] = useTransition();

    const fetchScores = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all scores if game has expired, otherwise top scores only
            const showAll = !isGamePlayable();
            const url = showAll ? `${config.apiUrl}?all=true` : config.apiUrl;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();

            // Use React 19 transition for non-blocking state updates
            startTransition(() => {
                if (Array.isArray(data)) {
                    setHighScores(data);
                } else {
                    setHighScores([]);
                }
            });
        } catch (e) {
            console.error("Failed to fetch scores", e);
            setError('fetch');
            setHighScores([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const submitScore = async (name: string, score: number, time?: number, retryCount = 0): Promise<boolean> => {
        const MAX_RETRIES = 3;
        setError(null);

        try {
            const res = await fetch(config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score, time })
            });

            if (!res.ok) {
                // Auto-retry on 503 (lock timeout) or 500 (server error)
                if ((res.status === 503 || res.status === 500) && retryCount < MAX_RETRIES) {
                    console.log(`🔄 Retrying submission (${retryCount + 1}/${MAX_RETRIES})...`);
                    // Exponential backoff: 1s, 2s, 3s
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    return submitScore(name, score, time, retryCount + 1);
                }
                throw new Error(`Server returned ${res.status}`);
            }

            const data = await res.json();

            // Use scores from response if available (eliminates race condition)
            if (data.scores && Array.isArray(data.scores)) {
                startTransition(() => {
                    setHighScores(data.scores);
                });
            } else {
                // Fallback: fetch scores
                await fetchScores();
            }

            return true;
        } catch (e) {
            // Auto-retry on network errors
            if (retryCount < MAX_RETRIES) {
                console.log(`🔄 Retrying submission after error (${retryCount + 1}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return submitScore(name, score, time, retryCount + 1);
            }

            console.error("❌ Submission failed after retries", e);
            setError('submit');
            return false;
        }
    };

    useEffect(() => {
        fetchScores();
    }, [fetchScores]);

    return {
        highScores,
        isLoading: isLoading || isPending,
        error,
        fetchScores,
        submitScore
    };
};
