import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useLanguage } from './LanguageContext';
import GameIcon from './GameIcon';
import { calculateStatistics } from '@/utils/statisticsCalculator';

interface Score {
    name: string;
    score: number;
    time?: number;
    timestamp?: number;
}

interface StatisticsProps {
    scores: Score[];
    onClose: () => void;
}

export default function Statistics({ scores, onClose }: StatisticsProps) {
    const { t } = useLanguage();
    const stats = calculateStatistics(scores);

    // Edge case: Keine Daten
    if (stats.totalGames === 0) {
        return (
            <Modal
                isOpen={true}
                onClose={onClose}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t('stats.title')} <GameIcon name="chart" size={24} />
                    </div>
                }
            >
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <GameIcon name="snowman" size={64} />
                    <p style={{ fontSize: 'var(--text-heading-md)', marginTop: '1rem' }}>
                        {t('stats.noDataYet')}
                    </p>
                    <Button onClick={onClose} style={{ marginTop: '2rem' }}>
                        {t('common.done')}
                    </Button>
                </div>
            </Modal>
        );
    }

    // Helper: Format number with thousands separator
    const formatNumber = (num: number) => {
        return num.toLocaleString('de-DE');
    };

    // Helper: Format date
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t('stats.title')} <GameIcon name="chart" size={24} />
                </div>
            }
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                width: '100%',
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: '0.5rem'
            }}>
                {/* Hall of Fame */}
                <Card className="frost-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-retro)',
                        color: 'var(--primary-color)',
                        marginBottom: '1rem',
                        fontSize: 'var(--text-heading-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <GameIcon name="trophy" size={32} />
                        {t('stats.hallOfFame')}
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {/* Most Active Player */}
                        {stats.mostActivePlayer && (
                            <div style={{
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    fontSize: 'var(--text-small)',
                                    opacity: 0.8,
                                    marginBottom: '0.5rem'
                                }}>
                                    {t('stats.mostActive')}
                                </div>
                                <div style={{
                                    fontSize: 'var(--text-heading-lg)',
                                    fontWeight: 'bold',
                                    color: 'var(--primary-color)'
                                }}>
                                    {stats.mostActivePlayer.name}
                                </div>
                                <div style={{ fontSize: 'var(--text-body)' }}>
                                    {stats.mostActivePlayer.count} {t('stats.games')}
                                </div>
                                <div style={{
                                    fontSize: 'var(--text-small)',
                                    opacity: 0.7,
                                    marginTop: '0.5rem',
                                    fontStyle: 'italic'
                                }}>
                                    {t('stats.veryImpressive')}
                                </div>
                            </div>
                        )}

                        {/* Top Scorer */}
                        {stats.topScorer && (
                            <div style={{
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    fontSize: 'var(--text-small)',
                                    opacity: 0.8,
                                    marginBottom: '0.5rem'
                                }}>
                                    {t('stats.topScorer')}
                                </div>
                                <div style={{
                                    fontSize: 'var(--text-heading-lg)',
                                    fontWeight: 'bold',
                                    color: 'var(--primary-color)'
                                }}>
                                    {stats.topScorer.name}
                                </div>
                                <div style={{ fontSize: 'var(--text-body)' }}>
                                    {formatNumber(stats.topScorer.score)} {t('stats.points')}
                                </div>
                                <div style={{
                                    fontSize: 'var(--text-small)',
                                    opacity: 0.7,
                                    marginTop: '0.5rem',
                                    fontStyle: 'italic'
                                }}>
                                    {t('stats.santaIsProud')}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Interessante Zahlen */}
                <Card className="frost-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-retro)',
                        color: 'var(--primary-color)',
                        marginBottom: '1rem',
                        fontSize: 'var(--text-heading-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <GameIcon name="star" size={32} />
                        {t('stats.interestingNumbers')}
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem'
                    }}>
                        <StatItem
                            label={t('stats.totalGames')}
                            value={formatNumber(stats.totalGames)}
                        />
                        <StatItem
                            label={t('stats.uniquePlayers')}
                            value={formatNumber(stats.totalPlayers)}
                        />
                        <StatItem
                            label={t('stats.averageScore')}
                            value={formatNumber(stats.averageScore)}
                        />
                        <StatItem
                            label={t('stats.highestScore')}
                            value={formatNumber(stats.highestScore)}
                        />
                    </div>

                    <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        fontSize: 'var(--text-small)',
                        opacity: 0.7,
                        fontStyle: 'italic'
                    }}>
                        {t('stats.kidsAreHappy')}
                    </div>
                </Card>

                {/* Absurde Umrechnungen */}
                <Card className="frost-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-retro)',
                        color: 'var(--primary-color)',
                        marginBottom: '1rem',
                        fontSize: 'var(--text-heading-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <GameIcon name="gift" size={32} />
                        {t('stats.conversions')}
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.75rem',
                        fontSize: 'var(--text-body)'
                    }}>
                        <ConversionItem
                            icon={<GameIcon name="chimney" size={20} />}
                            label={t('stats.chimneysClimbed')}
                            value={formatNumber(stats.conversions.chimneys)}
                        />
                        <ConversionItem
                            icon={<GameIcon name="gift" size={20} />}
                            label={t('stats.giftsDelivered')}
                            value={formatNumber(stats.conversions.gifts)}
                        />
                        <ConversionItem
                            icon={<GameIcon name="snowflake" size={20} />}
                            label={t('stats.cookiesEaten')}
                            value={formatNumber(stats.conversions.cookies)}
                        />
                        <ConversionItem
                            icon={<GameIcon name="snowman" size={20} />}
                            label={t('stats.milkGlasses')}
                            value={formatNumber(stats.conversions.milkGlasses)}
                        />
                        <ConversionItem
                            icon={<GameIcon name="reindeer" size={20} />}
                            label={t('stats.reindeerMiles')}
                            value={formatNumber(stats.conversions.reindeerMiles)}
                        />
                    </div>

                    <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        fontSize: 'var(--text-small)',
                        opacity: 0.7,
                        fontStyle: 'italic'
                    }}>
                        {t('stats.timeForBreak')}
                    </div>
                </Card>

                {/* Spielgewohnheiten */}
                <Card className="frost-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-retro)',
                        color: 'var(--primary-color)',
                        marginBottom: '1rem',
                        fontSize: 'var(--text-heading-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <GameIcon name="timer" size={32} />
                        {t('stats.playHabits')}
                    </h3>

                    {/* Favorite Time */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: 'var(--text-small)',
                            opacity: 0.8,
                            marginBottom: '0.5rem'
                        }}>
                            {t('stats.favoriteTime')}
                        </div>
                        <div style={{
                            fontSize: 'var(--text-heading-lg)',
                            fontWeight: 'bold',
                            color: 'var(--primary-color)'
                        }}>
                            {stats.favoriteTime} {t('stats.seconds')}
                        </div>
                        {stats.timeDistribution.length > 0 && (
                            <div style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>
                                {stats.timeDistribution[0].percentage}% {t('stats.favoriteTimeText')} {stats.favoriteTime}s!
                            </div>
                        )}
                    </div>

                    {/* Busiest Day */}
                    {stats.busiestDay && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{
                                fontSize: 'var(--text-small)',
                                opacity: 0.8,
                                marginBottom: '0.5rem'
                            }}>
                                {t('stats.busiestDay')}
                            </div>
                            <div style={{
                                fontSize: 'var(--text-heading-md)',
                                fontWeight: 'bold',
                                color: 'var(--primary-color)'
                            }}>
                                {t(`stats.${stats.busiestDay.dayName}`)} ({stats.busiestDay.count} {t('stats.games')})
                            </div>
                        </div>
                    )}

                    {/* First and Latest Player */}
                    {stats.firstGame && stats.latestGame && (
                        <div style={{
                            marginTop: '1rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1rem',
                            fontSize: 'var(--text-small)'
                        }}>
                            <div>
                                <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>
                                    {t('stats.firstPlayer')}
                                </div>
                                <div style={{ fontWeight: 'bold' }}>{stats.firstGame.name}</div>
                                <div style={{ opacity: 0.7 }}>{formatDate(stats.firstGame.timestamp)}</div>
                            </div>
                            <div>
                                <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>
                                    {t('stats.latestPlayer')}
                                </div>
                                <div style={{ fontWeight: 'bold' }}>{stats.latestGame.name}</div>
                                <div style={{ opacity: 0.7 }}>{formatDate(stats.latestGame.timestamp)}</div>
                            </div>
                        </div>
                    )}

                    <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        fontSize: 'var(--text-small)',
                        opacity: 0.7,
                        fontStyle: 'italic'
                    }}>
                        {t('stats.thanksForHelp')}
                    </div>
                </Card>
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <Button onClick={onClose}>
                    {t('common.done')}
                </Button>
            </div>
        </Modal>
    );
}

// Helper component for stat items
function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px'
        }}>
            <div style={{
                fontSize: 'var(--text-small)',
                opacity: 0.8,
                marginBottom: '0.25rem'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: 'var(--text-heading-md)',
                fontWeight: 'bold',
                color: 'var(--primary-color)'
            }}>
                {value}
            </div>
        </div>
    );
}

// Helper component for conversion items
function ConversionItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px'
        }}>
            {icon}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-small)', opacity: 0.8 }}>
                    {label}
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {value}
                </div>
            </div>
        </div>
    );
}
