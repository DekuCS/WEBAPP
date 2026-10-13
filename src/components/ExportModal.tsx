import React, { useState } from 'react';
import { ShaderConfig, TextConfig, ExportProgress } from '../types';
import { exportImage, exportGIF, exportVideoOrWebP } from '../utils/exportEngine';
import { X, Image, Film, Code, Download, Loader2, Check, Copy, Share2, Sparkles, CheckCircle2, Tv, Sliders } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  glCanvas: HTMLCanvasElement | null;
  renderFrameAtTime: (time: number) => void;
  renderAtResolution: (time: number, targetWidth: number, targetHeight: number) => void;
  restoreViewportResolution: () => void;
  currentTime?: number;
  shaderConfig: ShaderConfig;
  textConfig: TextConfig;
  activePresetName?: string;
}

export type ResolutionPreset = 
  | 'nuvio-poster'  // 600 × 900 px (2:3 Portrait Poster)
  | 'nuvio-banner'  // 1024 × 576 px (16:9 Landscape Banner)
  | 'nuvio-fhd'     // 1920 × 1080 px (16:9 Full HD Backdrop)
  | '4k'            // 3840 × 2160 px (4K Cinema)
  | 'instagram'     // 1080 × 1080 px (1:1 Square)
  | 'story'         // 1080 × 1920 px (9:16 Vertical)
  | 'og'            // 1200 × 630 px (Landscape Web)
  | 'viewport'      // Retina 2x
  | 'custom';       // Custom dimensions

