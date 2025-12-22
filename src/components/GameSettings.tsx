import { GAME_CONFIG } from '../constants/gameConfig'

interface GameSettingsProps {
    settings: typeof GAME_CONFIG;
    onUpdate: (newSettings: typeof GAME_CONFIG) => void;
    onClose: () => void;
}

export default function GameSettings({ settings, onUpdate, onClose }: GameSettingsProps) {
    const handleTimerChange = (val: number) => {
        onUpdate({
            ...settings,
            TIMER: Math.max(10, Math.min(300, val))
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')} Min` : `${secs} Sek`;
    };

    const presets = [30, 60, 90, 120];

    return (
        <div className="settings-overlay frost-card" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center',
            width: '90%',
            maxWidth: '400px'
        }}>
            <h2 style={{ fontFamily: 'var(--font-festive)', color: 'var(--warm-gold)', fontSize: '2.5rem', margin: 0 }}>
                Einstellungen ⚙️
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                <label style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Spieldauer: <span style={{ color: 'var(--warm-gold)', fontSize: '1.4rem' }}>{formatTime(settings.TIMER)}</span>
                </label>

                <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={settings.TIMER}
                    onChange={(e) => handleTimerChange(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                />

                <div className="preset-container">
                    {presets.map(p => (
                        <button
                            key={p}
                            className={`btn-preset ${settings.TIMER === p ? 'active' : ''}`}
                            onClick={() => handleTimerChange(p)}
                        >
                            {p}s
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn-start" onClick={onClose} style={{ fontSize: '1.2rem', padding: '0.5rem 2rem' }}>
                    FERTIG
                </button>
            </div>
        </div>
    );
}
