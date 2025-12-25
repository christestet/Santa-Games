
export type GameType = 'snowball' | 'gift-toss' | 'reindeer-run' | 'none';
export type GameState = 'menu' | 'playing' | 'name-entry' | 'gameover';

export interface GameSettings {
    duration: number;
    spawnInterval: number;
    [key: string]: any;
}
