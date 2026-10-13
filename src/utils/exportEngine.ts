import { GIFEncoder, quantize } from 'gifenc';
import { TextConfig } from '../types';
import { computeTypographyMetrics } from './typographyMetrics';

// Convert Hex color to RGB vec3 [0..1]
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
}

// Helper for line wrapping
function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const result: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        result.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) result.push(currentLine);
  }
  return result;
}

// Draw the text overlay onto an offscreen 2D canvas for exact export compositing
export function drawTextOverlayOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  textConfig: TextConfig,
  shaderColors: string[] = ['#ff007f', '#7928ca', '#00dfd8'],
  time: number = 0
) {
  if (!textConfig.enabled) return;

  ctx.save();
  ctx.globalAlpha = textConfig.opacity;

  const fontMap: Record<TextConfig['fontFamily'], string> = {
    'plus-jakarta': "'Plus Jakarta Sans', sans-serif",
    'syne': "'Syne', sans-serif",
    'outfit': "'Outfit', sans-serif",
    'instrument-serif': "'Instrument Serif', serif",
    'cinzel': "'Cinzel', serif",
    'jetbrains-mono': "'JetBrains Mono', monospace",
    'space-grotesk': "'Space Grotesk', sans-serif",
  };

  const currentFont = fontMap[textConfig.fontFamily] || "'Plus Jakarta Sans', sans-serif";

  // Use the exact unified metrics shared with TextOverlay.tsx
  const metrics = computeTypographyMetrics(width, height, textConfig);
  const {
    baseScale,
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
  } = metrics;

  const rawHeadline = textConfig.uppercase ? textConfig.headline.toUpperCase() : textConfig.headline;
  const tagline = textConfig.tagline.toUpperCase();
  const description = textConfig.description;

  // Measure Headline lines
  ctx.font = `800 ${headlineFontSize}px ${currentFont}`;
  const headlineLines = getWrappedLines(ctx, rawHeadline, maxHeadlineWidth);
  const totalHeadlineHeight = Math.max(headlineFontSize, headlineLines.length * headlineLineHeight);

  // Measure Description lines
  ctx.font = `400 ${descFontSize}px ${currentFont}`;
  const descLines = description ? getWrappedLines(ctx, description, maxDescWidth) : [];
  const totalDescHeight = descLines.length * descLineHeight;

  // Tagline Badge dimensions
  const hasBadge = textConfig.showBadge && Boolean(tagline);

  // Total content height
  const totalContentHeight =
    (hasBadge ? badgePillHeight + badgeGap : 0) +
    totalHeadlineHeight +
    (descLines.length > 0 ? descGap + totalDescHeight : 0);

  // Alignment coordinates matching preview flexbox layout
  let startX = width / 2;
  let align: CanvasTextAlign = 'center';
  let groupTopY = (height - totalContentHeight) / 2;

  if (textConfig.alignment === 'bottom-left') {
    startX = paddingX;
    align = 'left';
    groupTopY = height - paddingY - totalContentHeight;
  } else if (textConfig.alignment === 'top-left') {
    startX = paddingX;
    align = 'left';
    groupTopY = paddingY;
  } else if (textConfig.alignment === 'editorial-split') {
    startX = paddingX;
    align = 'left';
    groupTopY = Math.max(paddingY, height - paddingY - totalContentHeight);
  }

  // Draw Card / Frosted backdrop if requested
  if (textConfig.effect === 'frosted-badge' || textConfig.alignment === 'card-center') {
    const cardWidth = Math.min(width - paddingX * 2, Math.max(width * 0.65, 480 * baseScale));
    const cardHeight = totalContentHeight + cardPadY * 2;
    const cardX = (width - cardWidth) / 2;
    const cardY = (height - cardHeight) / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = Math.max(1, 1.5 * baseScale);
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.fill();
    ctx.stroke();

    startX = width / 2;
    align = 'center';
    groupTopY = cardY + cardPadY;
  }

  ctx.textAlign = align;

  const activeAccent = (textConfig.effect === 'match-palette' || textConfig.matchBackgroundColors)
    ? shaderColors[shaderColors.length - 1] || '#ec4899'
    : (textConfig.effect === 'rainbow-wave' || textConfig.effect === 'rainbow-hologram')
    ? '#00ffff'
    : textConfig.accentColor || '#38bdf8';

  // Motion animation displacement for animated recording (GIF / Video)
  let animOffsetY = 0;
  if (textConfig.animation === 'cinematic-drift') {
    animOffsetY = Math.sin(time * 1.5) * 10 * baseScale;
  } else if (textConfig.animation === 'kinetic-wave') {
    animOffsetY = Math.sin(time * 2.5) * 8 * baseScale;
  }

  let currentY = groupTopY + animOffsetY;

  // 1. Tagline Badge
  if (hasBadge) {
    ctx.font = `600 ${badgeFontSize}px ${currentFont}`;
    const badgeTextY = currentY + badgeFontSize;

    if (align === 'center') {
      const metricsText = ctx.measureText(tagline);
      const padX = Math.round(badgeFontSize * 0.9);
      const padY = Math.round(badgeFontSize * 0.35);
      const pillW = metricsText.width + padX * 2;
      const pillH = badgeFontSize + padY * 2;
      const pillX = startX - pillW / 2;
      const pillY = currentY;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = `${activeAccent}55`;
      ctx.lineWidth = Math.max(1, 1 * baseScale);
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeAccent;
      ctx.fillText(tagline, startX, pillY + pillH - padY * 0.85);
    } else {
      ctx.fillStyle = activeAccent;
      ctx.fillText(`●  ${tagline}`, startX, badgeTextY);
    }

    currentY += badgePillHeight + badgeGap;
  }

  // 2. Headline (Multi-line rendering!)
  if (headlineLines.length > 0) {
    ctx.font = `800 ${headlineFontSize}px ${currentFont}`;

    // Set FillStyle & Effects
    if (textConfig.effect === 'difference-blend') {
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = '#ffffff';
    } else if (textConfig.effect === 'exclusion-blend') {
      ctx.globalCompositeOperation = 'exclusion';
      ctx.fillStyle = '#ffffff';
    } else if (textConfig.effect === 'color-dodge') {
      ctx.globalCompositeOperation = 'color-dodge';
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 24 * baseScale;
    } else if (textConfig.effect === 'hard-light-blend') {
      ctx.globalCompositeOperation = 'hard-light';
      ctx.fillStyle = '#67e8f9';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 18 * baseScale;
    } else if (textConfig.effect === 'match-palette' || textConfig.matchBackgroundColors) {
      const grad = ctx.createLinearGradient(startX - 260 * baseScale, currentY, startX + 260 * baseScale, currentY + totalHeadlineHeight);
      const count = Math.max(2, shaderColors.length);
      shaderColors.forEach((col, idx) => {
        grad.addColorStop(idx / (count - 1), col);
      });
      ctx.fillStyle = grad;
    } else if (textConfig.effect === 'rainbow-wave' || textConfig.effect === 'rainbow-hologram') {
      const grad = ctx.createLinearGradient(startX - 260 * baseScale, currentY, startX + 260 * baseScale, currentY + totalHeadlineHeight);
      grad.addColorStop(0, '#ff0055');
      grad.addColorStop(0.18, '#ff5500');
      grad.addColorStop(0.36, '#ffcc00');
      grad.addColorStop(0.54, '#00e676');
      grad.addColorStop(0.72, '#00b0ff');
      grad.addColorStop(0.88, '#7c4dff');
      grad.addColorStop(1, '#ff007f');
      ctx.fillStyle = grad;
      if (textConfig.effect === 'rainbow-hologram') {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 24 * baseScale;
      }
    } else if (textConfig.effect === 'gold-shimmer') {
      const grad = ctx.createLinearGradient(startX - 200 * baseScale, currentY, startX + 200 * baseScale, currentY + totalHeadlineHeight);
      grad.addColorStop(0, '#fff275');
      grad.addColorStop(0.25, '#d4af37');
      grad.addColorStop(0.5, '#fffbe6');
      grad.addColorStop(0.75, '#aa771c');
      grad.addColorStop(1, '#fff275');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(234, 179, 8, 0.4)';
      ctx.shadowBlur = 18 * baseScale;
    } else if (textConfig.effect === 'vaporwave-glow') {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 22 * baseScale;
    } else if (textConfig.effect === 'aurora-sweep') {
      const grad = ctx.createLinearGradient(startX - 220 * baseScale, currentY, startX + 220 * baseScale, currentY + totalHeadlineHeight);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(0.25, '#4facfe');
      grad.addColorStop(0.5, '#43e97b');
      grad.addColorStop(0.75, '#fa709a');
      grad.addColorStop(1, '#fee140');
      ctx.fillStyle = grad;
    } else if (textConfig.effect === 'neon-pulse') {
      ctx.shadowColor = textConfig.accentColor || '#ec4899';
      ctx.shadowBlur = 24 * baseScale;
      ctx.fillStyle = textConfig.textColor;
    } else if (textConfig.effect === 'outline-wireframe') {
      ctx.strokeStyle = textConfig.textColor;
      ctx.lineWidth = 2.5 * baseScale;
    } else if (textConfig.effect === 'thermal-heat') {
      const grad = ctx.createLinearGradient(startX - 260 * baseScale, currentY, startX + 260 * baseScale, currentY + totalHeadlineHeight);
      grad.addColorStop(0, '#1b00ff');
      grad.addColorStop(0.2, '#7b00ff');
      grad.addColorStop(0.4, '#ff007b');
      grad.addColorStop(0.6, '#ff7b00');
      grad.addColorStop(0.8, '#ffff00');
      grad.addColorStop(1, '#00ffff');
      ctx.fillStyle = grad;
    } else if (textConfig.effect === 'prismatic-aberration') {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 0, 100, 0.85)';
      ctx.shadowBlur = 12 * baseScale;
    } else if (textConfig.effect === 'deep-velvet-shadow') {
      ctx.fillStyle = textConfig.textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 24 * baseScale;
      ctx.shadowOffsetY = 12 * baseScale;
    } else if (textConfig.effect === 'liquid-chrome') {
      const grad = ctx.createLinearGradient(startX - 200 * baseScale, currentY, startX + 200 * baseScale, currentY + totalHeadlineHeight);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#f1f5f9');
      grad.addColorStop(0.5, '#94a3b8');
      grad.addColorStop(0.7, '#ffffff');
      grad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = textConfig.textColor;
    }

    // Draw each headline line individually with precise vertical rhythm
    for (let i = 0; i < headlineLines.length; i++) {
      const lineText = headlineLines[i];
      const lineY = currentY + i * headlineLineHeight + headlineFontSize * 0.85;
      if (textConfig.effect === 'outline-wireframe') {
        ctx.strokeText(lineText, startX, lineY);
      } else {
        ctx.fillText(lineText, startX, lineY);
      }
    }

    ctx.shadowBlur = 0; // reset
    ctx.globalCompositeOperation = 'source-over'; // reset

    currentY += totalHeadlineHeight;
  }

  // 3. Description (Multi-line)
  if (descLines.length > 0) {
    currentY += descGap;
    ctx.font = `400 ${descFontSize}px ${currentFont}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

    for (let j = 0; j < descLines.length; j++) {
      const lineY = currentY + j * descLineHeight + descFontSize * 0.85;
      ctx.fillText(descLines[j], startX, lineY);
    }

    currentY += totalDescHeight;
  }

  // 4. Watermark / Brand stamp
  if (textConfig.showWatermark) {
    const wmSize = Math.max(10, Math.round(descFontSize * 0.65));
    ctx.font = `500 ${wmSize}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'right';
    ctx.fillText('NUVIO COLLECTION — 3D WEBGL STUDIO', width - paddingX * 0.6, height - paddingY * 0.4);
  }

  ctx.restore();
}

