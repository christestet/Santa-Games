import React from 'react';

// Wir definieren die Namen der Icons als Union Type
export type GameIconName =
    | 'santa'
    | 'grinch'
    | 'reindeer'
    | 'tree'
    | 'gift'
    | 'snowflake'
    | 'melting_snowflake'
    | 'return_parcel'
    | 'chimney'
    | 'plane'
    | 'cloud'
    | 'timer'
    | 'coal'
    | 'star'
    | 'flag_us'
    | 'flag_de'
    | 'sound_on'
    | 'sound_off'
    | 'settings'
    | 'trophy'
    | 'parcel'
    | 'pause'
    | 'snowman'
    | 'rock'
    | 'branch'
    | 'github';

interface GameIconProps {
    name: GameIconName;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

type SpriteDefinition = {
    content: React.ReactNode;
};

const SPRITES: Record<GameIconName, SpriteDefinition> = {
    santa: {
        content: (
            <>
                {/* Mütze */}
                <rect x="8" y="2" width="4" height="4" fill="white" /> {/* Bommel */}
                <rect x="5" y="5" width="10" height="4" fill="#D32F2F" />
                <rect x="15" y="6" width="3" height="3" fill="#D32F2F" />
                <rect x="4" y="8" width="16" height="3" fill="white" /> {/* Pelzrand */}

                {/* Gesicht */}
                <rect x="5" y="11" width="14" height="5" fill="#FFCCBC" />
                <rect x="7" y="12" width="2" height="2" fill="#1565C0" /> {/* Augen */}
                <rect x="15" y="12" width="2" height="2" fill="#1565C0" />
                <rect x="10" y="13" width="4" height="2" fill="#E57373" opacity="0.5" /> {/* Wangen */}

                {/* Bart & Körper */}
                <rect x="4" y="16" width="16" height="6" fill="white" />
                <rect x="6" y="20" width="12" height="4" fill="white" />
                <rect x="3" y="19" width="18" height="5" fill="#D32F2F" z-index="-1"/> {/* Mantel Schultern */}
            </>
        )
    },
    grinch: {
        content: (
            <>
                {/* Kopf & Hals */}
                <rect x="8" y="4" width="8" height="14" fill="#76FF03" />
                <rect x="6" y="6" width="12" height="10" fill="#76FF03" />

                {/* Fell-Details (Tuft oben) */}
                <rect x="10" y="2" width="2" height="3" fill="#76FF03" />
                <rect x="11" y="1" width="1" height="2" fill="#64DD17" />

                {/* Gesichtszüge */}
                <rect x="7" y="9" width="3" height="2" fill="#FFEB3B" /> {/* Gelbe Augen */}
                <rect x="14" y="9" width="3" height="2" fill="#FFEB3B" />
                <rect x="8" y="10" width="1" height="1" fill="#1B5E20" /> {/* Pupillen */}
                <rect x="15" y="10" width="1" height="1" fill="#1B5E20" />

                {/* Böse Augenbrauen */}
                <rect x="6" y="8" width="4" height="1" fill="#33691E" />
                <rect x="14" y="8" width="4" height="1" fill="#33691E" />
                <rect x="10" y="9" width="4" height="1" fill="#33691E" opacity="0.5" /> {/* Falten */}

                {/* Grinsen */}
                <rect x="7" y="15" width="1" height="1" fill="#33691E" />
                <rect x="8" y="16" width="8" height="1" fill="#33691E" />
                <rect x="16" y="15" width="1" height="1" fill="#33691E" />

                {/* Schal / Hals */}
                <rect x="7" y="19" width="10" height="4" fill="#D32F2F" />
            </>
        )
    },
    reindeer: {
        content: (
            <>
                {/* Geweih */}
                <rect x="4" y="2" width="2" height="4" fill="#5D4037" />
                <rect x="18" y="2" width="2" height="4" fill="#5D4037" />
                <rect x="2" y="4" width="4" height="2" fill="#5D4037" />
                <rect x="18" y="4" width="4" height="2" fill="#5D4037" />

                {/* Kopf */}
                <rect x="6" y="7" width="12" height="12" fill="#8D6E63" />
                <rect x="4" y="9" width="16" height="8" fill="#8D6E63" />

                {/* Ohren */}
                <rect x="2" y="8" width="3" height="4" fill="#6D4C41" />
                <rect x="19" y="8" width="3" height="4" fill="#6D4C41" />

                {/* Gesicht */}
                <rect x="7" y="10" width="2" height="2" fill="black" /> {/* Augen */}
                <rect x="15" y="10" width="2" height="2" fill="black" />

                {/* Die rote Nase (glänzend) */}
                <rect x="9" y="14" width="6" height="5" fill="#D32F2F" />
                <rect x="10" y="15" width="2" height="2" fill="#FF5252" /> {/* Glanzlicht */}
            </>
        )
    },
    tree: {
        content: (
            <>
                {/* Stern */}
                <rect x="11" y="0" width="2" height="2" fill="#FFD700" />
                <rect x="10" y="1" width="4" height="2" fill="#FFEB3B" />

                {/* Baum-Ebenen */}
                <rect x="10" y="3" width="4" height="3" fill="#388E3C" />
                <rect x="8" y="5" width="8" height="4" fill="#2E7D32" />

                <rect x="7" y="8" width="10" height="4" fill="#388E3C" />
                <rect x="5" y="11" width="14" height="4" fill="#2E7D32" />

                <rect x="4" y="14" width="16" height="4" fill="#388E3C" />
                <rect x="2" y="17" width="20" height="4" fill="#2E7D32" />

                {/* Stamm */}
                <rect x="10" y="21" width="4" height="3" fill="#5D4037" />

                {/* Kugeln */}
                <rect x="13" y="6" width="2" height="2" fill="#F44336" />
                <rect x="6" y="12" width="2" height="2" fill="#2196F3" />
                <rect x="16" y="15" width="2" height="2" fill="#FFEB3B" />
                <rect x="8" y="18" width="2" height="2" fill="#E91E63" />
            </>
        )
    },
    gift: {
        content: (
            <>
                {/* Schleife oben */}
                <rect x="9" y="1" width="6" height="3" fill="#D32F2F" />
                <rect x="6" y="2" width="12" height="2" fill="#F44336" />
                <rect x="11" y="4" width="2" height="2" fill="#B71C1C" /> {/* Knoten */}

                {/* Box */}
                <rect x="3" y="6" width="18" height="16" fill="#4CAF50" />
                <rect x="19" y="7" width="2" height="15" fill="#388E3C" /> {/* Schatten Seite */}
                <rect x="3" y="20" width="18" height="2" fill="#388E3C" /> {/* Schatten Unten */}

                {/* Band vertikal */}
                <rect x="10" y="6" width="4" height="16" fill="#F44336" />

                {/* Band horizontal */}
                <rect x="3" y="11" width="18" height="4" fill="#F44336" />

                {/* Glanz auf dem Band */}
                <rect x="11" y="6" width="1" height="4" fill="#FF8A80" opacity="0.5" />
            </>
        )
    },
    snowflake: {
        content: (
            <>
                {/* Hauptachsen */}
                <rect x="11" y="2" width="2" height="20" fill="#B3E5FC" />
                <rect x="2" y="11" width="20" height="2" fill="#B3E5FC" />

                {/* Diagonalen */}
                <rect x="5" y="5" width="2" height="2" fill="#B3E5FC" />
                <rect x="17" y="5" width="2" height="2" fill="#B3E5FC" />
                <rect x="5" y="17" width="2" height="2" fill="#B3E5FC" />
                <rect x="17" y="17" width="2" height="2" fill="#B3E5FC" />
                <rect x="8" y="8" width="2" height="2" fill="#B3E5FC" />
                <rect x="14" y="8" width="2" height="2" fill="#B3E5FC" />
                <rect x="8" y="14" width="2" height="2" fill="#B3E5FC" />
                <rect x="14" y="14" width="2" height="2" fill="#B3E5FC" />

                {/* Spitzen-Details */}
                <rect x="11" y="0" width="2" height="2" fill="#E1F5FE" />
                <rect x="22" y="11" width="2" height="2" fill="#E1F5FE" />
                <rect x="0" y="11" width="2" height="2" fill="#E1F5FE" />
                <rect x="11" y="22" width="2" height="2" fill="#E1F5FE" />
            </>
        )
    },
    melting_snowflake: {
        content: (
            <>
                {/* Pfütze (Breiter und detaillierter) */}
                <rect x="2" y="20" width="20" height="3" fill="#4FC3F7" opacity="0.9" />
                <rect x="4" y="19" width="16" height="2" fill="#81D4FA" opacity="0.7" />
                <rect x="1" y="21" width="22" height="1" fill="#0288D1" opacity="0.3" /> {/* Schatten */}

                {/* Noch intakter oberer Teil */}
                <rect x="11" y="2" width="2" height="8" fill="#B3E5FC" />
                <rect x="6" y="6" width="3" height="2" fill="#B3E5FC" />
                <rect x="15" y="6" width="3" height="2" fill="#B3E5FC" />
                <rect x="7" y="5" width="2" height="2" fill="#E1F5FE" />
                <rect x="15" y="5" width="2" height="2" fill="#E1F5FE" />

                {/* Schmelzende Tropfen */}
                <rect x="11" y="12" width="2" height="3" fill="#4FC3F7" />
                <rect x="11" y="16" width="2" height="2" fill="#29B6F6" />

                <rect x="7" y="11" width="1" height="4" fill="#81D4FA" />
                <rect x="16" y="11" width="1" height="5" fill="#81D4FA" />

                <rect x="5" y="17" width="2" height="1" fill="#B3E5FC" opacity="0.5" />
            </>
        )
    },
    return_parcel: {
        content: (
            <>
                {/* Paket Box */}
                <rect x="2" y="5" width="20" height="16" fill="#8D6E63" />
                <rect x="2" y="5" width="20" height="4" fill="#A1887F" /> {/* Deckel */}
                <rect x="1" y="6" width="22" height="2" fill="#5D4037" opacity="0.2" /> {/* Schattenlinie */}

                {/* Großes Weißes Label */}
                <rect x="6" y="9" width="12" height="10" fill="#FFFFFF" />
                <rect x="6" y="18" width="12" height="1" fill="#EEEEEE" /> {/* Papier Schatten */}

                {/* Das R für Retoure (High Res) */}
                <rect x="9" y="11" width="2" height="6" fill="#D32F2F" /> {/* Vertikal */}
                <rect x="10" y="11" width="3" height="2" fill="#D32F2F" /> {/* Oben */}
                <rect x="13" y="12" width="2" height="2" fill="#D32F2F" /> {/* Bogen Rechts */}
                <rect x="10" y="14" width="3" height="2" fill="#D32F2F" /> {/* Mitte */}
                <rect x="12" y="15" width="2" height="2" fill="#D32F2F" /> {/* Bein Ansatz */}
                <rect x="13" y="16" width="2" height="2" fill="#D32F2F" /> {/* Bein */}
            </>
        )
    },
    chimney: {
        content: (
            <>
                {/* Schnee auf Kamin */}
                <rect x="2" y="2" width="20" height="4" fill="white" />
                <rect x="3" y="6" width="18" height="1" fill="#E0E0E0" />

                {/* Kamin Körper */}
                <rect x="4" y="7" width="16" height="17" fill="#8D6E63" />

                {/* Ziegelsteine (Muster) */}
                <rect x="5" y="8" width="4" height="2" fill="#5D4037" />
                <rect x="11" y="8" width="4" height="2" fill="#5D4037" />
                <rect x="17" y="8" width="2" height="2" fill="#5D4037" />

                <rect x="4" y="12" width="2" height="2" fill="#5D4037" />
                <rect x="8" y="12" width="4" height="2" fill="#5D4037" />
                <rect x="14" y="12" width="4" height="2" fill="#5D4037" />

                <rect x="5" y="16" width="4" height="2" fill="#5D4037" />
                <rect x="11" y="16" width="4" height="2" fill="#5D4037" />

                <rect x="8" y="20" width="4" height="2" fill="#5D4037" />
                <rect x="14" y="20" width="4" height="2" fill="#5D4037" />

                {/* Dunkles Inneres oben */}
                <rect x="5" y="1" width="14" height="2" fill="#3E2723" />
            </>
        )
    },
    plane: {
        content: (
            <>
                {/* Körper */}
                <rect x="6" y="10" width="14" height="4" fill="#D32F2F" />
                <rect x="8" y="14" width="10" height="2" fill="#B71C1C" />

                {/* Heckflosse */}
                <rect x="2" y="7" width="4" height="5" fill="#D32F2F" />

                {/* Flügel */}
                <rect x="10" y="4" width="6" height="16" fill="#2E7D32" />
                <rect x="12" y="2" width="2" height="20" fill="#388E3C" />

                {/* Propeller */}
                <rect x="20" y="11" width="2" height="2" fill="#555" />
                <rect x="22" y="6" width="1" height="12" fill="#B0BEC5" opacity="0.6" />

                {/* Cockpit */}
                <rect x="14" y="11" width="3" height="2" fill="#81D4FA" />
            </>
        )
    },
    cloud: {
        content: (
            <>
                <rect x="6" y="10" width="12" height="8" fill="white" />
                <rect x="3" y="13" width="18" height="6" fill="white" />
                <rect x="8" y="7" width="8" height="4" fill="white" />
                <rect x="16" y="11" width="4" height="4" fill="white" />
                <rect x="4" y="15" width="2" height="2" fill="#E0E0E0" /> {/* Schatten */}
            </>
        )
    },
    timer: {
        content: (
            <>
                <rect x="6" y="2" width="12" height="2" fill="#795548" />
                <rect x="6" y="20" width="12" height="2" fill="#795548" />
                <rect x="5" y="4" width="14" height="16" fill="#E3F2FD" /> {/* Glas */}

                {/* Sand oben */}
                <rect x="7" y="5" width="10" height="6" fill="#FFC107" />
                <rect x="9" y="11" width="6" height="1" fill="#FFC107" />

                {/* Sand unten */}
                <rect x="8" y="15" width="8" height="4" fill="#FFC107" />
                <rect x="10" y="14" width="4" height="1" fill="#FFC107" />

                {/* Rieseln */}
                <rect x="11" y="12" width="2" height="2" fill="#FFD54F" />
            </>
        )
    },
    coal: {
        content: (
            <>
                <rect x="6" y="10" width="12" height="10" fill="#212121" />
                <rect x="4" y="12" width="16" height="8" fill="#212121" />

                {/* Facetten / Brüche */}
                <rect x="8" y="12" width="4" height="4" fill="#424242" />
                <rect x="14" y="14" width="4" height="4" fill="#424242" />
                <rect x="5" y="15" width="3" height="3" fill="#424242" />

                {/* Tiefes Schwarz */}
                <rect x="10" y="16" width="3" height="3" fill="black" />
            </>
        )
    },
    star: {
        content: (
            <>
                <rect x="11" y="2" width="2" height="20" fill="#FFEB3B" />
                <rect x="2" y="11" width="20" height="2" fill="#FFEB3B" />
                <rect x="6" y="6" width="12" height="12" fill="#FFEB3B" />

                {/* Glanz Mitte */}
                <rect x="10" y="10" width="4" height="4" fill="#FFF176" />

                {/* Diagonalen */}
                <rect x="8" y="8" width="2" height="2" fill="#FBC02D" />
                <rect x="14" y="8" width="2" height="2" fill="#FBC02D" />
                <rect x="8" y="14" width="2" height="2" fill="#FBC02D" />
                <rect x="14" y="14" width="2" height="2" fill="#FBC02D" />
            </>
        )
    },
    flag_us: {
        content: (
            <>
                <rect x="2" y="4" width="20" height="16" fill="white" />
                {/* Rote Streifen */}
                <rect x="2" y="4" width="20" height="2" fill="#B71C1C" />
                <rect x="2" y="8" width="20" height="2" fill="#B71C1C" />
                <rect x="2" y="12" width="20" height="2" fill="#B71C1C" />
                <rect x="2" y="16" width="20" height="2" fill="#B71C1C" />

                {/* Blaues Feld */}
                <rect x="2" y="4" width="9" height="9" fill="#0D47A1" />

                {/* Sterne (Pixel) */}
                <rect x="3" y="5" width="1" height="1" fill="white" />
                <rect x="6" y="5" width="1" height="1" fill="white" />
                <rect x="9" y="5" width="1" height="1" fill="white" />
                <rect x="4" y="8" width="1" height="1" fill="white" />
                <rect x="7" y="8" width="1" height="1" fill="white" />
            </>
        )
    },
    flag_de: {
        content: (
            <>
                <rect x="2" y="5" width="20" height="5" fill="#212121" />
                <rect x="2" y="10" width="20" height="5" fill="#D50000" />
                <rect x="2" y="15" width="20" height="4" fill="#FFC107" />
            </>
        )
    },
    sound_on: {
        content: (
            <>
                {/* Speaker */}
                <rect x="2" y="8" width="4" height="8" fill="#424242" />
                <rect x="6" y="6" width="2" height="12" fill="#616161" />
                <rect x="8" y="4" width="2" height="16" fill="#212121" />
                <rect x="4" y="9" width="4" height="6" fill="#757575" />

                {/* Waves */}
                <rect x="12" y="8" width="2" height="8" fill="#212121" />
                <rect x="16" y="6" width="2" height="12" fill="#212121" />
                <rect x="20" y="4" width="2" height="16" fill="#212121" />
            </>
        )
    },
    sound_off: {
        content: (
            <>
                {/* Muted Speaker */}
                <rect x="2" y="8" width="4" height="8" fill="#9E9E9E" />
                <rect x="6" y="6" width="2" height="12" fill="#BDBDBD" />
                <rect x="8" y="4" width="2" height="16" fill="#616161" />

                {/* X Mark */}
                <rect x="14" y="8" width="2" height="2" fill="#D32F2F" />
                <rect x="16" y="10" width="2" height="2" fill="#D32F2F" />
                <rect x="18" y="12" width="2" height="2" fill="#D32F2F" />
                <rect x="16" y="14" width="2" height="2" fill="#D32F2F" />
                <rect x="14" y="16" width="2" height="2" fill="#D32F2F" />

                <rect x="20" y="8" width="2" height="2" fill="#D32F2F" />
                <rect x="20" y="16" width="2" height="2" fill="#D32F2F" />
            </>
        )
    },
    settings: {
        content: (
            <>
                {/* Ring */}
                <rect x="7" y="7" width="10" height="10" fill="#757575" />
                <rect x="9" y="9" width="6" height="6" fill="#212121" /> {/* Loch */}

                {/* Zähne Oben/Unten */}
                <rect x="10" y="4" width="4" height="3" fill="#9E9E9E" />
                <rect x="10" y="17" width="4" height="3" fill="#9E9E9E" />

                {/* Zähne Links/Rechts */}
                <rect x="4" y="10" width="3" height="4" fill="#9E9E9E" />
                <rect x="17" y="10" width="3" height="4" fill="#9E9E9E" />

                {/* Ecken */}
                <rect x="6" y="6" width="2" height="2" fill="#9E9E9E" />
                <rect x="16" y="6" width="2" height="2" fill="#9E9E9E" />
                <rect x="6" y="16" width="2" height="2" fill="#9E9E9E" />
                <rect x="16" y="16" width="2" height="2" fill="#9E9E9E" />
            </>
        )
    },
    trophy: {
        content: (
            <>
                <rect x="6" y="4" width="12" height="8" fill="#FFC107" />
                <rect x="4" y="4" width="2" height="4" fill="#FFD54F" /> {/* Henkel L */}
                <rect x="18" y="4" width="2" height="4" fill="#FFD54F" /> {/* Henkel R */}

                <rect x="8" y="12" width="8" height="4" fill="#FFC107" />
                <rect x="10" y="16" width="4" height="2" fill="#FFA000" />
                <rect x="7" y="18" width="10" height="2" fill="#FFB300" />
            </>
        )
    },
    parcel: {
        content: (
            <>
                <rect x="4" y="6" width="16" height="14" fill="#8D6E63" />
                <rect x="4" y="6" width="16" height="4" fill="#A1887F" />
                <rect x="3" y="7" width="18" height="2" fill="#5D4037" opacity="0.1" />

                <path d="M 8 13 C 10 16 14 16 16 13" stroke="#0859e5ff" strokeWidth="2" fill="none" />
                <rect x="11" y="6" width="2" height="14" fill="#4E342E" opacity="0.3" />
            </>
        )
    },
    pause: {
        content: (
            <>
                <rect x="7" y="5" width="4" height="14" fill="white" />
                <rect x="13" y="5" width="4" height="14" fill="white" />
            </>
        )
    },
    snowman: {
        content: (
            <>
                {/* Basis */}
                <rect x="6" y="15" width="12" height="7" fill="#F5F5F5" />

                {/* Mitte */}
                <rect x="7" y="10" width="10" height="6" fill="#F5F5F5" />

                {/* Kopf */}
                <rect x="8" y="5" width="8" height="6" fill="#F5F5F5" />

                {/* Hut */}
                <rect x="7" y="4" width="10" height="1" fill="#212121" />
                <rect x="9" y="1" width="6" height="3" fill="#212121" />

                {/* Nase */}
                <rect x="12" y="8" width="3" height="1" fill="#FF6F00" />

                {/* Augen */}
                <rect x="10" y="7" width="1" height="1" fill="#212121" />
                <rect x="13" y="7" width="1" height="1" fill="#212121" />
            </>
        )
    },
    rock: {
        content: (
            <>
                <rect x="4" y="12" width="16" height="10" fill="#757575" />
                <rect x="6" y="8" width="12" height="4" fill="#757575" />

                {/* Highlights */}
                <rect x="6" y="8" width="4" height="2" fill="#9E9E9E" />
                <rect x="5" y="12" width="6" height="4" fill="#9E9E9E" />

                {/* Risse/Schatten */}
                <rect x="14" y="16" width="4" height="4" fill="#616161" />
                <rect x="10" y="14" width="2" height="4" fill="#424242" opacity="0.3" />
            </>
        )
    },
    branch: {
        content: (
            <>
                {/* Hauptast */}
                <rect x="0" y="12" width="24" height="3" fill="#795548" />
                <rect x="0" y="15" width="24" height="1" fill="#5D4037" />

                {/* Schnee oben drauf */}
                <rect x="2" y="10" width="4" height="2" fill="white" />
                <rect x="8" y="10" width="6" height="2" fill="white" />
                <rect x="18" y="10" width="4" height="2" fill="white" />

                {/* Zweige */}
                <rect x="4" y="9" width="1" height="3" fill="#795548" />
                <rect x="10" y="8" width="1" height="4" fill="#795548" />
                <rect x="20" y="9" width="1" height="3" fill="#795548" />

                <rect x="5" y="15" width="1" height="2" fill="#795548" />
                <rect x="15" y="15" width="1" height="3" fill="#795548" />
            </>
        )
    },
    github: {
        content: (
            <>
                {/* Octocat Silhouette geglättet für 24x24 */}
                <rect x="5" y="14" width="14" height="8" style={{ fill: 'var(--text-main)' }} />

                {/* Kopf */}
                <rect x="6" y="5" width="12" height="10" style={{ fill: 'var(--text-main)' }} />
                <rect x="4" y="8" width="16" height="4" style={{ fill: 'var(--text-main)' }} />

                {/* Ohren */}
                <rect x="5" y="3" width="3" height="3" style={{ fill: 'var(--text-main)' }} />
                <rect x="16" y="3" width="3" height="3" style={{ fill: 'var(--text-main)' }} />

                {/* Gesicht */}
                <rect x="8" y="9" width="2" height="3" fill="white" />
                <rect x="14" y="9" width="2" height="3" fill="white" />

                {/* Pupillen */}
                <rect x="9" y="10" width="1" height="1" style={{ fill: 'var(--bg-color)' }} />
                <rect x="14" y="10" width="1" height="1" style={{ fill: 'var(--bg-color)' }} />

                {/* Tentakel unten angedeutet */}
                <rect x="4" y="18" width="2" height="4" style={{ fill: 'var(--text-main)' }} />
                <rect x="18" y="18" width="2" height="4" style={{ fill: 'var(--text-main)' }} />
            </>
        )
    }
};

const GameIcon: React.FC<GameIconProps> = ({
    name,
    size = 40, // Standardgröße kann bleiben oder angepasst werden
    className = "",
    style
}) => {
    const sprite = SPRITES[name];

    if (!sprite) return null;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24" // WICHTIG: Auf 24 geändert
            shapeRendering="crispEdges" // WICHTIG: Behält den Pixel-Look
            className={className}
            style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                ...style
            }}
        >
            {sprite.content}
        </svg>
    );
};

export default GameIcon;
