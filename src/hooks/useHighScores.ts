import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';

export interface Score {
    name: string;
    score: number;
}

export const useHighScores = () => {
    const [highScores, setHighScores] = useState<Score[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchScores = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(config.apiUrl);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setHighScores(data);
            } else {
                setHighScores([]);
            }
        } catch (e) {
            console.error("Failed to fetch scores", e);
            setError("Bestenliste konnte nicht geladen werden");
            setHighScores([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const submitScore = async (name: string, score: number) => {
        setError(null);
        try {
            const res = await fetch(config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score })
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            await fetchScores();
            return true;
        } catch (e) {
            console.error("Submission failed", e);
            setError("Score konnte nicht gespeichert werden. Versuche es erneut.");
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
