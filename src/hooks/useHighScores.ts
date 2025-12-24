import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';
import { useLanguage } from '../components/LanguageContext';
import { isGamePlayable } from '@constants/gameConstants';

export interface Score {
    name: string;
    score: number;
    time?: number;
    timestamp?: number;
}

export const useHighScores = () => {
    const { t } = useLanguage();
    const [highScores, setHighScores] = useState<Score[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            if (Array.isArray(data)) {
                setHighScores(data);
            } else {
                setHighScores([]);
            }
        } catch (e) {
            console.error("Failed to fetch scores", e);
            setError(t('hooks.fetchError'));
            setHighScores([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const submitScore = async (name: string, score: number, time?: number) => {
        setError(null);
        try {
            const res = await fetch(config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score, time })
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            await fetchScores();
            return true;
        } catch (e) {
            console.error("Submission failed", e);
            setError(t('hooks.submitError'));
            return false;
        }
    };

    useEffect(() => {
        fetchScores();
    }, [fetchScores]);

    return {
        highScores,
        isLoading,
        error,
        fetchScores,
        submitScore
    };
};
