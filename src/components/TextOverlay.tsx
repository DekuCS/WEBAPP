import React, { useRef, useState, useEffect } from 'react';
import { TextConfig } from '../types';
import { computeTypographyMetrics } from '../utils/typographyMetrics';

interface TextOverlayProps {
  config: TextConfig;
  shaderColors?: string[];
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  config,
  shaderColors = ['#ff007f', '#7928ca', '#00dfd8'],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 450,
  });

  // Track live rendered dimensions of the canvas viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerSize({
            width: Math.round(entry.contentRect.width),
            height: Math.round(entry.contentRect.height),
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!config.enabled) return null;

  // Compute exact metrics matching canvas export engine
  const metrics = computeTypographyMetrics(containerSize.width, containerSize.height, config);

  const fontClasses: Record<TextConfig['fontFamily'], string> = {
    'plus-jakarta': 'font-["Plus_Jakarta_Sans"]',
    'syne': 'font-["Syne"]',
    'outfit': 'font-["Outfit"]',
    'instrument-serif': 'font-["Instrument_Serif"]',
    'cinzel': 'font-["Cinzel"]',
    'jetbrains-mono': 'font-["JetBrains_Mono"]',
    'space-grotesk': 'font-["Space_Grotesk"]',
  };

  const currentFontClass = fontClasses[config.fontFamily] || 'font-sans';

  // Letter spacing
  const spacingClasses: Record<TextConfig['letterSpacing'], string> = {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    widest: 'tracking-widest',
  };

  // Alignment containers
  const getAlignmentContainerStyles = () => {
    switch (config.alignment) {
      case 'bottom-left':
        return 'justify-end items-start text-left';
      case 'top-left':
        return 'justify-start items-start text-left';
      case 'editorial-split':
        return 'justify-between items-start text-left flex-col';
      case 'card-center':
      case 'center':
      default:
        return 'justify-center items-center text-center';
    }
  };

  const isCard = config.effect === 'frosted-badge' || config.alignment === 'card-center';
  const isDifference = config.effect === 'difference-blend';
  const isMatchPalette = config.effect === 'match-palette' || config.matchBackgroundColors;

  // 1. Compute Visual Style Effect (Texture, Blend, Color)
  const getVisualEffectStylesAndClasses = () => {
    let classes = '';
    const style: React.CSSProperties = {
      fontSize: `${metrics.headlineFontSize}px`,
      lineHeight: `${metrics.headlineLineHeight}px`,
      maxWidth: `${metrics.maxHeadlineWidth}px`,
    };

    switch (config.effect) {
      case 'difference-blend':
        classes = 'blend-difference text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]';
        break;

      case 'exclusion-blend':
        classes = 'blend-exclusion text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.25)]';
        break;

      case 'color-dodge':
        classes = 'blend-color-dodge text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.9)]';
        break;

      case 'hard-light-blend':
        classes = 'blend-hard-light text-cyan-200 drop-shadow-[0_4px_18px_rgba(255,0,128,0.6)]';
        break;

      case 'match-palette':
        classes = 'bg-clip-text text-transparent bg-[length:250%_auto] drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]';
        style.backgroundImage = `linear-gradient(90deg, ${shaderColors.join(', ')}, ${shaderColors[0]})`;
        break;

      case 'rainbow-wave':
        classes = 'bg-clip-text text-transparent bg-[length:300%_auto] drop-shadow-[0_4px_30px_rgba(255,255,255,0.4)]';
        style.backgroundImage = 'linear-gradient(90deg, #ff0055, #ff5500, #ffcc00, #00e676, #00b0ff, #7c4dff, #ff007f, #ff0055)';
        break;

      case 'rainbow-hologram':
        classes = 'bg-clip-text text-transparent bg-[length:300%_auto] drop-shadow-[0_0_25px_rgba(0,255,255,0.6)]';
        style.backgroundImage = 'linear-gradient(90deg, #ff1361, #fff800, #00ffe7, #7c4dff, #ff1361)';
        break;

      case 'liquid-chrome':
        classes = 'bg-gradient-to-r from-white via-slate-200 via-pink-200 to-white bg-clip-text text-transparent bg-[length:200%_auto] drop-shadow-[0_4px_24px_rgba(255,255,255,0.3)]';
        break;

      case 'gold-shimmer':
        classes = 'bg-clip-text text-transparent bg-[length:250%_auto] drop-shadow-[0_4px_20px_rgba(234,179,8,0.4)]';
        style.backgroundImage = 'linear-gradient(135deg, #fff275 0%, #d4af37 25%, #fffbe6 50%, #aa771c 75%, #fff275 100%)';
        break;

      case 'aurora-sweep':
        classes = 'bg-clip-text text-transparent bg-[length:250%_auto] drop-shadow-[0_4px_20px_rgba(67,233,123,0.3)]';
        style.backgroundImage = 'linear-gradient(90deg, #00f2fe, #4facfe, #43e97b, #fa709a, #fee140, #00f2fe)';
        break;

      case 'thermal-heat':
        classes = 'bg-clip-text text-transparent bg-[length:250%_auto] drop-shadow-[0_4px_22px_rgba(255,0,80,0.5)]';
        style.backgroundImage = 'linear-gradient(90deg, #1b00ff, #7b00ff, #ff007b, #ff7b00, #ffff00, #00ffff)';
        break;

      case 'vaporwave-glow':
        classes = 'anim-vaporwave-tube text-white';
        break;

      case 'prismatic-aberration':
        classes = 'anim-chromatic-aberration text-white';
        break;

      case 'deep-velvet-shadow':
        classes = 'text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)]';
        style.color = config.textColor;
        break;

      case 'outline-wireframe':
        classes = 'text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.95)] drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]';
        break;

      default:
        // Plain text / Solid
        if (config.matchBackgroundColors) {
          classes = 'bg-clip-text text-transparent bg-[length:200%_auto]';
          style.backgroundImage = `linear-gradient(90deg, ${shaderColors.join(', ')}, ${shaderColors[0]})`;
        } else {
          style.color = config.textColor;
        }
        break;
    }

    return { classes, style };
  };

  // 2. Compute Motion Animation Class (Separated!)
  const getMotionAnimationClass = () => {
    switch (config.animation) {
      case 'cinematic-drift':
        return 'anim-cinematic-drift';
      case 'kinetic-wave':
        return 'anim-float-tilt';
      case 'breathe-scale':
        return 'anim-breathe-scale';
      case 'tracking-drift':
        return 'anim-tracking-drift';
      case 'glitch-split':
        return 'anim-glitch-split';
      case 'cyber-scan':
        return 'anim-cyber-scan';
      case 'neon-flicker':
        return 'anim-neon-flicker';
      case 'fluid-morph':
        return 'anim-fluid-morph';
      case 'shimmer-flash':
        return 'anim-shimmer-flash';
      case 'gradient-flow':
        return 'anim-gradient-flow';
      case 'none':
      default:
        return '';
    }
  };

  const { classes: visualEffectClasses, style: headlineInlineStyle } = getVisualEffectStylesAndClasses();
  const motionAnimationClass = getMotionAnimationClass();

  // Active accent color (use shader palette if matching background)
  const activeAccent = isMatchPalette
    ? shaderColors[shaderColors.length - 1] || '#ec4899'
    : config.effect === 'rainbow-wave' || config.effect === 'rainbow-hologram'
    ? '#00ffff'
    : config.accentColor || '#ec4899';

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none flex select-none overflow-hidden ${getAlignmentContainerStyles()}`}
      style={{
        opacity: config.opacity,
        padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
      }}
    >
      <div
        className={`transition-all duration-300 ${
          isCard
            ? 'glass-panel shadow-2xl border border-white/20'
            : ''
        } ${isDifference ? 'blend-difference' : ''} ${config.alignment === 'editorial-split' ? 'w-full' : ''}`}
        style={
          isCard
            ? {
                padding: `${metrics.cardPadY}px ${metrics.cardPadX}px`,
                borderRadius: `${metrics.cardRadius}px`,
              }
            : undefined
        }
      >
        {/* Badge / Tagline (DISABLED BY DEFAULT, shown only if config.showBadge === true) */}
        {config.showBadge && config.tagline && (
          <div
            className="flex items-center gap-2"
            style={{
              marginBottom: `${metrics.badgeGap}px`,
              justifyContent: config.alignment === 'center' || isCard ? 'center' : 'flex-start',
            }}
          >
            <span
              className={`inline-flex items-center gap-2 rounded-full font-semibold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 ${
                isCard ? 'bg-white/10 text-white' : 'bg-black/40 text-white/90'
              }`}
              style={{
                fontSize: `${metrics.badgeFontSize}px`,
                padding: `${Math.round(metrics.badgeFontSize * 0.35)}px ${Math.round(metrics.badgeFontSize * 0.9)}px`,
                color: activeAccent,
                borderColor: `${activeAccent}40`,
              }}
            >
              <span
                className="rounded-full animate-ping"
                style={{
                  width: `${Math.max(6, Math.round(metrics.badgeFontSize * 0.45))}px`,
                  height: `${Math.max(6, Math.round(metrics.badgeFontSize * 0.45))}px`,
                  backgroundColor: activeAccent,
                }}
              />
              {config.tagline}
            </span>
          </div>
        )}

        {/* Headline (Combining Separated Visual Effect + Motion Animation) */}
        {config.headline && (
          <h1
            className={`transition-all whitespace-pre-line font-black ${currentFontClass} ${spacingClasses[config.letterSpacing]} ${visualEffectClasses} ${motionAnimationClass} ${
              config.uppercase ? 'uppercase' : ''
            }`}
            style={headlineInlineStyle}
          >
            {config.headline}
          </h1>
        )}

        {/* Description / Subtitle */}
        {config.description && (
          <p
            className={`text-white/85 font-normal leading-relaxed drop-shadow-sm whitespace-pre-line ${
              config.effect === 'minimal-mono' ? 'font-mono text-emerald-300/90' : ''
            }`}
            style={{
              fontSize: `${metrics.descFontSize}px`,
              lineHeight: `${metrics.descLineHeight}px`,
              maxWidth: `${metrics.maxDescWidth}px`,
              marginTop: `${metrics.descGap}px`,
            }}
          >
            {config.description}
          </p>
        )}

        {/* Minimal Mono Technical Stamp */}
        {config.effect === 'minimal-mono' && (
          <div
            className="border-t border-white/15 flex items-center justify-between font-mono text-white/60 tracking-wider"
            style={{
              marginTop: `${metrics.descGap}px`,
              paddingTop: `${Math.round(metrics.descGap * 0.6)}px`,
              fontSize: `${Math.max(9, Math.round(metrics.descFontSize * 0.75))}px`,
            }}
          >
            <span>COORD: 37.7749° N, 122.4194° W</span>
            <span>SHDR: GLSL_3D_V2</span>
            <span>FPS: 60.0</span>
          </div>
        )}
      </div>

      {/* Watermark / Corner signature (DISABLED BY DEFAULT, shown only if config.showWatermark === true) */}
      {config.showWatermark && (
        <div
          className="absolute pointer-events-none flex items-center gap-2 font-mono uppercase tracking-widest text-white/50 drop-shadow"
          style={{
            bottom: `${Math.max(12, Math.round(metrics.paddingY * 0.4))}px`,
            right: `${Math.max(16, Math.round(metrics.paddingX * 0.6))}px`,
            fontSize: `${Math.max(9, Math.round(metrics.descFontSize * 0.65))}px`,
          }}
        >
          <span
            className="rounded-full"
            style={{
              width: `${Math.max(5, Math.round(metrics.descFontSize * 0.35))}px`,
              height: `${Math.max(5, Math.round(metrics.descFontSize * 0.35))}px`,
              backgroundColor: activeAccent,
            }}
          />
          <span>Nuvio Collection 3D Studio</span>
        </div>
      )}
    </div>
  );
};
