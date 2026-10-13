import { TextVisualEffect, TextMotionAnimation, TextConfig } from '../types';

export interface TextEffectMeta {
  id: TextVisualEffect;
  name: string;
  badge: string;
  description: string;
  category: 'color-match' | 'rainbow' | 'metallic' | 'glow' | 'experimental' | 'clean';
  recommendedFont?: TextConfig['fontFamily'];
}

export interface TextMotionMeta {
  id: TextMotionAnimation;
  name: string;
  badge: string;
  description: string;
}

// 1. Visual Texture & Blend Style Effects
export const VISUAL_EFFECTS: TextEffectMeta[] = [
  // Color Match & GPU Invert Blend Modes
  {
    id: 'difference-blend',
    name: 'Negative Invert Cutout',
    badge: 'Difference GPU',
    description: 'Invertiert die Shaderfarben in Echtzeit (Difference Blend Mode) für dramatischen Kontrast.',
    category: 'color-match',
    recommendedFont: 'space-grotesk',
  },
  {
    id: 'exclusion-blend',
    name: 'Exclusion Ghost Invert',
    badge: 'Exclusion Soft',
    description: 'Weichere Negativ-Inversion mit prismatischen Zwischentönen (Exclusion Mode).',
    category: 'color-match',
    recommendedFont: 'syne',
  },
  {
    id: 'color-dodge',
    name: 'Luminous Solar Dodge',
    badge: 'Solar Glow',
    description: 'Lässt die Hintergrundfarben mit intensiver optischer Leuchtkraft durch den Text strahlen.',
    category: 'color-match',
    recommendedFont: 'outfit',
  },
  {
    id: 'hard-light-blend',
    name: 'Hard Light Cross-Process',
    badge: 'Analog Film',
    description: 'Kräftiges Solarisation-Verfahren mit retro-futuristischem Cross-Processing.',
    category: 'color-match',
    recommendedFont: 'instrument-serif',
  },
  {
    id: 'match-palette',
    name: 'Palette Match Flow',
    badge: 'Synced Colors',
    description: 'Schriftverlauf passt sich vollautomatisch den Farben des gewählten 3D-Shaders an.',
    category: 'color-match',
    recommendedFont: 'syne',
  },

  // Rainbow & Spectrum
  {
    id: 'rainbow-wave',
    name: 'Prismatic Rainbow Flow',
    badge: 'Full Spectrum',
    description: 'Vollspektraler, chromatisch schillernder Regenbogen-Verlauf.',
    category: 'rainbow',
    recommendedFont: 'syne',
  },
  {
    id: 'rainbow-hologram',
    name: 'Cyber Hologram Prism',
    badge: 'Holo Bloom',
    description: 'Schillernder Hologramm-Reflex mit mehrfarbigem Bloom und Prisma-Glanz.',
    category: 'rainbow',
    recommendedFont: 'outfit',
  },

  // Metallic & Luxury Materials
  {
    id: 'liquid-chrome',
    name: 'Liquid Chrome Mercury',
    badge: 'Liquid Metal',
    description: 'Flüssiges Chrom und spiegelndes Quecksilber mit feinen Glanzkanten.',
    category: 'metallic',
    recommendedFont: 'syne',
  },
  {
    id: 'gold-shimmer',
    name: '24K Imperial Gold Foil',
    badge: 'Luxury Gold',
    description: 'Edle Goldfolie mit warmem Lichtschimmer für luxuriöse Titel.',
    category: 'metallic',
    recommendedFont: 'cinzel',
  },

  // Atmospheric Glow & Light
  {
    id: 'aurora-sweep',
    name: 'Northern Aurora Ribbons',
    badge: 'Nordlicht',
    description: 'Smaragd- und Azurblaues Polarlicht mit samtigem Farbübergang.',
    category: 'glow',
    recommendedFont: 'instrument-serif',
  },
  {
    id: 'vaporwave-glow',
    name: 'Electric Neon Tube',
    badge: 'Vapor Neon',
    description: 'Hochvolt-Neonröhre mit strahlendem Cyan- und Magenta-Lichthof.',
    category: 'glow',
    recommendedFont: 'jetbrains-mono',
  },

  // Creative Experimental Effects
  {
    id: 'thermal-heat',
    name: 'Thermal Heat Vision',
    badge: 'Infrared Map',
    description: 'Spektrale Infrarot-Wärmebild-Farbpalette von Ultraviollet über Amber bis Neon-Cyan.',
    category: 'experimental',
    recommendedFont: 'space-grotesk',
  },
  {
    id: 'prismatic-aberration',
    name: 'Prismatic RGB Aberration',
    badge: 'RGB Split',
    description: 'Optischer Linsenfehler mit getrenntem Cyan- und Magenta-RGB-Versatz.',
    category: 'experimental',
    recommendedFont: 'syne',
  },
  {
    id: 'deep-velvet-shadow',
    name: 'Deep 3D Velvet Shadow',
    badge: 'Cinema Poster',
    description: 'Tief gestaffelter 3D-Schlagschatten für plastische Kino- und TV-Poster.',
    category: 'experimental',
    recommendedFont: 'cinzel',
  },
  {
    id: 'outline-wireframe',
    name: 'Outline Wireframe Stroke',
    badge: 'Minimal Outline',
    description: 'Transparente Buchstaben mit gestochen scharfer 2px-Außenkontur.',
    category: 'clean',
    recommendedFont: 'outfit',
  },
  {
    id: 'frosted-badge',
    name: 'Frosted Glass Badge Card',
    badge: 'Glassmorphism',
    description: 'Halbtransparente Acrylglas-Plakette mit Weichzeichner und Lichtkante.',
    category: 'clean',
    recommendedFont: 'plus-jakarta',
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Technical Mono',
    badge: 'Cyber Tech',
    description: 'Konstruktives Monospace-Design mit technischen Metadaten und Koordinaten.',
    category: 'clean',
    recommendedFont: 'jetbrains-mono',
  },
  {
    id: 'none',
    name: 'Solid Color (Reine Farbe)',
    badge: 'Standard',
    description: 'Klassische, klare Textfarbe ohne Textureffekt.',
    category: 'clean',
    recommendedFont: 'plus-jakarta',
  },
];