// Trigger browser download
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// High-Quality Floyd-Steinberg error diffusion dithering for silky smooth 256-color GIF gradients
export function applyDitheredPalette(
  data: Uint8ClampedArray,
  palette: number[][],
  width: number,
  height: number
): Uint8Array {
  const pixelCount = width * height;
  const indexed = new Uint8Array(pixelCount);

  const bufferR = new Float32Array(pixelCount);
  const bufferG = new Float32Array(pixelCount);
  const bufferB = new Float32Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    bufferR[i] = data[i * 4];
    bufferG[i] = data[i * 4 + 1];
    bufferB[i] = data[i * 4 + 2];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      const r = Math.max(0, Math.min(255, bufferR[idx]));
      const g = Math.max(0, Math.min(255, bufferG[idx]));
      const b = Math.max(0, Math.min(255, bufferB[idx]));

      let bestDist = Infinity;
      let bestIndex = 0;

      for (let p = 0; p < palette.length; p++) {
        const pr = palette[p][0];
        const pg = palette[p][1];
        const pb = palette[p][2];
        const dr = r - pr;
        const dg = g - pg;
        const db = b - pb;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = p;
          if (dist === 0) break;
        }
      }

      indexed[idx] = bestIndex;

      // Error calculation
      const matched = palette[bestIndex];
      const errR = r - matched[0];
      const errG = g - matched[1];
      const errB = b - matched[2];

      // Error distribution
      if (x + 1 < width) {
        const nIdx = idx + 1;
        bufferR[nIdx] += (errR * 7) / 16;
        bufferG[nIdx] += (errG * 7) / 16;
        bufferB[nIdx] += (errB * 7) / 16;
      }
      if (x - 1 >= 0 && y + 1 < height) {
        const nIdx = idx + width - 1;
        bufferR[nIdx] += (errR * 3) / 16;
        bufferG[nIdx] += (errG * 3) / 16;
        bufferB[nIdx] += (errB * 3) / 16;
      }
      if (y + 1 < height) {
        const nIdx = idx + width;
        bufferR[nIdx] += (errR * 5) / 16;
        bufferG[nIdx] += (errG * 5) / 16;
        bufferB[nIdx] += (errB * 5) / 16;
      }
      if (x + 1 < width && y + 1 < height) {
        const nIdx = idx + width + 1;
        bufferR[nIdx] += (errR * 1) / 16;
        bufferG[nIdx] += (errG * 1) / 16;
        bufferB[nIdx] += (errB * 1) / 16;
      }
    }
  }

  return indexed;
}

