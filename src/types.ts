export type ShaderStyle = 'mesh' | 'liquid' | 'aurora' | 'vortex' | 'silk' | 'prismatic';

export type AspectRatio = 'free' | '1:1' | '16:9' | '9:16' | '4:5' | '21:9' | '2:3' | 'tv-banner';

export interface ShaderConfig {
  style: ShaderStyle;
  colors: string[]; // 2 to 6 hex colors
  speed: number; // 0.1 to 3.0
  distortion: number; // 0.0 to 2.0
  frequency: number; // 0.5 to 4.0
  grain: number; // 0.0 to 0.4
  lighting: number; // 0.0 to 1.5
  angle: number; // 0 to 360 deg
  scale: number; // 0.5 to 3.0
  softness: number; // 0.1 to 2.0
  mouseInfluence: number; // 0.0 to 1.0
  isPlaying: boolean;
}

// 1. Separated Visual Texture & Blend Style Effects
export type TextVisualEffect = 
  | 'none'                  // Pure solid color
  | 'difference-blend'      // Negative Invert Cutout (Real-time GPU Invert)
  | 'exclusion-blend'       // Ghost Exclusion Invert (Prismatic Soft Invert)
  | 'color-dodge'           // Luminous Solar Flare Dodge
  | 'hard-light-blend'      // Cyber Cross-Process Hard Light
  | 'match-palette'         // Palette Match Flow (Synced to shader gradient)
  | 'rainbow-wave'          // Chromatic Rainbow Spectrum
  | 'rainbow-hologram'      // Hologram Cyber Foil & Bloom
  | 'liquid-chrome'         // Liquid Mercury Metallic Shimmer
  | 'gold-shimmer'          // 24K Gold Foil Sheen
  | 'aurora-sweep'          // Emerald/Cyan Northern Lights
  | 'vaporwave-glow'        // Electric Cyan/Magenta Neon Tube
  | 'thermal-heat'          // Thermal Heat Vision Gradient (Infrared)
  | 'prismatic-aberration'  // RGB Prism Chromatic Aberration
  | 'deep-velvet-shadow'    // 3D Cinema Velvet Drop Shadow
  | 'outline-wireframe'     // Precision Stroke Wireframe Cutout
  | 'frosted-badge'         // Frosted Glass Card Badge
  | 'minimal-mono'          // Technical Monospace Metadata
  | 'neon-pulse'
  | 'kinetic-wave'
  | 'breathe-scale'
  | 'blur-reveal'
  | 'glitch-split'
  | 'cyber-scan'
  | 'editorial-serif';

// Legacy alias for backwards compatibility
export type TextAnimationEffect = TextVisualEffect;

// 2. Separated Motion & Keyframe Animations
export type TextMotionAnimation = 
  | 'none'              // Static (No movement)
  | 'kinetic-wave'      // Organic 3D Floating & Gentle Tilt
  | 'breathe-scale'     // Rhythmic Deep Breathing Scale Pulse
  | 'cinematic-drift'   // Slow Horizon Drift (Ideal for Nuvio TV Posters)
  | 'tracking-drift'    // Expanding & Contracting Letter-Spacing
  | 'glitch-split'      // Digital Cyberpunk Glitch Twitch
  | 'cyber-scan'        // CRT Scanline Laser Flicker
  | 'neon-flicker'      // Realistic Electrical Tube Power Flicker
  | 'gradient-flow'     // Continuous Infinite Gradient Sweep
  | 'fluid-morph'       // Organic Fluid Distortion
  | 'shimmer-flash';    // Periodic Specular Light Flash

export type TextAlignment = 'center' | 'bottom-left' | 'top-left' | 'editorial-split' | 'card-center';

export interface TextConfig {
  enabled: boolean;
  tagline: string;
  headline: string;
  description: string;
  fontFamily: 'plus-jakarta' | 'syne' | 'outfit' | 'instrument-serif' | 'cinzel' | 'jetbrains-mono' | 'space-grotesk';
  effect: TextVisualEffect;       // Visual Style / Blend mode / Palette
  animation: TextMotionAnimation; // Motion / Keyframes (separated!)
  alignment: TextAlignment;
  size: 'small' | 'medium' | 'large' | 'huge' | 'massive';
  letterSpacing: 'tight' | 'normal' | 'wide' | 'widest';
  textColor: string;
  accentColor: string;
  opacity: number;
  showBadge: boolean;      // Disabled by default
  showWatermark: boolean;  // Disabled by default
  uppercase: boolean;
  matchBackgroundColors?: boolean;
  customScale?: number; // 0.6 to 2.5
}

export interface Preset {
  id: string;
  name: string;
  category: 'vibrant' | 'luxury' | 'cyber' | 'pastel' | 'dark' | 'natural';
  description: string;
  shader: Omit<ShaderConfig, 'isPlaying'>;
  text?: Partial<TextConfig>;
}

export interface ExportProgress {
  isExporting: boolean;
  format: 'png' | 'gif' | 'webm' | 'webp' | null;
  progress: number; // 0 to 100
  statusMessage: string;
}
