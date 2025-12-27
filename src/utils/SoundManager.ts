/**
 * Shared Sound Manager for game audio
 * Uses Web Audio API for retro sound effects
 */
export class SoundManager {
    ctx: AudioContext | null = null;
    muted: boolean = false;

    constructor() {
        try {
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // Gift Toss / Reindeer Run: Throw sound
    playThrow() {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    // Gift Toss: Hit chimney / Snowball Hunt: Hit targets
    playHit(type?: 'gift' | 'coal' | 'gold' | 'time' | 'ice' | 'parcel') {
        if (!type) {
            // Default for Gift Toss
            this.playTone(400, 'sine', 0.1, 0.1);
            return;
        }

        // Snowball Hunt specific sounds
        switch (type) {
            case 'gift':
            case 'parcel':
                this.playTone(600, 'sine', 0.1, 0.1); break;
            case 'gold':
                this.playTone(800, 'square', 0.2, 0.1); break;
            case 'coal':
                this.playTone(100, 'sawtooth', 0.3, 0.1); break;
            case 'time':
                this.playTone(1000, 'sine', 0.1, 0.05); break;
            case 'ice':
                this.playTone(1200, 'triangle', 0.3, 0.1); break;
        }
    }

    // Gift Toss: Hit obstacle
    playPoof() {
        this.playTone(80, 'sawtooth', 0.1, 0.1);
    }

    // Reindeer Run: Jump
    playJump() {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Reindeer Run: Score point
    playScore() {
        this.playTone(600, 'sine', 0.08, 0.06);
    }

    // Reindeer Run / Gift Toss: Game Over
    playGameOver() {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    // Reindeer Run: Snowflake powerup collected
    playSnowflake() {
        if (!this.ctx || this.muted) return;
        // Magical sparkle sound - sweeping high notes
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(1600, this.ctx.currentTime + 0.3);
        osc2.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 0.3);
        osc2.stop(this.ctx.currentTime + 0.3);
    }

    /**
     * Resume audio context (needed for autoplay policies)
     */
    resume() {
        this.ctx?.resume();
    }

    // Snowball Hunt: Hit different target types
    playSplat() {
        this.playTone(100, 'triangle', 0.1, 0.05);
    }
}