// PRISTINE HIGH-RESOLUTION PNG / WEBP IMAGE EXPORT (True 1080p, 4K, Nuvio TV Posters without upscaling!)
export async function exportImage(
  renderAtResolution: (time: number, targetWidth: number, targetHeight: number) => void,
  restoreViewportResolution: () => void,
  glCanvas: HTMLCanvasElement,
  textConfig: TextConfig,
  options: {
    width?: number;
    height?: number;
    time?: number;
    useFirstFrame?: boolean;
    includeText?: boolean;
    presetName?: string;
    shaderColors?: string[];
    format?: 'png' | 'webp';
    quality?: number; // 0.98 default for WebP
  } = {}
): Promise<void> {
  const targetW = options.width || 1920;
  const targetH = options.height || 1080;
  const renderTime = options.useFirstFrame ? 0 : (options.time ?? 0);
  const format = options.format || 'png';
  const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
  const quality = options.quality ?? 0.98;

  try {
    // Ensure all Google WebFonts are completely loaded and rendered before drawing
    if (document.fonts) {
      await document.fonts.ready;
    }

    // 1. Force the WebGL GPU shader to render at FULL TARGET PIXEL DIMENSIONS
    renderAtResolution(renderTime, targetW, targetH);

    // 2. Offscreen 2D composite canvas matching exact target size
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetW;
    exportCanvas.height = targetH;
    const ctx = exportCanvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not create 2D canvas context');

    // 3. Draw 1:1 pixel crisp WebGL framebuffer
    ctx.drawImage(glCanvas, 0, 0, targetW, targetH);

    // 4. Overlay crisp typography at full target resolution
    if (options.includeText !== false && textConfig.enabled) {
      drawTextOverlayOnCanvas(ctx, targetW, targetH, textConfig, options.shaderColors);
    }

    return new Promise((resolve, reject) => {
      exportCanvas.toBlob(
        (blob) => {
          // 5. Restore viewport canvas resolution immediately
          restoreViewportResolution();

          if (blob) {
            const name = (options.presetName || 'nuvio-gradient').toLowerCase().replace(/\s+/g, '-');
            triggerDownload(blob, `${name}-${targetW}x${targetH}-${Date.now()}.${format}`);
            resolve();
          } else {
            reject(new Error('Export failed to generate image blob'));
          }
        },
        mimeType,
        quality
      );
    });
  } catch (err) {
    restoreViewportResolution();
    throw err;
  }
}