export type GifPreset = 'nuvio-poster' | 'nuvio-banner' | 'high' | 'medium' | 'compact';
export type VideoPreset = 'nuvio-fhd' | 'nuvio-banner' | 'nuvio-poster' | 'square';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  glCanvas,
  renderFrameAtTime,
  renderAtResolution,
  restoreViewportResolution,
  currentTime = 0,
  shaderConfig,
  textConfig,
  activePresetName = 'Nuvio Gradient',
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'gif' | 'video' | 'code'>('image');
  const [imageFormat, setImageFormat] = useState<'png' | 'webp'>('png');
  const [includeText, setIncludeText] = useState<boolean>(true);
  const [useFirstFrame, setUseFirstFrame] = useState<boolean>(false);
  const [resolutionPreset, setResolutionPreset] = useState<ResolutionPreset>('nuvio-poster');
  
  // Custom dimensions state
  const [customWidth, setCustomWidth] = useState<number>(600);
  const [customHeight, setCustomHeight] = useState<number>(900);

  // GIF Quality settings
  const [gifQuality, setGifQuality] = useState<GifPreset>('nuvio-poster');
  const [gifDuration, setGifDuration] = useState<number>(2.5);
  const [gifFps, setGifFps] = useState<number>(20);
  const [enableDithering, setEnableDithering] = useState<boolean>(true);

  // Video settings
  const [videoResolution, setVideoResolution] = useState<VideoPreset>('nuvio-fhd');
  const [videoDuration, setVideoDuration] = useState<number>(3.0);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    format: null,
    progress: 0,
    statusMessage: '',
  });

  if (!isOpen) return null;

  // Handle PNG / WebP Export (True native GPU resolution rendering!)
  const handleExportImage = async () => {
    if (!glCanvas) return;
    setExportProgress({
      isExporting: true,
      format: imageFormat,
      progress: 30,
      statusMessage: `${imageFormat.toUpperCase()} wird mit nativer GPU-Auflösung gerendert...`,
    });

    try {
      let targetW = 600;
      let targetH = 900;

      if (resolutionPreset === 'nuvio-poster') {
        targetW = 600;
        targetH = 900;
      } else if (resolutionPreset === 'nuvio-banner') {
        targetW = 1024;
        targetH = 576;
      } else if (resolutionPreset === 'nuvio-fhd') {
        targetW = 1920;
        targetH = 1080;
      } else if (resolutionPreset === '4k') {
        targetW = 3840;
        targetH = 2160;
      } else if (resolutionPreset === 'instagram') {
        targetW = 1080;
        targetH = 1080;
      } else if (resolutionPreset === 'story') {
        targetW = 1080;
        targetH = 1920;
      } else if (resolutionPreset === 'og') {
        targetW = 1200;
        targetH = 630;
      } else if (resolutionPreset === 'viewport') {
        targetW = Math.max(1280, glCanvas.width * 2);
        targetH = Math.max(720, glCanvas.height * 2);
      } else if (resolutionPreset === 'custom') {
        targetW = Math.max(100, Math.min(7680, customWidth));
        targetH = Math.max(100, Math.min(4320, customHeight));
      }

      await exportImage(renderAtResolution, restoreViewportResolution, glCanvas, textConfig, {
        width: targetW,
        height: targetH,
        includeText,
        presetName: activePresetName,
        useFirstFrame,
        time: currentTime,
        shaderColors: shaderConfig.colors,
        format: imageFormat,
        quality: 0.98,
      });

      setExportProgress({
        isExporting: false,
        format: null,
        progress: 100,
        statusMessage: '',
      });
      onClose();
    } catch (err) {
      console.error(err);
      setExportProgress({
        isExporting: false,
        format: null,
        progress: 0,
        statusMessage: 'Fehler beim Bild-Export',
      });
    }
  };

  // Handle High-Res GIF Export with Floyd-Steinberg dithering
  const handleExportGIF = async () => {
    if (!glCanvas) return;
    setExportProgress({
      isExporting: true,
      format: 'gif',
      progress: 0,
      statusMessage: 'Initialisiere HD-GIF-Renderer mit Dithering...',
    });

    try {
      let gifWidth = 600;
      let gifHeight = 900;

      if (gifQuality === 'nuvio-poster') {
        gifWidth = 600;
        gifHeight = 900;
      } else if (gifQuality === 'nuvio-banner') {
        gifWidth = 1024;
        gifHeight = 576;
      } else if (gifQuality === 'high') {
        gifWidth = 960;
        gifHeight = 540;
      } else if (gifQuality === 'medium') {
        gifWidth = 720;
        gifHeight = 405;
      } else if (gifQuality === 'compact') {
        gifWidth = 480;
        gifHeight = 270;
      }

      await exportGIF(renderAtResolution, restoreViewportResolution, glCanvas, textConfig, {
        durationSec: gifDuration,
        fps: gifFps,
        width: gifWidth,
        height: gifHeight,
        includeText,
        presetName: activePresetName,
        shaderColors: shaderConfig.colors,
        enableDithering,
        onProgress: (percent, msg) => {
          setExportProgress({
            isExporting: true,
            format: 'gif',
            progress: percent,
            statusMessage: msg,
          });
        },
      });

      setExportProgress({
        isExporting: false,
        format: null,
        progress: 100,
        statusMessage: '',
      });
      onClose();
    } catch (err) {
      console.error(err);
      setExportProgress({
        isExporting: false,
        format: null,
        progress: 0,
        statusMessage: 'Fehler beim GIF-Export',
      });
    }
  };

  // Handle Video / WebM Export
  const handleExportVideo = async () => {
    if (!glCanvas) return;
    setExportProgress({
      isExporting: true,
      format: 'webm',
      progress: 0,
      statusMessage: 'Aufnahme bei 60 FPS (25 Mbps) vorbereiten...',
    });

    try {
      let targetW = 1920;
      let targetH = 1080;

      if (videoResolution === 'nuvio-fhd') {
        targetW = 1920;
        targetH = 1080;
      } else if (videoResolution === 'nuvio-banner') {
        targetW = 1024;
        targetH = 576;
      } else if (videoResolution === 'nuvio-poster') {
        targetW = 600;
        targetH = 900;
      } else if (videoResolution === 'square') {
        targetW = 1080;
        targetH = 1080;
      }

      await exportVideoOrWebP(renderAtResolution, restoreViewportResolution, glCanvas, textConfig, {
        durationSec: videoDuration,
        fps: 60,
        width: targetW,
        height: targetH,
        presetName: activePresetName,
        shaderColors: shaderConfig.colors,
        onProgress: (percent, msg) => {
          setExportProgress({
            isExporting: true,
            format: 'webm',
            progress: percent,
            statusMessage: msg,
          });
        },
      });

      setExportProgress({
        isExporting: false,
        format: null,
        progress: 100,
        statusMessage: '',
      });
      onClose();
    } catch (err) {
      console.error(err);
      setExportProgress({
        isExporting: false,
        format: null,
        progress: 0,
        statusMessage: 'Fehler bei der Video-Aufnahme',
      });
    }
  };

  // Generate CSS Fallback code
  const cssGradient = `background: linear-gradient(${shaderConfig.angle}deg, ${shaderConfig.colors.join(', ')});`;
  const tailwindSnippet = `bg-gradient-to-r from-[${shaderConfig.colors[0]}] to-[${shaderConfig.colors[shaderConfig.colors.length - 1]}]`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/15 p-6 shadow-2xl overflow-hidden text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Nuvio TV & Ultra-HD Export</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GPU Native
                </span>
              </h3>
              <p className="text-xs text-slate-400">Optimiert für Poster, Banner & TV App Cover der Nuvio Collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={exportProgress.isExporting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
          {[
            { id: 'image', label: 'Bild (PNG / WebP)', icon: <Image className="w-3.5 h-3.5" /> },
            { id: 'gif', label: 'HD GIF (Dithering)', icon: <Film className="w-3.5 h-3.5" /> },
            { id: 'video', label: '60fps Video (WebM)', icon: <Share2 className="w-3.5 h-3.5" /> },
            { id: 'code', label: 'Code & CSS', icon: <Code className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={exportProgress.isExporting}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="mt-5 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* TAB 1: PNG / WEBP IMAGE EXPORT */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              {/* Format selection */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-semibold text-slate-300">Dateiformat:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setImageFormat('png')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      imageFormat === 'png' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PNG (Verlustfrei)
                  </button>
                  <button
                    onClick={() => setImageFormat('webp')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      imageFormat === 'webp' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    WebP (98% Ultra-HD)
                  </button>
                </div>
              </div>

              {/* Nuvio TV App Featured Presets */}
              <div>
                <label className="text-xs font-semibold text-purple-300 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Tv className="w-3.5 h-3.5 text-purple-400" />
                    <span>Nuvio TV App Formate (Empfohlen)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Exakte 1:1 Text-Proportion
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'nuvio-poster',
                      label: 'Nuvio TV Poster',
                      sub: '600 × 900 px (2:3)',
                      badge: 'TV Poster Cover',
                    },
                    {
                      id: 'nuvio-banner',
                      label: 'Nuvio TV Banner',
                      sub: '1024 × 576 px (16:9)',
                      badge: 'Empfehlungs-Rail',
                    },
                    {
                      id: 'nuvio-fhd',
                      label: 'Nuvio TV Full HD',
                      sub: '1920 × 1080 px (16:9)',
                      badge: 'Backdrop / Player',
                    },
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setResolutionPreset(res.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        resolutionPreset === res.id
                          ? 'bg-purple-600/30 border-purple-400 text-white ring-1 ring-purple-400/50 shadow-lg'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {res.badge}
                          </span>
                          {resolutionPreset === res.id && <Check className="w-3.5 h-3.5 text-purple-300" />}
                        </div>
                        <span className="text-xs font-bold block">{res.label}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block mt-1.5">{res.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard & Cinema Resolutions */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Weitere Display- & Social-Auflösungen
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: '4k', label: '4K Ultra HD', sub: '3840 × 2160 px' },
                    { id: 'instagram', label: 'Square (1:1)', sub: '1080 × 1080 px' },
                    { id: 'story', label: 'Story (9:16)', sub: '1080 × 1920 px' },
                    { id: 'og', label: 'Twitter / OG', sub: '1200 × 630 px' },
                    { id: 'viewport', label: 'Retina 2x', sub: 'Fenstergröße × 2' },
                    { id: 'custom', label: 'Benutzerdefiniert', sub: 'Eigene Pixel W×H' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setResolutionPreset(res.id as any)}
                      className={`p-2 rounded-xl border text-left transition ${
                        resolutionPreset === res.id
                          ? 'bg-purple-600/25 border-purple-400 text-white ring-1 ring-purple-400/40'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{res.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{res.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions Input (if 'custom' selected) */}
              {resolutionPreset === 'custom' && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-[11px] text-slate-400 block mb-1">Breite (px)</span>
                    <input
                      type="number"
                      min={100}
                      max={7680}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 600)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#161922] border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <span className="text-slate-500 font-bold text-sm mt-4">×</span>
                  <div className="flex-1">
                    <span className="text-[11px] text-slate-400 block mb-1">Höhe (px)</span>
                    <input
                      type="number"
                      min={100}
                      max={4320}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 900)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#161922] border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}

              {/* Options Checkboxes */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFirstFrame}
                    onChange={(e) => setUseFirstFrame(e.target.checked)}
                    className="rounded accent-purple-600"
                  />
                  <div>
                    <span className="font-semibold block text-white">Ersten Frame der Animation nutzen (t = 0.0)</span>
                    <span className="text-[11px] text-slate-400 block">Sorgt für einen reproduzierbaren, statischen Frame</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-2 border-t border-white/5">
                  <input
                    type="checkbox"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                    className="rounded accent-purple-600"
                  />
                  <div>
                    <span className="font-semibold block text-white">Typografie & Text-Overlay in voller Auflösung einbinden</span>
                    <span className="text-[11px] text-slate-400 block">Identische relative Textgröße und Position wie in der Live-Vorschau</span>
                  </div>
                </label>
              </div>

              <button
                onClick={handleExportImage}
                disabled={exportProgress.isExporting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {exportProgress.isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{exportProgress.statusMessage || 'Rendert mit voller nativer Auflösung...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {imageFormat.toUpperCase()} ({resolutionPreset === 'nuvio-poster' ? '600×900 Poster' : resolutionPreset === 'nuvio-banner' ? '1024×576 Banner' : resolutionPreset === 'nuvio-fhd' ? '1920×1080 FHD' : 'Ausgewählte Auflösung'}) Exportieren
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: ANIMATED GIF WITH DITHERING */}
          {activeTab === 'gif' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                <span className="font-semibold block text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>HQ-Dithering gegen Farbstreifen</span>
                </span>
                Verwendet Floyd-Steinberg Fehlerdiffusion für samtweiche, stufenlose Farbverläufe ohne 8-Bit Banding.
              </div>

              {/* GIF Format Presets including Nuvio TV Poster & Banner */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  GIF Format & Auflösung:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'nuvio-poster', label: 'Nuvio TV Poster', desc: '600 × 900 px (2:3)' },
                    { id: 'nuvio-banner', label: 'Nuvio TV Banner', desc: '1024 × 576 px (16:9)' },
                    { id: 'high', label: 'Full HD Scale', desc: '960 × 540 px' },
                    { id: 'medium', label: 'Standard HD', desc: '720 × 405 px' },
                    { id: 'compact', label: 'Kompakt', desc: '480 × 270 px' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setGifQuality(q.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        gifQuality === q.id
                          ? 'bg-purple-600/30 border-purple-400 text-white ring-1 ring-purple-400/40'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{q.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{q.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration and FPS Controls */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Animationsdauer</span>
                    <span className="font-mono text-purple-400">{gifDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={gifDuration}
                    onChange={(e) => setGifDuration(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Framerate</span>
                    <span className="font-mono text-purple-400">{gifFps} FPS</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="2"
                    value={gifFps}
                    onChange={(e) => setGifFps(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDithering}
                    onChange={(e) => setEnableDithering(e.target.checked)}
                    className="rounded accent-purple-600"
                  />
                  <span>Floyd-Steinberg Dithering aktivieren (samtweiche Verläufe)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2 border-t border-white/5">
                  <input
                    type="checkbox"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                    className="rounded accent-purple-600"
                  />
                  <span>Text-Overlay im GIF einbinden</span>
                </label>
              </div>

              <button
                onClick={handleExportGIF}
                disabled={exportProgress.isExporting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {exportProgress.isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{exportProgress.statusMessage || `${exportProgress.progress}%`}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Animiertes GIF berechnen & herunterladen</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: 60FPS WEBM / WEBP VIDEO */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <span className="font-semibold block text-white mb-0.5">25 Mbps Ultra-HD Video-Stream</span>
                Echter 60 FPS WebM/VP9 Stream für gestochen scharfe TV-Hintergründe und dynamische Videowände.
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'nuvio-fhd', label: 'Nuvio TV FHD', desc: '1920 × 1080 px (16:9)' },
                  { id: 'nuvio-banner', label: 'Nuvio TV Banner', desc: '1024 × 576 px (16:9)' },
                  { id: 'nuvio-poster', label: 'Nuvio TV Poster', desc: '600 × 900 px (2:3)' },
                  { id: 'square', label: 'Square', desc: '1080 × 1080 px (1:1)' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVideoResolution(v.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      videoResolution === v.id
                        ? 'bg-purple-600/30 border-purple-400 text-white ring-1 ring-purple-400/40'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{v.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{v.desc}</span>
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Länge der Video-Aufnahme</span>
                  <span className="font-mono text-purple-400">{videoDuration}s</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="8.0"
                  step="0.5"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={handleExportVideo}
                disabled={exportProgress.isExporting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {exportProgress.isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{exportProgress.statusMessage}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>60 FPS Video aufnehmen & herunterladen</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 4: CODE & CSS EXPORT */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">CSS Fallback Gradient</span>
                <div className="p-3 bg-black/40 rounded-xl border border-white/10 font-mono text-xs text-purple-300 flex items-center justify-between">
                  <span className="truncate pr-2">{cssGradient}</span>
                  <button
                    onClick={() => copyToClipboard(cssGradient, 'css')}
                    className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white shrink-0"
                  >
                    {copiedCode === 'css' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Tailwind CSS Utility Class</span>
                <div className="p-3 bg-black/40 rounded-xl border border-white/10 font-mono text-xs text-indigo-300 flex items-center justify-between">
                  <span className="truncate pr-2">{tailwindSnippet}</span>
                  <button
                    onClick={() => copyToClipboard(tailwindSnippet, 'tailwind')}
                    className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white shrink-0"
                  >
                    {copiedCode === 'tailwind' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">JSON Konfiguration für Nuvio TV App</span>
                <div className="p-3 bg-black/40 rounded-xl border border-white/10 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                  <pre className="overflow-x-auto max-h-32">
                    {JSON.stringify({ preset: activePresetName, shader: shaderConfig, text: textConfig }, null, 2)}
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify({ preset: activePresetName, shader: shaderConfig, text: textConfig }, null, 2),
                        'json'
                      )
                    }
                    className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white self-start shrink-0 ml-2"
                  >
                    {copiedCode === 'json' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
