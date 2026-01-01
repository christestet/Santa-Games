export interface Score {
    name: string;
    score: number;
    time?: number;
    timestamp?: number;
}

export interface Statistics {
    // Hall of Fame
    mostActivePlayer: { name: string; count: number } | null;
    topScorer: { name: string; score: number } | null;

    // Interessante Zahlen
    totalGames: number;
    totalPlayers: number;
    averageScore: number;
    highestScore: number;
    totalPoints: number;

    // Zeitverteilung
    timeDistribution: { time: number; count: number; percentage: number }[];
    favoriteTime: number;

    // Absurde Umrechnungen
    conversions: {
        chimneys: number;
        gifts: number;
        cookies: number;
        milkGlasses: number;
        reindeerMiles: number;
    };

    // Zeitbasierte Muster
    playsByWeekday: { day: number; dayName: string; count: number }[];
    playsByHour: { hour: number; count: number }[];
    busiestDay: { day: number; dayName: string; count: number } | null;
    busiestHour: { hour: number; count: number } | null;
    firstGame: { name: string; timestamp: number } | null;
    latestGame: { name: string; timestamp: number } | null;
}

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function calculateStatistics(scores: Score[]): Statistics {
    // Edge case: keine Scores
    if (scores.length === 0) {
        return {
            mostActivePlayer: null,
            topScorer: null,
            totalGames: 0,
            totalPlayers: 0,
            averageScore: 0,
            highestScore: 0,
            totalPoints: 0,
            timeDistribution: [],
            favoriteTime: 60,
            conversions: {
                chimneys: 0,
                gifts: 0,
                cookies: 0,
                milkGlasses: 0,
                reindeerMiles: 0
            },
            playsByWeekday: [],
            playsByHour: [],
            busiestDay: null,
            busiestHour: null,
            firstGame: null,
            latestGame: null
        };
    }

    // Grundlegende Statistiken
    const totalGames = scores.length;
    const totalPoints = scores.reduce((sum, s) => sum + s.score, 0);
    const averageScore = Math.floor(totalPoints / totalGames);
    const highestScore = Math.max(...scores.map(s => s.score));

    // Unique Players
    const uniqueNames = new Set(scores.map(s => s.name));
    const totalPlayers = uniqueNames.size;

    // Most Active Player
    const playerCounts = new Map<string, number>();
    scores.forEach(s => {
        playerCounts.set(s.name, (playerCounts.get(s.name) || 0) + 1);
    });

    let mostActivePlayer: { name: string; count: number } | null = null;
    let maxCount = 0;
    playerCounts.forEach((count, name) => {
        if (count > maxCount) {
            maxCount = count;
            mostActivePlayer = { name, count };
        }
    });

    // Top Scorer
    const topScoreEntry = scores.reduce((max, s) => (s.score > max.score ? s : max), scores[0]);
    const topScorer = { name: topScoreEntry.name, score: topScoreEntry.score };

    // Zeitverteilung
    const timeCounts = new Map<number, number>();
    scores.forEach(s => {
        const time = s.time || 60;
        timeCounts.set(time, (timeCounts.get(time) || 0) + 1);
    });

    const timeDistribution = Array.from(timeCounts.entries())
        .map(([time, count]) => ({
            time,
            count,
            percentage: Math.round((count / totalGames) * 100)
        }))
        .sort((a, b) => b.count - a.count);

    const favoriteTime = timeDistribution.length > 0 ? timeDistribution[0].time : 60;

    // Absurde Umrechnungen
    const conversions = {
        chimneys: Math.floor(totalPoints / 100),        // 100 Punkte = 1 Schornstein
        gifts: Math.floor(totalPoints / 50),            // 50 Punkte = 1 Geschenk
        cookies: Math.floor(totalPoints / 25),          // 25 Punkte = 1 Keks
        milkGlasses: Math.floor(totalPoints / 75),      // 75 Punkte = 1 Glas Milch
        reindeerMiles: Math.floor(totalPoints / 500)    // 500 Punkte = 1 Meile Rentier-Flug
    };

    // Zeitbasierte Muster (nur wenn timestamps vorhanden)
    const scoresWithTimestamp = scores.filter(s => s.timestamp);

    let playsByWeekday: { day: number; dayName: string; count: number }[] = [];
    let playsByHour: { hour: number; count: number }[] = [];
    let busiestDay: { day: number; dayName: string; count: number } | null = null;
    let busiestHour: { hour: number; count: number } | null = null;
    let firstGame: { name: string; timestamp: number } | null = null;
    let latestGame: { name: string; timestamp: number } | null = null;

    if (scoresWithTimestamp.length > 0) {
        // Wochentag-Analyse
        const weekdayCounts = new Map<number, number>();
        scoresWithTimestamp.forEach(s => {
            const date = new Date(s.timestamp!);
            const day = date.getDay(); // 0 = Sunday, 6 = Saturday
            weekdayCounts.set(day, (weekdayCounts.get(day) || 0) + 1);
        });

        playsByWeekday = Array.from(weekdayCounts.entries())
            .map(([day, count]) => ({
                day,
                dayName: WEEKDAY_NAMES[day],
                count
            }))
            .sort((a, b) => b.count - a.count);

        if (playsByWeekday.length > 0) {
            busiestDay = playsByWeekday[0];
        }

        // Stunden-Analyse
        const hourCounts = new Map<number, number>();
        scoresWithTimestamp.forEach(s => {
            const date = new Date(s.timestamp!);
            const hour = date.getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        playsByHour = Array.from(hourCounts.entries())
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => b.count - a.count);

        if (playsByHour.length > 0) {
            busiestHour = playsByHour[0];
        }

        // First and Latest Game
        const sortedByTime = [...scoresWithTimestamp].sort((a, b) => a.timestamp! - b.timestamp!);
        firstGame = {
            name: sortedByTime[0].name,
            timestamp: sortedByTime[0].timestamp!
        };
        latestGame = {
            name: sortedByTime[sortedByTime.length - 1].name,
            timestamp: sortedByTime[sortedByTime.length - 1].timestamp!
        };
    }

    return {
        mostActivePlayer,
        topScorer,
        totalGames,
        totalPlayers,
        averageScore,
        highestScore,
        totalPoints,
        timeDistribution,
        favoriteTime,
        conversions,
        playsByWeekday,
        playsByHour,
        busiestDay,
        busiestHour,
        firstGame,
        latestGame
    };
}