// Legacy alias for exportImage with format 'png'
export const exportPNG = (
  glCanvas: HTMLCanvasElement,
  textConfig: TextConfig,
  options: any,
  renderAtResolution?: (time: number, w: number, h: number) => void,
  restoreViewportResolution?: () => void
) => {
  if (renderAtResolution && restoreViewportResolution) {
    return exportImage(renderAtResolution, restoreViewportResolution, glCanvas, textConfig, {
      ...options,
      format: 'png',
    });
  }
  // Fallback
  return exportImage(
    () => {},
    () => {},
    glCanvas,
    textConfig,
    { ...options, format: 'png' }
  );
};

// HIGH-RESOLUTION ANIMATED GIF EXPORT WITH DITHERING & FULL RESOLUTION FRAMES
export async function exportGIF(
  renderAtResolution: (time: number, targetWidth: number, targetHeight: number) => void,
  restoreViewportResolution: () => void,
  glCanvas: HTMLCanvasElement,
  textConfig: TextConfig,
  options: {
    durationSec?: number; // 2.5s default
    fps?: number; // 18-24 fps
    width?: number; // 600 / 1024 / 960 / 720
    height?: number;
    includeText?: boolean;
    presetName?: string;
    shaderColors?: string[];
    enableDithering?: boolean;
    onProgress?: (percent: number, status: string) => void;
  }
): Promise<void> {
  const duration = options.durationSec || 2.5;
  const fps = options.fps || 20;
  const totalFrames = Math.round(duration * fps);
  const targetW = options.width || 800;
  const targetH = options.height || Math.round((targetW * glCanvas.height) / glCanvas.width);
  const enableDithering = options.enableDithering !== false;

  if (document.fonts) {
    await document.fonts.ready;
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to get offscreen 2D canvas context');

  const gif = GIFEncoder();
  const delayMs = Math.round(1000 / fps);

  try {
    for (let i = 0; i < totalFrames; i++) {
      const progress = Math.round((i / totalFrames) * 88);
      options.onProgress?.(progress, `Frame ${i + 1}/${totalFrames} bei ${targetW}×${targetH} rendern...`);

      const frameTime = (i / totalFrames) * 3.5;
      // Render WebGL procedural math AT EXACT TARGET RESOLUTION!
      renderAtResolution(frameTime, targetW, targetH);

      // Composite onto 2D canvas
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(glCanvas, 0, 0, targetW, targetH);

      // Overlay text
      if (options.includeText !== false && textConfig.enabled) {
        drawTextOverlayOnCanvas(ctx, targetW, targetH, textConfig, options.shaderColors, frameTime);
      }

      const { data } = ctx.getImageData(0, 0, targetW, targetH);
      // High-quality 256 color quantization
      const palette = quantize(data, 256);

      // Apply Floyd-Steinberg error diffusion dithering to eliminate gradient banding
      const index = enableDithering
        ? applyDitheredPalette(data, palette, targetW, targetH)
        : applyPaletteQuick(data, palette);

      gif.writeFrame(index, targetW, targetH, {
        palette,
        delay: delayMs,
        repeat: 0,
      });

      // Yield to allow UI progress bar updates
      await new Promise((r) => setTimeout(r, 0));
    }

    options.onProgress?.(94, 'GIF-Datei mit hoher Farbtiefe kodieren...');
    gif.finish();
    const bytes = gif.bytes();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'image/gif' });

    restoreViewportResolution();
    options.onProgress?.(100, 'Fertig!');
    const name = (options.presetName || 'nuvio-gradient').toLowerCase().replace(/\s+/g, '-');
    triggerDownload(blob, `${name}-${targetW}x${targetH}-hd.gif`);
  } catch (err) {
    restoreViewportResolution();
    throw err;
  }
}

