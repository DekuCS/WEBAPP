import { TextConfig } from '../types';

export interface TypographyMetrics {
  referenceDimension: number;
  baseScale: number;
  customScale: number;
  headlineFontSize: number;
  headlineLineHeight: number;
  badgeFontSize: number;
  badgePillHeight: number;
  badgeGap: number;
  descFontSize: number;
  descLineHeight: number;
  descGap: number;
  paddingX: number;
  paddingY: number;
  maxHeadlineWidth: number;
  maxDescWidth: number;
  cardPadX: number;
  cardPadY: number;
  cardRadius: number;
}

/**
 * Computes exact unified typography metrics based on container or canvas pixel dimensions (W x H).
 * Used synchronously in both the live DOM preview (TextOverlay) and the canvas export engine (exportEngine)
 * so exported images are 100% pixel-and-ratio identical to what the user sees in the preview.
 */
export function computeTypographyMetrics(
  width: number,
  height: number,
  config: TextConfig
): TypographyMetrics {
  const isPortrait = width < height;
  const customScale = Math.max(0.5, Math.min(2.5, config.customScale ?? 1.15));

  // Determine reference dimension:
  // - Portrait (e.g. 600x900 TV poster, 1080x1920 story): width is primary scale baseline
  // - Landscape (e.g. 1024x576 TV banner, 1920x1080 backdrop): balanced scale
  const referenceDimension = isPortrait
    ? width
    : Math.min(width * 0.68, height * 1.25);

  const baseScale = referenceDimension / 650;

  // Size factors for headline (tuned specifically for cinematic TV posters and banners)
  let sizeFactor = 0.19; // large (default Hero)
  switch (config.size) {
    case 'small':
      sizeFactor = 0.11;
      break;
    case 'medium':
      sizeFactor = 0.15;
      break;
    case 'large':
      sizeFactor = 0.19;
      break;
    case 'huge':
      sizeFactor = 0.25; // Massive poster impact
      break;
    case 'massive':
      sizeFactor = 0.32; // Ultra TV Cinema title
      break;
    default:
      sizeFactor = 0.19;
  }

  const headlineFontSize = Math.max(18, Math.round(referenceDimension * sizeFactor * customScale));
  const headlineLineHeight = Math.round(headlineFontSize * 1.08);

  const badgeFontSize = Math.max(11, Math.round(referenceDimension * 0.026 * customScale));
  const badgePillHeight = Math.round(badgeFontSize * 1.7);
  const badgeGap = Math.max(8, Math.round(referenceDimension * 0.024 * customScale));

  const descFontSize = Math.max(12, Math.round(referenceDimension * 0.035 * customScale));
  const descLineHeight = Math.round(descFontSize * 1.45);
  const descGap = Math.max(10, Math.round(referenceDimension * 0.026 * customScale));

  const isCentered = config.alignment === 'center' || config.alignment === 'card-center';
  const paddingX = Math.round(width * (isCentered ? 0.07 : 0.08));
  const paddingY = Math.round(height * (isCentered ? 0.07 : 0.08));

  const maxHeadlineWidth = isCentered ? Math.round(width * 0.88) : Math.round(width * 0.82);
  const maxDescWidth = isCentered
    ? Math.round(Math.min(width * 0.82, 620 * baseScale * customScale))
    : Math.round(Math.min(width * 0.72, 560 * baseScale * customScale));

  const cardPadX = Math.round(44 * baseScale);
  const cardPadY = Math.round(34 * baseScale);
  const cardRadius = Math.round(26 * baseScale);

  return {
    referenceDimension,
    baseScale,
    customScale,
    headlineFontSize,
    headlineLineHeight,
    badgeFontSize,
    badgePillHeight,
    badgeGap,
    descFontSize,
    descLineHeight,
    descGap,
    paddingX,
    paddingY,
    maxHeadlineWidth,
    maxDescWidth,
    cardPadX,
    cardPadY,
    cardRadius,
  };
}