// Alias for backwards compatibility
export const TEXT_EFFECTS = VISUAL_EFFECTS;

// 2. Motion & Keyframe Animations (Can be combined with ANY visual effect!)
export const MOTION_ANIMATIONS: TextMotionMeta[] = [
  {
    id: 'none',
    name: 'Statisch (Keine Bewegung)',
    badge: 'Static',
    description: 'Text bleibt vollkommen ruhig und statisch.',
  },
  {
    id: 'cinematic-drift',
    name: 'Cinematic Horizon Drift',
    badge: 'TV Poster Flow',
    description: 'Langsames, elegantes Schweben mit subtiler Perspektive — perfekt für TV-Poster.',
  },
  {
    id: 'kinetic-wave',
    name: 'Kinetic 3D Float Wave',
    badge: 'Floating Tilt',
    description: 'Organisches 3D-Schweben mit sanftem Kippwinkel im Takt des Shaders.',
  },
  {
    id: 'breathe-scale',
    name: 'Rhythmic Breathe Scale',
    badge: 'Breathing',
    description: 'Gleichmäßiges, pulsierendes Ein- und Ausatmen der Schriftgröße.',
  },
  {
    id: 'tracking-drift',
    name: 'Editorial Tracking Drift',
    badge: 'Typo Expansion',
    description: 'Atmende Ausdehnung und Verengung der Zeichenabstände (Letter-Spacing).',
  },
  {
    id: 'glitch-split',
    name: 'Digital Cyber Glitch',
    badge: 'Cyber Glitch',
    description: 'Periodisches digitales Zucken mit chromatischem Offset.',
  },
  {
    id: 'cyber-scan',
    name: 'CRT Scanline Laser',
    badge: 'CRT Scan',
    description: 'Retro-Futuristisches Kathodenstrahl-Flackern und Scan-Interferenzen.',
  },
  {
    id: 'neon-flicker',
    name: 'Electrical Tube Flicker',
    badge: 'Power Hum',
    description: 'Realistisches Zündflackern und Stromschwankungen einer echten Neonröhre.',
  },
  {
    id: 'fluid-morph',
    name: 'Liquid Fluid Morph',
    badge: 'Fluid Wave',
    description: 'Geschmeidige Verformung wie im Wasser schwimmende Typografie.',
  },
  {
    id: 'shimmer-flash',
    name: 'Specular Shimmer Flash',
    badge: 'Light Flash',
    description: 'Periodisches Aufstrahlen mit hellem Reflex-Highlight.',
  },
  {
    id: 'gradient-flow',
    name: 'Infinite Gradient Flow',
    badge: 'Continuous Flow',
    description: 'Kontinuierliche horizontale Wanderung der Farbverläufe.',
  },
];

export const DEFAULT_TEXT_CONFIG: TextConfig = {
  enabled: true,
  tagline: 'NUVIO COLLECTION — 2026',
  headline: 'ETHEREAL DRIFT',
  description: 'Generative hardware-accelerated 3D fluid gradients crafted for modern creative vision.',
  fontFamily: 'syne',
  effect: 'difference-blend',       // Negative Invert Cutout default!
  animation: 'cinematic-drift',      // Smooth cinematic drift!
  alignment: 'center',
  size: 'large',
  letterSpacing: 'wide',
  textColor: '#ffffff',
  accentColor: '#ec4899',
  opacity: 1.0,
  showBadge: false,                 // DISABLED BY DEFAULT!
  showWatermark: false,             // DISABLED BY DEFAULT!
  uppercase: true,
  matchBackgroundColors: false,
  customScale: 1.15,
};