// Fast nearest-neighbor fallback when dithering is disabled
function applyPaletteQuick(data: Uint8ClampedArray, palette: number[][]): Uint8Array {
  const length = data.length / 4;
  const indexed = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    let bestDist = Infinity;
    let bestIdx = 0;
    for (let p = 0; p < palette.length; p++) {
      const pr = palette[p][0];
      const pg = palette[p][1];
      const pb = palette[p][2];
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = p;
        if (dist === 0) break;
      }
    }
    indexed[i] = bestIdx;
  }
  return indexed;
}

// ULTRA-HD WEBP / WEBM VIDEO RECORDING AT 25 MBPS BITRATE & 1080P/60FPS
export async function exportVideoOrWebP(
  renderAtResolution: (time: number, targetWidth: number, targetHeight: number) => void,
  restoreViewportResolution: () => void,
  glCanvas: HTMLCanvasElement,
  textConfig: TextConfig,
  options: {
    durationSec?: number;
    fps?: number;
    width?: number;
    height?: number;
    presetName?: string;
    format?: 'webm' | 'webp';
    shaderColors?: string[];
    onProgress?: (percent: number, status: string) => void;
  }
): Promise<void> {
  const duration = options.durationSec || 3.0;
  const fps = options.fps || 60; // Smooth 60fps
  const targetW = options.width || 1920;
  const targetH = options.height || 1080;

  if (document.fonts) {
    await document.fonts.ready;
  }

  // Dedicated offscreen canvas for recording
  const recCanvas = document.createElement('canvas');
  recCanvas.width = targetW;
  recCanvas.height = targetH;
  const ctx = recCanvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('2D context failed');

  const stream = recCanvas.captureStream(fps);
  
  // Pick highest quality supported video codec
  let mimeType = 'video/webm';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mimeType = 'video/webm;codecs=vp8';
  }

  // 25 Mbps high bitrate ensures razor-sharp, zero-compression macroblocking video!
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 25000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      restoreViewportResolution();
      const blob = new Blob(chunks, { type: 'video/webm' });
      const name = (options.presetName || 'nuvio-gradient').toLowerCase().replace(/\s+/g, '-');
      triggerDownload(blob, `${name}-${targetW}x${targetH}-60fps.webm`);
      options.onProgress?.(100, 'Export abgeschlossen!');
      resolve();
    };

    recorder.onerror = (e) => {
      restoreViewportResolution();
      reject(e);
    };

    recorder.start();

    const startTime = performance.now();
    const interval = 1000 / fps;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(99, Math.round((elapsed / duration) * 95));
      options.onProgress?.(progress, `Aufnahme (${targetW}×${targetH} @ 60fps): ${(elapsed).toFixed(1)}s / ${duration}s...`);

      // Render WebGL frame at target full resolution
      renderAtResolution(elapsed * 0.8, targetW, targetH);
      ctx.drawImage(glCanvas, 0, 0, targetW, targetH);

      if (textConfig.enabled) {
        drawTextOverlayOnCanvas(ctx, targetW, targetH, textConfig, options.shaderColors, elapsed);
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        recorder.stop();
      }
    }, interval);
  });
}
